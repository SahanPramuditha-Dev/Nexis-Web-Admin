import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { telemetryService } from '../../services/telemetryService';
import { TelemetryRecord } from '../../types/telemetry';
import { QuarantineHeader } from './components/QuarantineHeader';
import { QuarantineThreatKpis } from './components/QuarantineThreatKpis';
import { QuarantineFilterToolbar } from './components/QuarantineFilterToolbar';
import { QuarantineTable } from './components/QuarantineTable';

export const QuarantinePage: React.FC = () => {
  const { onInspect } = useOutletContext<{ onInspect: (record: TelemetryRecord) => void }>();
  
  const [records, setRecords] = useState<TelemetryRecord[]>(
    telemetryService
      .getRecords()
      .filter((r) => r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK' || r.status === 'FLAGGED')
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [anomalyFilter, setAnomalyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = telemetryService.subscribe(() => {
      const qRecords = telemetryService
        .getRecords()
        .filter((r) => r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK' || r.status === 'FLAGGED');
      setRecords(qRecords);
    });
    return () => unsub();
  }, []);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Anomaly Category filter
      if (anomalyFilter !== 'ALL') {
        const anomalies = r.proof?.anomalies || [];
        const hasAnomaly = anomalies.includes(anomalyFilter as any) || r.status === anomalyFilter;
        if (!hasAnomaly) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.deviceId?.toLowerCase().includes(q) ||
          r.deviceModel?.toLowerCase().includes(q) ||
          r.carrierName?.toLowerCase().includes(q) ||
          r.city?.toLowerCase().includes(q) ||
          r.s2CellId?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [records, anomalyFilter, searchQuery]);

  // Threat KPIs calculation
  const totalQuarantined = records.length;
  
  const mockLocationCount = records.filter(
    (r) =>
      r.status === 'SPOOFED_MOCK' ||
      r.proof?.isMockDetected ||
      (r.proof?.anomalies || []).includes('MOCK_LOCATION_ACTIVE')
  ).length;

  const physicsCeilingCount = records.filter((r) => {
    const anomalies = r.proof?.anomalies || [];
    return (
      anomalies.includes('IMPOSSIBLE_SPEED_FOR_TECH') ||
      anomalies.includes('VELOCITY_TELEPORTATION') ||
      anomalies.includes('IMPOSSIBLE_LOW_LATENCY')
    );
  }).length;

  const avgThreatScore =
    records.length > 0
      ? Math.round(records.reduce((acc, r) => acc + (r.nexisScore || 0), 0) / records.length)
      : 0;

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
    if (selectedIds.size === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map((r) => r.id)));
    }
  };

  // Actions
  const handleApproveRecord = async (id: string) => {
    await telemetryService.approveRecord(id, 'Admin Operator');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    if (records.length <= 1) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handlePurgeRecord = async (id: string) => {
    await telemetryService.purgeRecord(id, 'Admin Operator');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleBatchApprove = async () => {
    for (const id of selectedIds) {
      await telemetryService.approveRecord(id, 'Batch Admin Approval');
    }
    setSelectedIds(new Set());
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
  };

  const handleBatchPurge = async () => {
    for (const id of selectedIds) {
      await telemetryService.purgeRecord(id, 'Batch Admin Purge');
    }
    setSelectedIds(new Set());
  };

  const isAllSelected = filteredRecords.length > 0 && selectedIds.size === filteredRecords.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      
      {/* 1. Header & Defense Status Banner */}
      <QuarantineHeader
        totalCount={totalQuarantined}
        selectedCount={selectedIds.size}
        onBatchApprove={handleBatchApprove}
        onBatchPurge={handleBatchPurge}
      />

      {/* 2. Threat Intelligence KPI Strip */}
      <QuarantineThreatKpis
        totalQuarantined={totalQuarantined}
        mockLocationCount={mockLocationCount}
        physicsCeilingCount={physicsCeilingCount}
        avgThreatScore={avgThreatScore}
      />

      {/* 3. Filter Toolbar & Anomaly Category Selector */}
      <QuarantineFilterToolbar
        anomalyFilter={anomalyFilter}
        onAnomalyFilterChange={setAnomalyFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCount={selectedIds.size}
        totalFiltered={filteredRecords.length}
        onToggleSelectAll={handleToggleSelectAll}
        isAllSelected={isAllSelected}
      />

      {/* 4. Forensic Triage Table */}
      <QuarantineTable
        records={filteredRecords}
        selectedIds={selectedIds}
        onToggleSelectRow={handleToggleSelectRow}
        onInspect={onInspect}
        onApproveRecord={handleApproveRecord}
        onPurgeRecord={handlePurgeRecord}
      />

    </div>
  );
};

export default QuarantinePage;
