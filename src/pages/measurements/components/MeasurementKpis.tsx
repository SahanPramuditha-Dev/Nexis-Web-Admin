import React from 'react';
import { Gauge, Zap, Activity, ShieldCheck } from 'lucide-react';

interface MeasurementKpisProps {
  total: number;
  avgDownload: number;
  avgLatency: number;
  lowBufferbloatPct: number;
}

export const MeasurementKpis: React.FC<MeasurementKpisProps> = ({
  total,
  avgDownload,
  avgLatency,
  lowBufferbloatPct
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Speed Tests */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider block">
            Total Speed Tests
          </span>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono-num">
            {total.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#8E8E93] mt-0.5 block">Client diagnostic sessions</span>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex items-center justify-center text-[#0A84FF]">
          <Gauge className="h-5 w-5" />
        </div>
      </div>

      {/* 2. Avg Downlink Throughput */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider block">
            Avg Downlink Throughput
          </span>
          <div className="text-2xl font-extrabold text-[#30D158] mt-1 font-mono-num">
            {avgDownload} <span className="text-xs font-semibold text-[#8E8E93]">Mbps</span>
          </div>
          <span className="text-[11px] text-[#8E8E93] mt-0.5 block">Excluding 0.8s TCP warmup</span>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-[#30D158]/10 border border-[#30D158]/20 flex items-center justify-center text-[#30D158]">
          <Zap className="h-5 w-5" />
        </div>
      </div>

      {/* 3. Median Idle RTT */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider block">
            Median Idle RTT
          </span>
          <div className="text-2xl font-extrabold text-[#0A84FF] mt-1 font-mono-num">
            {avgLatency} <span className="text-xs font-semibold text-[#8E8E93]">ms</span>
          </div>
          <span className="text-[11px] text-[#8E8E93] mt-0.5 block">Cloudflare Anycast edge</span>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex items-center justify-center text-[#0A84FF]">
          <Activity className="h-5 w-5" />
        </div>
      </div>

      {/* 4. Grade A/A+ Bufferbloat */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider block">
            Grade A/A+ Bufferbloat
          </span>
          <div className="text-2xl font-extrabold text-[#FF9F0A] mt-1 font-mono-num">
            {lowBufferbloatPct}%
          </div>
          <span className="text-[11px] text-[#8E8E93] mt-0.5 block">&Delta;RTT &le; 15ms under load</span>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 flex items-center justify-center text-[#FF9F0A]">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
