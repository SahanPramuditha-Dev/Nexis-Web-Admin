import React, { useState, useEffect, useMemo } from 'react';
import { telemetryService } from '../../services/telemetryService';
import { AuditLogEntry } from '../../types/telemetry';
import { AuditHeader } from './components/AuditHeader';
import { AuditGovernanceKpis } from './components/AuditGovernanceKpis';
import { AuditFilterToolbar } from './components/AuditFilterToolbar';
import { AuditTimelineList } from './components/AuditTimelineList';

function downloadAuditCsv(logs: AuditLogEntry[], filename: string = 'nexis-governance-audit.csv') {
  if (logs.length === 0) return;
  const headers = ['ID', 'Timestamp', 'ISO_Time', 'Admin_User', 'Action', 'Target_ID', 'Details'];
  const rows = logs.map((l) => [
    l.id,
    l.timestamp,
    new Date(l.timestamp).toISOString(),
    `"${(l.adminUser || '').replace(/"/g, '""')}"`,
    l.action,
    `"${(l.targetId || '').replace(/"/g, '""')}"`,
    `"${(l.details || '').replace(/"/g, '""')}"`
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

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(telemetryService.getAuditLogs());
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = telemetryService.subscribe(() => {
      setLogs(telemetryService.getAuditLogs());
    });
    return () => unsub();
  }, []);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category Filter
      if (categoryFilter === 'APPROVALS') {
        if (log.action !== 'APPROVE_RECORD' && log.action !== 'REINSTATE_DEVICE') return false;
      } else if (categoryFilter === 'DEFENSE') {
        if (
          log.action !== 'QUARANTINE_RECORD' &&
          log.action !== 'SHADOW_BAN_DEVICE' &&
          log.action !== 'SET_PROBATION'
        ) {
          return false;
        }
      } else if (categoryFilter === 'POLICY') {
        if (log.action !== 'UPDATE_RULES') return false;
      } else if (categoryFilter === 'PURGES') {
        if (log.action !== 'PURGE_RECORD' && log.action !== 'PURGE_EXPIRED_TELEMETRY') return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          log.action?.toLowerCase().includes(q) ||
          log.adminUser?.toLowerCase().includes(q) ||
          log.targetId?.toLowerCase().includes(q) ||
          log.details?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [logs, categoryFilter, search]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: logs.length,
      approvals: logs.filter((l) => l.action === 'APPROVE_RECORD' || l.action === 'REINSTATE_DEVICE').length,
      defense: logs.filter(
        (l) => l.action === 'QUARANTINE_RECORD' || l.action === 'SHADOW_BAN_DEVICE' || l.action === 'SET_PROBATION'
      ).length,
      policy: logs.filter((l) => l.action === 'UPDATE_RULES').length,
      purges: logs.filter((l) => l.action === 'PURGE_RECORD' || l.action === 'PURGE_EXPIRED_TELEMETRY').length
    };
  }, [logs]);

  // Governance KPIs
  const totalLogs = logs.length;
  const securityOverrides = logs.filter(
    (l) => l.action === 'APPROVE_RECORD' || l.action === 'QUARANTINE_RECORD'
  ).length;
  const ruleUpdates = logs.filter((l) => l.action === 'UPDATE_RULES').length;
  const activeOperators = new Set(logs.map((l) => l.adminUser)).size;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-20">
      
      {/* 1. Governance Header & Export Bundle */}
      <AuditHeader
        totalLogs={totalLogs}
        onExportCsv={() => downloadAuditCsv(filteredLogs, 'nexis-governance-audit.csv')}
      />

      {/* 2. Governance Intelligence KPI Strip */}
      <AuditGovernanceKpis
        totalLogs={totalLogs}
        securityOverrides={securityOverrides}
        ruleUpdates={ruleUpdates}
        activeOperators={activeOperators}
      />

      {/* 3. Action Filter Toolbar */}
      <AuditFilterToolbar
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categoryCounts={categoryCounts}
        search={search}
        onSearchChange={setSearch}
      />

      {/* 4. Tamper-Evident Chronological Timeline */}
      <AuditTimelineList logs={filteredLogs} />

    </div>
  );
};

export default AuditPage;
