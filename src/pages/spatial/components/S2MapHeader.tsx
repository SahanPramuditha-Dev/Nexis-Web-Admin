import React from 'react';
import { MapPin, ShieldCheck, Layers, Compass, Radio, TowerControl as Tower, AlertOctagon, Download } from 'lucide-react';

export type MetricLayer = 'CARRIER' | 'SPEED' | 'LATENCY' | 'RSRP' | 'PRIVACY';

interface S2MapHeaderProps {
  totalCells: number;
  verifiedCells: number;
  activeLayer: MetricLayer;
  onActiveLayerChange: (layer: MetricLayer) => void;
  privacyOnly: boolean;
  onTogglePrivacyOnly: (val: boolean) => void;
  onSelectCluster: (center: [number, number], zoom: number) => void;
  showTowers: boolean;
  onToggleTowers: (val: boolean) => void;
  deadZoneMode: boolean;
  onToggleDeadZone: (val: boolean) => void;
  onExportGeoJson: () => void;
  onExportKml: () => void;
}

export const S2MapHeader: React.FC<S2MapHeaderProps> = ({
  totalCells,
  verifiedCells,
  activeLayer,
  onActiveLayerChange,
  privacyOnly,
  onTogglePrivacyOnly,
  onSelectCluster,
  showTowers,
  onToggleTowers,
  deadZoneMode,
  onToggleDeadZone,
  onExportGeoJson,
  onExportKml
}) => {
  const clusters: { name: string; center: [number, number]; zoom: number }[] = [
    { name: 'National Extent', center: [7.8731, 80.7718], zoom: 7 },
    { name: 'Colombo Metro', center: [6.9271, 79.8612], zoom: 12 },
    { name: 'Kandy Central', center: [7.2906, 80.6337], zoom: 12 },
    { name: 'Galle Coastal', center: [6.0535, 80.2210], zoom: 12 }
  ];

  const layerOptions: { id: MetricLayer; label: string }[] = [
    { id: 'CARRIER', label: 'Carriers' },
    { id: 'SPEED', label: 'Speed' },
    { id: 'LATENCY', label: 'Latency' },
    { id: 'RSRP', label: 'RF Signal' },
    { id: 'PRIVACY', label: 'k-Anonymity' }
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#1C1C1E] via-[#1C1C1E] to-[#0A84FF]/15 border border-white/[0.08] shadow-lg relative overflow-hidden">
        
        {/* Title & S2 Standards Badge */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
              <MapPin className="h-5 w-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              S2 Spatial Grid &amp; Network Heatmap
              <span className="text-xs font-mono font-bold text-[#0A84FF] bg-[#0A84FF]/15 px-2 py-0.5 rounded-md border border-[#0A84FF]/30">
                S2 Level 13 (~1.2 km)
              </span>
            </h1>
          </div>
          <p className="text-xs text-[#8E8E93]">
            Google S2 spherical geometry cell indexing, differential privacy verification ($k \ge 5$ devices), and radio coverage choropleths.
          </p>
        </div>

        {/* Cluster Fly-To Shortcuts & GIS Exports */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 mr-2">
            {clusters.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => onSelectCluster(c.center, c.zoom)}
                className="px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-[#0A84FF]/20 text-white hover:text-[#0A84FF] border border-white/[0.08] hover:border-[#0A84FF]/40 text-xs font-medium transition-all cursor-pointer"
              >
                {c.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onExportGeoJson}
            className="px-2.5 py-1.5 rounded-xl bg-[#0A84FF]/15 hover:bg-[#0A84FF]/25 text-[#0A84FF] border border-[#0A84FF]/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Download active cells as GeoJSON for QGIS/ArcGIS"
          >
            <Download className="h-3.5 w-3.5" />
            <span>GeoJSON</span>
          </button>
          <button
            type="button"
            onClick={onExportKml}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Download active cells as Google Earth KML"
          >
            <Download className="h-3.5 w-3.5" />
            <span>KML</span>
          </button>
        </div>

      </div>

      {/* Filter & Layer Toolbar */}
      <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        
        {/* Metric Layer Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-semibold text-[#8E8E93] uppercase mr-1.5 flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-[#0A84FF]" /> Layer:
          </span>
          <div className="inline-flex items-center p-1 rounded-xl bg-[#2C2C2E] border border-white/[0.08]">
            {layerOptions.map((opt) => {
              const isActive = activeLayer === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onActiveLayerChange(opt.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1C1C1E] text-white font-bold border border-white/[0.12] shadow-xs'
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* GIS Overlays (Towers, Dead-Zones, k-Anon) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Physical Towers Toggle */}
          <button
            type="button"
            onClick={() => onToggleTowers(!showTowers)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
              showTowers
                ? 'bg-[#0A84FF]/20 text-[#0A84FF] border-[#0A84FF]/40 font-bold'
                : 'bg-black/40 text-[#8E8E93] border-white/[0.08] hover:text-white'
            }`}
          >
            <Tower className="h-3.5 w-3.5" />
            <span>Cell Towers</span>
          </button>

          {/* Dead Zone Highlight Toggle */}
          <button
            type="button"
            onClick={() => onToggleDeadZone(!deadZoneMode)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
              deadZoneMode
                ? 'bg-[#FF453A]/20 text-[#FF453A] border-[#FF453A]/40 font-bold'
                : 'bg-black/40 text-[#8E8E93] border-white/[0.08] hover:text-white'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>Dead Zones</span>
          </button>

          {/* Privacy k-Anonymity Filter Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.08] font-semibold text-xs">
            <button
              type="button"
              onClick={() => onTogglePrivacyOnly(false)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                !privacyOnly
                  ? 'bg-[#1C1C1E] text-white font-bold border border-white/[0.12]'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              All Grid Cells ({totalCells})
            </button>
            <button
              type="button"
              onClick={() => onTogglePrivacyOnly(true)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                privacyOnly
                  ? 'bg-[#30D158]/20 text-[#30D158] font-bold border border-[#30D158]/40'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Public Verified ({verifiedCells})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

