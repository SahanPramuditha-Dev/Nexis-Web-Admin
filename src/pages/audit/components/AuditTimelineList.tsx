import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Sliders, 
  UserX, 
  User, 
  Clock, 
  Copy, 
  Check, 
  History 
} from 'lucide-react';
import { AuditLogEntry } from '../../../types/telemetry';
import { EmptyState } from '../../../components/ui/EmptyState';

interface AuditTimelineListProps {
  logs: AuditLogEntry[];
}

export const AuditTimelineList: React.FC<AuditTimelineListProps> = ({ logs }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

  const getActionMeta = (action: string) => {
    switch (action) {
      case 'APPROVE_RECORD':
      case 'REINSTATE_DEVICE':
        return {
          icon: CheckCircle2,
          color: 'text-[#30D158] bg-[#30D158]/15 border-[#30D158]/30',
          dot: 'bg-[#30D158]'
        };
      case 'QUARANTINE_RECORD':
      case 'SET_PROBATION':
        return {
          icon: AlertTriangle,
          color: 'text-[#FF9F0A] bg-[#FF9F0A]/15 border-[#FF9F0A]/30',
          dot: 'bg-[#FF9F0A]'
        };
      case 'PURGE_RECORD':
      case 'PURGE_EXPIRED_TELEMETRY':
      case 'SHADOW_BAN_DEVICE':
        return {
          icon: Trash2,
          color: 'text-[#FF453A] bg-[#FF453A]/15 border-[#FF453A]/30',
          dot: 'bg-[#FF453A]'
        };
      case 'UPDATE_RULES':
        return {
          icon: Sliders,
          color: 'text-[#0A84FF] bg-[#0A84FF]/15 border-[#0A84FF]/30',
          dot: 'bg-[#0A84FF]'
        };
      default:
        return {
          icon: History,
          color: 'text-[#BF5AF2] bg-[#BF5AF2]/15 border-[#BF5AF2]/30',
          dot: 'bg-[#BF5AF2]'
        };
    }
  };

  if (logs.length === 0) {
    return (
      <div className="rounded-3xl border border-white/[0.08] bg-[#1C1C1E] p-8 shadow-sm">
        <EmptyState
          icon={History}
          title="No Audit Records Match Current Filters"
          description="Try selecting a different action category or clearing the search query."
        />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#1C1C1E] p-5 md:p-6 space-y-3.5 shadow-sm">
      <div className="flex items-center justify-between text-xs text-[#8E8E93] pb-2 border-b border-white/[0.06]">
        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
          Chronological Audit Trail
        </span>
        <span className="font-mono-num">{logs.length} entries</span>
      </div>

      <div className="space-y-3">
        {logs.map((log) => {
          const meta = getActionMeta(log.action);
          const Icon = meta.icon;
          const isCopied = copiedId === log.targetId;

          return (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              {/* Left Details */}
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2 rounded-xl border shrink-0 ${meta.color}`}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${meta.color}`}>
                      {log.action}
                    </span>

                    <span className="text-[#8E8E93]">•</span>

                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <User className="h-3 w-3 text-[#8E8E93]" />
                      {log.adminUser}
                    </span>
                  </div>

                  <p className="text-white/80 leading-relaxed font-medium">
                    {log.details}
                  </p>

                  {/* Target ID Copyable */}
                  {log.targetId && (
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-[#8E8E93] uppercase font-semibold">Target:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(log.targetId)}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] font-mono text-[10px] text-[#0A84FF] transition-colors cursor-pointer"
                        title="Click to copy target ID"
                      >
                        <span className="truncate max-w-[200px]">{log.targetId}</span>
                        {isCopied ? (
                          <Check className="h-2.5 w-2.5 text-[#30D158]" />
                        ) : (
                          <Copy className="h-2.5 w-2.5 text-[#8E8E93]" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Timestamp */}
              <div className="text-[11px] text-[#8E8E93] font-mono shrink-0 flex items-center gap-2 self-start md:self-center pl-11 md:pl-0">
                <Clock className="h-3.5 w-3.5 text-[#8E8E93]" />
                <div className="text-right">
                  <div className="text-white font-medium">{formatRelativeTime(log.timestamp)}</div>
                  <div className="text-[10px] text-[#8E8E93]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
