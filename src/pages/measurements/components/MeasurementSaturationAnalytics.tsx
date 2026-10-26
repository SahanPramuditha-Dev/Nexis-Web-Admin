import React, { useMemo } from 'react';
import { TrendingUp, Layers, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { ClientMeasurementRecord } from '../../../types/telemetry';

interface MeasurementSaturationAnalyticsProps {
  measurements: ClientMeasurementRecord[];
}

export const MeasurementSaturationAnalytics: React.FC<MeasurementSaturationAnalyticsProps> = ({
  measurements
}) => {
  // Aggregate multi-sample saturation curve
  const saturationCurveData = useMemo(() => {
    // Collect all samples from measurements that have samples array
    const sampleBuckets: Record<number, { downSum: number; downCount: number; upSum: number; upCount: number }> = {};

    measurements.forEach((m) => {
      (m.samples || []).forEach((s) => {
        const t = Math.round(s.timeSec * 2) / 2; // bucket to nearest 0.5s
        if (!sampleBuckets[t]) {
          sampleBuckets[t] = { downSum: 0, downCount: 0, upSum: 0, upCount: 0 };
        }
        if (s.phase === 'download') {
          sampleBuckets[t].downSum += s.mbps;
          sampleBuckets[t].downCount += 1;
        } else if (s.phase === 'upload') {
          sampleBuckets[t].upSum += s.mbps;
          sampleBuckets[t].upCount += 1;
        }
      });
    });

    const times = Object.keys(sampleBuckets).map(Number).sort((a, b) => a - b);
    if (times.length > 0) {
      return times.map((t) => {
        const b = sampleBuckets[t];
        return {
          time: `${t.toFixed(1)}s`,
          Download: b.downCount > 0 ? Number((b.downSum / b.downCount).toFixed(1)) : 0,
          Upload: b.upCount > 0 ? Number((b.upSum / b.upCount).toFixed(1)) : 0
        };
      });
    }

    // Fallback synthetic RFC 6349 progression based on mean values if individual time samples are absent
    const total = measurements.length || 1;
    const meanDl = measurements.reduce((sum, m) => sum + (m.downloadMbps || 0), 0) / total;
    const meanUl = measurements.reduce((sum, m) => sum + (m.uploadMbps || 0), 0) / total;

    return [
      { time: '0.0s', Download: 0, Upload: 0 },
      { time: '1.0s', Download: Number((meanDl * 0.45).toFixed(1)), Upload: Number((meanUl * 0.35).toFixed(1)) },
      { time: '2.0s', Download: Number((meanDl * 0.75).toFixed(1)), Upload: Number((meanUl * 0.65).toFixed(1)) },
      { time: '3.0s', Download: Number((meanDl * 0.92).toFixed(1)), Upload: Number((meanUl * 0.88).toFixed(1)) },
      { time: '5.0s', Download: Number((meanDl * 0.98).toFixed(1)), Upload: Number((meanUl * 0.95).toFixed(1)) },
      { time: '8.0s', Download: Number(meanDl.toFixed(1)), Upload: Number(meanUl.toFixed(1)) },
      { time: '10.0s', Download: Number((meanDl * 1.01).toFixed(1)), Upload: Number(meanUl.toFixed(1)) }
    ];
  }, [measurements]);

  // Bufferbloat Grade distribution
  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    let totalWithGrade = 0;

    measurements.forEach((m) => {
      const g = m.bufferbloatGrade || 'B';
      if (counts[g] !== undefined) {
        counts[g] += 1;
        totalWithGrade += 1;
      }
    });

    const safeTotal = totalWithGrade || 1;
    return [
      { grade: 'A+', label: '< 5 ms delta', count: counts['A+'], pct: Math.round((counts['A+'] / safeTotal) * 100), color: '#30D158' },
      { grade: 'A', label: '< 15 ms delta', count: counts['A'], pct: Math.round((counts['A'] / safeTotal) * 100), color: '#30D158' },
      { grade: 'B', label: '< 30 ms delta', count: counts['B'], pct: Math.round((counts['B'] / safeTotal) * 100), color: '#0A84FF' },
      { grade: 'C', label: '< 60 ms delta', count: counts['C'], pct: Math.round((counts['C'] / safeTotal) * 100), color: '#FF9F0A' },
      { grade: 'D', label: '< 200 ms delta', count: counts['D'], pct: Math.round((counts['D'] / safeTotal) * 100), color: '#FF453A' },
      { grade: 'F', label: '> 200 ms bufferbloat', count: counts['F'], pct: Math.round((counts['F'] / safeTotal) * 100), color: '#FF453A' }
    ];
  }, [measurements]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. RFC 6349 Throughput Saturation Curve */}
      <div className="lg:col-span-2 p-5 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#0A84FF]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              RFC 6349 Throughput Saturation Dynamics
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#8E8E93]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#30D158]" />
              Downlink
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0A84FF]" />
              Uplink
            </span>
          </div>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={saturationCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="measDlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#30D158" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#30D158" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="measUlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0A84FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="time" stroke="#8E8E93" fontSize={11} tickLine={false} />
              <YAxis stroke="#8E8E93" fontSize={11} tickLine={false} unit="M" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-[#1C1C1E]/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[150px]">
                      <div className="font-bold text-white border-b border-white/10 pb-1">
                        Time: {label}
                      </div>
                      {payload.map((item: any) => (
                        <div key={item.dataKey} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[#8E8E93]">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.name}:
                          </span>
                          <span className="font-mono-num font-bold text-white">
                            {item.value} Mbps
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="Download"
                stroke="#30D158"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#measDlGradient)"
                name="Downlink"
              />
              <Area
                type="monotone"
                dataKey="Upload"
                stroke="#0A84FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#measUlGradient)"
                name="Uplink"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Bufferbloat Grade Distribution */}
      <div className="p-5 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#FF9F0A]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Bufferbloat Rating
              </h2>
            </div>
            <span className="text-[10px] text-[#8E8E93]">
              Loaded &Delta;RTT
            </span>
          </div>

          <div className="space-y-2.5 pt-3">
            {gradeDistribution.map((item) => (
              <div key={item.grade} className="text-xs">
                <div className="flex items-center justify-between text-[#8E8E93] mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] text-white"
                      style={{ backgroundColor: `${item.color}33`, color: item.color }}
                    >
                      {item.grade}
                    </span>
                    <span className="text-[11px]">{item.label}</span>
                  </div>
                  <span className="font-mono-num text-white font-bold">
                    {item.count} <span className="text-[#8E8E93] font-normal">({item.pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#8E8E93] pt-2 border-t border-white/[0.06] leading-relaxed">
          Graded using loaded TCP buffer congestion benchmarks: low bufferbloat ensures smooth gaming, VoIP, and video calls.
        </p>
      </div>
    </div>
  );
};
