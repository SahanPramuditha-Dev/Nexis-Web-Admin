import React from 'react';
import { Layers, Signal, Wifi, Cpu } from 'lucide-react';
import { TelemetryRecord } from '../../../types/telemetry';

interface TechnologyBreakdownCardProps {
  records: TelemetryRecord[];
}

export const TechnologyBreakdownCard: React.FC<TechnologyBreakdownCardProps> = ({ records }) => {
  const total = records.length;

  // Aggregate RATs
  const ratCounts = {
    '5G': 0,
    LTE: 0,
    '3G': 0,
    WIFI: 0
  };

  // Dynamic Carrier counts
  const carrierCounts: Record<string, number> = {};

  records.forEach((r) => {
    if (r.networkType in ratCounts) {
      ratCounts[r.networkType as keyof typeof ratCounts]++;
    }
    const c = r.carrierName || 'Unknown Carrier';
    carrierCounts[c] = (carrierCounts[c] || 0) + 1;
  });

  const dynamicCarriers = Object.entries(carrierCounts).sort((a, b) => b[1] - a[1]);

  const ratColors = {
    '5G': { bg: 'bg-[#0A84FF]', text: 'text-[#0A84FF]', badge: 'bg-[#0A84FF]/15 border-[#0A84FF]/30' },
    LTE: { bg: 'bg-[#64D2FF]', text: 'text-[#64D2FF]', badge: 'bg-[#64D2FF]/15 border-[#64D2FF]/30' },
    '3G': { bg: 'bg-[#FF9F0A]', text: 'text-[#FF9F0A]', badge: 'bg-[#FF9F0A]/15 border-[#FF9F0A]/30' },
    WIFI: { bg: 'bg-[#BF5AF2]', text: 'text-[#BF5AF2]', badge: 'bg-[#BF5AF2]/15 border-[#BF5AF2]/30' }
  };

  return (
    <div className="p-6 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] flex flex-col justify-between space-y-6">
      
      {/* RAT Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Layers className="h-4 w-4 text-[#0A84FF]" />
            Radio Access Technology (RAT)
          </div>
          <span className="text-xs text-[#8E8E93] font-medium">{total} Samples</span>
        </div>

        {/* Stacked Technology Bar */}
        <div className="h-3 w-full rounded-full bg-black/40 overflow-hidden flex border border-white/[0.08] mb-4">
          {Object.entries(ratCounts).map(([rat, count]) => {
            if (count === 0) return null;
            const pct = total > 0 ? (count / total) * 100 : 0;
            const color = ratColors[rat as keyof typeof ratColors]?.bg || 'bg-white/20';
            return (
              <div
                key={rat}
                style={{ width: `${pct}%` }}
                className={`${color} h-full transition-all`}
                title={`${rat}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* RAT Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(['5G', 'LTE', '3G', 'WIFI'] as const).map((rat) => {
            const count = ratCounts[rat];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const meta = ratColors[rat];
            return (
              <div
                key={rat}
                className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] flex flex-col justify-between space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded border ${meta.badge} ${meta.text}`}>
                    {rat}
                  </span>
                  <span className="text-[10px] text-[#8E8E93] font-mono-num">{pct}%</span>
                </div>
                <div className="text-lg font-extrabold text-white font-mono-num">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carrier Distribution */}
      <div className="border-t border-white/[0.08] pt-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">Active Carrier Share</span>
          <span className="text-[#8E8E93]">{dynamicCarriers.length} Carriers</span>
        </div>

        <div className="space-y-2.5">
          {dynamicCarriers.length === 0 ? (
            <div className="text-xs text-[#8E8E93] py-4 text-center">No carrier data available</div>
          ) : (
            dynamicCarriers.slice(0, 4).map(([carrierName, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={carrierName} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium truncate max-w-[180px]">{carrierName}</span>
                    <span className="text-[#8E8E93] font-mono-num">
                      {count} <span className="text-white/40 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/50 overflow-hidden border border-white/[0.06]">
                    <div
                      className="h-full bg-[#0A84FF] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
