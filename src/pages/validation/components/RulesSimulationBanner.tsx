import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

interface RulesSimulationBannerProps {
  currentPassRate: number;
  simulatedPassRate: number;
  currentQuarantined: number;
  simulatedQuarantined: number;
  totalEvaluated: number;
}

export const RulesSimulationBanner: React.FC<RulesSimulationBannerProps> = ({
  currentPassRate,
  simulatedPassRate,
  currentQuarantined,
  simulatedQuarantined,
  totalEvaluated
}) => {
  const diffQuarantined = simulatedQuarantined - currentQuarantined;
  const isStricter = diffQuarantined > 0;
  const isLooser = diffQuarantined < 0;

  return (
    <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
      
      {/* Left: Simulation Indicator */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-[#0A84FF] shrink-0">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <div className="font-bold text-white flex items-center gap-1.5">
            <span>Pre-Flight Rules Impact Simulation</span>
            <span className="text-[10px] font-mono text-[#8E8E93] bg-black/40 px-1.5 py-0.2 rounded border border-white/[0.06]">
              {totalEvaluated} telemetry samples
            </span>
          </div>
          <p className="text-[#8E8E93] text-[11px] mt-0.5">
            Real-time calculation showing how proposed thresholds would re-evaluate active telemetry.
          </p>
        </div>
      </div>

      {/* Right: Comparative Pass Rate & Delta */}
      <div className="flex items-center gap-4 shrink-0 bg-black/40 border border-white/[0.06] px-4 py-2 rounded-2xl">
        <div className="text-right">
          <span className="text-[10px] text-[#8E8E93] uppercase font-semibold block">Current Pass Rate</span>
          <span className="font-mono-num font-bold text-white text-sm">{currentPassRate}%</span>
        </div>

        <ArrowRight className="h-4 w-4 text-[#8E8E93]" />

        <div>
          <span className="text-[10px] text-[#8E8E93] uppercase font-semibold block">Simulated Pass Rate</span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-mono-num font-bold text-sm ${
                simulatedPassRate >= 90
                  ? 'text-[#30D158]'
                  : simulatedPassRate >= 75
                  ? 'text-[#FF9F0A]'
                  : 'text-[#FF453A]'
              }`}
            >
              {simulatedPassRate}%
            </span>
            <span
              className={`text-[10px] font-mono font-bold ${
                isStricter
                  ? 'text-[#FF453A]'
                  : isLooser
                  ? 'text-[#30D158]'
                  : 'text-[#8E8E93]'
              }`}
            >
              {isStricter ? `(+${diffQuarantined} quarantined)` : isLooser ? `(${diffQuarantined} fewer quarantined)` : '(neutral)'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
