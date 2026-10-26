import React from 'react';
import { Signal, Radio, Gauge, Wifi } from 'lucide-react';
import { TelemetryRecord } from '../../../types/telemetry';

interface RfSignalHealthCardProps {
  records: TelemetryRecord[];
}

export const RfSignalHealthCard: React.FC<RfSignalHealthCardProps> = ({ records }) => {
  const recordsWithRf = records.filter((r) => r.rsrpDbm !== undefined && r.rsrpDbm !== null);
  const total = recordsWithRf.length;

  let excellent = 0; // > -80
  let good = 0;      // -80 to -90
  let fair = 0;      // -90 to -100
  let poor = 0;      // < -100

  let sumRsrp = 0;
  let sumSinr = 0;
  let sinrCount = 0;
  let sumBufferbloat = 0;
  let bufferbloatCount = 0;

  recordsWithRf.forEach((r) => {
    const rsrp = r.rsrpDbm!;
    sumRsrp += rsrp;
    if (rsrp >= -80) excellent++;
    else if (rsrp >= -90) good++;
    else if (rsrp >= -100) fair++;
    else poor++;

    if (r.sinrDb !== undefined && r.sinrDb !== null) {
      sumSinr += r.sinrDb;
      sinrCount++;
    }
    if (r.bufferbloatMs !== undefined && r.bufferbloatMs !== null) {
      sumBufferbloat += r.bufferbloatMs;
      bufferbloatCount++;
    }
  });

  const avgRsrp = total > 0 ? Math.round(sumRsrp / total) : -85;
  const avgSinr = sinrCount > 0 ? Number((sumSinr / sinrCount).toFixed(1)) : 12.5;
  const avgBufferbloat = bufferbloatCount > 0 ? Math.round(sumBufferbloat / bufferbloatCount) : 18;

  const getTierPct = (val: number) => (total > 0 ? Math.round((val / total) * 100) : 0);

  return (
    <div className="p-6 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-white text-base">
          <Signal className="h-4 w-4 text-[#30D158]" />
          RF Radio Physics & Signal Health
        </div>
        <span className="text-xs text-[#8E8E93]">3GPP Standards</span>
      </div>

      {/* Primary Average RSRP Callout */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block">
            Fleet Mean RSRP
          </span>
          <div className="text-2xl font-extrabold text-white font-mono-num">
            {avgRsrp} <span className="text-xs font-normal text-[#8E8E93]">dBm</span>
          </div>
        </div>

        <div className="text-right space-y-0.5">
          <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block">
            SINR / Bufferbloat
          </span>
          <div className="text-sm font-bold text-white font-mono-num">
            {avgSinr} dB <span className="text-[#8E8E93]">/ {avgBufferbloat} ms</span>
          </div>
        </div>
      </div>

      {/* RSRP Tier Distribution */}
      <div className="space-y-2.5 pt-1 text-xs">
        {/* Tier: Excellent */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-white font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#30D158]" />
              Excellent <span className="text-[#8E8E93] font-mono">(&gt; -80 dBm)</span>
            </span>
            <span className="text-[#8E8E93] font-mono-num">{excellent} ({getTierPct(excellent)}%)</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/50 overflow-hidden">
            <div className="h-full bg-[#30D158] rounded-full transition-all" style={{ width: `${getTierPct(excellent)}%` }} />
          </div>
        </div>

        {/* Tier: Good */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-white font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0A84FF]" />
              Good <span className="text-[#8E8E93] font-mono">(-80 to -90 dBm)</span>
            </span>
            <span className="text-[#8E8E93] font-mono-num">{good} ({getTierPct(good)}%)</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/50 overflow-hidden">
            <div className="h-full bg-[#0A84FF] rounded-full transition-all" style={{ width: `${getTierPct(good)}%` }} />
          </div>
        </div>

        {/* Tier: Fair */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-white font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FF9F0A]" />
              Fair <span className="text-[#8E8E93] font-mono">(-90 to -100 dBm)</span>
            </span>
            <span className="text-[#8E8E93] font-mono-num">{fair} ({getTierPct(fair)}%)</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/50 overflow-hidden">
            <div className="h-full bg-[#FF9F0A] rounded-full transition-all" style={{ width: `${getTierPct(fair)}%` }} />
          </div>
        </div>

        {/* Tier: Poor */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-white font-medium flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FF453A]" />
              Poor / Edge <span className="text-[#8E8E93] font-mono">(&lt; -100 dBm)</span>
            </span>
            <span className="text-[#8E8E93] font-mono-num">{poor} ({getTierPct(poor)}%)</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/50 overflow-hidden">
            <div className="h-full bg-[#FF453A] rounded-full transition-all" style={{ width: `${getTierPct(poor)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
