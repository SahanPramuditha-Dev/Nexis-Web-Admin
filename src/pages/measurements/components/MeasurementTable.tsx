import React from 'react';
import { Eye, Trash2, Activity, Globe } from 'lucide-react';
import { ClientMeasurementRecord } from '../../../types/telemetry';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';

interface MeasurementTableProps {
  measurements: ClientMeasurementRecord[];
  onInspect: (measurement: ClientMeasurementRecord) => void;
  onDelete: (id: string) => void;
}

export const MeasurementTable: React.FC<MeasurementTableProps> = ({
  measurements,
  onInspect,
  onDelete
}) => {
  const gradeColors: Record<string, string> = {
    'A+': 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30',
    'A': 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30',
    'B': 'bg-[#0A84FF]/15 text-[#0A84FF] border-[#0A84FF]/30',
    'C': 'bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30',
    'D': 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30',
    'F': 'bg-[#FF453A]/20 text-[#FF453A] border-[#FF453A]/40'
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#1C1C1E] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-[10px] uppercase font-bold text-[#8E8E93] border-b border-white/[0.08]">
            <tr>
              <th className="py-3 px-4">Test ID & Time</th>
              <th className="py-3 px-4">ISP & ASN</th>
              <th className="py-3 px-4">Downlink</th>
              <th className="py-3 px-4">Uplink</th>
              <th className="py-3 px-4">Idle Latency</th>
              <th className="py-3 px-4">Bufferbloat</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] font-medium">
            {measurements.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon={Activity}
                    title="No Diagnostic Measurements Found"
                    description="No client speed tests matched your filters or search query."
                  />
                </td>
              </tr>
            ) : (
              measurements.map((m) => {
                const gradeBadge = m.bufferbloatGrade ? (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono-num font-bold border ${
                      gradeColors[m.bufferbloatGrade] || 'bg-white/10 text-white border-white/20'
                    }`}
                  >
                    {m.bufferbloatGrade}
                  </span>
                ) : (
                  <span className="text-[#8E8E93] text-[10px]">N/A</span>
                );

                return (
                  <tr key={m.id} className="hover:bg-white/[0.04] transition-colors">
                    {/* Test ID & Time */}
                    <td className="py-3 px-4">
                      <div className="font-mono-num text-white font-bold">{m.id}</div>
                      <div className="text-[10px] text-[#8E8E93] mt-0.5">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(m.timestamp).toLocaleDateString()}
                      </div>
                    </td>

                    {/* ISP & ASN */}
                    <td className="py-3 px-4">
                      <div className="text-white font-semibold">{m.isp || 'Unknown ISP'}</div>
                      <div className="font-mono-num text-[10px] text-[#8E8E93]">{m.asn || 'AS-Local'}</div>
                    </td>

                    {/* Downlink */}
                    <td className="py-3 px-4">
                      <span className="font-mono-num text-[#30D158] font-bold">
                        {m.downloadMbps !== null ? `${m.downloadMbps.toFixed(1)} Mbps` : '—'}
                      </span>
                    </td>

                    {/* Uplink */}
                    <td className="py-3 px-4">
                      <span className="font-mono-num text-[#0A84FF] font-bold">
                        {m.uploadMbps !== null ? `${m.uploadMbps.toFixed(1)} Mbps` : '—'}
                      </span>
                    </td>

                    {/* Idle Latency */}
                    <td className="py-3 px-4">
                      <span className="font-mono-num text-white font-bold">
                        {m.latencyMs !== null ? `${m.latencyMs.toFixed(1)} ms` : '—'}
                      </span>
                      {m.jitterMs !== null && (
                        <div className="text-[10px] text-[#8E8E93] font-mono-num">
                          &plusmn;{m.jitterMs.toFixed(1)} ms jitter
                        </div>
                      )}
                    </td>

                    {/* Bufferbloat */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {gradeBadge}
                        <span className="font-mono-num text-[#FF9F0A] text-[11px]">
                          {m.bufferbloatMs !== null ? `+${m.bufferbloatMs.toFixed(0)}ms` : ''}
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4">
                      <div className="text-white">
                        {m.location?.city ? `${m.location.city}, ${m.location.country}` : 'Sri Lanka'}
                      </div>
                      <div className="font-mono-num text-[10px] text-[#8E8E93]">
                        {m.colo || 'CMB Edge'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => onInspect(m)}
                        >
                          Inspect
                        </Button>
                        <button
                          onClick={() => {
                            if (confirm(`Purge test ${m.id}?`)) {
                              onDelete(m.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-[#8E8E93] hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors"
                          title="Purge record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
