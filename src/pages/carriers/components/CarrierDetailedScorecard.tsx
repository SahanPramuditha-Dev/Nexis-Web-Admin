import React from 'react';
import { Radio, ShieldCheck, AlertTriangle, CheckCircle2, Signal, Wifi, Activity } from 'lucide-react';
import { CarrierStats } from '../types';

interface CarrierDetailedScorecardProps {
  carrier: CarrierStats;
}

export const CarrierDetailedScorecard: React.FC<CarrierDetailedScorecardProps> = ({ carrier }) => {
  const getSlaBadge = (score: number) => {
    if (score >= 90) {
      return {
        label: 'SLA Compliant',
        className: 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30',
        icon: CheckCircle2
      };
    }
    if (score >= 75) {
      return {
        label: 'Marginal Risk',
        className: 'bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30',
        icon: AlertTriangle
      };
    }
    return {
      label: 'SLA Breach',
      className: 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30',
      icon: AlertTriangle
    };
  };

  const slaBadge = getSlaBadge(carrier.slaOverallPass);
  const SlaIcon = slaBadge.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Operator Profile Card */}
      <div className="p-5 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider">
              Operator Inspection
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5 truncate max-w-[190px]">
              {carrier.name}
            </h3>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono-num font-bold bg-white/10 text-white">
              {carrier.samples} tests
            </span>
            <div className="text-[10px] text-[#8E8E93] mt-0.5 font-mono-num">
              {carrier.sampleSharePct}% share
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <span className="text-[10px] text-[#8E8E93] uppercase font-bold block">Avg Download</span>
            <span className="text-base font-extrabold text-[#30D158] font-mono-num">
              {carrier.avgDownload} <span className="text-[10px] text-[#8E8E93]">Mbps</span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <span className="text-[10px] text-[#8E8E93] uppercase font-bold block">Avg Upload</span>
            <span className="text-base font-extrabold text-[#0A84FF] font-mono-num">
              {carrier.avgUpload} <span className="text-[10px] text-[#8E8E93]">Mbps</span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <span className="text-[10px] text-[#8E8E93] uppercase font-bold block">Median Latency</span>
            <span className="text-base font-extrabold text-white font-mono-num">
              {carrier.avgLatency} <span className="text-[10px] text-[#8E8E93]">ms</span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06]">
            <span className="text-[10px] text-[#8E8E93] uppercase font-bold block">Mean Jitter</span>
            <span className="text-base font-extrabold text-white font-mono-num">
              &plusmn;{carrier.avgJitter} <span className="text-[10px] text-[#8E8E93]">ms</span>
            </span>
          </div>
        </div>

        {/* 3GPP RSRP Signal Power Tier Breakdown */}
        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-[#8E8E93] flex items-center gap-1.5">
              <Signal className="h-3.5 w-3.5 text-[#0A84FF]" />
              3GPP RSRP RF Health
            </span>
            <span className="font-mono-num font-bold text-white text-[11px]">
              {carrier.avgRsrp} dBm mean
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden flex">
            <div
              className="h-full bg-[#30D158]"
              style={{ width: `${carrier.rsrpTiers.excellent}%` }}
              title={`Excellent (> -80 dBm): ${carrier.rsrpTiers.excellent}%`}
            />
            <div
              className="h-full bg-[#0A84FF]"
              style={{ width: `${carrier.rsrpTiers.good}%` }}
              title={`Good (-80 to -90 dBm): ${carrier.rsrpTiers.good}%`}
            />
            <div
              className="h-full bg-[#FF9F0A]"
              style={{ width: `${carrier.rsrpTiers.fair}%` }}
              title={`Fair (-90 to -100 dBm): ${carrier.rsrpTiers.fair}%`}
            />
            <div
              className="h-full bg-[#FF453A]"
              style={{ width: `${carrier.rsrpTiers.poor}%` }}
              title={`Poor (< -100 dBm): ${carrier.rsrpTiers.poor}%`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono-num pt-0.5">
            <span className="text-[#30D158]">&gt; -80: {carrier.rsrpTiers.excellent}%</span>
            <span className="text-[#0A84FF]">-85: {carrier.rsrpTiers.good}%</span>
            <span className="text-[#FF9F0A]">-95: {carrier.rsrpTiers.fair}%</span>
            <span className="text-[#FF453A]">&lt; -100: {carrier.rsrpTiers.poor}%</span>
          </div>
        </div>

        {/* RAT Distribution */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
          <span className="text-[#8E8E93] flex items-center gap-1">
            <Radio className="h-3 w-3 text-[#BF5AF2]" /> 5G: <strong className="text-white font-mono-num">{carrier.pct5G}%</strong>
          </span>
          <span className="text-[#8E8E93]">
            LTE: <strong className="text-white font-mono-num">{carrier.pctLTE}%</strong>
          </span>
          <span className="text-[#8E8E93]">
            3G: <strong className="text-white font-mono-num">{carrier.pct3G}%</strong>
          </span>
          <span className="text-[#8E8E93] flex items-center gap-1">
            <Wifi className="h-3 w-3 text-[#64D2FF]" /> <strong className="text-white font-mono-num">{carrier.pctWiFi}%</strong>
          </span>
        </div>
      </div>

      {/* 2. TRCSL & ITU-T Regulatory SLA Scorecard */}
      <div className="lg:col-span-2 p-5 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider">
                TRCSL & ITU-T Quality of Experience Benchmark
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Regulatory SLA Compliance Targets
              </h3>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${slaBadge.className}`}>
              <SlaIcon className="h-3.5 w-3.5" />
              <span>{carrier.slaOverallPass}% {slaBadge.label}</span>
            </div>
          </div>

          <div className="space-y-3.5 pt-3 text-xs">
            {/* Download SLA */}
            <div>
              <div className="flex justify-between items-center text-[#8E8E93] mb-1">
                <span>Broadband Throughput Floor (&ge; 10 Mbps Downlink)</span>
                <span className="font-mono-num text-white font-bold">{carrier.slaDownloadPass}% compliance</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#30D158] rounded-full transition-all duration-500"
                  style={{ width: `${carrier.slaDownloadPass}%` }}
                />
              </div>
            </div>

            {/* Latency SLA */}
            <div>
              <div className="flex justify-between items-center text-[#8E8E93] mb-1">
                <span>Interactive Latency Ceiling (&le; 50 ms Round-Trip Time)</span>
                <span className="font-mono-num text-white font-bold">{carrier.slaLatencyPass}% compliance</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#0A84FF] rounded-full transition-all duration-500"
                  style={{ width: `${carrier.slaLatencyPass}%` }}
                />
              </div>
            </div>

            {/* Packet Loss SLA */}
            <div>
              <div className="flex justify-between items-center text-[#8E8E93] mb-1">
                <span>Packet Integrity Ceiling (&le; 1.0% Packet Loss)</span>
                <span className="font-mono-num text-white font-bold">{carrier.slaLossPass}% compliance</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#BF5AF2] rounded-full transition-all duration-500"
                  style={{ width: `${carrier.slaLossPass}%` }}
                />
              </div>
            </div>

            {/* Jitter SLA */}
            <div>
              <div className="flex justify-between items-center text-[#8E8E93] mb-1">
                <span>Bufferbloat & Jitter Stability (&le; 10 ms Jitter)</span>
                <span className="font-mono-num text-white font-bold">{carrier.slaJitterPass}% compliance</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#FF9F0A] rounded-full transition-all duration-500"
                  style={{ width: `${carrier.slaJitterPass}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8E8E93]">
          <span>
            Specifications follow <strong>ITU-T G.107 E-model</strong> and TRCSL National Broadband Quality Directive.
          </span>
          <span className="font-mono-num">
            Loss: {carrier.avgLoss}% mean
          </span>
        </div>
      </div>
    </div>
  );
};
