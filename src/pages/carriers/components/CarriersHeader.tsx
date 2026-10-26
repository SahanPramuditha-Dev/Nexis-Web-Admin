import React from 'react';
import { Radio, Download, Calendar, Activity } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { TimeframeOption } from '../types';

interface CarriersHeaderProps {
  timeframe: TimeframeOption;
  setTimeframe: (tf: TimeframeOption) => void;
  onExportCsv: () => void;
  totalCarriers: number;
  totalSamples: number;
}

export const CarriersHeader: React.FC<CarriersHeaderProps> = ({
  timeframe,
  setTimeframe,
  onExportCsv,
  totalCarriers,
  totalSamples
}) => {
  const timeframes: { id: TimeframeOption; label: string }[] = [
    { id: '1h', label: 'Past Hour' },
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: 'all', label: 'All-Time' }
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="p-2 rounded-2xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30 shadow-sm shadow-[#0A84FF]/10">
            <Radio className="h-5 w-5" />
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Carrier Benchmarks & SLA Compliance
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
            MNO Radar
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/20 text-[11px] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#30D158] animate-pulse" />
            <span className="font-mono-num">{totalCarriers}</span> Operators &bull; <span className="font-mono-num">{totalSamples.toLocaleString()}</span> Samples
          </div>
        </div>
        <p className="text-xs text-[#8E8E93] mt-1.5">
          Standardized cellular performance telemetry and TRCSL / ITU-T Quality of Experience (QoE) SLA audits.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Timeframe pill selector */}
        <div className="flex items-center bg-[#1C1C1E] border border-white/[0.08] p-1 rounded-2xl">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                timeframe === tf.id
                  ? 'bg-[#0A84FF] text-white shadow-sm'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* CSV Export */}
        <Button
          variant="secondary"
          onClick={onExportCsv}
          className="h-9 px-3.5 rounded-2xl border-white/[0.08] bg-[#1C1C1E] hover:bg-white/[0.05] text-xs font-semibold text-white"
        >
          <Download className="h-3.5 w-3.5 mr-1.5 text-[#0A84FF]" />
          Export SLA Report
        </Button>
      </div>
    </div>
  );
};
