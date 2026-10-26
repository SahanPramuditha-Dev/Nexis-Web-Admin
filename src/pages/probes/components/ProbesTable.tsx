import React from 'react';
import { 
  CheckSquare, 
  Square, 
  Smartphone, 
  Apple, 
  Globe, 
  Eye, 
  UserX, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { ProbeDevice } from '../../../types/telemetry';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';

interface ProbesTableProps {
  probes: ProbeDevice[];
  selectedIds: Set<string>;
  onToggleSelectRow: (id: string) => void;
  onToggleSelectAll: () => void;
  onSelectProbe: (probe: ProbeDevice) => void;
  onShadowBan: (id: string) => void;
  onReinstate: (id: string) => void;
}

export const ProbesTable: React.FC<ProbesTableProps> = ({
  probes,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectAll,
  onSelectProbe,
  onShadowBan,
  onReinstate
}) => {
  const isAllSelected = probes.length > 0 && probes.every((p) => selectedIds.has(p.deviceId));
  const isSomeSelected = probes.some((p) => selectedIds.has(p.deviceId)) && !isAllSelected;

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    const min = Math.floor(diff / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'iOS') return <Apple className="h-4 w-4 text-[#8E8E93]" />;
    if (platform === 'Web') return <Globe className="h-4 w-4 text-[#0A84FF]" />;
    return <Smartphone className="h-4 w-4 text-[#30D158]" />;
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#1C1C1E] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          
          <thead className="bg-black/50 text-[10px] uppercase font-bold text-[#8E8E93] border-b border-white/[0.08]">
            <tr>
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeSelected;
                  }}
                  onChange={onToggleSelectAll}
                  className="rounded border-white/20 bg-black/40 text-[#0A84FF] focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Device Model &amp; Hardware ID</th>
              <th className="py-3 px-3">Fleet Status</th>
              <th className="py-3 px-3">Trust Score Meter</th>
              <th className="py-3 px-3">Platform &amp; OS</th>
              <th className="py-3 px-3">Submissions &amp; Pass Rate</th>
              <th className="py-3 px-3">Last Seen &amp; Location</th>
              <th className="py-3 px-4 text-right">Lifecycle Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.06] font-medium">
            {probes.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon={Smartphone}
                    title="No Probes Match Criteria"
                    description="No hardware devices match your current status, platform, or search filters."
                  />
                </td>
              </tr>
            ) : (
              probes.map((p) => {
                const isSelected = selectedIds.has(p.deviceId);
                const passRate =
                  p.totalSubmissions > 0
                    ? Math.round((p.verifiedSubmissions / p.totalSubmissions) * 100)
                    : 100;

                const trustScore = p.trustScore || 85;
                const trustColor =
                  trustScore >= 70
                    ? 'text-[#30D158] bg-[#30D158]'
                    : trustScore >= 45
                    ? 'text-[#FF9F0A] bg-[#FF9F0A]'
                    : 'text-[#FF453A] bg-[#FF453A]';

                return (
                  <tr
                    key={p.deviceId}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-[#0A84FF]/10 hover:bg-[#0A84FF]/15'
                        : p.status === 'SHADOW_BANNED'
                        ? 'bg-[#FF453A]/5 hover:bg-[#FF453A]/10'
                        : 'hover:bg-white/[0.04]'
                    }`}
                    onClick={() => onSelectProbe(p)}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3 px-3.5 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectRow(p.deviceId);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectRow(p.deviceId)}
                        className="rounded border-white/20 bg-black/40 text-[#0A84FF] focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Model & Hardware UUID */}
                    <td className="py-3 px-3 text-white">
                      <div className="font-bold flex items-center gap-2">
                        {getPlatformIcon(p.platform)}
                        <span>{p.deviceModel}</span>
                      </div>
                      <div className="text-[10px] text-[#8E8E93] font-mono mt-0.5 truncate max-w-[150px]">
                        {p.deviceId}
                      </div>
                    </td>

                    {/* Fleet Status */}
                    <td className="py-3 px-3">
                      {p.status === 'ACTIVE' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30 flex items-center gap-1.5 w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#30D158]" />
                          Active
                        </span>
                      )}
                      {p.status === 'PROBATIONARY' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30 flex items-center gap-1.5 w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF9F0A] animate-pulse" />
                          Probationary
                        </span>
                      )}
                      {p.status === 'SHADOW_BANNED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30 flex items-center gap-1.5 w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF453A]" />
                          Shadow-Banned
                        </span>
                      )}
                    </td>

                    {/* Trust Score Meter */}
                    <td className="py-3 px-3">
                      <div className="space-y-1 w-28">
                        <div className="flex justify-between text-[11px] font-mono-num font-bold">
                          <span className={trustScore >= 70 ? 'text-[#30D158]' : trustScore >= 45 ? 'text-[#FF9F0A]' : 'text-[#FF453A]'}>
                            {trustScore}
                          </span>
                          <span className="text-[#8E8E93] font-normal text-[10px]">/ 100</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/[0.04]">
                          <div
                            className={`h-full rounded-full ${
                              trustScore >= 70 ? 'bg-[#30D158]' : trustScore >= 45 ? 'bg-[#FF9F0A]' : 'bg-[#FF453A]'
                            }`}
                            style={{ width: `${trustScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Platform & OS */}
                    <td className="py-3 px-3">
                      <div className="text-white font-medium">{p.platform}</div>
                      <span className="text-[10px] text-[#8E8E93] font-mono">{p.osVersion}</span>
                    </td>

                    {/* Submissions & Pass Rate */}
                    <td className="py-3 px-3 font-mono-num">
                      <div className="text-white font-bold">{p.totalSubmissions} tests</div>
                      <span className={`text-[10px] ${passRate >= 80 ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
                        {passRate}% pass rate
                      </span>
                    </td>

                    {/* Last Seen & Location */}
                    <td className="py-3 px-3 text-[11px]">
                      <div className="text-white flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 text-[#0A84FF]" />
                        {formatRelativeTime(p.lastSeen)}
                      </div>
                      <div className="text-[10px] text-[#8E8E93] truncate max-w-[120px] flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5 text-[#8E8E93]" />
                        {p.lastKnownLocation || 'Active Probe'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => onSelectProbe(p)}
                          title="Inspect Telemetry Timeline"
                        >
                          Timeline
                        </Button>

                        {p.status !== 'SHADOW_BANNED' ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            icon={UserX}
                            onClick={() => onShadowBan(p.deviceId)}
                            title="Shadow-ban probe: silently discard poisoned telemetry"
                          >
                            Ban
                          </Button>
                        ) : (
                          <Button
                            variant="tinted"
                            size="sm"
                            icon={CheckCircle2}
                            className="text-[#30D158] bg-[#30D158]/15 border-[#30D158]/30 hover:bg-[#30D158]/25"
                            onClick={() => onReinstate(p.deviceId)}
                            title="Reinstate probe into active crowdsource fleet"
                          >
                            Reinstate
                          </Button>
                        )}
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
