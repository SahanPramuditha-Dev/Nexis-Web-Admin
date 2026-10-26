import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Eye, 
  Radio, 
  Signal, 
  Activity, 
  Smartphone, 
  X, 
  Layers 
} from 'lucide-react';
import { S2CoverageCell, TelemetryRecord } from '../../../types/telemetry';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';

interface S2CellInspectorProps {
  selectedCell: S2CoverageCell | null;
  cellRecords: TelemetryRecord[];
  minKAnon: number;
  onInspectRecord: (record: TelemetryRecord) => void;
  onClose: () => void;
}

export const S2CellInspector: React.FC<S2CellInspectorProps> = ({
  selectedCell,
  cellRecords,
  minKAnon,
  onInspectRecord,
  onClose
}) => {
  if (!selectedCell) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#8E8E93] space-y-3">
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.08] text-[#0A84FF]">
          <Layers className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="text-white font-bold text-sm">Select an S2 Cell</div>
          <p className="text-xs text-[#8E8E93] max-w-xs leading-relaxed">
            Click any cell boundary on the map or choose from the list to inspect localized radio physics and $k$-anonymity verification proofs.
          </p>
        </div>
      </div>
    );
  }

  const kAnonPct = Math.min(100, Math.round((selectedCell.distinctDevices / minKAnon) * 100));

  return (
    <div className="h-full flex flex-col justify-between space-y-4 p-5 overflow-y-auto">
      
      <div className="space-y-4">
        {/* Cell Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
                Level {selectedCell.level || 13}
              </span>
              <span className="text-xs text-[#8E8E93] font-mono">
                {selectedCell.centerLat.toFixed(4)}, {selectedCell.centerLng.toFixed(4)}
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base font-mono">
              {selectedCell.cellId}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* k-Anonymity Differential Privacy Progress Card */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8E8E93] font-medium flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-[#BF5AF2]" /> Device Contributors
            </span>
            <span className="font-mono-num font-bold text-white">
              {selectedCell.distinctDevices} / {minKAnon} devices
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 rounded-full bg-black/60 overflow-hidden border border-white/[0.04]">
            <div
              className={`h-full rounded-full transition-all ${
                selectedCell.kAnonPassed ? 'bg-[#30D158]' : 'bg-[#FF9F0A]'
              }`}
              style={{ width: `${kAnonPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            {selectedCell.kAnonPassed ? (
              <span className="text-[#30D158] flex items-center gap-1 font-semibold">
                <ShieldCheck className="h-3 w-3" /> Public Verified ($k \ge {minKAnon}$)
              </span>
            ) : (
              <span className="text-[#FF9F0A] flex items-center gap-1 font-semibold">
                <AlertTriangle className="h-3 w-3" /> Sub-Threshold ($k &lt; {minKAnon}$) — Private
              </span>
            )}
            <span className="text-[#8E8E93] font-mono-num">{selectedCell.totalSamples} telemetry pts</span>
          </div>
        </div>

        {/* Radio Physics Aggregates Matrix */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-[#8E8E93] uppercase font-semibold block">Mean Download</span>
            <span className="font-mono-num font-extrabold text-white text-base">
              {selectedCell.avgDownloadMbps} <span className="text-[10px] text-[#8E8E93]">Mbps</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-[#8E8E93] uppercase font-semibold block">Mean Upload</span>
            <span className="font-mono-num font-extrabold text-white text-base">
              {selectedCell.avgUploadMbps} <span className="text-[10px] text-[#8E8E93]">Mbps</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-[#8E8E93] uppercase font-semibold block">Median Latency</span>
            <span className="font-mono-num font-extrabold text-white text-base">
              {selectedCell.avgLatencyMs} <span className="text-[10px] text-[#8E8E93]">ms</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-[#8E8E93] uppercase font-semibold block">Mean RSRP</span>
            <span className="font-mono-num font-extrabold text-white text-base">
              {selectedCell.avgRsrpDbm} <span className="text-[10px] text-[#8E8E93]">dBm</span>
            </span>
          </div>
        </div>

        {/* Carrier & Radio Technology */}
        <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-[#8E8E93] uppercase block font-medium">Dominant Carrier</span>
            <span className="text-white font-bold">{selectedCell.carrierName}</span>
          </div>
          <span className="text-xs font-bold text-[#0A84FF] font-mono px-2 py-0.5 rounded bg-[#0A84FF]/10 border border-[#0A84FF]/20">
            {selectedCell.networkType}
          </span>
        </div>

        {/* Ingested Samples List Drilldown */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Raw Ingestion Samples ({cellRecords.length})
            </span>
          </div>

          {cellRecords.length === 0 ? (
            <div className="text-xs text-[#8E8E93] py-4 text-center">No individual records in current buffer</div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {cellRecords.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => onInspectRecord(rec)}
                  className="p-2.5 rounded-xl bg-black/40 hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={rec.status} size="sm" />
                      <span className="font-bold text-white font-mono-num">{rec.downloadMbps} Mbps</span>
                    </div>
                    <div className="text-[10px] text-[#8E8E93] font-mono truncate max-w-[130px]">
                      {rec.deviceId}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectRecord(rec);
                    }}
                  >
                    Inspect
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
