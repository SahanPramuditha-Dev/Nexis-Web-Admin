import React, { useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Circle, 
  CircleMarker, 
  Tooltip, 
  useMap 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { S2CoverageCell } from '../../../types/telemetry';
import { MetricLayer } from './S2MapHeader';

export interface CellTower {
  id: string;
  name: string;
  carrier: string;
  radio: '5G' | 'LTE' | '3G';
  lat: number;
  lng: number;
  azimuth: number;
}

interface S2MapCanvasProps {
  displayedCells: S2CoverageCell[];
  selectedCell: S2CoverageCell | null;
  onSelectCell: (cell: S2CoverageCell) => void;
  activeLayer: MetricLayer;
  carrierColorMap: Record<string, string>;
  uniqueCarriers: string[];
  flyTarget: { center: [number, number]; zoom: number } | null;
  showTowers?: boolean;
  deadZoneMode?: boolean;
  towers?: CellTower[];
}

function MapViewController({
  flyTarget,
  selectedCell
}: {
  flyTarget: { center: [number, number]; zoom: number } | null;
  selectedCell: S2CoverageCell | null;
}) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget.center, flyTarget.zoom, { duration: 1.2 });
    }
  }, [flyTarget, map]);

  useEffect(() => {
    if (selectedCell) {
      map.flyTo([selectedCell.centerLat, selectedCell.centerLng], 13, { duration: 0.8 });
    }
  }, [selectedCell, map]);

  return null;
}

export const S2MapCanvas: React.FC<S2MapCanvasProps> = ({
  displayedCells,
  selectedCell,
  onSelectCell,
  activeLayer,
  carrierColorMap,
  uniqueCarriers,
  flyTarget,
  showTowers = false,
  deadZoneMode = false,
  towers = []
}) => {
  const getCellColor = (cell: S2CoverageCell): string => {
    if (deadZoneMode) {
      const isDead = cell.avgDownloadMbps < 10 || (cell.avgRsrpDbm !== undefined && cell.avgRsrpDbm < -100);
      return isDead ? '#FF453A' : '#2C2C2E';
    }
    if (activeLayer === 'SPEED') {
      if (cell.avgDownloadMbps >= 250) return '#30D158'; // Optimal Green
      if (cell.avgDownloadMbps >= 80) return '#0A84FF';  // Good Blue
      if (cell.avgDownloadMbps >= 30) return '#FF9F0A';  // Amber
      return '#FF453A'; // Degraded Red
    }
    if (activeLayer === 'LATENCY') {
      if (cell.avgLatencyMs <= 15) return '#30D158';
      if (cell.avgLatencyMs <= 30) return '#0A84FF';
      if (cell.avgLatencyMs <= 50) return '#FF9F0A';
      return '#FF453A';
    }
    if (activeLayer === 'RSRP') {
      if (cell.avgRsrpDbm >= -80) return '#30D158'; // Excellent
      if (cell.avgRsrpDbm >= -95) return '#0A84FF'; // Good
      return '#FF453A'; // Weak
    }
    if (activeLayer === 'PRIVACY') {
      return cell.kAnonPassed ? '#30D158' : '#FF9F0A';
    }
    // Carrier
    return carrierColorMap[cell.carrierName] || '#0A84FF';
  };

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0A0A0C] relative shadow-2xl">
      <MapContainer
        center={[7.8731, 80.7718]}
        zoom={8}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', backgroundColor: '#000000' }}
      >
        <MapViewController flyTarget={flyTarget} selectedCell={selectedCell} />

        {/* Dark Esri Basemap */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />

        {/* S2 Cells Geodesic Circles & Markers */}
        {displayedCells.map((cell) => {
          const isSelected = selectedCell?.cellId === cell.cellId;
          const color = getCellColor(cell);

          return (
            <React.Fragment key={cell.cellId}>
              {/* S2 Cell Boundary (Level 13 ~ 1,400m radius circle) */}
              <Circle
                center={[cell.centerLat, cell.centerLng]}
                radius={1400}
                pathOptions={{
                  color: isSelected ? '#FFFFFF' : color,
                  fillColor: color,
                  fillOpacity: deadZoneMode ? (cell.avgDownloadMbps < 10 ? 0.75 : 0.08) : (isSelected ? 0.65 : 0.35),
                  weight: isSelected ? 3 : 1.5,
                  dashArray: cell.kAnonPassed ? undefined : '5, 5'
                }}
                eventHandlers={{
                  click: () => onSelectCell(cell)
                }}
              >
                <Tooltip direction="top" opacity={0.95}>
                  <div className="font-sans text-xs p-1.5 text-white bg-[#1C1C1E] rounded-xl border border-white/20 shadow-xl leading-tight min-w-[160px]">
                    <div className="font-bold text-sm text-white flex items-center justify-between">
                      <span>{cell.carrierName}</span>
                      <span className="text-[10px] font-mono text-[#0A84FF]">{cell.networkType}</span>
                    </div>
                    <div className="text-[11px] text-[#8E8E93] font-mono mt-0.5">
                      Cell: {cell.cellId} (L13)
                    </div>
                    <div className="mt-1.5 font-mono-num font-bold text-white text-xs">
                      {cell.avgDownloadMbps} Mbps • {cell.avgLatencyMs} ms
                    </div>
                    {cell.kAnonPassed ? (
                      <div className="text-[10px] text-[#30D158] font-semibold mt-1">
                        ✓ k-Anonymity Verified ({cell.distinctDevices} devices)
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#FF9F0A] font-semibold mt-1">
                        ⚠ Below k-Anonymity ({cell.distinctDevices} devices — Private)
                      </div>
                    )}
                  </div>
                </Tooltip>
              </Circle>

              {/* Center Probe Marker */}
              <CircleMarker
                center={[cell.centerLat, cell.centerLng]}
                radius={4}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: color,
                  fillOpacity: 1,
                  weight: 1.5
                }}
                eventHandlers={{
                  click: () => onSelectCell(cell)
                }}
              />
            </React.Fragment>
          );
        })}

        {/* Physical Base Station Towers */}
        {showTowers && towers.map((tower) => (
          <CircleMarker
            key={tower.id}
            center={[tower.lat, tower.lng]}
            radius={7}
            pathOptions={{
              color: '#FFFFFF',
              fillColor: tower.radio === '5G' ? '#BF5AF2' : '#0A84FF',
              fillOpacity: 0.95,
              weight: 2
            }}
          >
            <Tooltip direction="top" opacity={0.95}>
              <div className="font-sans text-xs p-1.5 text-white bg-[#1C1C1E] rounded-xl border border-white/20 shadow-xl leading-tight min-w-[150px]">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>{tower.name}</span>
                  <span className="text-[10px] font-mono px-1 rounded bg-[#0A84FF]/20 text-[#0A84FF]">{tower.radio}</span>
                </div>
                <div className="text-[10px] text-[#8E8E93] mt-0.5">{tower.carrier} Base Station</div>
                <div className="text-[10px] font-mono text-[#30D158] mt-0.5">Azimuth Bearing: {tower.azimuth}°</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Floating Apple HIG Dark Legend */}
      <div className="absolute bottom-5 left-5 z-[400] p-3.5 rounded-2xl bg-[#1C1C1E]/95 border border-white/[0.12] backdrop-blur-2xl text-xs space-y-2.5 pointer-events-auto shadow-2xl max-w-xs">
        <div className="font-bold text-[#8E8E93] text-[10px] uppercase tracking-wider flex items-center justify-between">
          <span>
            {activeLayer === 'CARRIER'
              ? 'Mobile Carriers'
              : activeLayer === 'SPEED'
              ? 'Downlink Tiers'
              : activeLayer === 'LATENCY'
              ? 'Latency Bounds'
              : activeLayer === 'RSRP'
              ? 'RF Signal (RSRP)'
              : 'Privacy Verification'}
          </span>
        </div>

        {activeLayer === 'CARRIER' && (
          <div className="space-y-1.5">
            {uniqueCarriers.map((c) => (
              <div key={c} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: carrierColorMap[c] || '#0A84FF' }}
                />
                <span className="text-white font-medium truncate">{c}</span>
              </div>
            ))}
          </div>
        )}

        {activeLayer === 'SPEED' && (
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#30D158]" />
              <span className="text-white font-medium">&gt; 250 Mbps (Gigabit/5G)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0A84FF]" />
              <span className="text-white font-medium">80 – 250 Mbps (LTE-A)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF9F0A]" />
              <span className="text-white font-medium">30 – 80 Mbps (Moderate)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF453A]" />
              <span className="text-white font-medium">&lt; 30 Mbps (Degraded)</span>
            </div>
          </div>
        )}

        {activeLayer === 'LATENCY' && (
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#30D158]" />
              <span className="text-white font-medium">&lt; 15 ms (Ultra-Low)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0A84FF]" />
              <span className="text-white font-medium">15 – 30 ms (Standard)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF453A]" />
              <span className="text-white font-medium">&gt; 50 ms (High Delay)</span>
            </div>
          </div>
        )}

        {activeLayer === 'RSRP' && (
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#30D158]" />
              <span className="text-white font-medium">&gt; -80 dBm (Excellent)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0A84FF]" />
              <span className="text-white font-medium">-80 to -95 dBm (Good)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF453A]" />
              <span className="text-white font-medium">&lt; -95 dBm (Cell Edge)</span>
            </div>
          </div>
        )}

        {activeLayer === 'PRIVACY' && (
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#30D158]" />
              <span className="text-white font-medium">k-Anon Verified (Public)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF9F0A]" />
              <span className="text-white font-medium">Sub-Threshold (Private Staging)</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
