import React from 'react';
import { History, Download, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface AuditHeaderProps {
  totalLogs: number;
  onExportCsv: () => void;
}

export const AuditHeader: React.FC<AuditHeaderProps> = ({ totalLogs, onExportCsv }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#1C1C1E] via-[#1C1C1E] to-[#0A84FF]/15 border border-white/[0.08] shadow-lg relative overflow-hidden">
      
      {/* Title & Compliance Standards */}
      <div className="space-y-1.5 max-w-xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-[#0A84FF] text-[11px] font-semibold">
            <Lock className="h-3 w-3" />
            <span>SOC2 Type II &amp; GDPR Audit Trail</span>
          </div>
          <span className="text-xs text-[#8E8E93] font-mono">
            {totalLogs} Events Logged
          </span>
        </div>

        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          Governance &amp; Audit Trail
        </h1>

        <p className="text-xs text-[#8E8E93]">
          Chronological, tamper-evident log of manual validation overrides, physics rule alterations, device shadow-bans, and data purge actions.
        </p>
      </div>

      {/* Export Button */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={onExportCsv}
        >
          Export Audit Bundle
        </Button>
      </div>

    </div>
  );
};
