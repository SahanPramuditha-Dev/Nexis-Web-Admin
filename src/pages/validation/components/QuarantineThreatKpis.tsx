import React from 'react';
import { AlertTriangle, MapPinOff, Gauge, ShieldAlert } from 'lucide-react';

interface QuarantineThreatKpisProps {
  totalQuarantined: number;
  mockLocationCount: number;
  physicsCeilingCount: number;
  avgThreatScore: number;
}

export const QuarantineThreatKpis: React.FC<QuarantineThreatKpisProps> = ({
  totalQuarantined,
  mockLocationCount,
  physicsCeilingCount,
  avgThreatScore
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      
      {/* 1. Pending Queue */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Pending Threats</span>
          <AlertTriangle className="h-3.5 w-3.5 text-[#FF453A]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {totalQuarantined}
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">records</span>
        </div>
      </div>

      {/* 2. GPS Mock Spoofs */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">GPS Spoofing Attacks</span>
          <MapPinOff className="h-3.5 w-3.5 text-[#FF9F0A]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num flex items-baseline gap-1.5">
          <span className={mockLocationCount > 0 ? 'text-[#FF9F0A]' : 'text-white'}>
            {mockLocationCount}
          </span>
          <span className="text-[11px] font-normal text-[#8E8E93]">emulators</span>
        </div>
      </div>

      {/* 3. Physics Bound Breaches */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Radio Bounds Breached</span>
          <Gauge className="h-3.5 w-3.5 text-[#64D2FF]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {physicsCeilingCount}
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">impossible packets</span>
        </div>
      </div>

      {/* 4. Mean Integrity Score */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Mean Integrity Score</span>
          <ShieldAlert className="h-3.5 w-3.5 text-[#BF5AF2]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-[#FF453A] font-mono-num">
          {avgThreatScore}%
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">(severely degraded)</span>
        </div>
      </div>

    </div>
  );
};
