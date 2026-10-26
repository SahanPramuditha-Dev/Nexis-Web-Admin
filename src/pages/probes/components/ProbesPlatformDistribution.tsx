import React from 'react';
import { Smartphone, Apple, Globe, Activity, ShieldCheck } from 'lucide-react';
import { ProbeDevice } from '../../../types/telemetry';

interface ProbesPlatformDistributionProps {
  probes: ProbeDevice[];
}

export const ProbesPlatformDistribution: React.FC<ProbesPlatformDistributionProps> = ({ probes }) => {
  const total = probes.length;

  let androidCount = 0;
  let iosCount = 0;
  let webCount = 0;
  let sumTrust = 0;

  probes.forEach((p) => {
    sumTrust += p.trustScore || 85;
    if (p.platform === 'iOS') iosCount++;
    else if (p.platform === 'Web') webCount++;
    else androidCount++;
  });

  const avgTrust = total > 0 ? Math.round(sumTrust / total) : 85;

  const getPct = (val: number) => (total > 0 ? Math.round((val / total) * 100) : 0);

  return (
    <div className="p-5 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-5 text-xs">
      
      {/* Left: Platform Distribution Bars */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-white">
            <Smartphone className="h-3.5 w-3.5 text-[#0A84FF]" />
            Operating System &amp; Hardware Fleet Mix
          </span>
          <span>{total} probes</span>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="h-2.5 w-full rounded-full bg-black/40 overflow-hidden flex border border-white/[0.06]">
          {androidCount > 0 && (
            <div
              style={{ width: `${getPct(androidCount)}%` }}
              className="bg-[#30D158] h-full"
              title={`Android: ${androidCount} (${getPct(androidCount)}%)`}
            />
          )}
          {iosCount > 0 && (
            <div
              style={{ width: `${getPct(iosCount)}%` }}
              className="bg-[#8E8E93] h-full"
              title={`iOS: ${iosCount} (${getPct(iosCount)}%)`}
            />
          )}
          {webCount > 0 && (
            <div
              style={{ width: `${getPct(webCount)}%` }}
              className="bg-[#0A84FF] h-full"
              title={`Web Speedtest: ${webCount} (${getPct(webCount)}%)`}
            />
          )}
        </div>

        {/* Breakdown Chips */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-1">
          <div className="flex items-center gap-1.5 text-white">
            <span className="h-2 w-2 rounded-full bg-[#30D158]" />
            <span>Android: <span className="font-mono-num font-bold">{androidCount}</span> ({getPct(androidCount)}%)</span>
          </div>

          <div className="flex items-center gap-1.5 text-white">
            <span className="h-2 w-2 rounded-full bg-[#8E8E93]" />
            <span>iOS: <span className="font-mono-num font-bold">{iosCount}</span> ({getPct(iosCount)}%)</span>
          </div>

          <div className="flex items-center gap-1.5 text-white">
            <span className="h-2 w-2 rounded-full bg-[#0A84FF]" />
            <span>Web Speedtest: <span className="font-mono-num font-bold">{webCount}</span> ({getPct(webCount)}%)</span>
          </div>
        </div>
      </div>

      {/* Right: Fleet Mean Trust Score */}
      <div className="flex items-center gap-3.5 bg-black/40 border border-white/[0.06] p-3.5 rounded-2xl shrink-0">
        <div className="p-2.5 rounded-xl bg-[#30D158]/15 border border-[#30D158]/30 text-[#30D158]">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <span className="text-[10px] text-[#8E8E93] uppercase font-semibold block">Fleet Mean Trust</span>
          <div className="flex items-baseline gap-1">
            <span className={`font-mono-num font-black text-xl ${avgTrust >= 75 ? 'text-[#30D158]' : 'text-[#FF9F0A]'}`}>
              {avgTrust}
            </span>
            <span className="text-xs text-[#8E8E93] font-normal">/ 100</span>
          </div>
        </div>
      </div>

    </div>
  );
};
