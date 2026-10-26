import React from 'react';
import { TelemetryStatus } from '../../types/telemetry';

interface StatusBadgeProps {
  status: TelemetryStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'VERIFIED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#30D158] animate-pulse" />
          Verified
        </span>
      );
    case 'FLAGGED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF9F0A]" />
          Flagged
        </span>
      );
    case 'QUARANTINED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF453A] animate-pulse" />
          Quarantined
        </span>
      );
    case 'SPOOFED_MOCK':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#BF5AF2]/15 text-[#BF5AF2] border border-[#BF5AF2]/30 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#BF5AF2]" />
          Mock Spoofed
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-red-950/60 text-red-400 border border-red-800/60 ${sizeClasses}`}
        >
          Rejected
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-white/[0.08] text-[#8E8E93] border border-white/[0.08] ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
};
