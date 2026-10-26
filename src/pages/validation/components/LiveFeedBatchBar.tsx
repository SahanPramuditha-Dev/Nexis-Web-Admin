import React from 'react';
import { CheckCircle, AlertTriangle, Download, X, Layers } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface LiveFeedBatchBarProps {
  selectedCount: number;
  onBatchApprove: () => void;
  onBatchQuarantine: () => void;
  onBatchExport: () => void;
  onClearSelection: () => void;
}

export const LiveFeedBatchBar: React.FC<LiveFeedBatchBarProps> = ({
  selectedCount,
  onBatchApprove,
  onBatchQuarantine,
  onBatchExport,
  onClearSelection
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1C1C1E]/95 backdrop-blur-2xl border border-white/20 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
      
      {/* Selected counter */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/10 text-xs">
        <span className="h-2 w-2 rounded-full bg-[#0A84FF] animate-pulse" />
        <span className="font-extrabold text-white font-mono-num">{selectedCount}</span>
        <span className="text-[#8E8E93]">selected</span>
      </div>

      {/* Batch Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={CheckCircle}
          onClick={onBatchApprove}
          className="text-[#30D158] hover:bg-[#30D158]/15 border-[#30D158]/30"
        >
          Approve Selected
        </Button>

        <Button
          variant="secondary"
          size="sm"
          icon={AlertTriangle}
          onClick={onBatchQuarantine}
          className="text-[#FF453A] hover:bg-[#FF453A]/15 border-[#FF453A]/30"
        >
          Quarantine Selected
        </Button>

        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={onBatchExport}
        >
          Export CSV
        </Button>

        {/* Clear selection */}
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
