import React from 'react';
import { Smartphone, Download, ShieldCheck, Radio } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface ProbesHeaderProps {
  totalProbes: number;
  onExportCsv: () => void;
}

export const ProbesHeader: React.FC<ProbesHeaderProps> = ({ totalProbes, onExportCsv }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#1C1C1E] via-[#1C1C1E] to-[#BF5AF2]/15 border border-white/[0.08] shadow-lg relative overflow-hidden">
      
      {/* Title & Fleet Identifier */}
      <div className="space-y-1.5 max-w-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-[#BF5AF2]/15 text-[#BF5AF2] border border-[#BF5AF2]/30">
            <Smartphone className="h-5 w-5" />
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Probes &amp; Fleets Console
            <span className="text-xs font-mono font-bold text-[#BF5AF2] bg-[#BF5AF2]/15 px-2 py-0.5 rounded-md border border-[#BF5AF2]/30">
              {totalProbes} Hardware Devices
            </span>
          </h1>
        </div>
        <p className="text-xs text-[#8E8E93]">
          Decentralized mobile device reputation scores, submission reliability history, and adversarial shadow-ban lifecycle controls.
        </p>
      </div>

      {/* Export Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={onExportCsv}
        >
          Export Fleet CSV
        </Button>
      </div>

    </div>
  );
};
