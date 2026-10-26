import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, ArrowUpRight, Search, ShieldCheck, AlertTriangle } from 'lucide-react';
import { TelemetryRecord } from '../../../types/telemetry';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';

interface RecentSubmissionsTableProps {
  records: TelemetryRecord[];
  onInspect: (record: TelemetryRecord) => void;
}

export const RecentSubmissionsTable: React.FC<RecentSubmissionsTableProps> = ({
  records,
  onInspect
}) => {
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'QUARANTINED'>('ALL');
  const [search, setSearch] = useState('');

  const filtered = records.filter((r) => {
    if (filter === 'VERIFIED' && r.status !== 'VERIFIED') return false;
    if (filter === 'QUARANTINED' && r.status !== 'QUARANTINED' && r.status !== 'SPOOFED_MOCK') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.deviceModel?.toLowerCase().includes(q) ||
        r.carrierName?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.s2CellId?.toLowerCase().includes(q) ||
        r.networkType?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getRsrpPill = (rsrp?: number) => {
    if (rsrp === undefined || rsrp === null) return null;
    let color = 'text-[#FF453A] bg-[#FF453A]/10 border-[#FF453A]/20';
    if (rsrp >= -80) color = 'text-[#30D158] bg-[#30D158]/10 border-[#30D158]/20';
    else if (rsrp >= -90) color = 'text-[#0A84FF] bg-[#0A84FF]/10 border-[#0A84FF]/20';
    else if (rsrp >= -100) color = 'text-[#FF9F0A] bg-[#FF9F0A]/10 border-[#FF9F0A]/20';

    return (
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${color}`}>
        {rsrp} dBm
      </span>
    );
  };

  return (
    <div className="p-6 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] space-y-4">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold text-white text-base">
          <Radio className="h-4 w-4 text-[#0A84FF]" />
          Realtime Ingestion Stream
          <span className="text-xs font-mono font-bold text-[#8E8E93] bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/[0.08]">
            {filtered.length} shown
          </span>
        </div>

        {/* Filter Buttons & Live Link */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center p-0.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                filter === 'ALL' ? 'bg-[#1C1C1E] text-white font-bold border border-white/10' : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('VERIFIED')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                filter === 'VERIFIED' ? 'bg-[#30D158]/15 text-[#30D158] font-bold border border-[#30D158]/30' : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <ShieldCheck className="h-3 w-3" /> Verified
            </button>
            <button
              type="button"
              onClick={() => setFilter('QUARANTINED')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                filter === 'QUARANTINED' ? 'bg-[#FF453A]/15 text-[#FF453A] font-bold border border-[#FF453A]/30' : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <AlertTriangle className="h-3 w-3" /> Quarantined
            </button>
          </div>

          <Link
            to="/validation/feed"
            className="text-xs font-semibold text-[#0A84FF] hover:text-[#0071E3] flex items-center gap-1 ml-1"
          >
            Full Live Stream <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Table Content */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No Telemetry Matches Current Filter"
          description="Try selecting a different time window or reset the verification filter above."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-[#8E8E93] border-b border-white/[0.08]">
              <tr>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Device & Probe</th>
                <th className="pb-3 px-3">Carrier & RAT</th>
                <th className="pb-3 px-3">Bandwidth (DL / UL)</th>
                <th className="pb-3 px-3">Latency / Jitter</th>
                <th className="pb-3 px-3">Signal (RSRP)</th>
                <th className="pb-3 px-3">Geospatial (City / S2)</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-medium">
              {filtered.slice(0, 7).map((rec) => (
                <tr
                  key={rec.id}
                  className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  onClick={() => onInspect(rec)}
                >
                  <td className="py-3 px-3">
                    <StatusBadge status={rec.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-white">
                    <div className="font-semibold">{rec.deviceModel}</div>
                    <div className="text-[10px] text-[#8E8E93] font-mono">{rec.deviceId}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-white font-medium">{rec.carrierName}</div>
                    <span className="text-[10px] font-bold text-[#0A84FF] font-mono px-1.5 py-0.2 rounded bg-[#0A84FF]/10 border border-[#0A84FF]/20">
                      {rec.networkType}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono-num">
                    <span className="text-white font-bold">{rec.downloadMbps}</span>
                    <span className="text-[#8E8E93]"> / {rec.uploadMbps} Mbps</span>
                  </td>
                  <td className="py-3 px-3 font-mono-num">
                    <span className="text-white font-bold">{rec.latencyMedianMs} ms</span>
                    <span className="text-[#8E8E93]"> / {rec.jitterMs} ms</span>
                  </td>
                  <td className="py-3 px-3">
                    {getRsrpPill(rec.rsrpDbm) || <span className="text-[#8E8E93] text-[10px]">N/A</span>}
                  </td>
                  <td className="py-3 px-3 text-[11px]">
                    <div className="text-white">{rec.city}</div>
                    <div className="text-[10px] font-mono text-[#0A84FF]">{rec.s2CellId}</div>
                  </td>
                  <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="secondary" size="sm" onClick={() => onInspect(rec)}>
                      Inspect Proof
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
