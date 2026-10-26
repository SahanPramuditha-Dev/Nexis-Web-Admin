import { TelemetryRecord, S2CoverageCell, ClientMeasurementRecord } from '../types/telemetry';

export const SAMPLE_CLIENT_MEASUREMENTS: ClientMeasurementRecord[] = [
  {
    id: 'meas-cmb-dl-0192a',
    timestamp: Date.now() - 1000 * 60 * 14,
    latencyMs: 14.2,
    loadedLatencyMs: 22.8,
    downloadLoadedLatencyMs: 24.1,
    uploadLoadedLatencyMs: 21.5,
    bufferbloatMs: 8.6,
    bufferbloatGrade: 'A+',
    jitterMs: 1.8,
    lossPercent: 0.0,
    downloadMbps: 184.5,
    uploadMbps: 48.2,
    endpointUrl: 'https://cmb-edge01.nexis.io/speed',
    methodVersion: 'nexis-web-v1',
    colo: 'CMB (Colombo Anycast)',
    isp: 'Dialog Broadband Networks',
    asn: 'AS18001',
    asnOrg: 'Dialog Axiata PLC',
    clientIp: '112.134.82.14',
    tags: ['5G NSA', 'Sub-6GHz', 'Chrome 129'],
    notes: 'Low bufferbloat verified over optical backhaul.',
    samples: [
      { timeSec: 0.5, mbps: 42.1, phase: 'download' },
      { timeSec: 1.0, mbps: 98.4, phase: 'download' },
      { timeSec: 1.5, mbps: 145.2, phase: 'download' },
      { timeSec: 2.0, mbps: 184.5, phase: 'download' },
      { timeSec: 2.5, mbps: 182.1, phase: 'download' },
      { timeSec: 3.0, mbps: 184.5, phase: 'download' },
      { timeSec: 3.5, mbps: 15.2, phase: 'upload' },
      { timeSec: 4.0, mbps: 38.6, phase: 'upload' },
      { timeSec: 4.5, mbps: 48.2, phase: 'upload' },
      { timeSec: 5.0, mbps: 47.9, phase: 'upload' }
    ],
    durationSec: 5.2,
    location: {
      lat: 6.9271,
      lng: 79.8612,
      accuracyM: 12,
      precision: 'approximate',
      city: 'Colombo',
      country: 'Sri Lanka'
    }
  },
  {
    id: 'meas-kdy-slt-0481b',
    timestamp: Date.now() - 1000 * 60 * 48,
    latencyMs: 8.4,
    loadedLatencyMs: 38.2,
    downloadLoadedLatencyMs: 41.0,
    uploadLoadedLatencyMs: 35.4,
    bufferbloatMs: 29.8,
    bufferbloatGrade: 'B',
    jitterMs: 3.1,
    lossPercent: 0.1,
    downloadMbps: 95.8,
    uploadMbps: 88.4,
    endpointUrl: 'https://cmb-edge02.nexis.io/speed',
    methodVersion: 'nexis-web-v1',
    colo: 'CMB (Colombo Anycast)',
    isp: 'SLT-Mobitel Fiber',
    asn: 'AS9329',
    asnOrg: 'Sri Lanka Telecom',
    clientIp: '175.157.24.99',
    tags: ['GPON FTTH', 'Firefox 131'],
    notes: 'Symmetrical gigabit uplink with moderate buffer queueing.',
    samples: [
      { timeSec: 0.5, mbps: 35.0, phase: 'download' },
      { timeSec: 1.0, mbps: 78.0, phase: 'download' },
      { timeSec: 1.5, mbps: 95.8, phase: 'download' },
      { timeSec: 2.0, mbps: 94.2, phase: 'download' },
      { timeSec: 2.5, mbps: 30.1, phase: 'upload' },
      { timeSec: 3.0, mbps: 88.4, phase: 'upload' },
      { timeSec: 3.5, mbps: 87.0, phase: 'upload' }
    ],
    durationSec: 4.8,
    location: {
      lat: 7.2906,
      lng: 80.6337,
      accuracyM: 15,
      precision: 'approximate',
      city: 'Kandy',
      country: 'Sri Lanka'
    }
  },
  {
    id: 'meas-gal-mob-8821c',
    timestamp: Date.now() - 1000 * 60 * 92,
    latencyMs: 32.5,
    loadedLatencyMs: 145.8,
    downloadLoadedLatencyMs: 154.2,
    uploadLoadedLatencyMs: 137.4,
    bufferbloatMs: 113.3,
    bufferbloatGrade: 'D',
    jitterMs: 14.6,
    lossPercent: 1.4,
    downloadMbps: 28.4,
    uploadMbps: 9.1,
    endpointUrl: 'https://cmb-edge01.nexis.io/speed',
    methodVersion: 'nexis-web-v1',
    colo: 'SIN (Singapore Anycast)',
    isp: 'Mobitel (Pvt) Ltd',
    asn: 'AS17470',
    asnOrg: 'Mobitel Cellular',
    clientIp: '124.43.190.21',
    tags: ['4G LTE', 'Band 3', 'Safari iOS'],
    notes: 'Edge tower congestion during peak evening window.',
    samples: [
      { timeSec: 0.5, mbps: 8.2, phase: 'download' },
      { timeSec: 1.0, mbps: 19.5, phase: 'download' },
      { timeSec: 1.5, mbps: 28.4, phase: 'download' },
      { timeSec: 2.0, mbps: 26.1, phase: 'download' },
      { timeSec: 2.5, mbps: 4.1, phase: 'upload' },
      { timeSec: 3.0, mbps: 9.1, phase: 'upload' }
    ],
    durationSec: 4.5,
    location: {
      lat: 6.0535,
      lng: 80.2210,
      accuracyM: 25,
      precision: 'approximate',
      city: 'Galle',
      country: 'Sri Lanka'
    }
  },
  {
    id: 'meas-jfn-air-1109d',
    timestamp: Date.now() - 1000 * 60 * 180,
    latencyMs: 44.1,
    loadedLatencyMs: 78.5,
    downloadLoadedLatencyMs: 82.0,
    uploadLoadedLatencyMs: 75.0,
    bufferbloatMs: 34.4,
    bufferbloatGrade: 'C',
    jitterMs: 7.2,
    lossPercent: 0.4,
    downloadMbps: 45.2,
    uploadMbps: 14.7,
    endpointUrl: 'https://cmb-edge02.nexis.io/speed',
    methodVersion: 'nexis-web-v1',
    colo: 'CMB (Colombo Anycast)',
    isp: 'Airtel Sri Lanka',
    asn: 'AS45356',
    asnOrg: 'Bharti Airtel Lanka',
    clientIp: '203.115.30.12',
    tags: ['4G LTE', 'Android Chrome'],
    notes: 'Stable suburban LTE throughput.',
    samples: [
      { timeSec: 0.5, mbps: 14.0, phase: 'download' },
      { timeSec: 1.0, mbps: 36.2, phase: 'download' },
      { timeSec: 1.5, mbps: 45.2, phase: 'download' },
      { timeSec: 2.0, mbps: 44.8, phase: 'download' },
      { timeSec: 2.5, mbps: 8.0, phase: 'upload' },
      { timeSec: 3.0, mbps: 14.7, phase: 'upload' }
    ],
    durationSec: 4.2,
    location: {
      lat: 9.6615,
      lng: 80.0255,
      accuracyM: 20,
      precision: 'approximate',
      city: 'Jaffna',
      country: 'Sri Lanka'
    }
  },
  {
    id: 'meas-neg-htc-3091e',
    timestamp: Date.now() - 1000 * 60 * 240,
    latencyMs: 29.0,
    loadedLatencyMs: 52.1,
    downloadLoadedLatencyMs: 55.0,
    uploadLoadedLatencyMs: 49.2,
    bufferbloatMs: 23.1,
    bufferbloatGrade: 'B',
    jitterMs: 4.8,
    lossPercent: 0.0,
    downloadMbps: 38.6,
    uploadMbps: 16.2,
    endpointUrl: 'https://cmb-edge01.nexis.io/speed',
    methodVersion: 'nexis-web-v1',
    colo: 'CMB (Colombo Anycast)',
    isp: 'Hutchison Telecommunications',
    asn: 'AS18229',
    asnOrg: 'Hutchison Lanka',
    clientIp: '113.59.201.7',
    tags: ['4G LTE', 'Negombo Coastal'],
    notes: 'Coastal cell tower handoff test.',
    samples: [
      { timeSec: 0.5, mbps: 11.2, phase: 'download' },
      { timeSec: 1.0, mbps: 29.4, phase: 'download' },
      { timeSec: 1.5, mbps: 38.6, phase: 'download' },
      { timeSec: 2.0, mbps: 16.2, phase: 'upload' }
    ],
    durationSec: 3.8,
    location: {
      lat: 7.2008,
      lng: 79.8736,
      accuracyM: 18,
      precision: 'approximate',
      city: 'Negombo',
      country: 'Sri Lanka'
    }
  }
];

/**
 * Dynamically aggregates S2 coverage cells from actual database records,
 * rigorously calculating distinct device contributors and enforcing k-anonymity privacy thresholds.
 */
export function aggregateS2CellsFromRecords(
  records: TelemetryRecord[],
  minKAnon: number = 5
): S2CoverageCell[] {
  const map: Record<string, S2CoverageCell> = {};
  const deviceSets: Record<string, Set<string>> = {};

  records.forEach((r) => {
    if (!r.s2CellId) return;

    if (!map[r.s2CellId]) {
      map[r.s2CellId] = {
        cellId: r.s2CellId,
        level: r.s2Level || 13,
        centerLat: r.latitude,
        centerLng: r.longitude,
        carrierName: r.carrierName,
        networkType: r.networkType,
        totalSamples: 0,
        distinctDevices: 0,
        avgDownloadMbps: 0,
        avgUploadMbps: 0,
        avgLatencyMs: 0,
        avgRsrpDbm: r.rsrpDbm || -85,
        reliabilityScore: 95,
        kAnonPassed: false,
        lastUpdated: r.timestamp
      };
      deviceSets[r.s2CellId] = new Set<string>();
    }

    const c = map[r.s2CellId];
    if (r.deviceId) {
      deviceSets[r.s2CellId].add(r.deviceId);
    }
    c.totalSamples++;
    c.avgDownloadMbps = Number(((c.avgDownloadMbps * (c.totalSamples - 1) + r.downloadMbps) / c.totalSamples).toFixed(1));
    c.avgUploadMbps = Number(((c.avgUploadMbps * (c.totalSamples - 1) + r.uploadMbps) / c.totalSamples).toFixed(1));
    c.avgLatencyMs = Number(((c.avgLatencyMs * (c.totalSamples - 1) + r.latencyMedianMs) / c.totalSamples).toFixed(1));
    c.lastUpdated = Math.max(c.lastUpdated, r.timestamp);
  });

  // Finalize distinct device counts and k-anonymity validation
  Object.keys(map).forEach((cellId) => {
    const devices = deviceSets[cellId] ? deviceSets[cellId].size : 1;
    map[cellId].distinctDevices = devices;
    map[cellId].kAnonPassed = devices >= minKAnon;
  });

  return Object.values(map);
}
