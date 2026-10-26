import React from 'react';
import { 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Radio, 
  ShieldAlert, 
  Navigation, 
  Clock 
} from 'lucide-react';
import { TelemetryRecord } from '../../../types/telemetry';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { EmptyState } from '../../../components/ui/EmptyState';

interface LiveFeedTableProps {
  records: TelemetryRecord[];
  selectedIds: Set<string>;
  onToggleSelectRow: (id: string) => void;
  onToggleSelectAll: () => void;
  onInspect: (record: TelemetryRecord) => void;
  onApproveRecord: (id: string) => void;
  onQuarantineRecord: (id: string) => void;
  onPurgeRecord: (id: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const LiveFeedTable: React.FC<LiveFeedTableProps> = ({
  records,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectAll,
  onInspect,
  onApproveRecord,
  onQuarantineRecord,
  onPurgeRecord,
  onResetFilters,
  hasActiveFilters
}) => {
  const allSelected = records.length > 0 && records.every((r) => selectedIds.has(r.id));
  const someSelected = records.some((r) => selectedIds.has(r.id)) && !allSelected;

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    const min = Math.floor(diff / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    return `${hrs}h ago`;
  };

  const getRsrpIndicator = (rsrp?: number) => {
    if (rsrp === undefined || rsrp === null) return <span className="text-[#8E8E93]">N/A</span>;
    let badgeColor = 'text-[#FF453A] bg-[#FF453A]/10 border-[#FF453A]/25';
    if (rsrp >= -80) badgeColor = 'text-[#30D158] bg-[#30D158]/10 border-[#30D158]/25';
    else if (rsrp >= -90) badgeColor = 'text-[#0A84FF] bg-[#0A84FF]/10 border-[#0A84FF]/25';
    else if (rsrp >= -100) badgeColor = 'text-[#FF9F0A] bg-[#FF9F0A]/10 border-[#FF9F0A]/25';

    return (
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeColor}`}>
        {rsrp} dBm
      </span>
    );
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#1C1C1E] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          
          {/* Table Header */}
          <thead className="bg-black/50 text-[10px] uppercase font-bold text-[#8E8E93] border-b border-white/[0.08]">
            <tr>
              {/* Checkbox */}
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={onToggleSelectAll}
                  className="rounded border-white/20 bg-black/40 text-[#0A84FF] focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Status & Score</th>
              <th className="py-3 px-3">Time</th>
              <th className="py-3 px-3">Device & Probe</th>
              <th className="py-3 px-3">Carrier & RAT</th>
              <th className="py-3 px-3">Bandwidth (DL / UL)</th>
              <th className="py-3 px-3">Latency / Jitter</th>
              <th className="py-3 px-3">RF Signal & Velocity</th>
              <th className="py-3 px-3">Location & S2</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/[0.06] font-medium">
            {records.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <EmptyState
                    icon={Radio}
                    title="No Telemetry Matches Current Filters"
                    description="No events match your selected status, network, or search criteria."
                    action={
                      hasActiveFilters
                        ? {
                            label: 'Reset All Filters',
                            onClick: onResetFilters
                          }
                        : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              records.map((r) => {
                const isSelected = selectedIds.has(r.id);
                const anomalies = r.proof?.anomalies || [];
                const isFlaggedOrQuarantined = r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK';

                return (
                  <tr
                    key={r.id}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-[#0A84FF]/10 hover:bg-[#0A84FF]/15'
                        : isFlaggedOrQuarantined
                        ? 'hover:bg-[#FF453A]/5 bg-transparent'
                        : 'hover:bg-white/[0.04]'
                    }`}
                    onClick={() => onInspect(r)}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3 px-3.5 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectRow(r.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectRow(r.id)}
                        className="rounded border-white/20 bg-black/40 text-[#0A84FF] focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Status & Integrity Score */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={r.status} size="sm" />
                          <span
                            className={`font-mono-num font-bold text-[10px] px-1 rounded ${
                              r.nexisScore >= 85
                                ? 'text-[#30D158] bg-[#30D158]/10'
                                : r.nexisScore >= 60
                                ? 'text-[#FF9F0A] bg-[#FF9F0A]/10'
                                : 'text-[#FF453A] bg-[#FF453A]/10'
                            }`}
                          >
                            {r.nexisScore}%
                          </span>
                        </div>
                        {/* Inline anomaly chips for quarantined */}
                        {isFlaggedOrQuarantined && anomalies.length > 0 && (
                          <div className="flex flex-wrap gap-1 max-w-[170px]">
                            {anomalies.slice(0, 1).map((a) => (
                              <span
                                key={a}
                                className="text-[9px] font-mono text-[#FF453A] bg-[#FF453A]/10 border border-[#FF453A]/25 px-1 py-0.2 rounded truncate block"
                                title={a}
                              >
                                {a.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3 font-mono text-[11px] text-[#8E8E93]" title={new Date(r.timestamp).toISOString()}>
                      <div className="text-white font-medium">{formatRelativeTime(r.timestamp)}</div>
                      <div className="text-[10px] text-[#8E8E93]">
                        {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>

                    {/* Device & Model */}
                    <td className="py-3 px-3 text-white">
                      <div className="font-semibold truncate max-w-[140px]">{r.deviceModel}</div>
                      <div className="text-[10px] text-[#8E8E93] font-mono truncate max-w-[120px]">{r.deviceId}</div>
                    </td>

                    {/* Carrier & RAT */}
                    <td className="py-3 px-3">
                      <div className="text-white font-medium truncate max-w-[120px]">{r.carrierName}</div>
                      <span className="text-[10px] font-bold text-[#0A84FF] font-mono px-1.5 py-0.2 rounded bg-[#0A84FF]/10 border border-[#0A84FF]/20">
                        {r.networkType}
                      </span>
                    </td>

                    {/* Bandwidth */}
                    <td className="py-3 px-3 font-mono-num">
                      <span className="text-white font-bold">{r.downloadMbps}</span>
                      <span className="text-[#8E8E93]"> / {r.uploadMbps} Mbps</span>
                    </td>

                    {/* Latency & Jitter */}
                    <td className="py-3 px-3 font-mono-num">
                      <span className="text-white font-bold">{r.latencyMedianMs} ms</span>
                      <span className="text-[#8E8E93]"> / {r.jitterMs} ms</span>
                    </td>

                    {/* RF Signal & Velocity */}
                    <td className="py-3 px-3 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {getRsrpIndicator(r.rsrpDbm)}
                        {r.sinrDb !== undefined && (
                          <span className="text-[10px] text-[#8E8E93] font-mono">{r.sinrDb} dB</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#8E8E93] flex items-center gap-1 mt-0.5 font-mono">
                        <Navigation className="h-2.5 w-2.5 text-[#0A84FF]" />
                        {r.velocityKmH && r.velocityKmH > 1 ? `${r.velocityKmH} km/h` : 'Stationary'}
                      </div>
                    </td>

                    {/* Location & S2 */}
                    <td className="py-3 px-3 text-[11px]">
                      <div className="text-white">{r.city}</div>
                      <div className="text-[10px] font-mono text-[#0A84FF]">{r.s2CellId}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onInspect(r)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
                          title="Inspect Telemetry Proof"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {r.status !== 'VERIFIED' ? (
                          <button
                            type="button"
                            onClick={() => onApproveRecord(r.id)}
                            className="p-1.5 rounded-lg hover:bg-[#30D158]/20 text-[#8E8E93] hover:text-[#30D158] transition-colors cursor-pointer"
                            title="Verify Telemetry Payload"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onQuarantineRecord(r.id)}
                            className="p-1.5 rounded-lg hover:bg-[#FF453A]/20 text-[#8E8E93] hover:text-[#FF453A] transition-colors cursor-pointer"
                            title="Flag / Quarantine Payload"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onPurgeRecord(r.id)}
                          className="p-1.5 rounded-lg hover:bg-[#FF453A]/20 text-[#8E8E93] hover:text-[#FF453A] transition-colors cursor-pointer"
                          title="Purge Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};
