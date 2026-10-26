import React, { useState, useEffect } from 'react';
import { Radio, ShieldCheck, Database, ExternalLink, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { telemetryService } from '../../services/telemetryService';
import { testSupabaseConnection } from '../../services/supabase';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const [isLive, setIsLive] = useState(telemetryService.isConnectedToSupabase());
  const [dbStatus, setDbStatus] = useState<string>('Connecting...');
  const [quarantinedCount, setQuarantinedCount] = useState(
    telemetryService.getRecords().filter((r) => r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK').length
  );

  useEffect(() => {
    const update = () => {
      setIsLive(telemetryService.isConnectedToSupabase());
      const recs = telemetryService.getRecords();
      setQuarantinedCount(recs.filter((r) => r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK').length);
    };

    const unsub = telemetryService.subscribe(update);
    testSupabaseConnection().then((res) => {
      setDbStatus(res.ok ? 'Live Database' : 'Local Fallback');
    });

    return () => unsub();
  }, []);

  return (
    <header className="h-16 border-b border-white/[0.08] bg-black/75 backdrop-blur-2xl px-5 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40">
      
      {/* Brand & System Identifier */}
      <div className="flex items-center gap-3.5">
        <div className="h-9 w-9 rounded-xl bg-[#0A84FF] flex items-center justify-center shadow-lg shadow-[#0A84FF]/20 border border-white/10">
          <img src="/nexis-mark.svg" alt="NEXIS" className="h-5 w-5 brightness-200" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-base tracking-tight">NEXIS</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
              ADMIN
            </span>
          </div>
          <span className="text-[11px] text-[#8E8E93] font-medium hidden sm:inline">
            Crowdsource Telemetry & Integrity Console
          </span>
        </div>
      </div>

      {/* Center Live Database Status Capsule */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C1C1E] border border-white/[0.08] text-xs text-[#8E8E93]">
          <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-[#30D158] animate-pulse' : 'bg-[#FF9F0A]'}`} />
          <span className="text-white font-medium">{dbStatus}</span>
          <span className="text-white/20">•</span>
          <span className="font-mono text-[11px] text-[#8E8E93]">Supabase (ap-southeast-2)</span>
        </div>

        {quarantinedCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF453A]/15 border border-[#FF453A]/30 text-xs text-[#FF453A] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF453A] animate-pulse" />
            <span>{quarantinedCount} Quarantined</span>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 text-[#0A84FF]" />
            <span>Search or jump...</span>
            <kbd className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono text-white/70">⌘K</kbd>
          </button>
        )}

        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex"
        >
          <Button variant="ghost" size="sm" icon={ExternalLink}>
            Launch Nexis Web
          </Button>
        </a>
      </div>

    </header>
  );
};
