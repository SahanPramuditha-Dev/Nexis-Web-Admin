import React from 'react';
import { Activity, ArrowDown, ArrowUp, Zap } from 'lucide-react';
import { TelemetryRecord } from '../../../types/telemetry';

interface CarrierBenchmarkMatrixProps {
  records: TelemetryRecord[];
}

interface CarrierStat {
  carrierName: string;
  count: number;
  avgDl: number;
  avgUl: number;
  avgLat: number;
  avgJitter: number;
}

export const CarrierBenchmarkMatrix: React.FC<CarrierBenchmarkMatrixProps> = ({ records }) => {
  // Aggregate stats by carrier
  const carrierMap: Record<string, { count: number; dl: number; ul: number; lat: number; jitter: number }> = {};

  records.forEach((r) => {
    const c = r.carrierName || 'Unknown Carrier';
    if (!carrierMap[c]) {
      carrierMap[c] = { count: 0, dl: 0, ul: 0, lat: 0, jitter: 0 };
    }
    const item = carrierMap[c];
    item.count++;
    item.dl += r.downloadMbps;
    item.ul += r.uploadMbps;
    item.lat += r.latencyMedianMs;
    item.jitter += r.jitterMs;
  });

  const carriers: CarrierStat[] = Object.entries(carrierMap)
    .map(([name, data]) => ({
      carrierName: name,
      count: data.count,
      avgDl: Math.round(data.dl / data.count),
      avgUl: Math.round(data.ul / data.count),
      avgLat: Math.round(data.lat / data.count),
      avgJitter: Math.round(data.jitter / data.count)
    }))
    .sort((a, b) => b.avgDl - a.avgDl);

  const maxDl = Math.max(...carriers.map((c) => c.avgDl), 100);

  return (
    <div className="p-6 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-white text-base">
          <Activity className="h-4 w-4 text-[#0A84FF]" />
          Carrier Speed & Latency Matrix
        </div>
        <span className="text-xs text-[#8E8E93]">Live Aggregations</span>
      </div>

      <div className="space-y-4 pt-1">
        {carriers.length === 0 ? (
          <div className="text-xs text-[#8E8E93] py-8 text-center">No carrier benchmarks available</div>
        ) : (
          carriers.map((c) => {
            const dlBarPct = Math.min(100, Math.round((c.avgDl / maxDl) * 100));
            return (
              <div key={c.carrierName} className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-3">
                
                {/* Carrier Title & Sample Size */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{c.carrierName}</span>
                  <span className="text-[10px] font-mono text-[#8E8E93] px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.06]">
                    {c.count} tests
                  </span>
                </div>

                {/* Progress bar for Download bandwidth */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono-num">
                    <span className="text-[#8E8E93] flex items-center gap-1 text-[11px]">
                      <ArrowDown className="h-3 w-3 text-[#0A84FF]" /> Download
                    </span>
                    <span className="text-white font-bold">{c.avgDl} Mbps</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/60 overflow-hidden border border-white/[0.04]">
                    <div
                      className="h-full bg-gradient-to-r from-[#0A84FF] to-[#64D2FF] rounded-full transition-all"
                      style={{ width: `${dlBarPct}%` }}
                    />
                  </div>
                </div>

                {/* Uplink & Latency Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#8E8E93] uppercase block font-medium">Upload</span>
                    <span className="text-white font-mono-num font-bold text-xs">{c.avgUl} Mbps</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#8E8E93] uppercase block font-medium">Latency</span>
                    <span className="text-white font-mono-num font-bold text-xs">{c.avgLat} ms</span>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-[10px] text-[#8E8E93] uppercase block font-medium">Jitter</span>
                    <span className="text-white font-mono-num font-bold text-xs">{c.avgJitter} ms</span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
