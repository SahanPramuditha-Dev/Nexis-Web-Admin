import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { telemetryService } from '../../services/telemetryService';
import { TelemetryRecord } from '../../types/telemetry';
import { LiveFeedHeader } from './components/LiveFeedHeader';
import { LiveFeedStreamKpis } from './components/LiveFeedStreamKpis';
import { LiveFeedFilters, FeedStatusFilter, SortOption } from './components/LiveFeedFilters';
import { LiveFeedBatchBar } from './components/LiveFeedBatchBar';
import { LiveFeedTable } from './components/LiveFeedTable';

function downloadTelemetryCsv(records: TelemetryRecord[], filename: string = 'nexis-telemetry-feed.csv') {
  if (records.length === 0) return;
  const headers = [
    'ID',
    'Timestamp',
    'ISO_Time',
    'Status',
    'Nexis_Score',
    'Device_ID',
    'Device_Model',
    'OS_Version',
    'Network_Type',
    'Carrier_Name',
    'Download_Mbps',
    'Upload_Mbps',
    'Latency_ms',
    'Jitter_ms',
    'Packet_Loss_pct',
    'RSRP_dBm',
    'SINR_dB',
    'City',
    'Country',
    'S2_Cell_ID',
    'Latitude',
    'Longitude',
    'Anomalies'
  ];

  const rows = records.map((r) => [
    r.id,
    r.timestamp,
    new Date(r.timestamp).toISOString(),
    r.status,
    r.nexisScore,
    `"${(r.deviceId || '').replace(/"/g, '""')}"`,
    `"${(r.deviceModel || '').replace(/"/g, '""')}"`,
    `"${(r.osVersion || '').replace(/"/g, '""')}"`,
    r.networkType,
    `"${(r.carrierName || '').replace(/"/g, '""')}"`,
    r.downloadMbps,
    r.uploadMbps,
    r.latencyMedianMs,
    r.jitterMs,
    r.packetLossPct,
    r.rsrpDbm ?? '',
    r.sinrDb ?? '',
    `"${(r.city || '').replace(/"/g, '""')}"`,
    `"${(r.country || '').replace(/"/g, '""')}"`,
    r.s2CellId,
    r.latitude,
    r.longitude,
    `"${(r.proof?.anomalies || []).join(';')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const LiveFeedPage: React.FC = () => {
  const { onInspect } = useOutletContext<{ onInspect: (record: TelemetryRecord) => void }>();
  
  const [displayedRecords, setDisplayedRecords] = useState<TelemetryRecord[]>(telemetryService.getRecords());
  const [pendingRecords, setPendingRecords] = useState<TelemetryRecord[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isLive, setIsLive] = useState(telemetryService.isConnectedToSupabase());
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter & Sort states
  const [statusFilter, setStatusFilter] = useState<FeedStatusFilter>('ALL');
  const [selectedRats, setSelectedRats] = useState<string[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('ALL');
  const [onlyWeakSignal, setOnlyWeakSignal] = useState(false);
  const [onlyAnomalies, setOnlyAnomalies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Track stream updates
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  useEffect(() => {
    const unsub = telemetryService.subscribe(() => {
      setIsLive(telemetryService.isConnectedToSupabase());
      const latest = telemetryService.getRecords();

      if (!isPausedRef.current) {
        setDisplayedRecords(latest);
        setPendingRecords([]);
      } else {
        // Paused: calculate diff between displayed and latest
        setDisplayedRecords((curr) => {
          const currIds = new Set(curr.map((r) => r.id));
          const newItems = latest.filter((r) => !currIds.has(r.id));
          setPendingRecords(newItems);
          return curr;
        });
      }
    });
    return () => unsub();
  }, []);

  const handleTogglePause = () => {
    if (isPaused) {
      // Resuming stream -> merge any pending
      setDisplayedRecords(telemetryService.getRecords());
      setPendingRecords([]);
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  };

  const handleMergePending = () => {
    setDisplayedRecords(telemetryService.getRecords());
    setPendingRecords([]);
  };

  // Available carriers list
  const availableCarriers = useMemo(() => {
    return Array.from(new Set(displayedRecords.map((r) => r.carrierName))).filter(Boolean);
  }, [displayedRecords]);

  // RAT toggle handler
  const handleToggleRat = (rat: string) => {
    setSelectedRats((prev) =>
      prev.includes(rat) ? prev.filter((r) => r !== rat) : [...prev, rat]
    );
  };

  // Filter logic
  const filteredRecords = useMemo(() => {
    return displayedRecords.filter((rec) => {
      // 1. Status
      if (statusFilter === 'VERIFIED' && rec.status !== 'VERIFIED') return false;
      if (statusFilter === 'QUARANTINED' && rec.status !== 'QUARANTINED' && rec.status !== 'SPOOFED_MOCK') {
        return false;
      }

      // 2. RAT
      if (selectedRats.length > 0 && !selectedRats.includes(rec.networkType)) {
        return false;
      }

      // 3. Carrier
      if (selectedCarrier !== 'ALL' && rec.carrierName !== selectedCarrier) {
        return false;
      }

      // 4. Weak Signal (< -100 dBm)
      if (onlyWeakSignal) {
        if (rec.rsrpDbm === undefined || rec.rsrpDbm >= -100) return false;
      }

      // 5. Anomalies only
      if (onlyAnomalies) {
        const hasAnomalies =
          (rec.proof?.anomalies && rec.proof.anomalies.length > 0) ||
          rec.status === 'QUARANTINED' ||
          rec.status === 'SPOOFED_MOCK';
        if (!hasAnomalies) return false;
      }

      // 6. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          rec.deviceId?.toLowerCase().includes(q) ||
          rec.deviceModel?.toLowerCase().includes(q) ||
          rec.carrierName?.toLowerCase().includes(q) ||
          rec.city?.toLowerCase().includes(q) ||
          rec.s2CellId?.toLowerCase().includes(q) ||
          rec.networkType?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [displayedRecords, statusFilter, selectedRats, selectedCarrier, onlyWeakSignal, onlyAnomalies, searchQuery]);

  // Sort logic
  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];
    switch (sortOption) {
      case 'newest':
        return list.sort((a, b) => b.timestamp - a.timestamp);
      case 'oldest':
        return list.sort((a, b) => a.timestamp - b.timestamp);
      case 'speed_desc':
        return list.sort((a, b) => b.downloadMbps - a.downloadMbps);
      case 'latency_asc':
        return list.sort((a, b) => a.latencyMedianMs - b.latencyMedianMs);
      case 'score_asc':
        return list.sort((a, b) => a.nexisScore - b.nexisScore);
      default:
        return list;
    }
  }, [filteredRecords, sortOption]);

  // Status counts across displayed
  const statusCounts = useMemo(() => {
    return {
      all: displayedRecords.length,
      verified: displayedRecords.filter((r) => r.status === 'VERIFIED').length,
      quarantined: displayedRecords.filter(
        (r) => r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK'
      ).length
    };
  }, [displayedRecords]);

  // Stream Performance KPIs
  const verifiedInView = sortedRecords.filter((r) => r.status === 'VERIFIED').length;
  const quarantinedInView = sortedRecords.filter(
    (r) => r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK'
  ).length;

  const avgDownload = sortedRecords.length > 0
    ? Math.round(sortedRecords.reduce((acc, r) => acc + r.downloadMbps, 0) / sortedRecords.length)
    : 0;

  const avgLatency = sortedRecords.length > 0
    ? Math.round(sortedRecords.reduce((acc, r) => acc + r.latencyMedianMs, 0) / sortedRecords.length)
    : 0;

  const distinctProbes = useMemo(() => {
    return new Set(sortedRecords.map((r) => r.deviceId)).size;
  }, [sortedRecords]);

  // Active filters check
  const hasActiveFilters =
    statusFilter !== 'ALL' ||
    selectedRats.length > 0 ||
    selectedCarrier !== 'ALL' ||
    onlyWeakSignal ||
    onlyAnomalies ||
    searchQuery !== '';

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setSelectedRats([]);
    setSelectedCarrier('ALL');
    setOnlyWeakSignal(false);
    setOnlyAnomalies(false);
    setSearchQuery('');
  };

  // Selection handlers
  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (sortedRecords.every((r) => selectedIds.has(r.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedRecords.map((r) => r.id)));
    }
  };

  // Batch actions
  const handleBatchApprove = async () => {
    for (const id of selectedIds) {
      await telemetryService.approveRecord(id);
    }
    setSelectedIds(new Set());
  };

  const handleBatchQuarantine = async () => {
    for (const id of selectedIds) {
      await telemetryService.quarantineRecord(id, 'Batch Admin Quarantine');
    }
    setSelectedIds(new Set());
  };

  const handleBatchExport = () => {
    const selected = displayedRecords.filter((r) => selectedIds.has(r.id));
    downloadTelemetryCsv(selected, `nexis-telemetry-batch-${selected.length}.csv`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-20">
      
      {/* 1. Live Feed Header & Buffer Control */}
      <LiveFeedHeader
        isLive={isLive}
        isPaused={isPaused}
        pendingCount={pendingRecords.length}
        throughputPerMin={Math.max(displayedRecords.length, 12)}
        totalRecords={displayedRecords.length}
        onTogglePause={handleTogglePause}
        onMergePending={handleMergePending}
        onExportCsv={() => downloadTelemetryCsv(sortedRecords, 'nexis-live-telemetry-stream.csv')}
      />

      {/* 2. Stream KPI Strip */}
      <LiveFeedStreamKpis
        totalInView={sortedRecords.length}
        verifiedInView={verifiedInView}
        quarantinedInView={quarantinedInView}
        avgDownload={avgDownload}
        avgLatency={avgLatency}
        distinctProbes={distinctProbes}
      />

      {/* 3. Multi-Factor Filter Bar */}
      <LiveFeedFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusCounts={statusCounts}
        selectedRats={selectedRats}
        onToggleRat={handleToggleRat}
        selectedCarrier={selectedCarrier}
        onCarrierChange={setSelectedCarrier}
        availableCarriers={availableCarriers}
        onlyWeakSignal={onlyWeakSignal}
        onToggleWeakSignal={() => setOnlyWeakSignal(!onlyWeakSignal)}
        onlyAnomalies={onlyAnomalies}
        onToggleOnlyAnomalies={() => setOnlyAnomalies(!onlyAnomalies)}
        sortOption={sortOption}
        onSortChange={setSortOption}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 4. Telemetry Stream Table */}
      <LiveFeedTable
        records={sortedRecords}
        selectedIds={selectedIds}
        onToggleSelectRow={handleToggleSelectRow}
        onToggleSelectAll={handleToggleSelectAll}
        onInspect={onInspect}
        onApproveRecord={(id) => telemetryService.approveRecord(id)}
        onQuarantineRecord={(id) => telemetryService.quarantineRecord(id)}
        onPurgeRecord={(id) => telemetryService.purgeRecord(id)}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 5. Contextual Batch Action Bar */}
      <LiveFeedBatchBar
        selectedCount={selectedIds.size}
        onBatchApprove={handleBatchApprove}
        onBatchQuarantine={handleBatchQuarantine}
        onBatchExport={handleBatchExport}
        onClearSelection={() => setSelectedIds(new Set())}
      />

    </div>
  );
};

export default LiveFeedPage;
