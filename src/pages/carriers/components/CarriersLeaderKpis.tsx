import React from 'react';
import { Award, Zap, Activity, ShieldCheck, Radio, SignalHigh } from 'lucide-react';
import { CarrierStats } from '../types';

interface CarriersLeaderKpisProps {
  speedLeader?: CarrierStats;
  latencyLeader?: CarrierStats;
  slaLeader?: CarrierStats;
  fiveGLeader?: CarrierStats;
}

export const CarriersLeaderKpis: React.FC<CarriersLeaderKpisProps> = ({
  speedLeader,
  latencyLeader,
  slaLeader,
  fiveGLeader
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Speed Leader */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-[#30D158]/30 transition-all">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8E8E93] font-bold uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5 text-[#30D158]" />
            Speed Champion
          </div>
          <div className="text-lg font-extrabold text-white mt-1 truncate max-w-[150px]">
            {speedLeader?.name || '—'}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-extrabold text-[#30D158] font-mono-num">
              {speedLeader?.avgDownload.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs text-[#8E8E93]">Mbps avg DL</span>
          </div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-[#30D158]/10 border border-[#30D158]/20 flex items-center justify-center text-[#30D158] flex-shrink-0">
          <Award className="h-5 w-5" />
        </div>
      </div>

      {/* 2. Lowest Latency Leader */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-[#0A84FF]/30 transition-all">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8E8E93] font-bold uppercase tracking-wider">
            <Activity className="h-3.5 w-3.5 text-[#0A84FF]" />
            Lowest Latency
          </div>
          <div className="text-lg font-extrabold text-white mt-1 truncate max-w-[150px]">
            {latencyLeader?.name || '—'}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-extrabold text-[#0A84FF] font-mono-num">
              {latencyLeader?.avgLatency.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs text-[#8E8E93]">ms median RTT</span>
          </div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex items-center justify-center text-[#0A84FF] flex-shrink-0">
          <Activity className="h-5 w-5" />
        </div>
      </div>

      {/* 3. SLA Compliance Leader */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-[#FF9F0A]/30 transition-all">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8E8E93] font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-[#FF9F0A]" />
            SLA Compliance
          </div>
          <div className="text-lg font-extrabold text-white mt-1 truncate max-w-[150px]">
            {slaLeader?.name || '—'}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-extrabold text-[#FF9F0A] font-mono-num">
              {slaLeader?.slaOverallPass.toFixed(1) || '0.0'}%
            </span>
            <span className="text-xs text-[#8E8E93]">tests compliant</span>
          </div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 flex items-center justify-center text-[#FF9F0A] flex-shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      {/* 4. 5G Availability Leader */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-[#BF5AF2]/30 transition-all">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8E8E93] font-bold uppercase tracking-wider">
            <SignalHigh className="h-3.5 w-3.5 text-[#BF5AF2]" />
            5G Penetration
          </div>
          <div className="text-lg font-extrabold text-white mt-1 truncate max-w-[150px]">
            {fiveGLeader?.name || '—'}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-extrabold text-[#BF5AF2] font-mono-num">
              {fiveGLeader?.pct5G.toFixed(1) || '0.0'}%
            </span>
            <span className="text-xs text-[#8E8E93]">5G share</span>
          </div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-[#BF5AF2]/10 border border-[#BF5AF2]/20 flex items-center justify-center text-[#BF5AF2] flex-shrink-0">
          <Radio className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
