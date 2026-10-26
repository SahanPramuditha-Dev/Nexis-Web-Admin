import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  Radio, 
  AlertTriangle, 
  Sliders, 
  Activity, 
  MapPin, 
  Lock, 
  Smartphone, 
  Users, 
  Server, 
  History, 
  X
} from 'lucide-react';
import { telemetryService } from '../../services/telemetryService';

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const pages = [
    { to: '/', label: 'Command Center / KPIs', icon: LayoutDashboard, category: 'Navigation' },
    { to: '/validation/feed', label: 'Live Telemetry Feed', icon: Radio, category: 'Navigation' },
    { to: '/validation/quarantine', label: 'Quarantine Center', icon: AlertTriangle, category: 'Navigation' },
    { to: '/validation/rules', label: 'Physics Rules Engine', icon: Sliders, category: 'Navigation' },
    { to: '/measurements', label: 'Measurement Explorer (RFC 6349)', icon: Activity, category: 'Navigation' },
    { to: '/carriers', label: 'Carrier Benchmarks & SLAs', icon: Radio, category: 'Navigation' },
    { to: '/spatial/map', label: 'S2 Spatial Grid & Heatmap', icon: MapPin, category: 'Navigation' },
    { to: '/privacy', label: 'Privacy Control Center (k-Anon)', icon: Lock, category: 'Navigation' },
    { to: '/probes', label: 'Probes & Fleets', icon: Smartphone, category: 'Navigation' },
    { to: '/admin/team', label: 'Administration & Team RBAC', icon: Users, category: 'Navigation' },
    { to: '/platform/observability', label: 'Platform Observability & Pipeline', icon: Server, category: 'Navigation' },
    { to: '/platform/flags', label: 'Feature Flags & Versioning', icon: Sliders, category: 'Navigation' },
    { to: '/audit', label: 'Governance & Audit Trail', icon: History, category: 'Navigation' }
  ];

  const probes = telemetryService.getProbes();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent or event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPages = pages.filter((p) =>
    p.label.toLowerCase().includes(query.toLowerCase()) ||
    p.to.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProbes = probes.filter((p) =>
    p.deviceId.toLowerCase().includes(query.toLowerCase()) ||
    p.deviceModel.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const handleSelect = (to: string) => {
    navigate(to);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#1C1C1E] border border-white/[0.15] rounded-3xl shadow-2xl overflow-hidden space-y-2">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
          <Search className="h-5 w-5 text-[#8E8E93]" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search pages, probes, S2 cells... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-[#8E8E93] focus:outline-hidden"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-[#8E8E93] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto px-2 pb-3 space-y-4 text-xs">
          {/* Pages */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
              Navigation
            </div>
            <div className="space-y-0.5">
              {filteredPages.map((page) => {
                const Icon = page.icon;
                return (
                  <button
                    key={page.to}
                    onClick={() => handleSelect(page.to)}
                    className="w-full px-3 py-2 rounded-xl text-left text-white hover:bg-[#0A84FF] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-[#8E8E93] group-hover:text-white" />
                      <span className="font-medium">{page.label}</span>
                    </div>
                    <span className="text-[10px] text-[#8E8E93] group-hover:text-white font-mono">
                      {page.to}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Probes Match */}
          {filteredProbes.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                Fleet Probes
              </div>
              <div className="space-y-0.5">
                {filteredProbes.map((p) => (
                  <button
                    key={p.deviceId}
                    onClick={() => handleSelect('/probes')}
                    className="w-full px-3 py-2 rounded-xl text-left text-white hover:bg-white/[0.08] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="h-4 w-4 text-[#30D158]" />
                      <span className="font-medium">{p.deviceModel}</span>
                      <span className="font-mono text-[10px] text-[#8E8E93]">{p.deviceId}</span>
                    </div>
                    <span className="text-[10px] text-[#30D158] font-bold font-mono">
                      {p.trustScore} pts
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
