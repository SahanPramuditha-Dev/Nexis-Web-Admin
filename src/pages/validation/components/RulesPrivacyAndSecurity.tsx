import React from 'react';
import { ShieldAlert, Users, Trash2, Clock, Check, X } from 'lucide-react';
import { ValidationRuleConfig } from '../../../types/telemetry';

interface RulesPrivacyAndSecurityProps {
  rules: ValidationRuleConfig;
  onChange: (updated: Partial<ValidationRuleConfig>) => void;
  onPurgeExpired: () => void;
  isPurged: boolean;
}

export const RulesPrivacyAndSecurity: React.FC<RulesPrivacyAndSecurityProps> = ({
  rules,
  onChange,
  onPurgeExpired,
  isPurged
}) => {
  return (
    <div className="p-6 md:p-7 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] space-y-5">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#FF453A]" />
          Zero-Trust Confidence &amp; S2 Differential Privacy
        </h2>
        <p className="text-xs text-[#8E8E93] mt-1">
          Automated quarantine thresholds, S2 spatial k-anonymity privacy, and Android mock location policy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        
        {/* Auto-Quarantine Score Cutoff */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-white flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-[#FF453A]" />
              Auto-Quarantine Score Cutoff
            </span>
            <span className="text-[#FF453A] font-mono font-bold">&lt; {rules.autoQuarantineThresholdScore} / 100</span>
          </div>
          <p className="text-[11px] text-[#8E8E93]">
            Telemetry records scoring below this composite integrity threshold are quarantined automatically for review.
          </p>
          <input
            type="range"
            min={30}
            max={85}
            step={5}
            value={rules.autoQuarantineThresholdScore}
            onChange={(e) => onChange({ autoQuarantineThresholdScore: Number(e.target.value) })}
            className="w-full accent-[#FF453A] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono">
            <span>30 (Permissive)</span>
            <span>85 (Ultra-Strict)</span>
          </div>
        </div>

        {/* k-Anonymity Contributor Threshold */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-white flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#BF5AF2]" />
              S2 k-Anonymity Threshold
            </span>
            <span className="text-[#BF5AF2] font-mono font-bold">≥ {rules.minContributorPrivacyThreshold} devices</span>
          </div>
          <p className="text-[11px] text-[#8E8E93]">
            An S2 Level-13 spatial cell is only published publicly once it has contributions from at least k distinct devices.
          </p>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={rules.minContributorPrivacyThreshold}
            onChange={(e) => onChange({ minContributorPrivacyThreshold: Number(e.target.value) })}
            className="w-full accent-[#BF5AF2] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E8E93] font-mono">
            <span>2 devices</span>
            <span>20 devices</span>
          </div>
        </div>

        {/* Mock Location Provider Rejection */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col justify-between space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white">Reject Mock Locations</span>
              <span
                className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                  rules.rejectMockLocations
                    ? 'bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30'
                    : 'bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30'
                }`}
              >
                {rules.rejectMockLocations ? 'ENFORCED' : 'DISABLED'}
              </span>
            </div>
            <p className="text-[11px] text-[#8E8E93] mt-2">
              Automatically drops or quarantines any packet flagged with Android `isFromMockProvider` or fake GPS signals.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onChange({ rejectMockLocations: !rules.rejectMockLocations })}
            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              rules.rejectMockLocations
                ? 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30 hover:bg-[#30D158]/25'
                : 'bg-white/[0.06] text-[#8E8E93] border-white/[0.1] hover:text-white'
            }`}
          >
            {rules.rejectMockLocations ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Mock Provider Rejection Active</span>
              </>
            ) : (
              <>
                <X className="h-3.5 w-3.5" />
                <span>Enable Mock Location Rejection</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Automated Data Retention & TTL Enforcement */}
      <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#0A84FF]" />
            Privacy Retention &amp; Automated TTL Policy
          </div>
          <p className="text-[11px] text-[#8E8E93] mt-0.5">
            Permanently purges fine-grained raw GPS coordinates older than 30 days while preserving privacy-safe anonymous S2 aggregates.
          </p>
        </div>

        <button
          type="button"
          onClick={onPurgeExpired}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer active:scale-95 shrink-0 ${
            isPurged
              ? 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/40'
              : 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30 hover:bg-[#FF453A]/25'
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>{isPurged ? 'Retention Policy Enforced!' : 'Purge Raw Coordinates (>30 Days)'}</span>
        </button>
      </div>

    </div>
  );
};
