import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface PrivacyComplianceMeterProps {
  totalCells: number;
  passedCells: number;
  suppressedCells: number;
  compliancePct: number;
  kAnonThreshold: number;
}

export const PrivacyComplianceMeter: React.FC<PrivacyComplianceMeterProps> = ({
  totalCells,
  passedCells,
  suppressedCells,
  compliancePct,
  kAnonThreshold
}) => {
  return (
    <div className="p-6 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#30D158]" />
            Live S2 Spatial Coverage k-Anonymity Audit
          </h3>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Current real-time breakdown of spatial cells meeting the legal minimum threshold of independent contributors.
          </p>
        </div>
        <div className="text-right">
          <span className="font-mono-num text-2xl font-extrabold text-[#30D158]">
            {compliancePct}%
          </span>
          <span className="text-xs text-[#8E8E93] block">Publicly Visible Cells</span>
        </div>
      </div>

      {/* Multi-segment progress bar */}
      <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden flex">
        <div
          className="bg-[#30D158] h-full transition-all duration-300"
          style={{ width: `${compliancePct}%` }}
          title={`${passedCells} cells verified & passing`}
        />
        <div
          className="bg-[#FF9F0A] h-full transition-all duration-300"
          style={{ width: `${100 - compliancePct}%` }}
          title={`${suppressedCells} cells suppressed`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
        <div className="p-3.5 rounded-2xl bg-black/40 border border-[#30D158]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#30D158] flex-shrink-0" />
            <div>
              <span className="text-white font-medium block">Publicly Aggregated Cells</span>
              <span className="text-[10px] text-[#8E8E93]">&ge; {kAnonThreshold} distinct probe devices</span>
            </div>
          </div>
          <span className="font-mono-num font-bold text-[#30D158] text-base">{passedCells}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/40 border border-[#FF9F0A]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF9F0A] flex-shrink-0" />
            <div>
              <span className="text-white font-medium block">Suppressed Provisional Cells</span>
              <span className="text-[10px] text-[#8E8E93]">&lt; {kAnonThreshold} devices (hidden from public map)</span>
            </div>
          </div>
          <span className="font-mono-num font-bold text-[#FF9F0A] text-base">{suppressedCells}</span>
        </div>
      </div>
    </div>
  );
};
