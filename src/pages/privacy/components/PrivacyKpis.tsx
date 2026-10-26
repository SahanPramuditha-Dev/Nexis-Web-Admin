import React from 'react';
import { Lock, EyeOff, Clock, ShieldCheck } from 'lucide-react';

interface PrivacyKpisProps {
  kAnonThreshold: number;
  retentionDays: number;
  compliancePct: number;
  passedCells: number;
  totalCells: number;
}

export const PrivacyKpis: React.FC<PrivacyKpisProps> = ({
  kAnonThreshold,
  retentionDays,
  compliancePct,
  passedCells,
  totalCells
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. K-Anonymity Guardrail */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider block">
            K-Anonymity Guardrail
          </span>
          <div className="text-2xl font-extrabold text-[#0A84FF] mt-1 font-mono-num">
            N &ge; {kAnonThreshold}
          </div>
          <span className="text-[11px] text-[#8E8E93] mt-0.5 block">
            Cells with &lt;{kAnonThreshold} devices suppressed
          </span>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-[#0A84FF]/10 border border-[#0A84FF]/20 flex items-center justify-center text-[#0A84FF]">
          <Lock className="h-5 w-5" />
        </div>
      </div>

      {/* 2. S2 Spatial Quantization */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider block">
            S2 Quantization
          </span>
          <div className="text-2xl font-extrabold text-[#BF5AF2] mt-1 font-mono-num">
            Level 13
          </div>
          <span className="text-[11px] text-[#8E8E93] mt-0.5 block">
            ~1.2 km centroid polygon masking
          </span>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-[#BF5AF2]/10 border border-[#BF5AF2]/20 flex items-center justify-center text-[#BF5AF2]">
          <EyeOff className="h-5 w-5" />
        </div>
      </div>

      {/* 3. Data Minimization TTL */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider block">
            Minimization TTL
          </span>
          <div className="text-2xl font-extrabold text-[#30D158] mt-1 font-mono-num">
            {retentionDays} Days
          </div>
          <span className="text-[11px] text-[#8E8E93] mt-0.5 block">
            Pruned into non-reversible OLAP
          </span>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-[#30D158]/10 border border-[#30D158]/20 flex items-center justify-center text-[#30D158]">
          <Clock className="h-5 w-5" />
        </div>
      </div>

      {/* 4. Privacy Compliance Rate */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider block">
            Compliance Index
          </span>
          <div className="text-2xl font-extrabold text-[#FF9F0A] mt-1 font-mono-num">
            {compliancePct}%
          </div>
          <span className="text-[11px] text-[#8E8E93] mt-0.5 block">
            {passedCells} of {totalCells} cells publicly visible
          </span>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 flex items-center justify-center text-[#FF9F0A]">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
