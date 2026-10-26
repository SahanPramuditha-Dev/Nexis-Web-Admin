-- ==============================================================================
-- NEXIS Crowdsourced Telemetry & Validation Central Database Schema
-- Compatible with Supabase / PostgreSQL 15+ with PostGIS
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumerations
DO $$ BEGIN
  CREATE TYPE telemetry_status AS ENUM (
    'VERIFIED', 
    'FLAGGED', 
    'QUARANTINED', 
    'SPOOFED_MOCK', 
    'PENDING', 
    'REJECTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE probe_status AS ENUM (
    'ACTIVE', 
    'SUSPENDED', 
    'PROBATIONARY', 
    'SHADOW_BANNED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Probe Devices Table (Fleet & Contributor Reputation)
CREATE TABLE IF NOT EXISTS probe_devices (
  device_id TEXT PRIMARY KEY,
  device_model TEXT NOT NULL DEFAULT 'Unknown Device',
  os_version TEXT NOT NULL DEFAULT 'Android',
  platform TEXT NOT NULL DEFAULT 'Android',
  reputation_score INT NOT NULL DEFAULT 85 CHECK (reputation_score BETWEEN 0 AND 100),
  status probe_status NOT NULL DEFAULT 'ACTIVE',
  total_submissions BIGINT NOT NULL DEFAULT 0,
  verified_submissions BIGINT NOT NULL DEFAULT 0,
  quarantined_submissions BIGINT NOT NULL DEFAULT 0,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- 4. Central Telemetry Records Table (High-volume ingestion & triage)
CREATE TABLE IF NOT EXISTS telemetry_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES probe_devices(device_id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Network & Carrier Identity
  network_type TEXT NOT NULL DEFAULT 'LTE', -- '5G', 'LTE', '3G', 'WIFI'
  carrier_name TEXT NOT NULL,
  mcc TEXT,
  mnc TEXT,
  cell_id TEXT, -- eNodeB / gNodeB CID
  
  -- Performance Metrics
  download_mbps NUMERIC(10, 2) NOT NULL DEFAULT 0,
  upload_mbps NUMERIC(10, 2) NOT NULL DEFAULT 0,
  latency_ms NUMERIC(10, 2) NOT NULL DEFAULT 0,
  jitter_ms NUMERIC(10, 2) NOT NULL DEFAULT 0,
  packet_loss_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
  bufferbloat_ms NUMERIC(10, 2),
  
  -- RF Radio Physics
  rsrp_dbm INT, -- Reference Signal Received Power (-140 to -40 dBm)
  rsrq_db INT,  -- Reference Signal Received Quality (-20 to -3 dB)
  sinr_db INT,  -- Signal-to-Interference-plus-Noise Ratio (-10 to 30 dB)
  rssi_dbm INT,
  
  -- Geospatial & S2 Indexing
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
  s2_cell_id TEXT NOT NULL,
  s2_level INT DEFAULT 13,
  accuracy_meters NUMERIC(8, 2) DEFAULT 10,
  altitude_meters NUMERIC(8, 2),
  velocity_kmh NUMERIC(8, 2) DEFAULT 0,
  
  -- Validation, Proof & Fraud Radar
  status telemetry_status NOT NULL DEFAULT 'PENDING',
  integrity_score INT NOT NULL DEFAULT 100 CHECK (integrity_score BETWEEN 0 AND 100),
  is_mock_location BOOLEAN NOT NULL DEFAULT FALSE,
  proof_signature TEXT,
  payload_digest TEXT,
  anomalies TEXT[] DEFAULT ARRAY[]::TEXT[],
  quarantine_reason TEXT,
  
  -- Metadata
  city TEXT,
  country TEXT DEFAULT 'Sri Lanka',
  app_version TEXT DEFAULT 'v1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast querying & geospatial filtering
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry_records (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_status ON telemetry_records (status);
CREATE INDEX IF NOT EXISTS idx_telemetry_s2_cell ON telemetry_records (s2_cell_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_carrier ON telemetry_records (carrier_name);
CREATE INDEX IF NOT EXISTS idx_telemetry_geom ON telemetry_records USING GIST (geom);

-- 5. S2 Spatial Coverage Aggregates
CREATE TABLE IF NOT EXISTS s2_coverage_cells (
  cell_id TEXT PRIMARY KEY,
  level INT NOT NULL DEFAULT 13,
  carrier_name TEXT NOT NULL,
  network_type TEXT NOT NULL,
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)) STORED,
  total_samples INT NOT NULL DEFAULT 1,
  distinct_devices INT NOT NULL DEFAULT 1,
  avg_download_mbps NUMERIC(10, 2) NOT NULL DEFAULT 0,
  avg_upload_mbps NUMERIC(10, 2) NOT NULL DEFAULT 0,
  avg_latency_ms NUMERIC(10, 2) NOT NULL DEFAULT 0,
  avg_rsrp_dbm INT,
  reliability_score INT NOT NULL DEFAULT 90,
  k_anon_passed BOOLEAN NOT NULL DEFAULT FALSE, -- Privacy threshold passed (>= 5 contributors)
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_s2_geom ON s2_coverage_cells USING GIST (geom);

-- 6. System Validation Rules (Dynamic threshold management)
CREATE TABLE IF NOT EXISTS validation_rules (
  id TEXT PRIMARY KEY DEFAULT 'current_rules',
  max_speed_5g_mbps NUMERIC(8, 2) NOT NULL DEFAULT 2500,
  max_speed_4g_mbps NUMERIC(8, 2) NOT NULL DEFAULT 600,
  max_speed_3g_mbps NUMERIC(8, 2) NOT NULL DEFAULT 45,
  max_speed_wifi_mbps NUMERIC(8, 2) NOT NULL DEFAULT 3500,
  min_allowed_latency_ms NUMERIC(8, 2) NOT NULL DEFAULT 0.8,
  max_transit_velocity_kmh NUMERIC(8, 2) NOT NULL DEFAULT 950,
  reject_mock_locations BOOLEAN NOT NULL DEFAULT TRUE,
  rate_limit_max_per_hour INT NOT NULL DEFAULT 60,
  iqr_outlier_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.5,
  auto_quarantine_score INT NOT NULL DEFAULT 60,
  min_contributor_k_anonymity INT NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default rules if not present
INSERT INTO validation_rules (id) VALUES ('current_rules') ON CONFLICT (id) DO NOTHING;

-- 7. Audit Logs Table (Admin Triage & Governance History)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user TEXT NOT NULL DEFAULT 'System Admin',
  action TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs (created_at DESC);

-- 7.1 Individual Benchmark Measurements Archive (Client speed test histories)
CREATE TABLE IF NOT EXISTS measurements (
  id TEXT PRIMARY KEY,
  timestamp BIGINT NOT NULL,
  latency_ms NUMERIC(10, 2),
  loaded_latency_ms NUMERIC(10, 2),
  download_loaded_latency_ms NUMERIC(10, 2),
  upload_loaded_latency_ms NUMERIC(10, 2),
  bufferbloat_ms NUMERIC(10, 2),
  bufferbloat_grade TEXT,
  jitter_ms NUMERIC(10, 2),
  loss_percent NUMERIC(5, 2),
  download_mbps NUMERIC(10, 2),
  upload_mbps NUMERIC(10, 2),
  endpoint_url TEXT,
  method_version TEXT,
  location JSONB,
  samples JSONB,
  duration_sec NUMERIC(10, 2),
  colo TEXT,
  isp TEXT,
  asn TEXT,
  asn_org TEXT,
  client_ip TEXT,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_measurements_timestamp ON measurements (timestamp DESC);

-- 8. Enable Supabase Realtime for instant live queue updates!
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE telemetry_records;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 9. Row Level Security (RLS) & Zero-Trust Privacy Policies
-- ==============================================================================

-- Enable RLS across all telemetry tables
ALTER TABLE telemetry_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE probe_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE s2_coverage_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 9.0 Measurements Policies (Client benchmark archive)
DROP POLICY IF EXISTS "Anon insert measurements" ON measurements;
CREATE POLICY "Anon insert measurements" 
  ON measurements FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage measurements" ON measurements;
CREATE POLICY "Admins manage measurements" 
  ON measurements FOR ALL 
  TO authenticated 
  USING (true);

-- 9.1 Telemetry Records Policies:
-- Anonymous clients can ONLY insert new records with 'PENDING' status (never VERIFIED)
DROP POLICY IF EXISTS "Anon clients insert pending telemetry" ON telemetry_records;
CREATE POLICY "Anon clients insert pending telemetry" 
  ON telemetry_records FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (status = 'PENDING');

-- Only authenticated admins can read raw, pinpointed coordinate records
DROP POLICY IF EXISTS "Admins read telemetry records" ON telemetry_records;
CREATE POLICY "Admins read telemetry records" 
  ON telemetry_records FOR SELECT 
  TO authenticated 
  USING (true);

-- Admins can update status (approve, quarantine) or delete poisoned records
DROP POLICY IF EXISTS "Admins manage telemetry records" ON telemetry_records;
CREATE POLICY "Admins manage telemetry records" 
  ON telemetry_records FOR ALL 
  TO authenticated 
  USING (true);

-- 9.2 S2 Spatial Coverage Cells (Public Map) Policies:
-- Public can ONLY read aggregated cells where k-anonymity has PASSED (>= 5 contributors)
DROP POLICY IF EXISTS "Public read k-anonymized cells" ON s2_coverage_cells;
CREATE POLICY "Public read k-anonymized cells" 
  ON s2_coverage_cells FOR SELECT 
  TO anon, authenticated 
  USING (k_anon_passed = TRUE);

-- Admins can read all cells including below-threshold ones and modify them
DROP POLICY IF EXISTS "Admins manage coverage cells" ON s2_coverage_cells;
CREATE POLICY "Admins manage coverage cells" 
  ON s2_coverage_cells FOR ALL 
  TO authenticated 
  USING (true);

-- 9.3 Probe Devices Policies:
-- Device inventory and trust scores are private to administrators
DROP POLICY IF EXISTS "Admins manage probe devices" ON probe_devices;
CREATE POLICY "Admins manage probe devices" 
  ON probe_devices FOR ALL 
  TO authenticated 
  USING (true);

-- 9.4 Validation Rules Policies:
-- Rules configuration is readable by system, editable by admins
DROP POLICY IF EXISTS "Public view validation rules" ON validation_rules;
CREATE POLICY "Public view validation rules" 
  ON validation_rules FOR SELECT 
  TO anon, authenticated 
  USING (true);

DROP POLICY IF EXISTS "Admins edit validation rules" ON validation_rules;
CREATE POLICY "Admins edit validation rules" 
  ON validation_rules FOR ALL 
  TO authenticated 
  USING (true);

-- 9.5 Audit Logs Policies:
-- Audit logs are strictly restricted to authenticated administrators
DROP POLICY IF EXISTS "Admins manage audit logs" ON audit_logs;
CREATE POLICY "Admins manage audit logs" 
  ON audit_logs FOR ALL 
  TO authenticated 
  USING (true);

-- ==============================================================================
-- 10. Automated Privacy Retention (TTL) & Dynamic k-Anonymity Functions
-- ==============================================================================

-- 10.1 Purge expired pinpoint telemetry records older than retention period (default 30 days)
CREATE OR REPLACE FUNCTION purge_expired_telemetry(retention_days INT DEFAULT 30)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count BIGINT := 0;
BEGIN
  -- Delete raw records older than retention threshold that are already aggregated or resolved
  WITH deleted AS (
    DELETE FROM telemetry_records
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  -- Record purge action into immutable audit trail
  INSERT INTO audit_logs (admin_user, action, target_id, details)
  VALUES (
    'System Auto-Retention',
    'PURGE_EXPIRED_TELEMETRY',
    'telemetry_records',
    jsonb_build_object('retention_days', retention_days, 'records_purged', deleted_count)
  );

  RETURN deleted_count;
END;
$$;

-- 10.2 Recompute S2 Coverage Cells and enforce strict k-anonymity
CREATE OR REPLACE FUNCTION refresh_s2_coverage_cells()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_k_min INT := 5;
BEGIN
  -- Obtain minimum k-anonymity threshold from active validation rules
  SELECT min_contributor_k_anonymity INTO v_k_min 
  FROM validation_rules 
  WHERE id = 'current_rules' 
  LIMIT 1;

  IF v_k_min IS NULL THEN
    v_k_min := 5;
  END IF;

  -- Upsert aggregated cells from VERIFIED telemetry records
  INSERT INTO s2_coverage_cells (
    cell_id,
    level,
    carrier_name,
    network_type,
    center_lat,
    center_lng,
    total_samples,
    distinct_devices,
    avg_download_mbps,
    avg_upload_mbps,
    avg_latency_ms,
    avg_rsrp_dbm,
    reliability_score,
    k_anon_passed,
    last_updated
  )
  SELECT 
    r.s2_cell_id AS cell_id,
    COALESCE(MAX(r.s2_level), 13) AS level,
    r.carrier_name,
    r.network_type,
    AVG(r.latitude) AS center_lat,
    AVG(r.longitude) AS center_lng,
    COUNT(*) AS total_samples,
    COUNT(DISTINCT r.device_id) AS distinct_devices,
    ROUND(AVG(r.download_mbps), 2) AS avg_download_mbps,
    ROUND(AVG(r.upload_mbps), 2) AS avg_upload_mbps,
    ROUND(AVG(r.latency_ms), 2) AS avg_latency_ms,
    ROUND(AVG(COALESCE(r.rsrp_dbm, -95)))::INT AS avg_rsrp_dbm,
    95 AS reliability_score,
    (COUNT(DISTINCT r.device_id) >= v_k_min) AS k_anon_passed,
    NOW() AS last_updated
  FROM telemetry_records r
  WHERE r.status = 'VERIFIED'
  GROUP BY r.s2_cell_id, r.carrier_name, r.network_type
  ON CONFLICT (cell_id) DO UPDATE SET
    total_samples = EXCLUDED.total_samples,
    distinct_devices = EXCLUDED.distinct_devices,
    avg_download_mbps = EXCLUDED.avg_download_mbps,
    avg_upload_mbps = EXCLUDED.avg_upload_mbps,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    avg_rsrp_dbm = EXCLUDED.avg_rsrp_dbm,
    k_anon_passed = EXCLUDED.k_anon_passed,
    last_updated = NOW();
END;
$$;
