import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, MapPin, Zap, Clock, ShieldCheck, Activity } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';

export type TimeWindow = '1h' | '24h' | '7d' | 'all';

interface DashboardHeaderProps {
  isLive: boolean;
  totalFiltered: number;
  totalAllTime: number;
  timeWindow: TimeWindow;
  onTimeWindowChange: (w: TimeWindow) => void;
  lastUpdated?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isLive,
  totalFiltered,
  totalAllTime,
  timeWindow,
  onTimeWindowChange,
  lastUpdated
}) => {
  const timeOptions: { id: TimeWindow; label: string }[] = [
    { id: '1h', label: 'Past 1h' },
    { id: '24h', label: '24h' },
    { id: '7d', label: '7 Days' },
    { id: 'all', label: 'All Time' }
  ];

  const formatLastSeen = (timestamp?: number) => {
    if (!timestamp) return 'Just now';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
  };

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#1C1C1E] via-[#1C1C1E] to-[#0A84FF]/20 border border-white/[0.08] shadow-lg relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#0A84FF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Titles & Realtime Pulse */}
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/[0.08] text-[11px] font-semibold">
              <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-[#30D158] animate-pulse' : 'bg-[#FF9F0A]'}`} />
              <span className={isLive ? 'text-[#30D158]' : 'text-[#FF9F0A]'}>
                {isLive ? 'Realtime WebSocket Active' : 'Local Fallback Buffer'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#8E8E93]">
              <Clock className="h-3 w-3 text-[#0A84FF]" />
              <span>Synced {formatLastSeen(lastUpdated)}</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Command Center
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30 tracking-normal hidden sm:inline-block">
              NEXIS v2.4
            </span>
          </h1>

          <p className="text-xs md:text-sm text-[#8E8E93] leading-relaxed">
            Zero-trust crowdsourced cellular intelligence: ITU-T radio bounds verification, cryptographic packet integrity, and S2 geospatial telemetry indexing.
          </p>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          {/* Timeframe Selector */}
          <SegmentedControl
            options={timeOptions}
            value={timeWindow}
            onChange={onTimeWindowChange}
            className="w-full sm:w-auto"
          />

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link to="/spatial/map">
              <Button variant="secondary" size="md" icon={MapPin}>
                S2 Grid
              </Button>
            </Link>
            <Link to="/validation/feed">
              <Button variant="primary" size="md" icon={Radio}>
                Live Stream
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
