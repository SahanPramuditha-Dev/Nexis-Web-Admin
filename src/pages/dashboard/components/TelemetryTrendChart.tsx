import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { TelemetryRecord } from '../../../types/telemetry';

interface TelemetryTrendChartProps {
  records: TelemetryRecord[];
  timeWindowLabel: string;
}

interface TrendDataPoint {
  time: string;
  timestamp: number;
  total: number;
  verified: number;
  quarantined: number;
  avgSpeed: number;
}

export const TelemetryTrendChart: React.FC<TelemetryTrendChartProps> = ({
  records,
  timeWindowLabel
}) => {
  // Aggregate records into chronological timeline bins
  const chartData = useMemo(() => {
    if (records.length === 0) {
      // Empty placeholder bins
      return Array.from({ length: 7 }, (_, i) => ({
        time: `${i * 4}:00`,
        timestamp: Date.now() - (6 - i) * 3600000 * 4,
        total: 0,
        verified: 0,
        quarantined: 0,
        avgSpeed: 0
      }));
    }

    // Sort ascending by timestamp
    const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);
    const minTime = sorted[0].timestamp;
    const maxTime = Math.max(sorted[sorted.length - 1].timestamp, minTime + 3600000);
    const duration = maxTime - minTime;

    // Define 8 uniform time bins
    const binCount = 8;
    const binSize = Math.max(duration / binCount, 60000); // at least 1 min per bin

    const bins: TrendDataPoint[] = [];
    for (let i = 0; i < binCount; i++) {
      const binStart = minTime + i * binSize;
      const binEnd = binStart + binSize;
      const binRecords = sorted.filter(
        (r) => r.timestamp >= binStart && (i === binCount - 1 ? r.timestamp <= binEnd : r.timestamp < binEnd)
      );

      const verified = binRecords.filter((r) => r.status === 'VERIFIED').length;
      const quarantined = binRecords.filter(
        (r) => r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK'
      ).length;

      const totalSpeed = binRecords.reduce((sum, r) => sum + r.downloadMbps, 0);
      const avgSpeed = binRecords.length > 0 ? Math.round(totalSpeed / binRecords.length) : 0;

      const dateObj = new Date(binStart);
      const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      bins.push({
        time: timeStr,
        timestamp: binStart,
        total: binRecords.length,
        verified,
        quarantined,
        avgSpeed
      });
    }

    return bins;
  }, [records]);

  // Total summary for header
  const totalVerifiedInPeriod = chartData.reduce((acc, d) => acc + d.verified, 0);
  const totalQuarantinedInPeriod = chartData.reduce((acc, d) => acc + d.quarantined, 0);

  return (
    <div className="p-6 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Activity className="h-4 w-4 text-[#0A84FF]" />
            Telemetry Verification Velocity
          </div>
          <p className="text-xs text-[#8E8E93]">
            Continuous timeline of crowdsourced packets vs. zero-trust quarantine decisions ({timeWindowLabel})
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-[#30D158]">
            <span className="h-2 w-2 rounded-full bg-[#30D158]" />
            <span>Verified ({totalVerifiedInPeriod})</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#FF453A]">
            <span className="h-2 w-2 rounded-full bg-[#FF453A]" />
            <span>Quarantined ({totalQuarantinedInPeriod})</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="verifiedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#30D158" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#30D158" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="quarantineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF453A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FF453A" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />

            <XAxis
              dataKey="time"
              stroke="#636366"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            />
            <YAxis
              stroke="#636366"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload as TrendDataPoint;
                return (
                  <div className="p-3.5 rounded-2xl bg-[#1C1C1E]/95 backdrop-blur-2xl border border-white/15 shadow-2xl text-xs space-y-2 min-w-[170px]">
                    <div className="text-[#8E8E93] font-medium border-b border-white/[0.08] pb-1.5 flex justify-between">
                      <span>Time Interval</span>
                      <span className="text-white font-mono">{d.time}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[#30D158]">
                        <span className="flex items-center gap-1.5 font-medium">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                        <span className="font-mono-num font-bold">{d.verified}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#FF453A]">
                        <span className="flex items-center gap-1.5 font-medium">
                          <AlertTriangle className="h-3.5 w-3.5" /> Quarantined
                        </span>
                        <span className="font-mono-num font-bold">{d.quarantined}</span>
                      </div>
                      {d.avgSpeed > 0 && (
                        <div className="flex justify-between items-center text-[#0A84FF] pt-1 border-t border-white/[0.06]">
                          <span>Mean Speed</span>
                          <span className="font-mono-num font-bold">{d.avgSpeed} Mbps</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey="verified"
              stroke="#30D158"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#verifiedGradient)"
              activeDot={{ r: 5, fill: '#30D158', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="quarantined"
              stroke="#FF453A"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#quarantineGradient)"
              activeDot={{ r: 5, fill: '#FF453A', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
