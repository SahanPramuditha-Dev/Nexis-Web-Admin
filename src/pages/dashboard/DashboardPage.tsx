import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { telemetryService } from '../../services/telemetryService';
import { TelemetryRecord } from '../../types/telemetry';
import { DashboardHeader, TimeWindow } from './components/DashboardHeader';
import { DashboardKpiGrid } from './components/DashboardKpiGrid';
import { TelemetryTrendChart } from './components/TelemetryTrendChart';
import { TechnologyBreakdownCard } from './components/TechnologyBreakdownCard';
import { RfSignalHealthCard } from './components/RfSignalHealthCard';
import { CarrierBenchmarkMatrix } from './components/CarrierBenchmarkMatrix';
import { ThreatRadarCard } from './components/ThreatRadarCard';
import { RecentSubmissionsTable } from './components/RecentSubmissionsTable';

export const DashboardPage: React.FC = () => {
  const { onInspect } = useOutletContext<{ onInspect: (record: TelemetryRecord) => void }>();
  
  const [allRecords, setAllRecords] = useState<TelemetryRecord[]>(telemetryService.getRecords());
  const [probes, setProbes] = useState(telemetryService.getProbes());
  const [cells, setCells] = useState(telemetryService.getCells());
  const [isLive, setIsLive] = useState(telemetryService.isConnectedToSupabase());
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('all');

  useEffect(() => {
    const unsub = telemetryService.subscribe(() => {
      setAllRecords(telemetryService.getRecords());
      setProbes(telemetryService.getProbes());
      setCells(telemetryService.getCells());
      setIsLive(telemetryService.isConnectedToSupabase());
    });
    return () => unsub();
  }, []);

  // Filter records based on selected time window
  const filteredRecords = useMemo(() => {
    if (timeWindow === 'all') return allRecords;
    
    // Find most recent timestamp as reference (or now)
    const latestTimestamp = allRecords.length > 0 
      ? Math.max(...allRecords.map((r) => r.timestamp)) 
      : Date.now();

    let windowMs = 24 * 3600 * 1000;
    if (timeWindow === '1h') windowMs = 1 * 3600 * 1000;
    if (timeWindow === '24h') windowMs = 24 * 3600 * 1000;
    if (timeWindow === '7d') windowMs = 7 * 24 * 3600 * 1000;

    const cutoff = latestTimestamp - windowMs;
    const res = allRecords.filter((r) => r.timestamp >= cutoff);
    return res.length > 0 ? res : allRecords; // graceful fallback if data is historical
  }, [allRecords, timeWindow]);

  // Aggregate KPI stats
  const total = filteredRecords.length;
  const verified = filteredRecords.filter((r) => r.status === 'VERIFIED').length;
  const quarantined = filteredRecords.filter(
    (r) => r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK'
  ).length;

  const timeWindowLabel = {
    '1h': 'Past 1 Hour',
    '24h': 'Past 24 Hours',
    '7d': 'Past 7 Days',
    all: 'All Time'
  }[timeWindow];

  const mostRecentTimestamp = allRecords.length > 0 
    ? Math.max(...allRecords.map((r) => r.timestamp)) 
    : undefined;

  return (
    <div className="space-y-7 animate-in fade-in duration-200 pb-12">
      
      {/* 1. Command Center Executive Header */}
      <DashboardHeader
        isLive={isLive}
        totalFiltered={total}
        totalAllTime={allRecords.length}
        timeWindow={timeWindow}
        onTimeWindowChange={setTimeWindow}
        lastUpdated={mostRecentTimestamp}
      />

      {/* 2. Primary KPI Tiles Grid */}
      <DashboardKpiGrid
        total={total}
        verified={verified}
        quarantined={quarantined}
        probesCount={probes.length}
        cellsCount={cells.length}
        timeWindowLabel={timeWindowLabel}
      />

      {/* 3. Visual Analytics Core (Recharts Trend + RAT Technology Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TelemetryTrendChart
            records={filteredRecords}
            timeWindowLabel={timeWindowLabel}
          />
        </div>
        <div className="lg:col-span-1">
          <TechnologyBreakdownCard records={filteredRecords} />
        </div>
      </div>

      {/* 4. Specialized Cellular Operations (RF Physics, Carrier Benchmark, Threat Radar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RfSignalHealthCard records={filteredRecords} />
        <CarrierBenchmarkMatrix records={filteredRecords} />
        <ThreatRadarCard records={filteredRecords} />
      </div>

      {/* 5. Real-Time Telemetry Ingestion Stream Table */}
      <RecentSubmissionsTable
        records={filteredRecords}
        onInspect={onInspect}
      />

    </div>
  );
};

export default DashboardPage;
