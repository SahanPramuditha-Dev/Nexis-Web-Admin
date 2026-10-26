import React, { useState } from 'react';
import { Sliders, CheckCircle2, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../../../components/ui/Button';

interface PrivacyGuardrailFormProps {
  kAnonThreshold: number;
  setKAnonThreshold: (val: number) => void;
  onSave: (val: number) => Promise<void>;
}

export const PrivacyGuardrailForm: React.FC<PrivacyGuardrailFormProps> = ({
  kAnonThreshold,
  setKAnonThreshold,
  onSave
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(kAnonThreshold);
      setIsSaved(true);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-4 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#0A84FF]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Anonymity Guardrail Policy
            </h3>
          </div>
          {isSaved && (
            <span className="text-[11px] text-[#30D158] font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved & Re-aggregated
            </span>
          )}
        </div>

        <div className="space-y-4 text-xs pt-3">
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-[#8E8E93] font-semibold">
                Minimum Unique Devices ($k$-anonymity):
              </label>
              <span className="font-mono-num text-white font-bold text-sm">{kAnonThreshold} Devices</span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              value={kAnonThreshold}
              onChange={(e) => setKAnonThreshold(Number(e.target.value))}
              className="w-full accent-[#0A84FF] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono-num mt-1">
              <span>2 (Permissive)</span>
              <span>5 (Standard)</span>
              <span>15 (Ultra-Strict)</span>
            </div>
            <span className="text-[11px] text-[#8E8E93] mt-2 block leading-relaxed">
              Standard baseline is 5 independent contributor devices per S2 cell before cellular speeds are made publicly accessible on consumer coverage maps.
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#30D158]" />
                Client Differential Privacy (&epsilon;-Noise)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-num font-bold bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
                &epsilon; = 0.5 ENFORCED
              </span>
            </div>
            <p className="text-[11px] text-[#8E8E93] leading-relaxed">
              Applies Laplace noise injection on throughput benchmarks to prevent linkability attacks across consecutive speed test samples from fixed locations.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          size="sm"
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-[#0A84FF] hover:bg-[#0A84FF]/90 font-semibold"
        >
          {isSubmitting ? 'Re-aggregating Cells...' : 'Apply & Re-index Coverage Cells'}
        </Button>
      </div>
    </form>
  );
};
