import React from 'react';
import { Layers, ShieldCheck, Activity, Smartphone } from 'lucide-react';

interface S2SpatialKpisProps {
  totalCells: number;
  verifiedCells: number;
  avgDownload: number;
  distinctProbes: number;
}

export const S2SpatialKpis: React.FC<S2SpatialKpisProps> = ({
  totalCells,
  verifiedCells,
  avgDownload,
  distinctProbes
}) => {
  const verifiedPct = totalCells > 0 ? Math.round((verifiedCells / totalCells) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      
      {/* 1. Total S2 Cells */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">S2 Cells Indexed</span>
          <Layers className="h-3.5 w-3.5 text-[#0A84FF]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {totalCells}
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">spatial cells</span>
        </div>
      </div>

      {/* 2. Public k-Anonymity Verified */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">k-Anonymity Public</span>
          <ShieldCheck className="h-3.5 w-3.5 text-[#30D158]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num flex items-baseline gap-1.5">
          <span className="text-[#30D158]">{verifiedCells}</span>
          <span className="text-[11px] font-normal text-[#8E8E93]">({verifiedPct}% of grid)</span>
        </div>
      </div>

      {/* 3. Spatial Mean Downlink */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Spatial Mean Speed</span>
          <Activity className="h-3.5 w-3.5 text-[#64D2FF]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {avgDownload} <span className="text-xs font-normal text-[#8E8E93]">Mbps DL</span>
        </div>
      </div>

      {/* 4. Contributing Hardware Probes */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Field Probe Contributors</span>
          <Smartphone className="h-3.5 w-3.5 text-[#BF5AF2]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {distinctProbes}
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">distinct probes</span>
        </div>
      </div>

    </div>
  );
};
