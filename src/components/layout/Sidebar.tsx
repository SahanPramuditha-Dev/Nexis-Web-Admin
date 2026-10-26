import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Radio, 
  AlertTriangle, 
  Sliders, 
  MapPin, 
  Smartphone, 
  ShieldCheck, 
  History,
  Activity,
  Lock,
  Users,
  Server
} from 'lucide-react';
import { telemetryService } from '../../services/telemetryService';

export const Sidebar: React.FC = () => {
  const quarantinedCount = telemetryService.getRecords().filter(
    (r) => r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK'
  ).length;

  const navGroups = [
    {
      group: 'Validation Operations',
      items: [
        { to: '/', label: 'Command Center', icon: LayoutDashboard },
        { to: '/validation/feed', label: 'Live Telemetry Feed', icon: Radio, badge: 'Live' },
        { 
          to: '/validation/quarantine', 
          label: 'Quarantine Center', 
          icon: AlertTriangle, 
          badge: quarantinedCount > 0 ? String(quarantinedCount) : undefined,
          badgeColor: 'bg-[#FF453A]/20 text-[#FF453A] border-[#FF453A]/30'
        },
        { to: '/measurements', label: 'Measurement Explorer', icon: Activity, badge: 'Speed' },
        { to: '/validation/rules', label: 'Physics Rules Engine', icon: Sliders }
      ]
    },
    {
      group: 'Spatial & Fleets',
      items: [
        { to: '/carriers', label: 'Carrier Benchmarks & SLAs', icon: Radio },
        { to: '/spatial/map', label: 'S2 Spatial Grid & Heatmap', icon: MapPin },
        { to: '/probes', label: 'Probes & Fleets', icon: Smartphone }
      ]
    },
    {
      group: 'Privacy & Governance',
      items: [
        { to: '/privacy', label: 'Privacy Control Center', icon: Lock, badge: 'k-Anon' },
        { to: '/audit', label: 'Governance & Audit Trail', icon: History }
      ]
    },
    {
      group: 'Administration & Platform',
      items: [
        { to: '/admin/team', label: 'Administration & RBAC', icon: Users },
        { to: '/platform/observability', label: 'Pipeline Observability', icon: Server },
        { to: '/platform/flags', label: 'Feature Flags & Releases', icon: Sliders }
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-white/[0.08] bg-black/60 backdrop-blur-xl flex flex-col justify-between shrink-0 p-3 h-[calc(100vh-4rem)] sticky top-16 select-none">
      
      <div className="space-y-6">
        {navGroups.map((g) => (
          <div key={g.group} className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
              {g.group}
            </div>
            <nav className="space-y-1">
              {g.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#0A84FF] text-white shadow-sm shadow-[#0A84FF]/25 font-bold'
                          : 'text-[#8E8E93] hover:text-white hover:bg-white/[0.06]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${
                          item.badgeColor || 'bg-white/10 text-white border-white/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] text-xs text-[#8E8E93] space-y-1">
        <div className="flex items-center gap-2 text-white font-bold">
          <ShieldCheck className="h-4 w-4 text-[#30D158]" />
          <span>Zero-Trust Active</span>
        </div>
        <p className="text-[11px] text-[#8E8E93] leading-relaxed">
          ITU-T latency bounds & S2 Level-13 geometric privacy checks enforced.
        </p>
      </div>

    </aside>
  );
};
