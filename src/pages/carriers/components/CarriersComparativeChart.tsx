import React, { useState } from 'react';
import { BarChart3, Radar as RadarIcon, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { CarrierStats, ChartViewOption } from '../types';

interface CarriersComparativeChartProps {
  carriers: CarrierStats[];
  selectedCarrierName: string;
  onSelectCarrier: (name: string) => void;
}

export const CarriersComparativeChart: React.FC<CarriersComparativeChartProps> = ({
  carriers,
  selectedCarrierName,
  onSelectCarrier
}) => {
  const [chartView, setChartView] = useState<ChartViewOption>('bar');

  // Shorten carrier names for display
  const cleanName = (name: string) => {
    return name
      .replace(' Axiata', '')
      .replace('Telecommunications', '')
      .replace(' Broadband Networks', '')
      .replace(' Sri Lanka', '');
  };

  const barData = carriers.map((c) => ({
    fullName: c.name,
    name: cleanName(c.name),
    Download: c.avgDownload,
    Upload: c.avgUpload,
    Latency: c.avgLatency,
    Jitter: c.avgJitter
  }));

  // Radar metrics across operators (max top 4 carriers to prevent clutter)
  const topCarriers = carriers.slice(0, 4);
  const radarAxes = [
    { metric: 'Download Speed', key: 'avgDownload', max: Math.max(...carriers.map(c => c.avgDownload), 1) },
    { metric: 'Upload Speed', key: 'avgUpload', max: Math.max(...carriers.map(c => c.avgUpload), 1) },
    { metric: 'Latency (Fastest)', key: 'avgLatency', inverse: true, max: Math.max(...carriers.map(c => c.avgLatency), 1) },
    { metric: 'SLA Compliance', key: 'slaOverallPass', max: 100 },
    { metric: '5G Availability', key: 'pct5G', max: 100 },
    { metric: 'Packet Integrity', key: 'slaLossPass', max: 100 }
  ];

  const radarData = radarAxes.map((axis) => {
    const point: Record<string, any> = { metric: axis.metric };
    topCarriers.forEach((c) => {
      let val = (c as any)[axis.key];
      if (axis.inverse) {
        // Lower latency is better: invert to 0-100 scale
        val = Math.max(0, 100 - (val / (axis.max || 100)) * 100);
      } else {
        val = Math.min(100, (val / (axis.max || 100)) * 100);
      }
      point[cleanName(c.name)] = Math.round(val);
    });
    return point;
  });

  const radarColors = ['#0A84FF', '#30D158', '#FF9F0A', '#BF5AF2'];

  return (
    <div className="p-5 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#0A84FF]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Carrier Telemetry Benchmarks
            </h2>
          </div>
          <p className="text-[11px] text-[#8E8E93] mt-0.5">
            Aggregated over crowd test samples filtered by the active timeframe
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-black/40 border border-white/[0.08] p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setChartView('bar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              chartView === 'bar'
                ? 'bg-[#0A84FF] text-white shadow-sm'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Bar Comparison
          </button>
          <button
            onClick={() => setChartView('radar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              chartView === 'radar'
                ? 'bg-[#0A84FF] text-white shadow-sm'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <RadarIcon className="h-3.5 w-3.5" />
            Spider Radar
          </button>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        {chartView === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(state) => {
                if (state && state.activePayload && state.activePayload.length > 0) {
                  const clicked = state.activePayload[0].payload.fullName;
                  if (clicked) onSelectCarrier(clicked);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" stroke="#8E8E93" fontSize={11} tickLine={false} />
              <YAxis stroke="#8E8E93" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-[#1C1C1E]/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[170px]">
                      <div className="font-bold text-white border-b border-white/10 pb-1 flex items-center justify-between">
                        <span>{label}</span>
                        <span className="text-[10px] text-[#0A84FF] font-medium">Click to select</span>
                      </div>
                      {payload.map((item: any) => (
                        <div key={item.dataKey} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[#8E8E93]">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.name}:
                          </span>
                          <span className="font-mono-num font-bold text-white">
                            {item.value} {item.dataKey === 'Latency' || item.dataKey === 'Jitter' ? 'ms' : 'Mbps'}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#8E8E93', paddingTop: '8px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="Download" fill="#30D158" radius={[6, 6, 0, 0]} name="Downlink (Mbps)" />
              <Bar dataKey="Upload" fill="#0A84FF" radius={[6, 6, 0, 0]} name="Uplink (Mbps)" />
              <Bar dataKey="Latency" fill="#FF9F0A" radius={[6, 6, 0, 0]} name="Latency RTT (ms)" />
              <Bar dataKey="Jitter" fill="#BF5AF2" radius={[6, 6, 0, 0]} name="Jitter (ms)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="metric" stroke="#8E8E93" fontSize={10} tickLine={false} />
              <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" angle={30} domain={[0, 100]} tick={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1C1E',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  fontSize: 11,
                  color: '#fff'
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8E8E93', paddingTop: '6px' }} />
              {topCarriers.map((carrier, index) => {
                const name = cleanName(carrier.name);
                const color = radarColors[index % radarColors.length];
                return (
                  <Radar
                    key={carrier.name}
                    name={name}
                    dataKey={name}
                    stroke={color}
                    fill={color}
                    fillOpacity={carrier.name === selectedCarrierName ? 0.35 : 0.15}
                    strokeWidth={carrier.name === selectedCarrierName ? 2.5 : 1.5}
                  />
                );
              })}
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
