import { 
  TelemetryRecord, 
  S2CoverageCell, 
  ProbeDevice, 
  ValidationRuleConfig, 
  AuditLogEntry,
  ClientMeasurementRecord 
} from '../types/telemetry';
import { aggregateS2CellsFromRecords, SAMPLE_CLIENT_MEASUREMENTS } from './seedData';
import { ValidationEngine } from './validationEngine';
import { supabase, isSupabaseConfigured } from './supabase';
import { localCache } from './localCache';

type Listener = () => void;

const DEFAULT_FALLBACK_RULES: ValidationRuleConfig = {
  maxSpeed5GMbps: 2500,
  maxSpeed4GMbps: 600,
  maxSpeed3GMbps: 45,
  maxSpeedWifiMbps: 3500,
  minAllowedLatencyMs: 0.8,
  maxTransitVelocityKmH: 950,
  rejectMockLocations: true,
  rateLimitMaxPerHour: 60,
  hmacSignatureEnforced: true,
  iqrOutlierMultiplier: 1.5,
  autoQuarantineThresholdScore: 60,
  minContributorPrivacyThreshold: 5
};

class TelemetryService {
  private records: TelemetryRecord[] = [];
  private cells: S2CoverageCell[] = [];
  private probes: ProbeDevice[] = [];
  private measurements: ClientMeasurementRecord[] = [...SAMPLE_CLIENT_MEASUREMENTS];
  private rules: ValidationRuleConfig = { ...DEFAULT_FALLBACK_RULES };
  private auditLogs: AuditLogEntry[] = [];
  private listeners: Set<Listener> = new Set();
  private isLiveSupabase: boolean = false;
  private realtimeChannel: any = null;
  private insertBuffer: any[] = [];
  private flushTimer: any = null;
  private pendingRuleUpdate: { rules: ValidationRuleConfig; adminUser: string } | null = null;
  private ruleDebounceTimer: any = null;

  constructor() {
    this.initialize();
  }

  public async initialize() {
    // 0. Instantly hydrate from local IndexedDB cache for instant render (<50ms)
    try {
      const [cachedRecords, cachedProbes] = await Promise.all([
        localCache.getAllRecords<TelemetryRecord>('telemetry_records'),
        localCache.getAllRecords<ProbeDevice>('probe_devices')
      ]);

      if (cachedRecords.length > 0) {
        this.records = cachedRecords.sort((a, b) => b.timestamp - a.timestamp);
        this.cells = aggregateS2CellsFromRecords(this.records, this.rules.minContributorPrivacyThreshold || 5);
        this.notify();
      }

      if (cachedProbes.length > 0) {
        this.probes = cachedProbes;
        this.notify();
      }
    } catch (e) {
      console.warn('Local cache hydration warning:', e);
    }

    if (!isSupabaseConfigured || !supabase) {
      console.warn('Supabase is not configured in .env');
      return;
    }

    try {
      // 1. Fetch live telemetry records using Delta Sync if cached, else initial sync
      let dbRecords: any[] = [];
      const latestCachedTime = this.records.length > 0 
        ? Math.max(...this.records.map(r => r.timestamp))
        : null;

      if (latestCachedTime && this.records.length > 0) {
        // Delta sync: only fetch records newer than the most recent cached timestamp
        const { data, error } = await supabase
          .from('telemetry_records')
          .select('*')
          .gt('timestamp', new Date(latestCachedTime).toISOString())
          .order('timestamp', { ascending: false });

        if (!error && data) {
          if (data.length > 0) {
            const newMapped = data.map((r: any) => this.mapDbToRecord(r));
            // Merge delta with existing cache
            const existingMap = new Map(this.records.map(r => [r.id, r]));
            newMapped.forEach(r => existingMap.set(r.id, r));
            this.records = Array.from(existingMap.values()).sort((a, b) => b.timestamp - a.timestamp);
            this.cells = aggregateS2CellsFromRecords(this.records, this.rules.minContributorPrivacyThreshold || 5);
            // Save new delta records to IndexedDB
            await localCache.putRecords('telemetry_records', newMapped);
          }
          this.isLiveSupabase = true;
        }
      } else {
        // Initial full load
        const { data, error: recError } = await supabase
          .from('telemetry_records')
          .select('*')
          .order('timestamp', { ascending: false });

        if (!recError && data) {
          this.records = data.map((r: any) => this.mapDbToRecord(r));
          this.cells = aggregateS2CellsFromRecords(this.records, this.rules.minContributorPrivacyThreshold || 5);
          this.isLiveSupabase = true;
          // Cache to IndexedDB in background
          localCache.putRecords('telemetry_records', this.records);
        }
      }

      // 2. Fetch live probe devices
      const { data: dbProbes, error: probeError } = await supabase
        .from('probe_devices')
        .select('*');

      if (!probeError && dbProbes) {
        this.probes = dbProbes.map((p: any) => ({
          deviceId: p.device_id,
          deviceModel: p.device_model || 'Unknown',
          osVersion: p.os_version || 'Unknown',
          platform: p.platform || 'Android',
          trustScore: p.reputation_score || 85,
          status: p.status,
          totalSubmissions: Number(p.total_submissions || 0),
          verifiedSubmissions: Number(p.verified_submissions || 0),
          quarantinedSubmissions: Number(p.quarantined_submissions || 0),
          firstSeen: new Date(p.first_seen).getTime(),
          lastSeen: new Date(p.last_seen).getTime(),
          lastKnownLocation: p.notes || 'Active Probe',
          recentFlags: []
        }));
        // Cache to IndexedDB in background
        localCache.putRecords('probe_devices', this.probes);
      }

      // 2.1 Fetch live client speed test measurements
      const { data: dbMeas, error: measError } = await supabase
        .from('measurements')
        .select('*')
        .order('timestamp', { ascending: false });

      if (!measError && dbMeas && dbMeas.length > 0) {
        this.measurements = dbMeas.map((m: any) => this.mapDbToMeasurement(m));
      }

      // 3. Fetch live validation rules
      const { data: dbRules, error: ruleError } = await supabase
        .from('validation_rules')
        .select('*')
        .eq('id', 'current_rules')
        .single();

      if (!ruleError && dbRules) {
        this.rules = {
          maxSpeed5GMbps: Number(dbRules.max_speed_5g_mbps),
          maxSpeed4GMbps: Number(dbRules.max_speed_4g_mbps),
          maxSpeed3GMbps: Number(dbRules.max_speed_3g_mbps),
          maxSpeedWifiMbps: Number(dbRules.max_speed_wifi_mbps),
          minAllowedLatencyMs: Number(dbRules.min_allowed_latency_ms),
          maxTransitVelocityKmH: Number(dbRules.max_transit_velocity_kmh),
          rejectMockLocations: dbRules.reject_mock_locations,
          rateLimitMaxPerHour: Number(dbRules.rate_limit_max_per_hour),
          hmacSignatureEnforced: true,
          iqrOutlierMultiplier: Number(dbRules.iqr_outlier_multiplier),
          autoQuarantineThresholdScore: Number(dbRules.auto_quarantine_score),
          minContributorPrivacyThreshold: Number(dbRules.min_contributor_k_anonymity)
        };
      }

      // 4. Fetch live audit logs
      const { data: dbLogs, error: logError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!logError && dbLogs) {
        this.auditLogs = dbLogs.map((l: any) => ({
          id: l.id,
          timestamp: new Date(l.created_at).getTime(),
          adminUser: l.admin_user,
          action: l.action,
          targetId: l.target_id,
          details: typeof l.details === 'string' ? l.details : JSON.stringify(l.details)
        }));
      }

      // 5. Connect Realtime WebSocket Subscription
      if (!this.realtimeChannel) {
        this.realtimeChannel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'telemetry_records' },
            () => this.refetchRecords()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'probe_devices' },
            () => this.refetchProbes()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'measurements' },
            () => this.refetchMeasurements()
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'audit_logs' },
            () => this.refetchLogs()
          )
          .subscribe();
      }

      this.notify();
    } catch (e) {
      console.error('Failed to load data from Supabase:', e);
    }
  }

  private mapDbToRecord(r: any): TelemetryRecord {
    return {
      id: r.id,
      timestamp: new Date(r.timestamp).getTime(),
      deviceId: r.device_id,
      deviceModel: r.device_id,
      osVersion: 'Android',
      networkType: r.network_type,
      carrierName: r.carrier_name,
      mcc: r.mcc,
      mnc: r.mnc,
      cellId: r.cell_id,
      downloadMbps: Number(r.download_mbps),
      uploadMbps: Number(r.upload_mbps),
      latencyMedianMs: Number(r.latency_ms),
      jitterMs: Number(r.jitter_ms),
      packetLossPct: Number(r.packet_loss_pct),
      bufferbloatMs: r.bufferbloat_ms ? Number(r.bufferbloat_ms) : undefined,
      rsrpDbm: r.rsrp_dbm,
      rsrqDb: r.rsrq_db,
      sinrDb: r.sinr_db,
      rssiDbm: r.rssi_dbm,
      s2CellId: r.s2_cell_id,
      s2Level: r.s2_level || 13,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      accuracyMeters: r.accuracy_meters ? Number(r.accuracy_meters) : undefined,
      velocityKmH: r.velocity_kmh ? Number(r.velocity_kmh) : 0,
      city: r.city || 'Field Location',
      country: r.country || 'Sri Lanka',
      status: r.status,
      nexisScore: r.integrity_score || 95,
      proof: {
        proofSignature: r.proof_signature || 'live_sig',
        payloadDigest: r.payload_digest || 'live_digest',
        isAuthentic: r.status === 'VERIFIED',
        isMockDetected: r.is_mock_location || false,
        algorithm: 'Ed25519-HMAC-SHA256',
        integrityScore: r.integrity_score || 95,
        anomalies: r.anomalies || []
      },
      quarantineReason: r.quarantine_reason
    };
  }

  public async refetchRecords() {
    if (!supabase) return;
    const { data } = await supabase
      .from('telemetry_records')
      .select('*')
      .order('timestamp', { ascending: false });

    if (data) {
      this.records = data.map((r: any) => this.mapDbToRecord(r));
      this.cells = aggregateS2CellsFromRecords(this.records, this.rules.minContributorPrivacyThreshold || 5);
      // Asynchronously update local offline cache
      localCache.putRecords('telemetry_records', this.records);
      this.notify();
    }
  }

  public async refetchProbes() {
    if (!supabase) return;
    const { data } = await supabase.from('probe_devices').select('*');
    if (data) {
      this.probes = data.map((p: any) => ({
        deviceId: p.device_id,
        deviceModel: p.device_model || 'Unknown',
        osVersion: p.os_version || 'Unknown',
        platform: p.platform || 'Android',
        trustScore: p.reputation_score || 85,
        status: p.status,
        totalSubmissions: Number(p.total_submissions || 0),
        verifiedSubmissions: Number(p.verified_submissions || 0),
        quarantinedSubmissions: Number(p.quarantined_submissions || 0),
        firstSeen: new Date(p.first_seen).getTime(),
        lastSeen: new Date(p.last_seen).getTime(),
        lastKnownLocation: p.notes || 'Active Probe',
        recentFlags: []
      }));
      // Asynchronously update local offline cache
      localCache.putRecords('probe_devices', this.probes);
      this.notify();
    }
  }

  public async refetchLogs() {
    if (!supabase) return;
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) {
      this.auditLogs = data.map((l: any) => ({
        id: l.id,
        timestamp: new Date(l.created_at).getTime(),
        adminUser: l.admin_user,
        action: l.action,
        targetId: l.target_id,
        details: typeof l.details === 'string' ? l.details : JSON.stringify(l.details)
      }));
      this.notify();
    }
  }

  private mapDbToMeasurement(m: any): ClientMeasurementRecord {
    return {
      id: m.id,
      timestamp: Number(m.timestamp),
      latencyMs: m.latency_ms !== null && m.latency_ms !== undefined ? Number(m.latency_ms) : null,
      loadedLatencyMs: m.loaded_latency_ms !== null && m.loaded_latency_ms !== undefined ? Number(m.loaded_latency_ms) : null,
      downloadLoadedLatencyMs: m.download_loaded_latency_ms !== null && m.download_loaded_latency_ms !== undefined ? Number(m.download_loaded_latency_ms) : null,
      uploadLoadedLatencyMs: m.upload_loaded_latency_ms !== null && m.upload_loaded_latency_ms !== undefined ? Number(m.upload_loaded_latency_ms) : null,
      bufferbloatMs: m.bufferbloat_ms !== null && m.bufferbloat_ms !== undefined ? Number(m.bufferbloat_ms) : null,
      bufferbloatGrade: m.bufferbloat_grade || null,
      jitterMs: m.jitter_ms !== null && m.jitter_ms !== undefined ? Number(m.jitter_ms) : null,
      lossPercent: m.loss_percent !== null && m.loss_percent !== undefined ? Number(m.loss_percent) : null,
      downloadMbps: m.download_mbps !== null && m.download_mbps !== undefined ? Number(m.download_mbps) : null,
      uploadMbps: m.upload_mbps !== null && m.upload_mbps !== undefined ? Number(m.upload_mbps) : null,
      endpointUrl: m.endpoint_url,
      methodVersion: m.method_version,
      location: m.location,
      samples: m.samples || [],
      durationSec: m.duration_sec !== null && m.duration_sec !== undefined ? Number(m.duration_sec) : undefined,
      colo: m.colo,
      isp: m.isp,
      asn: m.asn,
      asnOrg: m.asn_org,
      clientIp: m.client_ip,
      tags: m.tags || [],
      notes: m.notes,
      createdAt: m.created_at
    };
  }

  public async refetchMeasurements() {
    if (!supabase) return;
    const { data } = await supabase
      .from('measurements')
      .select('*')
      .order('timestamp', { ascending: false });

    if (data && data.length > 0) {
      this.measurements = data.map((m: any) => this.mapDbToMeasurement(m));
      this.notify();
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Getters
  public getRecords(): TelemetryRecord[] { return this.records; }
  public getMeasurements(): ClientMeasurementRecord[] { return this.measurements; }
  public getCells(): S2CoverageCell[] { return this.cells; }
  public getProbes(): ProbeDevice[] { return this.probes; }
  public getRules(): ValidationRuleConfig { return this.rules; }
  public getAuditLogs(): AuditLogEntry[] { return this.auditLogs; }
  public isConnectedToSupabase(): boolean { return this.isLiveSupabase; }

  public async deleteMeasurement(id: string, adminUser: string = 'SuperAdmin') {
    if (supabase) {
      await supabase.from('measurements').delete().eq('id', id);

      await supabase.from('audit_logs').insert({
        admin_user: adminUser,
        action: 'PURGE_RECORD',
        target_id: id,
        details: { message: `Purged client speed benchmark measurement: ${id}` }
      });
    }

    this.measurements = this.measurements.filter((m) => m.id !== id);
    this.notify();
  }

  // Live Database Actions
  public async approveRecord(id: string, adminUser: string = 'SuperAdmin') {
    if (supabase) {
      await supabase
        .from('telemetry_records')
        .update({ status: 'VERIFIED', integrity_score: 98, quarantine_reason: null })
        .eq('id', id);

      await supabase.from('audit_logs').insert({
        admin_user: adminUser,
        action: 'APPROVE_RECORD',
        target_id: id,
        details: { message: 'Approved quarantined telemetry record into verified public dataset.' }
      });
    }

    await this.refetchRecords();
    await this.refetchLogs();
  }

  public async quarantineRecord(id: string, reason: string = 'Manual Admin Quarantine', adminUser: string = 'SuperAdmin') {
    if (supabase) {
      await supabase
        .from('telemetry_records')
        .update({ status: 'QUARANTINED', quarantine_reason: reason })
        .eq('id', id);

      await supabase.from('audit_logs').insert({
        admin_user: adminUser,
        action: 'QUARANTINE_RECORD',
        target_id: id,
        details: { message: `Quarantined record: ${reason}` }
      });
    }

    await this.refetchRecords();
    await this.refetchLogs();
  }

  public async purgeRecord(id: string, adminUser: string = 'SuperAdmin') {
    if (supabase) {
      await supabase.from('telemetry_records').delete().eq('id', id);

      await supabase.from('audit_logs').insert({
        admin_user: adminUser,
        action: 'PURGE_RECORD',
        target_id: id,
        details: { message: 'Permanently purged invalid or poisoned telemetry record.' }
      });
    }

    await this.refetchRecords();
    await this.refetchLogs();
  }

  public async updateRules(newRules: ValidationRuleConfig, adminUser: string = 'SuperAdmin') {
    this.rules = { ...newRules };
    this.cells = aggregateS2CellsFromRecords(this.records, this.rules.minContributorPrivacyThreshold || 5);
    this.notify();

    // Debounce database write by 500ms to coalesce rapid slider adjustments
    this.pendingRuleUpdate = { rules: newRules, adminUser };
    if (this.ruleDebounceTimer) {
      clearTimeout(this.ruleDebounceTimer);
    }

    this.ruleDebounceTimer = setTimeout(async () => {
      if (!this.pendingRuleUpdate || !supabase) return;
      const { rules, adminUser: user } = this.pendingRuleUpdate;
      this.pendingRuleUpdate = null;

      try {
        await supabase.from('validation_rules').upsert({
          id: 'current_rules',
          max_speed_5g_mbps: rules.maxSpeed5GMbps,
          max_speed_4g_mbps: rules.maxSpeed4GMbps,
          max_speed_3g_mbps: rules.maxSpeed3GMbps,
          max_speed_wifi_mbps: rules.maxSpeedWifiMbps,
          min_allowed_latency_ms: rules.minAllowedLatencyMs,
          max_transit_velocity_kmh: rules.maxTransitVelocityKmH,
          reject_mock_locations: rules.rejectMockLocations,
          rate_limit_max_per_hour: rules.rateLimitMaxPerHour,
          iqr_outlier_multiplier: rules.iqrOutlierMultiplier,
          auto_quarantine_score: rules.autoQuarantineThresholdScore,
          min_contributor_k_anonymity: rules.minContributorPrivacyThreshold,
          updated_at: new Date().toISOString()
        });

        await supabase.from('audit_logs').insert({
          admin_user: user,
          action: 'UPDATE_RULES',
          target_id: 'current_rules',
          details: { message: 'Updated physical speed ceilings and zero-trust validation thresholds.' }
        });
      } catch (err) {
        console.error('Failed to update validation rules in Supabase:', err);
      }
    }, 500);
  }

  public async purgeExpiredRecords(retentionDays: number = 30, adminUser: string = 'SuperAdmin') {
    if (supabase) {
      try {
        // Attempt database function call first
        const { data, error } = await supabase.rpc('purge_expired_telemetry', { retention_days: retentionDays });
        if (error) {
          // Fallback direct delete query if RPC is not deployed yet
          const cutoffIso = new Date(Date.now() - retentionDays * 86400000).toISOString();
          await supabase
            .from('telemetry_records')
            .delete()
            .lt('created_at', cutoffIso);

          await supabase.from('audit_logs').insert({
            admin_user: adminUser,
            action: 'PURGE_EXPIRED_TELEMETRY',
            target_id: 'telemetry_records',
            details: { message: `Purged raw telemetry records older than ${retentionDays} days to satisfy privacy retention policy.` }
          });
        }
      } catch (err) {
        console.warn('Auto-retention purge error:', err);
      }
    }

    await this.refetchRecords();
    await this.refetchLogs();
  }

  public async shadowBanDevice(deviceId: string, adminUser: string = 'SuperAdmin') {
    if (supabase) {
      await supabase
        .from('probe_devices')
        .update({ status: 'SHADOW_BANNED', reputation_score: 0 })
        .eq('device_id', deviceId);

      await supabase
        .from('telemetry_records')
        .update({ status: 'REJECTED', quarantine_reason: 'Device shadow-banned.' })
        .eq('device_id', deviceId);

      await supabase.from('audit_logs').insert({
        admin_user: adminUser,
        action: 'SHADOW_BAN_DEVICE',
        target_id: deviceId,
        details: { message: 'Shadow-banned device. Subsequent telemetry will be discarded silently.' }
      });
    }

    await this.refetchProbes();
    await this.refetchRecords();
    await this.refetchLogs();
  }

  public async reinstateDevice(deviceId: string, adminUser: string = 'SuperAdmin') {
    if (supabase) {
      await supabase
        .from('probe_devices')
        .update({ status: 'ACTIVE', reputation_score: 85 })
        .eq('device_id', deviceId);

      await supabase.from('audit_logs').insert({
        admin_user: adminUser,
        action: 'APPROVE_RECORD',
        target_id: deviceId,
        details: { message: `Reinstated probe device ${deviceId} to ACTIVE fleet status.` }
      });
    }

    const p = this.probes.find((pr) => pr.deviceId === deviceId);
    if (p) {
      p.status = 'ACTIVE';
      p.trustScore = 85;
    }
    this.notify();
    await this.refetchProbes();
    await this.refetchLogs();
  }

  public async setDeviceProbation(deviceId: string, adminUser: string = 'SuperAdmin') {
    if (supabase) {
      await supabase
        .from('probe_devices')
        .update({ status: 'PROBATIONARY', reputation_score: 50 })
        .eq('device_id', deviceId);

      await supabase.from('audit_logs').insert({
        admin_user: adminUser,
        action: 'UPDATE_RULES',
        target_id: deviceId,
        details: { message: `Placed probe device ${deviceId} on PROBATION.` }
      });
    }

    const p = this.probes.find((pr) => pr.deviceId === deviceId);
    if (p) {
      p.status = 'PROBATIONARY';
      p.trustScore = 50;
    }
    this.notify();
    await this.refetchProbes();
    await this.refetchLogs();
  }

  /**
   * Buffered Batch Ingestion:
   * Coalesces high-throughput telemetry records into batched multi-row inserts
   * to minimize database transactions and roundtrips.
   */
  public async queueRecordInsert(recordPayload: any) {
    this.insertBuffer.push(recordPayload);

    if (this.insertBuffer.length >= 25) {
      await this.flushInsertBuffer();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.flushInsertBuffer();
      }, 1500);
    }
  }

  public async flushInsertBuffer() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.insertBuffer.length === 0 || !supabase) return;

    const batch = [...this.insertBuffer];
    this.insertBuffer = [];

    try {
      const { error } = await supabase.from('telemetry_records').insert(batch);
      if (!error) {
        await this.refetchRecords();
      } else {
        console.error('Batch telemetry insert failed:', error);
      }
    } catch (err) {
      console.error('Batch insert network exception:', err);
    }
  }
}

export const telemetryService = new TelemetryService();
