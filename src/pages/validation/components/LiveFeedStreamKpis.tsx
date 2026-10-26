import React from 'react';
import { Radio, ShieldCheck, AlertTriangle, Smartphone, ArrowDown, Activity } from 'lucide-react';

interface LiveFeedStreamKpisProps {
  totalInView: number;
  verifiedInView: number;
  quarantinedInView: number;
  avgDownload: number;
  avgLatency: number;
  distinctProbes: number;
}

export const LiveFeedStreamKpis: React.FC<LiveFeedStreamKpisProps> = ({
  totalInView,
  verifiedInView,
  quarantinedInView,
  avgDownload,
  avgLatency,
  distinctProbes
}) => {
  const passRate = totalInView > 0 ? Math.round((verifiedInView / totalInView) * 100) : 100;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      
      {/* Stream Total */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Filtered Buffer</span>
          <Radio className="h-3.5 w-3.5 text-[#0A84FF]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {totalInView}
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">events</span>
        </div>
      </div>

      {/* Stream Pass Rate */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Pass Rate</span>
          <ShieldCheck className="h-3.5 w-3.5 text-[#30D158]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num flex items-baseline gap-1.5">
          <span className={passRate >= 90 ? 'text-[#30D158]' : passRate >= 75 ? 'text-[#FF9F0A]' : 'text-[#FF453A]'}>
            {passRate}%
          </span>
          <span className="text-[11px] font-normal text-[#8E8E93]">({quarantinedInView} quarantined)</span>
        </div>
      </div>

      {/* Mean Bandwidth & Latency */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Mean Speed / Latency</span>
          <Activity className="h-3.5 w-3.5 text-[#64D2FF]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {avgDownload} <span className="text-xs font-normal text-[#8E8E93]">Mbps</span>
          <span className="text-sm font-bold text-[#8E8E93] ml-2">/ {avgLatency} ms</span>
        </div>
      </div>

      {/* Distinct Probe Devices */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Active Probes</span>
          <Smartphone className="h-3.5 w-3.5 text-[#BF5AF2]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {distinctProbes}
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">hardware devices</span>
        </div>
      </div>

    </div>
  );
};
