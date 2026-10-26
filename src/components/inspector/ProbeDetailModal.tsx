import React from 'react';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  AlertTriangle, 
  UserX, 
  RefreshCw, 
  Clock, 
  Activity, 
  Globe, 
  Apple,
  CheckCircle2
} from 'lucide-react';
import { ProbeDevice, TelemetryRecord } from '../../types/telemetry';
import { Button } from '../ui/Button';
import { telemetryService } from '../../services/telemetryService';

interface ProbeDetailModalProps {
  probe: ProbeDevice | null;
  records: TelemetryRecord[];
  onClose: () => void;
}

export const ProbeDetailModal: React.FC<ProbeDetailModalProps> = ({ probe, records, onClose }) => {
  if (!probe) return null;

  const probeRecords = records.filter((r) => r.deviceId === probe.deviceId);
  const passRate = probe.totalSubmissions > 0
    ? Math.round((probe.verifiedSubmissions / probe.totalSubmissions) * 100)
    : 100;

  const handleReinstate = async () => {
    await telemetryService.reinstateDevice(probe.deviceId);
    onClose();
  };

  const handleProbation = async () => {
    await telemetryService.setDeviceProbation(probe.deviceId);
    onClose();
  };

  const handleShadowBan = async () => {
    if (confirm(`Shadow-ban probe ${probe.deviceId}? All subsequent telemetry will be discarded silently.`)) {
      await telemetryService.shadowBanDevice(probe.deviceId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#1C1C1E] border border-white/[0.12] rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
                {probe.platform === 'iOS' ? (
                  <Apple className="h-5 w-5" />
                ) : probe.platform === 'Web' ? (
                  <Globe className="h-5 w-5" />
                ) : (
                  <Smartphone className="h-5 w-5" />
                )}
              </span>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {probe.deviceModel}
                </h2>
                <span className="font-mono text-xs text-[#8E8E93]">{probe.deviceId}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8E8E93] hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Reputation & Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider">
              Fleet Status
            </span>
            <div className="mt-1">
              {probe.status === 'ACTIVE' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
                  Active Verified
                </span>
              )}
              {probe.status === 'PROBATIONARY' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30">
                  Probationary
                </span>
              )}
              {probe.status === 'SHADOW_BANNED' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30">
                  Shadow-Banned
                </span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider">
              Reputation Score
            </span>
            <div className="text-2xl font-black mt-1 font-mono">
              <span className={probe.trustScore >= 70 ? 'text-[#30D158]' : 'text-[#FF453A]'}>
                {probe.trustScore}
              </span>
              <span className="text-xs text-[#8E8E93] font-normal"> / 100</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider">
              Total Submissions
            </span>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {probe.totalSubmissions}
            </div>
            <span className="text-[11px] text-[#8E8E93]">{passRate}% pass rate</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider">
              Platform & OS
            </span>
            <div className="text-base font-bold text-white mt-1">
              {probe.platform}
            </div>
            <span className="text-[11px] text-[#8E8E93] font-mono">{probe.osVersion}</span>
          </div>
        </div>

        {/* Chronological Submission History from this Probe */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#0A84FF]" />
              Recent Telemetry Submissions
            </h3>
            <span className="text-[11px] text-[#8E8E93]">
              Showing {probeRecords.length} records in cache
            </span>
          </div>

          {probeRecords.length === 0 ? (
            <div className="p-6 rounded-2xl bg-black/40 border border-white/[0.06] text-center text-xs text-[#8E8E93]">
              No individual telemetry packets currently in active buffer.
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.08] bg-black/40 overflow-hidden divide-y divide-white/[0.06]">
              {probeRecords.slice(0, 5).map((r) => (
                <div key={r.id} className="p-3 flex items-center justify-between text-xs hover:bg-white/[0.04]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white font-bold">{r.downloadMbps} Mbps</span>
                      <span className="text-[#8E8E93]">•</span>
                      <span className="text-white">{r.carrierName} ({r.networkType})</span>
                    </div>
                    <div className="text-[10px] text-[#8E8E93] font-mono">
                      {new Date(r.timestamp).toLocaleString()} • {r.city} • Latency {r.latencyMedianMs} ms
                    </div>
                  </div>

                  <div>
                    {r.status === 'VERIFIED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#30D158]/15 text-[#30D158]">
                        Verified
                      </span>
                    )}
                    {r.status === 'QUARANTINED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF453A]/15 text-[#FF453A]">
                        Quarantined
                      </span>
                    )}
                    {r.status === 'SPOOFED_MOCK' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF453A]/20 text-[#FF453A]">
                        Mock GPS
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lifecycle Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-5">
          <div className="flex items-center gap-2">
            {probe.status !== 'ACTIVE' && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={handleReinstate}
              >
                Reinstate to Active Fleet
              </Button>
            )}

            {probe.status !== 'PROBATIONARY' && (
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={handleProbation}
              >
                Set Probation
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {probe.status !== 'SHADOW_BANNED' && (
              <Button
                variant="destructive"
                size="sm"
                icon={UserX}
                onClick={handleShadowBan}
              >
                Shadow-Ban Probe
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
