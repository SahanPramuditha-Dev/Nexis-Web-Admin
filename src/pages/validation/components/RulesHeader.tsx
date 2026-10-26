import React from 'react';
import { Sliders, Save, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface RulesHeaderProps {
  onApplyPreset: (key: string) => void;
  onReset: () => void;
  onSave: () => void;
  hasChanges: boolean;
  isSaved: boolean;
}

export const RulesHeader: React.FC<RulesHeaderProps> = ({
  onApplyPreset,
  onReset,
  onSave,
  hasChanges,
  isSaved
}) => {
  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#1C1C1E] via-[#1C1C1E] to-[#0A84FF]/15 border border-white/[0.08] shadow-lg relative overflow-hidden">
        
        {/* Title */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
              <Sliders className="h-5 w-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              Physics & Validation Rules Engine
              <span className="text-xs font-mono font-bold text-[#0A84FF] bg-[#0A84FF]/15 px-2 py-0.5 rounded-md border border-[#0A84FF]/30">
                ITU-T & 3GPP
              </span>
            </h1>
          </div>
          <p className="text-xs text-[#8E8E93]">
            Configure dynamic physical radio ceilings, speed-of-light latency floors, and S2 k-anonymity differential privacy thresholds.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="md"
            icon={RotateCcw}
            onClick={onReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Save}
            onClick={onSave}
            className={hasChanges ? 'animate-pulse font-bold' : ''}
          >
            Save to Supabase
          </Button>
        </div>

      </div>

      {/* Preset Quick Toolbar */}
      <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#8E8E93] font-semibold text-[11px] uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-[#0A84FF]" />
          <span>Industry Presets:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onApplyPreset('itut')}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-[#0A84FF]/20 text-white hover:text-[#0A84FF] border border-white/[0.08] hover:border-[#0A84FF]/40 font-medium transition-all cursor-pointer"
          >
            ITU-T Standard
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('carrier')}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-[#30D158]/20 text-white hover:text-[#30D158] border border-white/[0.08] hover:border-[#30D158]/40 font-medium transition-all cursor-pointer"
          >
            Carrier Strict
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('hardened')}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-[#FF453A]/20 text-white hover:text-[#FF453A] border border-white/[0.08] hover:border-[#FF453A]/40 font-medium transition-all cursor-pointer"
          >
            Anti-Spoof Hardened
          </button>

          <button
            type="button"
            onClick={() => onApplyPreset('permissive')}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-[#BF5AF2]/20 text-white hover:text-[#BF5AF2] border border-white/[0.08] hover:border-[#BF5AF2]/40 font-medium transition-all cursor-pointer"
          >
            Lab Permissive
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-[#30D158]/15 border border-[#30D158]/30 text-[#30D158] text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <ShieldCheck className="h-4 w-4" />
          Rules successfully saved and committed to Supabase central database!
        </div>
      )}
    </div>
  );
};
