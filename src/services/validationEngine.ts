import { TelemetryRecord, ValidationRuleConfig, AnomalyType } from '../types/telemetry';

export class ValidationEngine {
  /**
   * Run full physics and zero-trust validation on an incoming telemetry payload
   */
  public static evaluateRecord(
    record: Partial<TelemetryRecord>,
    rules: ValidationRuleConfig,
    previousRecordForDevice?: TelemetryRecord
  ): {
    status: TelemetryRecord['status'];
    score: number;
    anomalies: AnomalyType[];
    reason?: string;
  } {
    const anomalies: AnomalyType[] = [];
    let score = 100;

    // 1. Mock GPS & Developer Options Detection
    if (record.proof?.isMockDetected || (record as any).isMockLocation) {
      anomalies.push('MOCK_LOCATION_ACTIVE');
      score -= 70;
    }

    // 2. Physical Speed Ceiling vs Radio Technology
    const dl = record.downloadMbps || 0;
    const net = record.networkType || 'LTE';

    if (net === '5G' && dl > rules.maxSpeed5GMbps) {
      anomalies.push('IMPOSSIBLE_SPEED_FOR_TECH');
      score -= 40;
    } else if (net === 'LTE' && dl > rules.maxSpeed4GMbps) {
      anomalies.push('IMPOSSIBLE_SPEED_FOR_TECH');
      score -= 45;
    } else if (net === '3G' && dl > rules.maxSpeed3GMbps) {
      anomalies.push('IMPOSSIBLE_SPEED_FOR_TECH');
      score -= 50;
    } else if (net === 'WIFI' && dl > rules.maxSpeedWifiMbps) {
      anomalies.push('IMPOSSIBLE_SPEED_FOR_TECH');
      score -= 40;
    }

    // 3. Impossible Latency Physics (< minAllowedLatencyMs)
    if (record.latencyMedianMs !== undefined && record.latencyMedianMs < rules.minAllowedLatencyMs) {
      anomalies.push('IMPOSSIBLE_LOW_LATENCY');
      score -= 35;
    }

    // 4. Transit Velocity Teleportation (Speed between consecutive samples from same device)
    if (previousRecordForDevice && record.timestamp && record.latitude && record.longitude) {
      const timeDiffHours = (record.timestamp - previousRecordForDevice.timestamp) / 3600000;
      if (timeDiffHours > 0 && timeDiffHours < 24) {
        const distKm = this.calculateHaversineDistance(
          previousRecordForDevice.latitude,
          previousRecordForDevice.longitude,
          record.latitude,
          record.longitude
        );
        const velocity = distKm / timeDiffHours;
        if (velocity > rules.maxTransitVelocityKmH) {
          anomalies.push('VELOCITY_TELEPORTATION');
          score -= 60;
        }
      }
    }

    // 5. Future timestamp or extreme drift
    if (record.timestamp && record.timestamp > Date.now() + 60000) {
      anomalies.push('FUTURE_TIMESTAMP');
      score -= 50;
    }

    score = Math.max(0, Math.min(100, score));

    // Determine Status
    let status: TelemetryRecord['status'] = 'VERIFIED';
    if (anomalies.includes('MOCK_LOCATION_ACTIVE')) {
      status = 'SPOOFED_MOCK';
    } else if (score < rules.autoQuarantineThresholdScore) {
      status = 'QUARANTINED';
    } else if (anomalies.length > 0) {
      status = 'FLAGGED';
    }

    return {
      status,
      score,
      anomalies,
      reason: anomalies.length > 0 ? anomalies.join(', ') : undefined
    };
  }

  /**
   * Calculate distance between two lat/lng coordinates in kilometers (Haversine formula)
   */
  public static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
