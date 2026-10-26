import React, { useState, useEffect, useMemo } from 'react';
import { telemetryService } from '../../services/telemetryService';
import { TelemetryRecord } from '../../types/telemetry';
import { CarrierStats, TimeframeOption } from './types';
import { CarriersHeader } from './components/CarriersHeader';
import { CarriersLeaderKpis } from './components/CarriersLeaderKpis';
import { CarriersComparativeChart } from './components/CarriersComparativeChart';
import { CarrierDetailedScorecard } from './components/CarrierDetailedScorecard';
import { CarriersBenchmarkTable } from './components/CarriersBenchmarkTable';

export const CarriersPage: React.FC = () => {
  const [records, setRecords] = useState<TelemetryRecord[]>(telemetryService.getRecords());
  const [timeframe, setTimeframe] = useState<TimeframeOption>('all');
  const [selectedCarrierName, setSelectedCarrierName] = useState<string>('');

  useEffect(() => {
    const unsub = telemetryService.subscribe(() => {
      setRecords(telemetryService.getRecords());
    });
    return () => unsub();
  }, []);

  // Filter records by timeframe
  const filteredRecords = useMemo(() => {
    if (timeframe === 'all') return records;

    const now = Date.now();
    let windowMs = 24 * 60 * 60 * 1000;
    if (timeframe === '1h') windowMs = 60 * 60 * 1000;
    else if (timeframe === '24h') windowMs = 24 * 60 * 60 * 1000;
    else if (timeframe === '7d') windowMs = 7 * 24 * 60 * 60 * 1000;
    else if (timeframe === '30d') windowMs = 30 * 24 * 60 * 60 * 1000;

    const cutoff = now - windowMs;
    return records.filter((r) => new Date(r.timestamp).getTime() >= cutoff);
  }, [records, timeframe]);

  // Aggregate stats per carrier
  const carrierStatsList = useMemo<CarrierStats[]>(() => {
    const map: Record<string, TelemetryRecord[]> = {};
    const totalCount = filteredRecords.length || 1;

    filteredRecords.forEach((r) => {
      const name = r.carrierName || 'Unknown Carrier';
      if (!map[name]) map[name] = [];
      map[name].push(r);
    });

    return Object.entries(map).map(([name, recs]) => {
      const count = recs.length;
      const avgDl = recs.reduce((sum, r) => sum + r.downloadMbps, 0) / count;
      const avgUl = recs.reduce((sum, r) => sum + r.uploadMbps, 0) / count;
      const avgLat = recs.reduce((sum, r) => sum + r.latencyMedianMs, 0) / count;
      const avgJit = recs.reduce((sum, r) => sum + r.jitterMs, 0) / count;
      const avgLoss = recs.reduce((sum, r) => sum + r.packetLossPct, 0) / count;

      // 3GPP RSRP power tiers
      const rsrpRecs = recs.filter((r) => r.rsrpDbm !== undefined);
      const avgRsrp = rsrpRecs.length > 0
        ? rsrpRecs.reduce((sum, r) => sum + (r.rsrpDbm || 0), 0) / rsrpRecs.length
        : -90;

      const excellentRsrp = rsrpRecs.filter(r => (r.rsrpDbm || -999) >= -80).length;
      const goodRsrp = rsrpRecs.filter(r => (r.rsrpDbm || -999) >= -90 && (r.rsrpDbm || -999) < -80).length;
      const fairRsrp = rsrpRecs.filter(r => (r.rsrpDbm || -999) >= -100 && (r.rsrpDbm || -999) < -90).length;
      const poorRsrp = rsrpRecs.filter(r => (r.rsrpDbm || -999) < -100).length;
      const rsrpTotal = rsrpRecs.length || 1;

      // Radio Access Technology
      const count5G = recs.filter((r) => r.networkType === '5G').length;
      const countLTE = recs.filter((r) => r.networkType === 'LTE').length;
      const count3G = recs.filter((r) => r.networkType === '3G').length;
      const countWiFi = recs.filter((r) => r.networkType === 'WIFI').length;

      // SLA Compliance thresholds
      const dlPassed = recs.filter((r) => r.downloadMbps >= 10).length;
      const latPassed = recs.filter((r) => r.latencyMedianMs <= 50).length;
      const lossPassed = recs.filter((r) => r.packetLossPct <= 1.0).length;
      const jitPassed = recs.filter((r) => r.jitterMs <= 10).length;

      const slaDl = (dlPassed / count) * 100;
      const slaLat = (latPassed / count) * 100;
      const slaLoss = (lossPassed / count) * 100;
      const slaJit = (jitPassed / count) * 100;
      const slaOverall = (slaDl + slaLat + slaLoss + slaJit) / 4;

      return {
        name,
        samples: count,
        sampleSharePct: Number(((count / totalCount) * 100).toFixed(1)),
        avgDownload: Number(avgDl.toFixed(1)),
        avgUpload: Number(avgUl.toFixed(1)),
        avgLatency: Number(avgLat.toFixed(1)),
        avgJitter: Number(avgJit.toFixed(1)),
        avgLoss: Number(avgLoss.toFixed(2)),
        avgRsrp: Math.round(avgRsrp),
        pct5G: Number(((count5G / count) * 100).toFixed(1)),
        pctLTE: Number(((countLTE / count) * 100).toFixed(1)),
        pct3G: Number(((count3G / count) * 100).toFixed(1)),
        pctWiFi: Number(((countWiFi / count) * 100).toFixed(1)),
        rsrpTiers: {
          excellent: Math.round((excellentRsrp / rsrpTotal) * 100),
          good: Math.round((goodRsrp / rsrpTotal) * 100),
          fair: Math.round((fairRsrp / rsrpTotal) * 100),
          poor: Math.round((poorRsrp / rsrpTotal) * 100)
        },
        slaDownloadPass: Number(slaDl.toFixed(1)),
        slaLatencyPass: Number(slaLat.toFixed(1)),
        slaLossPass: Number(slaLoss.toFixed(1)),
        slaJitterPass: Number(slaJit.toFixed(1)),
        slaOverallPass: Number(slaOverall.toFixed(1))
      };
    }).sort((a, b) => b.samples - a.samples);
  }, [filteredRecords]);

  // Set default carrier on first compute
  useEffect(() => {
    if (carrierStatsList.length > 0) {
      if (!selectedCarrierName || !carrierStatsList.some(c => c.name === selectedCarrierName)) {
        setSelectedCarrierName(carrierStatsList[0].name);
      }
    }
  }, [carrierStatsList, selectedCarrierName]);

  const selectedCarrier = useMemo(() => {
    return carrierStatsList.find((c) => c.name === selectedCarrierName) || carrierStatsList[0];
  }, [carrierStatsList, selectedCarrierName]);

  // Leaders
  const speedLeader = useMemo(() => {
    if (!carrierStatsList.length) return undefined;
    return [...carrierStatsList].sort((a, b) => b.avgDownload - a.avgDownload)[0];
  }, [carrierStatsList]);

  const latencyLeader = useMemo(() => {
    if (!carrierStatsList.length) return undefined;
    return [...carrierStatsList].sort((a, b) => a.avgLatency - b.avgLatency)[0];
  }, [carrierStatsList]);

  const slaLeader = useMemo(() => {
    if (!carrierStatsList.length) return undefined;
    return [...carrierStatsList].sort((a, b) => b.slaOverallPass - a.slaOverallPass)[0];
  }, [carrierStatsList]);

  const fiveGLeader = useMemo(() => {
    if (!carrierStatsList.length) return undefined;
    return [...carrierStatsList].sort((a, b) => b.pct5G - a.pct5G)[0];
  }, [carrierStatsList]);

  // CSV Export handler
  const handleExportCsv = () => {
    const headers = [
      'Carrier Name',
      'Samples',
      'Sample Share %',
      'Avg Download (Mbps)',
      'Avg Upload (Mbps)',
      'Median Latency (ms)',
      'Mean Jitter (ms)',
      'Packet Loss %',
      'Avg RSRP (dBm)',
      '5G Share %',
      'LTE Share %',
      'Download SLA %',
      'Latency SLA %',
      'Loss SLA %',
      'Jitter SLA %',
      'Overall SLA %'
    ];

    const rows = carrierStatsList.map(c => [
      `"${c.name}"`,
      c.samples,
      `${c.sampleSharePct}%`,
      c.avgDownload,
      c.avgUpload,
      c.avgLatency,
      c.avgJitter,
      c.avgLoss,
      c.avgRsrp,
      `${c.pct5G}%`,
      `${c.pctLTE}%`,
      `${c.slaDownloadPass}%`,
      `${c.slaLatencyPass}%`,
      `${c.slaLossPass}%`,
      `${c.slaJitterPass}%`,
      `${c.slaOverallPass}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `carrier_sla_benchmark_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Header with Timeframe selector & CSV Export */}
      <CarriersHeader
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        onExportCsv={handleExportCsv}
        totalCarriers={carrierStatsList.length}
        totalSamples={filteredRecords.length}
      />

      {/* 2. Executive Leadership KPIs */}
      <CarriersLeaderKpis
        speedLeader={speedLeader}
        latencyLeader={latencyLeader}
        slaLeader={slaLeader}
        fiveGLeader={fiveGLeader}
      />

      {/* 3. Comparative Telemetry Visualization (Bar & Spider Radar) */}
      <CarriersComparativeChart
        carriers={carrierStatsList}
        selectedCarrierName={selectedCarrier?.name || ''}
        onSelectCarrier={setSelectedCarrierName}
      />

      {/* 4. Selected Operator Deep-Dive & SLA Quality Scorecard */}
      {selectedCarrier && (
        <CarrierDetailedScorecard carrier={selectedCarrier} />
      )}

      {/* 5. Complete Network Operators Scorecard Table */}
      <CarriersBenchmarkTable
        carriers={carrierStatsList}
        selectedCarrierName={selectedCarrier?.name || ''}
        onSelectCarrier={setSelectedCarrierName}
      />
    </div>
  );
};
export default CarriersPage;
