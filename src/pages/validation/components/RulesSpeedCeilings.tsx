import React from 'react';
import { Zap, Radio, Activity, Wifi } from 'lucide-react';
import { ValidationRuleConfig } from '../../../types/telemetry';

interface RulesSpeedCeilingsProps {
  rules: ValidationRuleConfig;
  onChange: (updated: Partial<ValidationRuleConfig>) => void;
}

export const RulesSpeedCeilings: React.FC<RulesSpeedCeilingsProps> = ({ rules, onChange }) => {
  return (
    <div className="p-6 md:p-7 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] space-y-5">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#0A84FF]" />
          Radio Speed Ceilings (3GPP Bounds)
        </h2>
        <p className="text-xs text-[#8E8E93] mt-1">
          Crowdsourced packets exceeding these limits violate physical modulation bounds and trigger immediate <code className="text-[#FF453A] font-mono">IMPOSSIBLE_SPEED_FOR_TECH</code> isolation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        
        {/* 5G */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-white flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#0A84FF]" />
              5G Sub-6 / mmWave
            </span>
            <span className="text-[#0A84FF] font-mono font-bold">{rules.maxSpeed5GMbps} Mbps</span>
          </div>
          <input
            type="range"
            min={1000}
            max={5000}
            step={100}
            value={rules.maxSpeed5GMbps}
            onChange={(e) => onChange({ maxSpeed5GMbps: Number(e.target.value) })}
            className="w-full accent-[#0A84FF] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono">
            <span>1,000 Mbps</span>
            <span>5,000 Mbps</span>
          </div>
        </div>

        {/* 4G LTE */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-white flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-[#0A84FF]" />
              4G LTE Advanced
            </span>
            <span className="text-[#0A84FF] font-mono font-bold">{rules.maxSpeed4GMbps} Mbps</span>
          </div>
          <input
            type="range"
            min={150}
            max={1200}
            step={50}
            value={rules.maxSpeed4GMbps}
            onChange={(e) => onChange({ maxSpeed4GMbps: Number(e.target.value) })}
            className="w-full accent-[#0A84FF] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono">
            <span>150 Mbps</span>
            <span>1,200 Mbps</span>
          </div>
        </div>

        {/* 3G HSPA+ */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-white flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#0A84FF]" />
              3G HSPA+
            </span>
            <span className="text-[#0A84FF] font-mono font-bold">{rules.maxSpeed3GMbps} Mbps</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={rules.maxSpeed3GMbps}
            onChange={(e) => onChange({ maxSpeed3GMbps: Number(e.target.value) })}
            className="w-full accent-[#0A84FF] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono">
            <span>10 Mbps</span>
            <span>100 Mbps</span>
          </div>
        </div>

        {/* Wi-Fi 6 / 7 */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-white flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-[#0A84FF]" />
              Wi-Fi 6 / 6E / 7
            </span>
            <span className="text-[#0A84FF] font-mono font-bold">{rules.maxSpeedWifiMbps} Mbps</span>
          </div>
          <input
            type="range"
            min={500}
            max={6000}
            step={250}
            value={rules.maxSpeedWifiMbps}
            onChange={(e) => onChange({ maxSpeedWifiMbps: Number(e.target.value) })}
            className="w-full accent-[#0A84FF] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono">
            <span>500 Mbps</span>
            <span>6,000 Mbps</span>
          </div>
        </div>

      </div>
    </div>
  );
};
