import React, { useState, useEffect, useMemo } from 'react';
import { telemetryService } from '../../services/telemetryService';
import { ProbeDevice, TelemetryRecord } from '../../types/telemetry';
import { ProbesHeader } from './components/ProbesHeader';
import { ProbesFleetKpis } from './components/ProbesFleetKpis';
import { ProbesPlatformDistribution } from './components/ProbesPlatformDistribution';
import { ProbesFilterToolbar } from './components/ProbesFilterToolbar';
import { ProbesBatchBar } from './components/ProbesBatchBar';
import { ProbesTable } from './components/ProbesTable';
import { ProbeDetailModal } from '../../components/inspector/ProbeDetailModal';

function downloadProbesCsv(probes: ProbeDevice[], filename: string = 'nexis-probes-inventory.csv') {
  if (probes.length === 0) return;
  const headers = [
    'Device_ID',
    'Device_Model',
    'Platform',
    'OS_Version',
    'Status',
    'Trust_Score',
    'Total_Submissions',
    'Verified_Submissions',
    'Quarantined_Submissions',
    'Pass_Rate_pct',
    'First_Seen_ISO',
    'Last_Seen_ISO',
    'Last_Location'
  ];

  const rows = probes.map((p) => {
    const passRate =
      p.totalSubmissions > 0
        ? Math.round((p.verifiedSubmissions / p.totalSubmissions) * 100)
        : 100;
    return [
      `"${(p.deviceId || '').replace(/"/g, '""')}"`,
      `"${(p.deviceModel || '').replace(/"/g, '""')}"`,
      p.platform,
      `"${(p.osVersion || '').replace(/"/g, '""')}"`,
      p.status,
      p.trustScore,
      p.totalSubmissions,
      p.verifiedSubmissions,
      p.quarantinedSubmissions,
      passRate,
      new Date(p.firstSeen).toISOString(),
      new Date(p.lastSeen).toISOString(),
      `"${(p.lastKnownLocation || '').replace(/"/g, '""')}"`
    ];
  });

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

export const ProbesPage: React.FC = () => {
  const [probes, setProbes] = useState<ProbeDevice[]>(telemetryService.getProbes());
  const [records, setRecords] = useState<TelemetryRecord[]>(telemetryService.getRecords());
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('trust_desc');
  const [search, setSearch] = useState('');
  
  const [selectedProbe, setSelectedProbe] = useState<ProbeDevice | null>(null);

  useEffect(() => {
    const unsub = telemetryService.subscribe(() => {
      setProbes(telemetryService.getProbes());
      setRecords(telemetryService.getRecords());
    });
    return () => unsub();
  }, []);

  // Filtered probes
  const filteredProbes = useMemo(() => {
    return probes.filter((p) => {
      // Status
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;

      // Platform
      if (platformFilter !== 'ALL' && p.platform !== platformFilter) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          p.deviceId?.toLowerCase().includes(q) ||
          p.deviceModel?.toLowerCase().includes(q) ||
          p.lastKnownLocation?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [probes, statusFilter, platformFilter, search]);

  // Sorted probes
  const sortedProbes = useMemo(() => {
    const list = [...filteredProbes];
    switch (sortOption) {
      case 'trust_desc':
        return list.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
      case 'trust_asc':
        return list.sort((a, b) => (a.trustScore || 0) - (b.trustScore || 0));
      case 'submissions_desc':
        return list.sort((a, b) => b.totalSubmissions - a.totalSubmissions);
      case 'recent':
        return list.sort((a, b) => b.lastSeen - a.lastSeen);
      default:
        return list;
    }
  }, [filteredProbes, sortOption]);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      all: probes.length,
      active: probes.filter((p) => p.status === 'ACTIVE').length,
      probationary: probes.filter((p) => p.status === 'PROBATIONARY').length,
      shadowBanned: probes.filter((p) => p.status === 'SHADOW_BANNED').length
    };
  }, [probes]);

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
    if (sortedProbes.every((p) => selectedIds.has(p.deviceId))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedProbes.map((p) => p.deviceId)));
    }
  };

  // Actions
  const handleShadowBan = async (id: string) => {
    await telemetryService.shadowBanDevice(id);
  };

  const handleReinstate = async (id: string) => {
    await telemetryService.reinstateDevice(id);
  };

  const handleBatchReinstate = async () => {
    for (const id of selectedIds) {
      await telemetryService.reinstateDevice(id);
    }
    setSelectedIds(new Set());
  };

  const handleBatchProbation = async () => {
    for (const id of selectedIds) {
      await telemetryService.setDeviceProbation(id);
    }
    setSelectedIds(new Set());
  };

  const handleBatchShadowBan = async () => {
    for (const id of selectedIds) {
      await telemetryService.shadowBanDevice(id);
    }
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-20">
      
      {/* 1. Header & Inventory Counter */}
      <ProbesHeader
        totalProbes={probes.length}
        onExportCsv={() => downloadProbesCsv(sortedProbes, 'nexis-fleets-export.csv')}
      />

      {/* 2. Fleet Health KPI Strip */}
      <ProbesFleetKpis
        totalProbes={probes.length}
        activeProbes={statusCounts.active}
        probationaryProbes={statusCounts.probationary}
        shadowBannedProbes={statusCounts.shadowBanned}
      />

      {/* 3. Hardware & Platform Diversity */}
      <ProbesPlatformDistribution probes={probes} />

      {/* 4. Multi-Factor Filter Toolbar */}
      <ProbesFilterToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusCounts={statusCounts}
        platformFilter={platformFilter}
        onPlatformFilterChange={setPlatformFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        search={search}
        onSearchChange={setSearch}
      />

      {/* 5. High-Density Fleet Table */}
      <ProbesTable
        probes={sortedProbes}
        selectedIds={selectedIds}
        onToggleSelectRow={handleToggleSelectRow}
        onToggleSelectAll={handleToggleSelectAll}
        onSelectProbe={setSelectedProbe}
        onShadowBan={handleShadowBan}
        onReinstate={handleReinstate}
      />

      {/* 6. Contextual Batch Fleet Bar */}
      <ProbesBatchBar
        selectedCount={selectedIds.size}
        onBatchReinstate={handleBatchReinstate}
        onBatchProbation={handleBatchProbation}
        onBatchShadowBan={handleBatchShadowBan}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* 7. Detailed Probe Modal */}
      <ProbeDetailModal
        probe={selectedProbe}
        records={records}
        onClose={() => setSelectedProbe(null)}
      />

    </div>
  );
};

export default ProbesPage;
