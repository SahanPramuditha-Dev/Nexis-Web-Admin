import React from 'react';
import { CheckCircle2, AlertTriangle, UserX, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface ProbesBatchBarProps {
  selectedCount: number;
  onBatchReinstate: () => void;
  onBatchProbation: () => void;
  onBatchShadowBan: () => void;
  onClearSelection: () => void;
}

export const ProbesBatchBar: React.FC<ProbesBatchBarProps> = ({
  selectedCount,
  onBatchReinstate,
  onBatchProbation,
  onBatchShadowBan,
  onClearSelection
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1C1C1E]/95 backdrop-blur-2xl border border-white/20 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
      
      {/* Selected counter */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/10 text-xs">
        <span className="h-2 w-2 rounded-full bg-[#BF5AF2] animate-pulse" />
        <span className="font-extrabold text-white font-mono-num">{selectedCount}</span>
        <span className="text-[#8E8E93]">probes selected</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={CheckCircle2}
          onClick={onBatchReinstate}
          className="text-[#30D158] hover:bg-[#30D158]/15 border-[#30D158]/30"
        >
          Reinstate Active
        </Button>

        <Button
          variant="secondary"
          size="sm"
          icon={AlertTriangle}
          onClick={onBatchProbation}
          className="text-[#FF9F0A] hover:bg-[#FF9F0A]/15 border-[#FF9F0A]/30"
        >
          Set Probation
        </Button>

        <Button
          variant="destructive"
          size="sm"
          icon={UserX}
          onClick={onBatchShadowBan}
        >
          Shadow-Ban
        </Button>

        {/* Clear */}
        <button
          type="button"
          onClick={onClearSelection}
          className="p-1.5 rounded-xl hover:bg-white/10 text-[#8E8E93] hover:text-white transition-colors cursor-pointer ml-1"
          title="Clear Selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
};
