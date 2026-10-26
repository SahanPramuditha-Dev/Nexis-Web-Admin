import React from 'react';
import { Navigation, Clock, ShieldCheck, Gauge } from 'lucide-react';
import { ValidationRuleConfig } from '../../../types/telemetry';

interface RulesKinematicsAndPhysicsProps {
  rules: ValidationRuleConfig;
  onChange: (updated: Partial<ValidationRuleConfig>) => void;
}

export const RulesKinematicsAndPhysicsProps: React.FC<RulesKinematicsAndPhysicsProps> = ({
  rules,
  onChange
}) => {
  return (
    <div className="p-6 md:p-7 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] space-y-5">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#30D158]" />
          Kinematics, Fiber Delays &amp; Statistical Outlier Fences
        </h2>
        <p className="text-xs text-[#8E8E93] mt-1">
          Detect teleportation jumps, sub-optical latency forgery, and multi-sigma statistical outliers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        
        {/* Transit Velocity */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-white flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-[#30D158]" />
              Mach Transit Velocity Ceiling
            </span>
            <span className="text-[#30D158] font-mono font-bold">{rules.maxTransitVelocityKmH} km/h</span>
          </div>
          <p className="text-[11px] text-[#8E8E93]">
            Velocity between consecutive samples from the same probe exceeding this bound is flagged as teleportation spoofing.
          </p>
          <input
            type="range"
            min={250}
            max={1500}
            step={50}
            value={rules.maxTransitVelocityKmH}
            onChange={(e) => onChange({ maxTransitVelocityKmH: Number(e.target.value) })}
            className="w-full accent-[#30D158] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono">
            <span>250 km/h (High-Speed Train)</span>
            <span>1,500 km/h (Supersonic)</span>
          </div>
        </div>

        {/* Minimum Latency Floor */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-white flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#30D158]" />
              Speed-of-Light Latency Floor
            </span>
            <span className="text-[#30D158] font-mono font-bold">{rules.minAllowedLatencyMs} ms</span>
          </div>
          <p className="text-[11px] text-[#8E8E93]">
            Sub-millisecond latency on cellular radios violates fiber optic round-trip physics and indicates forged packet timestamps.
          </p>
          <input
            type="range"
            min={0.2}
            max={5.0}
            step={0.1}
            value={rules.minAllowedLatencyMs}
            onChange={(e) => onChange({ minAllowedLatencyMs: Number(e.target.value) })}
            className="w-full accent-[#30D158] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono">
            <span>0.2 ms (Local Bus)</span>
            <span>5.0 ms (Conservative)</span>
          </div>
        </div>

        {/* Probe Burst Rate Limit */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-white flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-[#30D158]" />
              Max Submissions Per Probe (Hourly)
            </span>
            <span className="text-[#30D158] font-mono font-bold">{rules.rateLimitMaxPerHour} tests/hr</span>
          </div>
          <p className="text-[11px] text-[#8E8E93]">
            Limits bot spam and Sybil script flooding by throttling devices that exceed this hourly upload quota.
          </p>
          <input
            type="range"
            min={10}
            max={180}
            step={5}
            value={rules.rateLimitMaxPerHour}
            onChange={(e) => onChange({ rateLimitMaxPerHour: Number(e.target.value) })}
            className="w-full accent-[#30D158] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono">
            <span>10 / hr</span>
            <span>180 / hr</span>
          </div>
        </div>

        {/* Tukey's IQR Outlier Multiplier */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-white flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#30D158]" />
              Tukey's IQR Outlier Multiplier
            </span>
            <span className="text-[#30D158] font-mono font-bold">{rules.iqrOutlierMultiplier}x IQR</span>
          </div>
          <p className="text-[11px] text-[#8E8E93]">
            Statistical outlier fence: samples outside [Q1 - k*IQR, Q3 + k*IQR] in the cell are flagged as RF anomalies.
          </p>
          <input
            type="range"
            min={1.0}
            max={3.0}
            step={0.1}
            value={rules.iqrOutlierMultiplier}
            onChange={(e) => onChange({ iqrOutlierMultiplier: Number(e.target.value) })}
            className="w-full accent-[#30D158] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono">
            <span>1.0x (Strict Fence)</span>
            <span>3.0x (Relaxed Fence)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
