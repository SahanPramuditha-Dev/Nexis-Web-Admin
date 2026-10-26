import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface QuarantineHeaderProps {
  totalCount: number;
  selectedCount: number;
  onBatchApprove: () => void;
  onBatchPurge: () => void;
}

export const QuarantineHeader: React.FC<QuarantineHeaderProps> = ({
  totalCount,
  selectedCount,
  onBatchApprove,
  onBatchPurge
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#1C1C1E] via-[#1C1C1E] to-[#FF453A]/15 border border-white/[0.08] shadow-lg relative overflow-hidden">
      
      {/* Title & Threat Alert Status */}
      <div className="space-y-1.5 max-w-xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
              totalCount > 0
                ? 'bg-[#FF453A]/15 border-[#FF453A]/30 text-[#FF453A]'
                : 'bg-[#30D158]/15 border-[#30D158]/30 text-[#30D158]'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                totalCount > 0 ? 'bg-[#FF453A] animate-pulse' : 'bg-[#30D158]'
              }`}
            />
            <span>
              {totalCount > 0
                ? `${totalCount} Threat Payloads Awaiting Remediation`
                : 'Zero-Trust Defense Clean — No Active Breaches'}
            </span>
          </div>
        </div>

        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          Quarantine & Remediation Center
          <span className="text-xs font-mono font-bold text-[#FF453A] bg-[#FF453A]/15 px-2 py-0.5 rounded-md border border-[#FF453A]/30">
            Defense Layer 1
          </span>
        </h1>

        <p className="text-xs text-[#8E8E93]">
          Zero-trust isolation zone for cryptographic integrity failures, Android mock locations, and ITU-T radio speed violations.
        </p>
      </div>

      {/* Batch Remediation Buttons */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="destructive"
            size="sm"
            icon={Trash2}
            onClick={onBatchPurge}
          >
            Purge Poisoned ({selectedCount})
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={CheckCircle}
            onClick={onBatchApprove}
            className="bg-[#30D158] hover:bg-[#30D158]/80 text-black font-bold"
          >
            Approve ({selectedCount})
          </Button>
        </div>
      )}

    </div>
  );
};
