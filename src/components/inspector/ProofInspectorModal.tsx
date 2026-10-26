import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  MapPin, 
  Activity, 
  CheckCircle, 
  Trash2, 
  Lock,
  UserX,
  Copy,
  Check,
  ExternalLink,
  Navigation,
  Signal
} from 'lucide-react';
import { TelemetryRecord, AnomalyType } from '../../types/telemetry';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { telemetryService } from '../../services/telemetryService';

interface ProofInspectorModalProps {
  record: TelemetryRecord | null;
  onClose: () => void;
}

export const ProofInspectorModal: React.FC<ProofInspectorModalProps> = ({ record, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!record) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApprove = () => {
    telemetryService.approveRecord(record.id);
    onClose();
  };

  const handleQuarantine = () => {
    telemetryService.quarantineRecord(record.id, 'Manually quarantined by operator');
    onClose();
  };

  const handlePurge = () => {
    telemetryService.purgeRecord(record.id);
    onClose();
  };

  const handleShadowBan = () => {
    if (confirm(`Shadow-ban probe device ${record.deviceId}? All future telemetry will be silently dropped.`)) {
      telemetryService.shadowBanDevice(record.deviceId);
      onClose();
    }
  };

  const decodeAnomaly = (anomaly: AnomalyType | string) => {
    switch (anomaly) {
      case 'MOCK_LOCATION_ACTIVE':
        return {
          title: 'Mock GPS Provider Active',
          desc: 'Android Developer mock location injection or fake GPS application detected.'
        };
      case 'IMPOSSIBLE_SPEED_FOR_TECH':
        return {
          title: 'Radio Physics Ceiling Exceeded',
          desc: 'Throughput mathematically exceeds maximum theoretical channel capacity for RAT.'
        };
      case 'VELOCITY_TELEPORTATION':
        return {
          title: 'Velocity Warp / Teleportation',
          desc: 'Transit displacement velocity > 950 km/h between measurement pings.'
        };
      case 'IMPOSSIBLE_LOW_LATENCY':
        return {
          title: 'Sub-Physical Latency Floor',
          desc: 'Latency < 0.8 ms violates speed of light fiber optic round-trip propagation.'
        };
      case 'HMAC_SIGNATURE_MISMATCH':
        return {
          title: 'Cryptographic Digest Tampered',
          desc: 'Ed25519 HMAC signature verification failed against client payload secret.'
        };
      default:
        return {
          title: String(anomaly).replace(/_/g, ' '),
          desc: 'Zero-trust physical or statistical outlier.'
        };
    }
  };

  const getRsrpTier = (rsrp?: number) => {
    if (rsrp === undefined || rsrp === null) return { label: 'N/A', color: 'text-[#8E8E93]', bg: 'bg-white/10', pct: 0 };
    if (rsrp >= -80) return { label: 'Excellent', color: 'text-[#30D158]', bg: 'bg-[#30D158]', pct: 95 };
    if (rsrp >= -90) return { label: 'Good', color: 'text-[#0A84FF]', bg: 'bg-[#0A84FF]', pct: 75 };
    if (rsrp >= -100) return { label: 'Fair', color: 'text-[#FF9F0A]', bg: 'bg-[#FF9F0A]', pct: 45 };
    return { label: 'Poor / Cell Edge', color: 'text-[#FF453A]', bg: 'bg-[#FF453A]', pct: 20 };
  };

  const rsrpMeta = getRsrpTier(record.rsrpDbm);
  const anomalies = record.proof?.anomalies || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#1C1C1E] border border-white/[0.12] rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-[#0A84FF] uppercase tracking-wider">
                Telemetry Proof &amp; Radio Physics Inspector
              </span>
              <StatusBadge status={record.status} size="sm" />
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
              <span>{record.id}</span>
              <button
                type="button"
                onClick={() => handleCopy(record.id, 'id')}
                className="p-1 rounded-lg hover:bg-white/10 text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
                title="Copy Record ID"
              >
                {copiedKey === 'id' ? <Check className="h-4 w-4 text-[#30D158]" /> : <Copy className="h-4 w-4" />}
              </button>
            </h2>

            <p className="text-xs text-[#8E8E93]">
              Recorded {new Date(record.timestamp).toLocaleString()} • Probe Model:{' '}
              <span className="text-white font-semibold">{record.deviceModel}</span> ({record.deviceId})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8E8E93] hover:text-white rounded-xl hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Anomaly Callout if flagged */}
        {anomalies.length > 0 && (
          <div className="p-4 rounded-2xl border border-[#FF453A]/30 bg-[#FF453A]/10 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF453A]">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#FF453A]" />
              <span>Physics &amp; Zero-Trust Rule Violations Detected ({anomalies.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {anomalies.map((a) => {
                const meta = decodeAnomaly(a);
                return (
                  <div key={a} className="p-2.5 rounded-xl bg-black/40 border border-[#FF453A]/25 text-xs space-y-0.5">
                    <div className="font-bold text-[#FF453A] font-mono text-[11px]">{meta.title}</div>
                    <p className="text-[10px] text-white/70 leading-relaxed">{meta.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 1. Cryptographic Attestation Card */}
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-black/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#0A84FF]" />
                Cryptographic Attestation
              </span>
              <span className="text-[10px] font-mono font-bold text-[#30D158] bg-[#30D158]/15 px-2 py-0.5 rounded border border-[#30D158]/30">
                Score: {record.nexisScore} / 100
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Algorithm:</span>
                <span className="text-white">{record.proof.algorithm}</span>
              </div>

              {/* Payload Digest */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#8E8E93]">Payload Digest:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(record.proof.payloadDigest, 'digest')}
                    className="text-[#0A84FF] hover:underline flex items-center gap-1 text-[10px] cursor-pointer"
                  >
                    {copiedKey === 'digest' ? <Check className="h-3 w-3 text-[#30D158]" /> : <Copy className="h-3 w-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-black/60 border border-white/[0.06] text-[10px] text-[#8E8E93] break-all">
                  {record.proof.payloadDigest}
                </div>
              </div>

              {/* Proof Signature */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#8E8E93]">Ed25519 Signature:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(record.proof.proofSignature, 'sig')}
                    className="text-[#0A84FF] hover:underline flex items-center gap-1 text-[10px] cursor-pointer"
                  >
                    {copiedKey === 'sig' ? <Check className="h-3 w-3 text-[#30D158]" /> : <Copy className="h-3 w-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-black/60 border border-white/[0.06] text-[10px] text-[#8E8E93] break-all">
                  {record.proof.proofSignature}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Geospatial & Physics Card */}
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-black/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#30D158]" />
                Spatial S2 Grid &amp; Kinematics
              </span>
              <Link
                to="/spatial/map"
                onClick={onClose}
                className="text-[10px] text-[#0A84FF] hover:underline flex items-center gap-1 font-mono font-normal"
              >
                <span>View on S2 Map</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="text-[#8E8E93] block text-[10px] uppercase font-semibold">S2 Level-13 Cell</span>
                <span className="text-white font-mono font-bold text-xs">{record.s2CellId}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="text-[#8E8E93] block text-[10px] uppercase font-semibold">Transit Velocity</span>
                <span className="text-white font-mono-num font-bold text-xs">
                  {record.velocityKmH ?? 0} km/h
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="text-[#8E8E93] block text-[10px] uppercase font-semibold">Coordinates</span>
                <span className="text-white font-mono-num text-[11px]">
                  {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="text-[#8E8E93] block text-[10px] uppercase font-semibold">Accuracy &amp; City</span>
                <span className="text-white font-medium text-[11px] truncate block">
                  ±{record.accuracyMeters ?? 10}m • {record.city}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Performance Metrics Card */}
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-black/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Activity className="h-4 w-4 text-[#64D2FF]" />
              Bandwidth &amp; Latency Delays
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="text-[#8E8E93] block text-[10px] uppercase font-semibold">Download Bandwidth</span>
                <span className="text-lg font-extrabold text-[#30D158] font-mono-num">{record.downloadMbps} Mbps</span>
              </div>

              <div className="p-3 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="text-[#8E8E93] block text-[10px] uppercase font-semibold">Upload Bandwidth</span>
                <span className="text-lg font-extrabold text-[#0A84FF] font-mono-num">{record.uploadMbps} Mbps</span>
              </div>

              <div className="p-3 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="text-[#8E8E93] block text-[10px] uppercase font-semibold">Median RTT Latency</span>
                <span className="text-lg font-extrabold text-white font-mono-num">{record.latencyMedianMs} ms</span>
              </div>

              <div className="p-3 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="text-[#8E8E93] block text-[10px] uppercase font-semibold">RFC 3550 Jitter</span>
                <span className="text-lg font-extrabold text-white font-mono-num">{record.jitterMs} ms</span>
              </div>
            </div>
          </div>

          {/* 4. RF Radio Physics & Signal Health Card */}
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-black/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-[#BF5AF2]" />
                Cellular Radio Physics
              </span>
              <span className="text-[10px] font-mono font-bold text-[#0A84FF] px-2 py-0.5 rounded bg-[#0A84FF]/10 border border-[#0A84FF]/20">
                {record.networkType} • {record.carrierName}
              </span>
            </div>

            {/* RSRP Meter */}
            <div className="p-3 rounded-xl bg-[#1C1C1E] border border-white/[0.06] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8E8E93] text-[10px] uppercase font-semibold">RSRP (Power):</span>
                <span className={`font-mono-num font-bold text-xs ${rsrpMeta.color}`}>
                  {record.rsrpDbm ?? '—'} dBm ({rsrpMeta.label})
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/[0.04]">
                <div
                  className={`h-full rounded-full ${rsrpMeta.bg}`}
                  style={{ width: `${rsrpMeta.pct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="text-[#8E8E93] block text-[10px] uppercase font-semibold">SINR (Signal/Noise)</span>
                <span className="text-white font-mono-num font-bold text-xs">{record.sinrDb ?? '—'} dB</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1C1C1E] border border-white/[0.06]">
                <span className="text-[#8E8E93] block text-[10px] uppercase font-semibold">Cell Tower CID</span>
                <span className="text-[#8E8E93] font-mono text-xs truncate block">{record.cellId ?? 'Unknown'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              icon={UserX}
              onClick={handleShadowBan}
            >
              Shadow-ban Probe
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={handlePurge}
            >
              Purge Record
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {record.status !== 'QUARANTINED' && (
              <Button
                variant="secondary"
                size="md"
                icon={AlertTriangle}
                onClick={handleQuarantine}
              >
                Quarantine Record
              </Button>
            )}
            {record.status !== 'VERIFIED' && (
              <Button
                variant="primary"
                size="md"
                icon={CheckCircle}
                onClick={handleApprove}
                className="bg-[#30D158] text-black font-bold hover:bg-[#30D158]/80"
              >
                Approve &amp; Verify Record
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
