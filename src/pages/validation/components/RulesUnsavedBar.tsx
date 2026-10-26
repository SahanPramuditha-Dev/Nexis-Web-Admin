import React from 'react';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface RulesUnsavedBarProps {
  modifiedCount: number;
  diffSummary: string[];
  onSave: () => void;
  onRevert: () => void;
}

export const RulesUnsavedBar: React.FC<RulesUnsavedBarProps> = ({
  modifiedCount,
  diffSummary,
  onSave,
  onRevert
}) => {
  if (modifiedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#1C1C1E]/95 backdrop-blur-2xl border border-[#0A84FF]/40 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 max-w-2xl w-full">
      
      {/* Indicator */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/10 text-xs shrink-0">
        <span className="h-2 w-2 rounded-full bg-[#0A84FF] animate-pulse" />
        <span className="font-extrabold text-white font-mono-num">{modifiedCount}</span>
        <span className="text-[#8E8E93]">unsaved rules</span>
      </div>

      {/* Diff snippet */}
      <div className="flex-1 min-w-0 text-[11px] text-[#8E8E93] truncate font-mono">
        {diffSummary.slice(0, 3).join(' • ')}
        {diffSummary.length > 3 && ` • +${diffSummary.length - 3} more`}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          icon={RotateCcw}
          onClick={onRevert}
        >
          Revert
        </Button>

        <Button
          variant="primary"
          size="sm"
          icon={Save}
          onClick={onSave}
          className="font-bold shadow-lg shadow-[#0A84FF]/30"
        >
          Commit to Supabase
        </Button>
      </div>

    </div>
  );
};
