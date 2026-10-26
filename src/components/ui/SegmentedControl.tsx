import React from 'react';

interface SegmentOption<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = ''
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-[#2C2C2E] border border-white/[0.08] text-xs font-semibold select-none ${className}`}
    >
      {options.map((opt) => {
        const isActive = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? 'bg-[#1C1C1E] text-white shadow-xs border border-white/[0.12] font-bold'
                : 'text-[#8E8E93] hover:text-white'
            }`}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono-num font-bold ${
                  isActive ? 'bg-[#0A84FF] text-white' : 'bg-white/10 text-[#8E8E93]'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
