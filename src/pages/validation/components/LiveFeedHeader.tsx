import React from 'react';
import { Play, Pause, Download, RefreshCw, Radio, Layers, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface LiveFeedHeaderProps {
  isLive: boolean;
  isPaused: boolean;
  pendingCount: number;
  throughputPerMin: number;
  totalRecords: number;
  onTogglePause: () => void;
  onMergePending: () => void;
  onExportCsv: () => void;
}

export const LiveFeedHeader: React.FC<LiveFeedHeaderProps> = ({
  isLive,
  isPaused,
  pendingCount,
  throughputPerMin,
  totalRecords,
  onTogglePause,
  onMergePending,
  onExportCsv
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#1C1C1E] via-[#1C1C1E] to-[#0A84FF]/15 border border-white/[0.08] shadow-lg relative overflow-hidden">
      
      {/* Title & Live Status */}
      <div className="space-y-1.5 max-w-xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/[0.08] text-[11px] font-semibold">
            <span
              className={`h-2 w-2 rounded-full ${
                isPaused
                  ? 'bg-[#FF9F0A]'
                  : isLive
                  ? 'bg-[#30D158] animate-pulse'
                  : 'bg-[#FF9F0A]'
              }`}
            />
            <span className={isPaused ? 'text-[#FF9F0A]' : isLive ? 'text-[#30D158]' : 'text-[#FF9F0A]'}>
              {isPaused ? 'Stream Paused' : isLive ? 'Live Ingestion Active' : 'Local Buffer Active'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
            <Radio className="h-3 w-3 text-[#0A84FF]" />
            <span className="font-mono-num">{throughputPerMin}</span> events/min
          </div>
        </div>

        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          Live Telemetry Feed
          <span className="text-xs font-mono font-bold text-[#8E8E93] bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/[0.08]">
            {totalRecords} buffered
          </span>
        </h1>

        <p className="text-xs text-[#8E8E93]">
          Continuous zero-trust validation stream of decentralized mobile probe uploads and speedtest packets.
        </p>
      </div>

      {/* Stream Controls */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {/* Paused pending indicator button */}
        {isPaused && pendingCount > 0 && (
          <button
            type="button"
            onClick={onMergePending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A84FF]/20 border border-[#0A84FF]/40 text-[#0A84FF] text-xs font-bold hover:bg-[#0A84FF]/30 transition-all cursor-pointer animate-pulse"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>+{pendingCount} new events — merge</span>
          </button>
        )}

        {/* Pause / Resume Button */}
        <Button
          variant={isPaused ? 'primary' : 'secondary'}
          size="sm"
          icon={isPaused ? Play : Pause}
          onClick={onTogglePause}
        >
          {isPaused ? 'Resume Stream' : 'Pause Stream'}
        </Button>

        {/* Export CSV Button */}
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={onExportCsv}
          title="Export current view to CSV"
        >
          Export CSV
        </Button>
      </div>

    </div>
  );
};
