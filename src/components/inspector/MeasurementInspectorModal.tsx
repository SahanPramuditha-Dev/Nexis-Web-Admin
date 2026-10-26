import React, { useState } from 'react';
import { 
  X, 
  Activity, 
  Gauge, 
  Server, 
  Globe, 
  Copy, 
  Check, 
  Trash2, 
  Clock, 
  TrendingUp,
  Radio,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { ClientMeasurementRecord } from '../../types/telemetry';
import { Button } from '../ui/Button';
import { telemetryService } from '../../services/telemetryService';

interface MeasurementInspectorModalProps {
  measurement: ClientMeasurementRecord | null;
  onClose: () => void;
}

export const MeasurementInspectorModal: React.FC<MeasurementInspectorModalProps> = ({ 
  measurement, 
  onClose 
}) => {
  const [copied, setCopied] = useState(false);

  if (!measurement) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(measurement, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (confirm('Permanently purge this diagnostic speed test measurement from the database?')) {
      telemetryService.deleteMeasurement(measurement.id);
      onClose();
    }
  };

  const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
    'A+': { bg: 'bg-[#30D158]/15', text: 'text-[#30D158]', border: 'border-[#30D158]/30' },
    'A': { bg: 'bg-[#30D158]/15', text: 'text-[#30D158]', border: 'border-[#30D158]/30' },
    'B': { bg: 'bg-[#0A84FF]/15', text: 'text-[#0A84FF]', border: 'border-[#0A84FF]/30' },
    'C': { bg: 'bg-[#FF9F0A]/15', text: 'text-[#FF9F0A]', border: 'border-[#FF9F0A]/30' },
    'D': { bg: 'bg-[#FF453A]/15', text: 'text-[#FF453A]', border: 'border-[#FF453A]/30' },
    'F': { bg: 'bg-[#FF453A]/20', text: 'text-[#FF453A]', border: 'border-[#FF453A]/40' }
  };

  const gradeStyle = measurement.bufferbloatGrade 
    ? gradeColors[measurement.bufferbloatGrade] || gradeColors['B']
    : gradeColors['B'];

  const chartData = (measurement.samples || []).map((s) => ({
    time: `${s.timeSec.toFixed(1)}s`,
    mbps: Number(s.mbps.toFixed(1)),
    phase: s.phase
  }));

  const idleRtt = measurement.latencyMs ?? 0;
  const downRtt = measurement.downloadLoadedLatencyMs ?? measurement.loadedLatencyMs ?? idleRtt;
  const upRtt = measurement.uploadLoadedLatencyMs ?? measurement.loadedLatencyMs ?? idleRtt;
  const maxRtt = Math.max(idleRtt, downRtt, upRtt, 50);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#1C1C1E] border border-white/[0.12] rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-[#0A84FF] uppercase tracking-wider">
                RFC 6349 Client Speed Diagnostics
              </span>
              {measurement.bufferbloatGrade && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.border}`}>
                  Bufferbloat Grade {measurement.bufferbloatGrade}
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white font-mono tracking-tight">
              {measurement.id}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#8E8E93]">
              <span className="text-white font-medium">{measurement.isp || 'Unknown ISP'}</span>
              <span>•</span>
              <span className="font-mono">{measurement.asn || 'AS-Unknown'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(measurement.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8E8E93] hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Primary Metric Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider">
              Download Speed
            </span>
            <div className="text-2xl font-black text-[#30D158] mt-1 font-mono">
              {measurement.downloadMbps !== null ? `${measurement.downloadMbps.toFixed(1)}` : '—'}
              <span className="text-xs font-semibold text-[#8E8E93] ml-1">Mbps</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider">
              Upload Speed
            </span>
            <div className="text-2xl font-black text-[#0A84FF] mt-1 font-mono">
              {measurement.uploadMbps !== null ? `${measurement.uploadMbps.toFixed(1)}` : '—'}
              <span className="text-xs font-semibold text-[#8E8E93] ml-1">Mbps</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider">
              Idle RTT Latency
            </span>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {measurement.latencyMs !== null ? `${measurement.latencyMs.toFixed(1)}` : '—'}
              <span className="text-xs font-semibold text-[#8E8E93] ml-1">ms</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider">
              Bufferbloat Delta
            </span>
            <div className="text-2xl font-black text-[#FF9F0A] mt-1 font-mono">
              {measurement.bufferbloatMs !== null ? `+${measurement.bufferbloatMs.toFixed(1)}` : '—'}
              <span className="text-xs font-semibold text-[#8E8E93] ml-1">ms</span>
            </div>
          </div>
        </div>

        {/* Throughput Curve Chart */}
        {chartData.length > 0 && (
          <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#0A84FF]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Throughput Saturation Curve
                </span>
              </div>
              <span className="text-[11px] text-[#8E8E93] font-mono">
                Duration: {measurement.durationSec ? `${measurement.durationSec.toFixed(1)}s` : '5.0s'}
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mbpsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0A84FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#8E8E93" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8E8E93" fontSize={10} tickLine={false} unit="M" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1C1E',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      fontSize: 11,
                      color: '#fff'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mbps"
                    stroke="#0A84FF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#mbpsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Latency Under Load (Bufferbloat Analysis) */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#FF9F0A]" />
              Loaded Latency Variance & Queueing
            </span>
            <span className="text-[11px] text-[#8E8E93]">
              Jitter: {measurement.jitterMs?.toFixed(1) ?? '—'} ms • Loss: {measurement.lossPercent?.toFixed(2) ?? '0.00'}%
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[#8E8E93] mb-1">
                <span>Idle Unloaded RTT</span>
                <span className="font-mono text-white font-bold">{idleRtt.toFixed(1)} ms</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#30D158] rounded-full transition-all"
                  style={{ width: `${Math.min(100, (idleRtt / maxRtt) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#8E8E93] mb-1">
                <span>Download Loaded RTT (Active Saturation)</span>
                <span className="font-mono text-[#0A84FF] font-bold">{downRtt.toFixed(1)} ms</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#0A84FF] rounded-full transition-all"
                  style={{ width: `${Math.min(100, (downRtt / maxRtt) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[#8E8E93] mb-1">
                <span>Upload Loaded RTT (Reverse Saturation)</span>
                <span className="font-mono text-[#BF5AF2] font-bold">{upRtt.toFixed(1)} ms</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#BF5AF2] rounded-full transition-all"
                  style={{ width: `${Math.min(100, (upRtt / maxRtt) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Network & Edge Topology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2 text-xs">
            <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-[#0A84FF]" />
              Routing & Edge Gateway
            </span>
            <div className="space-y-1.5 text-[#8E8E93]">
              <div className="flex justify-between">
                <span>Cloudflare Colo:</span>
                <span className="font-mono text-white">{measurement.colo || 'CMB (Colombo)'}</span>
              </div>
              <div className="flex justify-between">
                <span>ASN Organization:</span>
                <span className="text-white truncate max-w-[200px]">{measurement.asnOrg || 'Dialog Axiata PLC'}</span>
              </div>
              <div className="flex justify-between">
                <span>Client WAN IP:</span>
                <span className="font-mono text-white">{measurement.clientIp || '112.134.xx.xx'}</span>
              </div>
              <div className="flex justify-between">
                <span>Method Version:</span>
                <span className="font-mono text-white">{measurement.methodVersion || 'nexis-web-v1'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2 text-xs">
            <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[#30D158]" />
              Client Geolocation & Device
            </span>
            <div className="space-y-1.5 text-[#8E8E93]">
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="text-white">
                  {measurement.location?.city ? `${measurement.location.city}, ${measurement.location.country}` : 'Sri Lanka (Estimated)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Coordinates:</span>
                <span className="font-mono text-white">
                  {measurement.location?.lat ? `${measurement.location.lat.toFixed(4)}, ${measurement.location.lng.toFixed(4)}` : 'Approximate'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tags / Environment:</span>
                <span className="text-white flex gap-1 flex-wrap">
                  {(measurement.tags || ['Web Client']).map((t) => (
                    <span key={t} className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono">
                      {t}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <Button
            variant="ghost"
            size="sm"
            icon={copied ? Check : Copy}
            onClick={handleCopyJson}
          >
            {copied ? 'Copied Full JSON' : 'Copy JSON'}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="tinted"
              size="sm"
              icon={Trash2}
              className="text-[#FF453A] bg-[#FF453A]/15 border-[#FF453A]/30 hover:bg-[#FF453A]/25"
              onClick={handleDelete}
            >
              Purge Measurement
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
