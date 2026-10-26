import React, { useState } from 'react';
import { 
  Sliders, 
  Smartphone, 
  Globe, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Save, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../../components/ui/Button';

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'CLIENT' | 'DIAGNOSTICS' | 'NETWORK';
}

const DEFAULT_FLAGS: FeatureFlag[] = [
  {
    key: 'enforce_min_android_version',
    name: 'Enforce Minimum Android App Version (v1.2.0)',
    description: 'Forces Android probes running builds older than v1.2.0 to prompt an in-app update before submitting telemetry.',
    enabled: true,
    category: 'CLIENT'
  },
  {
    key: 'enable_differential_privacy_fuzzing',
    name: 'Client-Side Differential Privacy Fuzzing',
    description: 'Injects mathematical Laplace noise into speed test latency curves on the client before network transmission.',
    enabled: true,
    category: 'CLIENT'
  },
  {
    key: 'enable_5g_mmwave_saturation',
    name: '5G mmWave Gigabit Stress Testing',
    description: 'Enables high-concurrency multi-chunk saturation threads up to 5,000 Mbps for 5G mmWave laboratory test runs.',
    enabled: false,
    category: 'DIAGNOSTICS'
  },
  {
    key: 'enable_rfc3550_jitter_smoothing',
    name: 'RFC 3550 Statistical Interarrival Jitter Smoothing',
    description: 'Applies weighted exponential moving averages on inter-packet arrival time deltas across all test phases.',
    enabled: true,
    category: 'DIAGNOSTICS'
  },
  {
    key: 'enable_cloudflare_anycast_fallback',
    name: 'Cloudflare Anycast Edge Failover',
    description: 'Automatically switches probe speed test ping targets to Cloudflare global Anycast when local colos have high loss.',
    enabled: true,
    category: 'NETWORK'
  }
];

export const FeatureFlagsPage: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>(DEFAULT_FLAGS);
  const [isSaved, setIsSaved] = useState(false);

  const toggleFlag = (key: string) => {
    setFlags(flags.map((f) => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  const handleSave = () => {
    setIsSaved(true);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setFlags(DEFAULT_FLAGS);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
              <Sliders className="h-5 w-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Feature Flags &amp; Client Versioning
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
              Remote Config
            </span>
          </div>
          <p className="text-xs text-[#8E8E93] mt-1">
            Dynamically toggle client capabilities, mobile probe version requirements, and experimental test engine endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleReset}>
            Reset Defaults
          </Button>
          <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-2xl bg-[#30D158]/15 border border-[#30D158]/30 text-xs text-[#30D158] font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Remote feature flags saved. Live probe clients will pick up updates on next polling interval.</span>
        </div>
      )}

      {/* 2. Feature Flags List */}
      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.key}
            onClick={() => toggleFlag(flag.key)}
            className="p-5 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] hover:border-white/[0.16] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-white text-sm">
                  {flag.name}
                </span>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-white/10 text-[#8E8E93]">
                  {flag.category}
                </span>
              </div>
              <p className="text-xs text-[#8E8E93] leading-relaxed">
                {flag.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  flag.enabled ? 'bg-[#30D158]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    flag.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
