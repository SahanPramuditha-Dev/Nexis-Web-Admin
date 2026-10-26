import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricTileProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  tint?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
  };
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  tint = 'blue',
  trend
}) => {
  const tintClasses = {
    blue: {
      bg: 'bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/20',
      glow: 'hover:border-[#0A84FF]/40'
    },
    green: {
      bg: 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20',
      glow: 'hover:border-[#30D158]/40'
    },
    orange: {
      bg: 'bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/20',
      glow: 'hover:border-[#FF9F0A]/40'
    },
    red: {
      bg: 'bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20',
      glow: 'hover:border-[#FF453A]/40'
    },
    purple: {
      bg: 'bg-[#BF5AF2]/10 text-[#BF5AF2] border-[#BF5AF2]/20',
      glow: 'hover:border-[#BF5AF2]/40'
    },
    gray: {
      bg: 'bg-white/[0.08] text-[#8E8E93] border-white/[0.08]',
      glow: 'hover:border-white/20'
    }
  }[tint];

  return (
    <div
      className={`p-5 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] transition-all ${tintClasses.glow}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
          {label}
        </span>
        <div className={`p-2 rounded-xl border ${tintClasses.bg}`}>
          <Icon className="h-4 w-4 shrink-0" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl md:text-3xl font-extrabold text-white font-mono-num tracking-tight">
          {value}
        </div>
        {subValue && (
          <span className="text-xs text-[#8E8E93] font-medium">{subValue}</span>
        )}
      </div>

      {trend && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold">
          <span
            className={
              trend.direction === 'up'
                ? 'text-[#30D158]'
                : trend.direction === 'down'
                ? 'text-[#FF453A]'
                : 'text-[#8E8E93]'
            }
          >
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};
