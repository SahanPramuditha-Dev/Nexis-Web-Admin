import React from 'react';
import { Activity, FileSpreadsheet, FileCode } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { ClientMeasurementRecord } from '../../../types/telemetry';

interface MeasurementHeaderProps {
  filteredMeasurements: ClientMeasurementRecord[];
  totalCount: number;
  onExportCsv: () => void;
  onExportJson: () => void;
}

export const MeasurementHeader: React.FC<MeasurementHeaderProps> = ({
  filteredMeasurements,
  totalCount,
  onExportCsv,
  onExportJson
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="p-2 rounded-2xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30 shadow-sm shadow-[#0A84FF]/10">
            <Activity className="h-5 w-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Measurement Explorer
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
            RFC 6349 Core
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/20 text-[11px] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0A84FF] animate-pulse" />
            <span className="font-mono-num">{totalCount}</span> Diagnostic Sessions
          </div>
        </div>
        <p className="text-xs text-[#8E8E93] mt-1.5">
          Detailed client-side throughput saturation curves, loaded bufferbloat latency deltas, and ISP routing diagnostics.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          icon={FileSpreadsheet}
          onClick={onExportCsv}
          disabled={filteredMeasurements.length === 0}
          className="rounded-2xl border-white/[0.08] bg-[#1C1C1E] hover:bg-white/[0.05] text-xs font-semibold text-white"
        >
          Export CSV
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={FileCode}
          onClick={onExportJson}
          disabled={filteredMeasurements.length === 0}
          className="rounded-2xl border-white/[0.08] bg-[#1C1C1E] hover:bg-white/[0.05] text-xs font-semibold text-white"
        >
          Export JSON
        </Button>
      </div>
    </div>
  );
};
