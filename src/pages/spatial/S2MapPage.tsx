import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';
import { telemetryService } from '../../services/telemetryService';
import { S2CoverageCell, TelemetryRecord } from '../../types/telemetry';
import { S2MapHeader, MetricLayer } from './components/S2MapHeader';
import { S2SpatialKpis } from './components/S2SpatialKpis';
import { S2MapCanvas, CellTower } from './components/S2MapCanvas';
import { S2CellInspector } from './components/S2CellInspector';

const CARRIER_COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#BF5AF2', '#64D2FF', '#FF453A'];

const SAMPLE_TOWERS: CellTower[] = [
  { id: 'TOW-CMB-01', name: 'Lotus Tower Sector A', carrier: 'Dialog Axiata PLC', radio: '5G', lat: 6.9298, lng: 79.8592, azimuth: 45 },
  { id: 'TOW-CMB-02', name: 'Fort eNodeB Mast', carrier: 'SLT-Mobitel', radio: 'LTE', lat: 6.9344, lng: 79.8519, azimuth: 120 },
  { id: 'TOW-CMB-03', name: 'Kollupitiya Coastal Tower', carrier: 'Dialog Axiata PLC', radio: '5G', lat: 6.9147, lng: 79.8507, azimuth: 180 },
  { id: 'TOW-KDY-01', name: 'Kandy Lake gNodeB', carrier: 'SLT-Mobitel', radio: '5G', lat: 7.2936, lng: 80.6380, azimuth: 90 },
  { id: 'TOW-KDY-02', name: 'Peradeniya Tower', carrier: 'Airtel Sri Lanka', radio: 'LTE', lat: 7.2625, lng: 80.5982, azimuth: 270 },
  { id: 'TOW-GAL-01', name: 'Galle Fort gNodeB', carrier: 'Dialog Axiata PLC', radio: '5G', lat: 6.0270, lng: 80.2170, azimuth: 15 },
  { id: 'TOW-JFN-01', name: 'Jaffna City Mast', carrier: 'Hutchison Lanka', radio: 'LTE', lat: 9.6615, lng: 80.0255, azimuth: 0 }
];

function downloadGeoJson(cells: S2CoverageCell[]) {
  const geojson = {
    type: 'FeatureCollection',
    features: cells.map((c) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [c.centerLng, c.centerLat]
      },
      properties: {
        s2_cell_id: c.cellId,
        level: c.level,
        carrier: c.carrierName,
        network_type: c.networkType,
        avg_download_mbps: c.avgDownloadMbps,
        avg_upload_mbps: c.avgUploadMbps,
        avg_latency_ms: c.avgLatencyMs,
        distinct_devices: c.distinctDevices,
        k_anon_passed: c.kAnonPassed,
        last_updated: new Date(c.lastUpdated).toISOString()
      }
    }))
  };
  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexis-s2-cells-${Date.now()}.geojson`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function downloadKml(cells: S2CoverageCell[]) {
  const placemarks = cells.map((c) => `
    <Placemark>
      <name>${c.cellId} (${c.carrierName})</name>
      <description>Download: ${c.avgDownloadMbps} Mbps, Latency: ${c.avgLatencyMs} ms, Devices: ${c.distinctDevices}</description>
      <Point>
        <coordinates>${c.centerLng},${c.centerLat},0</coordinates>
      </Point>
    </Placemark>
  `).join('\n');

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>NEXIS S2 Level-13 Coverage Cells</name>
    ${placemarks}
  </Document>
</kml>`;

  const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexis-s2-cells-${Date.now()}.kml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export const S2MapPage: React.FC = () => {
  const { onInspect } = useOutletContext<{ onInspect: (record: TelemetryRecord) => void }>();
  
  const [cells, setCells] = useState<S2CoverageCell[]>(telemetryService.getCells());
  const [allRecords, setAllRecords] = useState<TelemetryRecord[]>(telemetryService.getRecords());
  const [rules, setRules] = useState(telemetryService.getRules());

  const [selectedCell, setSelectedCell] = useState<S2CoverageCell | null>(null);
  const [search, setSearch] = useState('');
  const [activeLayer, setActiveLayer] = useState<MetricLayer>('CARRIER');
  const [privacyOnly, setPrivacyOnly] = useState<boolean>(false);
  const [showTowers, setShowTowers] = useState<boolean>(true);
  const [deadZoneMode, setDeadZoneMode] = useState<boolean>(false);
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number } | null>(null);

  useEffect(() => {
    const unsub = telemetryService.subscribe(() => {
      setCells(telemetryService.getCells());
      setAllRecords(telemetryService.getRecords());
      setRules(telemetryService.getRules());
    });
    return () => unsub();
  }, []);

  const uniqueCarriers = useMemo(() => {
    return Array.from(new Set(cells.map((c) => c.carrierName))).filter(Boolean);
  }, [cells]);

  const carrierColorMap: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    uniqueCarriers.forEach((c, idx) => {
      map[c] = CARRIER_COLORS[idx % CARRIER_COLORS.length];
    });
    return map;
  }, [uniqueCarriers]);

  // Privacy filtering
  const displayedCells = useMemo(() => {
    return privacyOnly ? cells.filter((c) => c.kAnonPassed) : cells;
  }, [cells, privacyOnly]);

  // Search filtering in cell list
  const filteredCells = useMemo(() => {
    if (!search.trim()) return displayedCells;
    const q = search.toLowerCase();
    return displayedCells.filter(
      (c) => c.cellId.toLowerCase().includes(q) || c.carrierName.toLowerCase().includes(q)
    );
  }, [displayedCells, search]);

  // Records belonging to the selected cell
  const selectedCellRecords = useMemo(() => {
    if (!selectedCell) return [];
    return allRecords.filter((r) => r.s2CellId === selectedCell.cellId);
  }, [allRecords, selectedCell]);

  // Spatial KPIs
  const totalCells = cells.length;
  const verifiedCells = cells.filter((c) => c.kAnonPassed).length;
  const avgDownload =
    cells.length > 0
      ? Math.round(cells.reduce((sum, c) => sum + c.avgDownloadMbps, 0) / cells.length)
      : 0;

  const distinctProbes = useMemo(() => {
    return new Set(allRecords.map((r) => r.deviceId)).size;
  }, [allRecords]);

  const handleSelectCluster = (center: [number, number], zoom: number) => {
    setFlyTarget({ center, zoom });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      
      {/* 1. Header & Cluster Shortcuts */}
      <S2MapHeader
        totalCells={totalCells}
        verifiedCells={verifiedCells}
        activeLayer={activeLayer}
        onActiveLayerChange={setActiveLayer}
        privacyOnly={privacyOnly}
        onTogglePrivacyOnly={setPrivacyOnly}
        onSelectCluster={handleSelectCluster}
        showTowers={showTowers}
        onToggleTowers={setShowTowers}
        deadZoneMode={deadZoneMode}
        onToggleDeadZone={setDeadZoneMode}
        onExportGeoJson={() => downloadGeoJson(displayedCells)}
        onExportKml={() => downloadKml(displayedCells)}
      />

      {/* 2. Spatial Coverage Fleet KPIs */}
      <S2SpatialKpis
        totalCells={totalCells}
        verifiedCells={verifiedCells}
        avgDownload={avgDownload}
        distinctProbes={distinctProbes}
      />

      {/* 3. Main Split View: Map Canvas + S2 Cell Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        
        {/* Left Interactive Map (8 cols on lg) */}
        <div className="lg:col-span-8 h-full">
          <S2MapCanvas
            displayedCells={displayedCells}
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
            activeLayer={activeLayer}
            carrierColorMap={carrierColorMap}
            uniqueCarriers={uniqueCarriers}
            flyTarget={flyTarget}
            showTowers={showTowers}
            deadZoneMode={deadZoneMode}
            towers={SAMPLE_TOWERS}
          />
        </div>

        {/* Right S2 Cell Explorer & Inspector Sidebar (4 cols on lg) */}
        <div className="lg:col-span-4 h-full rounded-3xl border border-white/[0.08] bg-[#1C1C1E] flex flex-col justify-between overflow-hidden shadow-lg">
          
          {selectedCell ? (
            <S2CellInspector
              selectedCell={selectedCell}
              cellRecords={selectedCellRecords}
              minKAnon={rules.minContributorPrivacyThreshold || 5}
              onInspectRecord={onInspect}
              onClose={() => setSelectedCell(null)}
            />
          ) : (
            <div className="p-5 h-full flex flex-col justify-between space-y-4">
              
              {/* Explorer Header */}
              <div className="space-y-3 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#0A84FF]" />
                    S2 Spatial Cells ({filteredCells.length})
                  </h3>
                  <span className="text-[10px] text-[#8E8E93] font-mono">L13 Hex / Spherical</span>
                </div>

                {/* Cell Search Input */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E8E93]" />
                  <input
                    type="text"
                    placeholder="Search cells by ID or carrier..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-black/50 border border-white/[0.08] rounded-xl text-xs text-white placeholder-[#8E8E93] focus:outline-hidden focus:border-[#0A84FF]"
                  />
                </div>

                {/* S2 Cells Scrollable List */}
                <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                  {filteredCells.map((cell) => {
                    const isSelected = selectedCell?.cellId === cell.cellId;
                    return (
                      <div
                        key={cell.cellId}
                        onClick={() => setSelectedCell(cell)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#0A84FF] bg-[#0A84FF]/10 text-white shadow-xs'
                            : 'border-white/[0.06] bg-black/40 text-[#8E8E93] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono font-bold">
                          <span className="text-[#0A84FF] flex items-center gap-1.5">
                            {cell.cellId}
                            {cell.kAnonPassed ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-sans font-semibold bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
                                k-Anon ✓
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-sans font-semibold bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30">
                                k &lt; {rules.minContributorPrivacyThreshold || 5}
                              </span>
                            )}
                          </span>
                          <span className="text-white font-mono-num">{cell.avgDownloadMbps} Mbps</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#8E8E93] mt-1.5">
                          <span className="text-white font-medium">{cell.carrierName}</span>
                          <span className="font-mono-num">{cell.distinctDevices} devices ({cell.totalSamples} pts)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Instruction */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] text-[11px] text-[#8E8E93] text-center">
                Click any cell row or map boundary to inspect localized RF telemetry.
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default S2MapPage;
