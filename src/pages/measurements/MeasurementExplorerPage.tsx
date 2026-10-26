import React, { useState, useEffect, useMemo } from 'react';
import { telemetryService } from '../../services/telemetryService';
import { ClientMeasurementRecord } from '../../types/telemetry';
import { MeasurementInspectorModal } from '../../components/inspector/MeasurementInspectorModal';
import { MeasurementHeader } from './components/MeasurementHeader';
import { MeasurementKpis } from './components/MeasurementKpis';
import { MeasurementSaturationAnalytics } from './components/MeasurementSaturationAnalytics';
import { MeasurementFilters } from './components/MeasurementFilters';
import { MeasurementTable } from './components/MeasurementTable';

export const MeasurementExplorerPage: React.FC = () => {
  const [measurements, setMeasurements] = useState<ClientMeasurementRecord[]>(
    telemetryService.getMeasurements()
  );
  const [search, setSearch] = useState('');
  const [ispFilter, setIspFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'download' | 'latency' | 'bufferbloat'>('recent');
  const [inspectedMeasurement, setInspectedMeasurement] = useState<ClientMeasurementRecord | null>(null);

  useEffect(() => {
    const unsub = telemetryService.subscribe(() => {
      setMeasurements(telemetryService.getMeasurements());
    });
    return () => unsub();
  }, []);

  // Unique ISPs
  const availableIsps = useMemo(() => {
    return Array.from(new Set(measurements.map((m) => m.isp).filter(Boolean))) as string[];
  }, [measurements]);

  // Filter and sort
  const filteredMeasurements = useMemo(() => {
    let result = measurements.filter((m) => {
      if (ispFilter !== 'ALL' && m.isp !== ispFilter) return false;
      if (gradeFilter !== 'ALL' && m.bufferbloatGrade !== gradeFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          m.id.toLowerCase().includes(q) ||
          (m.isp || '').toLowerCase().includes(q) ||
          (m.asn || '').toString().toLowerCase().includes(q) ||
          (m.location?.city || '').toLowerCase().includes(q) ||
          (m.clientIp || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    if (sortBy === 'recent') {
      result = [...result].sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'download') {
      result = [...result].sort((a, b) => (b.downloadMbps || 0) - (a.downloadMbps || 0));
    } else if (sortBy === 'latency') {
      result = [...result].sort((a, b) => (a.latencyMs || 9999) - (b.latencyMs || 9999));
    } else if (sortBy === 'bufferbloat') {
      result = [...result].sort((a, b) => (b.bufferbloatMs || 0) - (a.bufferbloatMs || 0));
    }

    return result;
  }, [measurements, search, ispFilter, gradeFilter, sortBy]);

  // Aggregate KPIs
  const total = measurements.length;
  const avgDownload = total > 0
    ? Math.round(measurements.reduce((sum, m) => sum + (m.downloadMbps || 0), 0) / total)
    : 0;
  const avgLatency = total > 0
    ? Math.round(measurements.reduce((sum, m) => sum + (m.latencyMs || 0), 0) / total)
    : 0;
  const lowBufferbloatPct = total > 0
    ? Math.round(
        (measurements.filter((m) => m.bufferbloatGrade === 'A+' || m.bufferbloatGrade === 'A').length / total) * 100
      )
    : 0;

  const isFiltered = search.trim() !== '' || ispFilter !== 'ALL' || gradeFilter !== 'ALL' || sortBy !== 'recent';

  const handleResetFilters = () => {
    setSearch('');
    setIspFilter('ALL');
    setGradeFilter('ALL');
    setSortBy('recent');
  };

  // CSV Export
  const handleExportCsv = () => {
    if (filteredMeasurements.length === 0) return;
    const headers = [
      'ID',
      'Timestamp',
      'ISO_Date',
      'ISP',
      'ASN',
      'Download_Mbps',
      'Upload_Mbps',
      'Idle_Latency_ms',
      'Loaded_Latency_ms',
      'Bufferbloat_ms',
      'Bufferbloat_Grade',
      'Jitter_ms',
      'Packet_Loss_pct',
      'City',
      'Country',
      'Client_IP',
      'Colo'
    ];

    const rows = filteredMeasurements.map((r) => [
      r.id,
      r.timestamp,
      new Date(r.timestamp).toISOString(),
      `"${(r.isp || '').replace(/"/g, '""')}"`,
      `"${(r.asn || '').toString().replace(/"/g, '""')}"`,
      r.downloadMbps ?? '',
      r.uploadMbps ?? '',
      r.latencyMs ?? '',
      r.loadedLatencyMs ?? '',
      r.bufferbloatMs ?? '',
      r.bufferbloatGrade ?? '',
      r.jitterMs ?? '',
      r.lossPercent ?? '',
      `"${(r.location?.city || '').replace(/"/g, '""')}"`,
      `"${(r.location?.country || '').replace(/"/g, '""')}"`,
      `"${(r.clientIp || '').replace(/"/g, '""')}"`,
      `"${(r.colo || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexis_measurements_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export
  const handleExportJson = () => {
    if (filteredMeasurements.length === 0) return;
    const blob = new Blob([JSON.stringify(filteredMeasurements, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nexis_measurements_report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    telemetryService.deleteMeasurement(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Header with live test count and CSV/JSON Export */}
      <MeasurementHeader
        filteredMeasurements={filteredMeasurements}
        totalCount={total}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
      />

      {/* 2. Top Metric Tiles */}
      <MeasurementKpis
        total={total}
        avgDownload={avgDownload}
        avgLatency={avgLatency}
        lowBufferbloatPct={lowBufferbloatPct}
      />

      {/* 3. RFC 6349 Throughput Saturation & Bufferbloat Grade Analytics */}
      <MeasurementSaturationAnalytics measurements={filteredMeasurements} />

      {/* 4. Search and Filter Toolbar */}
      <MeasurementFilters
        search={search}
        setSearch={setSearch}
        ispFilter={ispFilter}
        setIspFilter={setIspFilter}
        availableIsps={availableIsps}
        gradeFilter={gradeFilter}
        setGradeFilter={setGradeFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* 5. Measurements Data Table */}
      <MeasurementTable
        measurements={filteredMeasurements}
        onInspect={setInspectedMeasurement}
        onDelete={handleDelete}
      />

      {/* 6. Measurement Inspector Modal */}
      <MeasurementInspectorModal
        measurement={inspectedMeasurement}
        onClose={() => setInspectedMeasurement(null)}
      />
    </div>
  );
};

export default MeasurementExplorerPage;
