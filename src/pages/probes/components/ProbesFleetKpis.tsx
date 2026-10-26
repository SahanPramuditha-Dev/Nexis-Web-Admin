import React from 'react';
import { Smartphone, ShieldCheck, AlertTriangle, UserX } from 'lucide-react';

interface ProbesFleetKpisProps {
  totalProbes: number;
  activeProbes: number;
  probationaryProbes: number;
  shadowBannedProbes: number;
}

export const ProbesFleetKpis: React.FC<ProbesFleetKpisProps> = ({
  totalProbes,
  activeProbes,
  probationaryProbes,
  shadowBannedProbes
}) => {
  const activePct = totalProbes > 0 ? Math.round((activeProbes / totalProbes) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      
      {/* Total Registered */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Registered Fleets</span>
          <Smartphone className="h-3.5 w-3.5 text-[#0A84FF]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {totalProbes}
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">devices</span>
        </div>
      </div>

      {/* Active Verified */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Active Verified</span>
          <ShieldCheck className="h-3.5 w-3.5 text-[#30D158]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num flex items-baseline gap-1.5">
          <span className="text-[#30D158]">{activeProbes}</span>
          <span className="text-[11px] font-normal text-[#8E8E93]">({activePct}% fleet)</span>
        </div>
      </div>

      {/* Probationary */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Probationary Probes</span>
          <AlertTriangle className="h-3.5 w-3.5 text-[#FF9F0A]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          <span className={probationaryProbes > 0 ? 'text-[#FF9F0A]' : 'text-white'}>
            {probationaryProbes}
          </span>
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">monitored</span>
        </div>
      </div>

      {/* Shadow-Banned */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Shadow-Banned</span>
          <UserX className="h-3.5 w-3.5 text-[#FF453A]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          <span className={shadowBannedProbes > 0 ? 'text-[#FF453A]' : 'text-white'}>
            {shadowBannedProbes}
          </span>
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">adversaries</span>
        </div>
      </div>

    </div>
  );
};
