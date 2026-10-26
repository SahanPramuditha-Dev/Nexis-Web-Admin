export type TelemetryStatus = 
  | 'VERIFIED' 
  | 'FLAGGED' 
  | 'QUARANTINED' 
  | 'SPOOFED_MOCK' 
  | 'PENDING' 
  | 'REJECTED';

export type AnomalyType =
  | 'MOCK_LOCATION_ACTIVE'
  | 'IMPOSSIBLE_SPEED_FOR_TECH'
  | 'IMPOSSIBLE_LOW_LATENCY'
  | 'VELOCITY_TELEPORTATION'
  | 'HMAC_SIGNATURE_MISMATCH'
  | 'CELL_TOWER_MISMATCH'
  | 'RATE_LIMIT_EXCEEDED'
  | 'REPLAY_ATTACK_DETECTED'
  | 'PAYLOAD_TAMPERED'
  | 'FUTURE_TIMESTAMP'
  | 'BURST_SPAM_FLOOD';

export type ProbeStatus = 'ACTIVE' | 'SUSPENDED' | 'PROBATIONARY' | 'SHADOW_BANNED';

export interface MeasurementProof {
  proofSignature: string;
  payloadDigest: string;
  isAuthentic: boolean;
  isMockDetected: boolean;
  algorithm: string;
  integrityScore: number; // 0 - 100
  anomalies: AnomalyType[];
}

export interface TelemetryRecord {
  id: string;
  timestamp: number;
  deviceId: string;
  deviceModel: string;
  osVersion: string;
  networkType: '5G' | 'LTE' | '3G' | 'WIFI';
  carrierName: string;
  mcc?: string;
  mnc?: string;
  cellId?: string;

  // Performance metrics
  downloadMbps: number;
  uploadMbps: number;
  latencyMedianMs: number;
  jitterMs: number;
  packetLossPct: number;
  bufferbloatMs?: number;

  // RF Radio Physics
  rsrpDbm?: number; // -140 to -40 dBm
  rsrqDb?: number;  // -20 to -3 dB
  sinrDb?: number;  // -10 to 30 dB
  rssiDbm?: number;

  // Geospatial & S2 indexing
  s2CellId: string;
  s2Level?: number;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  altitudeMeters?: number;
  velocityKmH?: number;
  city: string;
  country: string;

  // Proving & Validation
  status: TelemetryStatus;
  nexisScore: number; // 0 - 100
  proof: MeasurementProof;
  quarantineReason?: string;
}

export interface S2CoverageCell {
  cellId: string;
  level: number;
  centerLat: number;
  centerLng: number;
  carrierName: string;
  networkType: string;
  totalSamples: number;
  distinctDevices: number;
  avgDownloadMbps: number;
  avgUploadMbps: number;
  avgLatencyMs: number;
  avgRsrpDbm: number;
  reliabilityScore: number;
  kAnonPassed: boolean;
  lastUpdated: number;
}

export interface ProbeDevice {
  deviceId: string;
  deviceModel: string;
  osVersion: string;
  platform: string;
  trustScore: number; // 0 - 100
  status: ProbeStatus;
  totalSubmissions: number;
  verifiedSubmissions: number;
  quarantinedSubmissions: number;
  firstSeen: number;
  lastSeen: number;
  lastKnownLocation: string;
  recentFlags: AnomalyType[];
}

export interface ValidationRuleConfig {
  maxSpeed5GMbps: number;
  maxSpeed4GMbps: number;
  maxSpeed3GMbps: number;
  maxSpeedWifiMbps: number;
  minAllowedLatencyMs: number;
  maxTransitVelocityKmH: number;
  rejectMockLocations: boolean;
  rateLimitMaxPerHour: number;
  hmacSignatureEnforced: boolean;
  iqrOutlierMultiplier: number;
  autoQuarantineThresholdScore: number;
  minContributorPrivacyThreshold: number; // k-anonymity (default 5)
}

export type AuditAction = 
  | 'APPROVE_RECORD' 
  | 'QUARANTINE_RECORD' 
  | 'PURGE_RECORD' 
  | 'SHADOW_BAN_DEVICE' 
  | 'REINSTATE_DEVICE'
  | 'SET_PROBATION'
  | 'UPDATE_RULES' 
  | 'INJECT_SIMULATION'
  | 'PURGE_EXPIRED_TELEMETRY'
  | string;

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  adminUser: string;
  action: AuditAction;
  targetId: string;
  details: string;
}

export interface ThroughputSample {
  timeSec: number;
  mbps: number;
  phase: 'download' | 'upload';
}

export interface ClientMeasurementRecord {
  id: string;
  timestamp: number;
  latencyMs: number | null;
  loadedLatencyMs?: number | null;
  downloadLoadedLatencyMs?: number | null;
  uploadLoadedLatencyMs?: number | null;
  bufferbloatMs?: number | null;
  bufferbloatGrade?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' | null;
  jitterMs: number | null;
  lossPercent: number | null;
  downloadMbps: number | null;
  uploadMbps: number | null;
  endpointUrl?: string;
  methodVersion?: string;
  location?: {
    lat: number;
    lng: number;
    accuracyM?: number;
    precision?: 'approximate' | 'precise';
    city?: string;
    country?: string;
  } | null;
  samples?: ThroughputSample[];
  durationSec?: number;
  colo?: string;
  isp?: string;
  asn?: string | number;
  asnOrg?: string;
  clientIp?: string;
  tags?: string[];
  notes?: string;
  createdAt?: string;
}
