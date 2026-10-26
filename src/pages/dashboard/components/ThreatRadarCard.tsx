import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, ArrowRight, ShieldCheck, Crosshair, Lock } from 'lucide-react';
import { TelemetryRecord, AnomalyType } from '../../../types/telemetry';
import { Button } from '../../../components/ui/Button';

interface ThreatRadarCardProps {
  records: TelemetryRecord[];
}

export const ThreatRadarCard: React.FC<ThreatRadarCardProps> = ({ records }) => {
  const quarantinedRecords = records.filter(
    (r) => r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK'
  );

  // Anomaly tally
  const anomalyCounts: Record<string, number> = {
    MOCK_LOCATION_ACTIVE: 0,
    VELOCITY_TELEPORTATION: 0,
    IMPOSSIBLE_SPEED_FOR_TECH: 0,
    HMAC_SIGNATURE_MISMATCH: 0,
    OTHER_ANOMALIES: 0
  };

  quarantinedRecords.forEach((r) => {
    const list = r.proof?.anomalies || [];
    if (list.length === 0) {
      if (r.status === 'SPOOFED_MOCK') {
        anomalyCounts.MOCK_LOCATION_ACTIVE++;
      } else {
        anomalyCounts.OTHER_ANOMALIES++;
      }
    } else {
      list.forEach((a: AnomalyType) => {
        if (a in anomalyCounts) {
          anomalyCounts[a]++;
        } else {
          anomalyCounts.OTHER_ANOMALIES++;
        }
      });
    }
  });

  const totalThreats = quarantinedRecords.length;

  const threatItems = [
    {
      id: 'MOCK_LOCATION_ACTIVE',
      label: 'Mock Location (GPS Spoofing)',
      count: anomalyCounts.MOCK_LOCATION_ACTIVE,
      desc: 'Android Mock Provider or Developer Mode active'
    },
    {
      id: 'VELOCITY_TELEPORTATION',
      label: 'Impossible Velocity / Teleport',
      count: anomalyCounts.VELOCITY_TELEPORTATION,
      desc: 'Calculated transit speed > 950 km/h between pings'
    },
    {
      id: 'IMPOSSIBLE_SPEED_FOR_TECH',
      label: 'Radio Physical Ceiling Exceeded',
      count: anomalyCounts.IMPOSSIBLE_SPEED_FOR_TECH,
      desc: 'Throughput mathematically impossible for RAT (e.g. 500Mbps 3G)'
    },
    {
      id: 'HMAC_SIGNATURE_MISMATCH',
      label: 'Cryptographic Digest Tampered',
      count: anomalyCounts.HMAC_SIGNATURE_MISMATCH,
      desc: 'Signature does not match client payload secret'
    }
  ];

  return (
    <div className="p-6 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-white text-base">
          <ShieldAlert className={`h-4 w-4 ${totalThreats > 0 ? 'text-[#FF453A]' : 'text-[#30D158]'}`} />
          Zero-Trust Security Radar
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
            totalThreats > 0
              ? 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30'
              : 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30'
          }`}
        >
          {totalThreats > 0 ? `${totalThreats} Intercepted` : 'All Clean'}
        </span>
      </div>

      {/* Threat List */}
      <div className="space-y-2.5">
        {threatItems.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-0.5 min-w-0">
              <span className="font-semibold text-white truncate block">{item.label}</span>
              <span className="text-[10px] text-[#8E8E93] truncate block">{item.desc}</span>
            </div>
            <div
              className={`font-mono-num font-bold text-xs px-2 py-0.5 rounded-lg border shrink-0 ${
                item.count > 0
                  ? 'bg-[#FF453A]/20 text-[#FF453A] border-[#FF453A]/30'
                  : 'bg-white/[0.04] text-[#8E8E93] border-white/[0.06]'
              }`}
            >
              {item.count}
            </div>
          </div>
        ))}
      </div>

      {/* Action footer */}
      <div className="pt-2">
        {totalThreats > 0 ? (
          <Link to="/validation/quarantine" className="w-full block">
            <Button
              variant="tinted"
              size="sm"
              icon={ArrowRight}
              className="w-full justify-center text-[#FF453A] bg-[#FF453A]/15 border-[#FF453A]/30 hover:bg-[#FF453A]/25"
            >
              Resolve Quarantined Payloads ({totalThreats})
            </Button>
          </Link>
        ) : (
          <div className="p-3 rounded-2xl bg-[#30D158]/10 border border-[#30D158]/20 text-center text-xs text-[#30D158] font-medium flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Zero cryptographic or physical breaches detected
          </div>
        )}
      </div>

    </div>
  );
};
