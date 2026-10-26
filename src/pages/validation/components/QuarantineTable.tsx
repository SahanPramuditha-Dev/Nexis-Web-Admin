import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Square, 
  Eye, 
  CheckCircle, 
  Trash2, 
  ShieldCheck, 
  ExternalLink, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';
import { TelemetryRecord, AnomalyType } from '../../../types/telemetry';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';

interface QuarantineTableProps {
  records: TelemetryRecord[];
  selectedIds: Set<string>;
  onToggleSelectRow: (id: string) => void;
  onInspect: (record: TelemetryRecord) => void;
  onApproveRecord: (id: string) => void;
  onPurgeRecord: (id: string) => void;
}

export const QuarantineTable: React.FC<QuarantineTableProps> = ({
  records,
  selectedIds,
  onToggleSelectRow,
  onInspect,
  onApproveRecord,
  onPurgeRecord
}) => {
  const decodeAnomaly = (anomaly: AnomalyType | string) => {
    switch (anomaly) {
      case 'MOCK_LOCATION_ACTIVE':
        return {
          title: 'Mock GPS Active',
          desc: 'Developer mock location provider enabled on Android device',
          color: 'text-[#FF453A] bg-[#FF453A]/15 border-[#FF453A]/30'
        };
      case 'IMPOSSIBLE_SPEED_FOR_TECH':
        return {
          title: 'Radio Ceiling Breached',
          desc: 'Throughput mathematically impossible for the connected radio technology',
          color: 'text-[#FF9F0A] bg-[#FF9F0A]/15 border-[#FF9F0A]/30'
        };
      case 'VELOCITY_TELEPORTATION':
        return {
          title: 'Velocity Warp',
          desc: 'Calculated displacement velocity > 950 km/h between measurement pings',
          color: 'text-[#FF453A] bg-[#FF453A]/15 border-[#FF453A]/30'
        };
      case 'IMPOSSIBLE_LOW_LATENCY':
        return {
          title: 'Sub-Physical Latency',
          desc: 'Reported latency < 0.8 ms exceeds speed of light fiber propagation limits',
          color: 'text-[#64D2FF] bg-[#64D2FF]/15 border-[#64D2FF]/30'
        };
      case 'HMAC_SIGNATURE_MISMATCH':
        return {
          title: 'Digest Tampered',
          desc: 'Cryptographic HMAC payload signature failed Ed25519 verification',
          color: 'text-[#BF5AF2] bg-[#BF5AF2]/15 border-[#BF5AF2]/30'
        };
      default:
        return {
          title: String(anomaly).replace(/_/g, ' '),
          desc: 'Zero-trust physical outlier',
          color: 'text-[#FF453A] bg-[#FF453A]/15 border-[#FF453A]/30'
        };
    }
  };

  const getPhysicsComparison = (rec: TelemetryRecord) => {
    // Show what physical bound was violated
    if (rec.networkType === '3G' && rec.downloadMbps > 45) {
      return (
        <div>
          <span className="text-[#FF453A] font-bold">{rec.downloadMbps} Mbps</span>
          <span className="text-[#8E8E93] block text-[10px]">3G Max: 45 Mbps</span>
        </div>
      );
    }
    if (rec.networkType === 'LTE' && rec.downloadMbps > 600) {
      return (
        <div>
          <span className="text-[#FF453A] font-bold">{rec.downloadMbps} Mbps</span>
          <span className="text-[#8E8E93] block text-[10px]">LTE Max: 600 Mbps</span>
        </div>
      );
    }
    if (rec.latencyMedianMs < 0.8) {
      return (
        <div>
          <span className="text-[#FF453A] font-bold">{rec.latencyMedianMs} ms</span>
          <span className="text-[#8E8E93] block text-[10px]">Min Optical: 0.8 ms</span>
        </div>
      );
    }
    if (rec.velocityKmH && rec.velocityKmH > 950) {
      return (
        <div>
          <span className="text-[#FF453A] font-bold">{rec.velocityKmH} km/h</span>
          <span className="text-[#8E8E93] block text-[10px]">Mach Ceiling: 950 km/h</span>
        </div>
      );
    }
    return (
      <div>
        <span className="text-white font-bold">{rec.downloadMbps} Mbps</span>
        <span className="text-[#8E8E93] block text-[10px]">{rec.latencyMedianMs} ms / {rec.jitterMs} ms</span>
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#1C1C1E] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          
          <thead className="bg-black/50 text-[10px] uppercase font-bold text-[#8E8E93] border-b border-white/[0.08]">
            <tr>
              <th className="py-3 px-3.5 w-10 text-center"></th>
              <th className="py-3 px-3">Status & Risk</th>
              <th className="py-3 px-3">Device & Probe History</th>
              <th className="py-3 px-3">Carrier & Radio</th>
              <th className="py-3 px-3">Reported vs Bound</th>
              <th className="py-3 px-3">Forensic Violation Diagnostics</th>
              <th className="py-3 px-3">Location & S2</th>
              <th className="py-3 px-4 text-right">Triage Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.06] font-medium">
            {records.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon={ShieldCheck}
                    title="Quarantine Queue Clear"
                    description="Zero active telemetry records are quarantined. All ingested crowdsourced packets have passed zero-trust cryptographic and physical radio bounds."
                  />
                </td>
              </tr>
            ) : (
              records.map((r) => {
                const isSelected = selectedIds.has(r.id);
                const anomalies = r.proof?.anomalies || [];
                const effectiveAnomalies = anomalies.length > 0 ? anomalies : [r.status as AnomalyType];

                return (
                  <tr
                    key={r.id}
                    className={`transition-colors cursor-pointer group ${
                      isSelected ? 'bg-[#0A84FF]/10 hover:bg-[#0A84FF]/15' : 'hover:bg-white/[0.04]'
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
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-[#0A84FF] mx-auto cursor-pointer" />
                      ) : (
                        <Square className="h-4 w-4 text-[#8E8E93] hover:text-white mx-auto cursor-pointer" />
                      )}
                    </td>

                    {/* Status & Risk Score */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={r.status} size="sm" />
                        <span className="font-mono-num font-bold text-[10px] text-[#FF453A] bg-[#FF453A]/10 border border-[#FF453A]/25 px-1 py-0.2 rounded">
                          {r.nexisScore}%
                        </span>
                      </div>
                    </td>

                    {/* Device & Model + Probe Deep Link */}
                    <td className="py-3 px-3 text-white">
                      <div className="font-semibold">{r.deviceModel}</div>
                      <Link
                        to={`/probes`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-[#0A84FF] hover:underline font-mono flex items-center gap-1 mt-0.5"
                        title="Inspect probe device reputation in Probes & Fleets"
                      >
                        <span>{r.deviceId}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </td>

                    {/* Carrier & Radio */}
                    <td className="py-3 px-3">
                      <div className="text-white font-medium">{r.carrierName}</div>
                      <span className="text-[10px] font-bold text-[#0A84FF] font-mono px-1.5 py-0.2 rounded bg-[#0A84FF]/10 border border-[#0A84FF]/20">
                        {r.networkType}
                      </span>
                    </td>

                    {/* Reported vs Physical Bound */}
                    <td className="py-3 px-3 font-mono-num text-[11px]">
                      {getPhysicsComparison(r)}
                    </td>

                    {/* Forensic Violations */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {effectiveAnomalies.map((a) => {
                          const meta = decodeAnomaly(a);
                          return (
                            <span
                              key={String(a)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${meta.color}`}
                              title={meta.desc}
                            >
                              {meta.title}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Location & S2 */}
                    <td className="py-3 px-3 text-[11px]">
                      <div className="text-white">{r.city}</div>
                      <div className="text-[10px] font-mono text-[#0A84FF]">{r.s2CellId}</div>
                    </td>

                    {/* Triage Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onInspect(r)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.08] text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
                          title="Inspect Cryptographic Proof"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <Button
                          variant="tinted"
                          size="sm"
                          className="text-[#30D158] bg-[#30D158]/15 border-[#30D158]/30 hover:bg-[#30D158]/25"
                          onClick={() => onApproveRecord(r.id)}
                          title="Approve as False Positive"
                        >
                          Approve
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onPurgeRecord(r.id)}
                          title="Permanently Expunge Poisoned Record"
                        >
                          Purge
                        </Button>
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
