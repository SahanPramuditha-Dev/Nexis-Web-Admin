export interface CarrierStats {
  name: string;
  samples: number;
  sampleSharePct: number;
  avgDownload: number;
  avgUpload: number;
  avgLatency: number;
  avgJitter: number;
  avgLoss: number;
  avgRsrp: number;
  pct5G: number;
  pctLTE: number;
  pct3G: number;
  pctWiFi: number;
  rsrpTiers: {
    excellent: number; // > -80 dBm
    good: number;      // -80 to -90
    fair: number;      // -90 to -100
    poor: number;      // < -100
  };
  slaDownloadPass: number; // % >= 10 Mbps
  slaLatencyPass: number;  // % <= 50 ms
  slaLossPass: number;     // % <= 1.0 %
  slaJitterPass: number;   // % <= 10 ms
  slaOverallPass: number;
}

export type TimeframeOption = '1h' | '24h' | '7d' | '30d' | 'all';
export type ChartViewOption = 'bar' | 'radar';
