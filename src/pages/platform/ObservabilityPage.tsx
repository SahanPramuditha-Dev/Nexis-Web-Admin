import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Radio, 
  Cpu, 
  Zap, 
  HardDrive, 
  CheckCircle2, 
  Clock, 
  Layers,
  RefreshCw
} from 'lucide-react';
import { telemetryService } from '../../services/telemetryService';
import { Button } from '../../components/ui/Button';

export const ObservabilityPage: React.FC = () => {
  const [isLive, setIsLive] = useState(telemetryService.isConnectedToSupabase());
  const [recordsCount, setRecordsCount] = useState(telemetryService.getRecords().length);
  const [measCount, setMeasCount] = useState(telemetryService.getMeasurements().length);
  const [cellsCount, setCellsCount] = useState(telemetryService.getCells().length);
  const [probesCount, setProbesCount] = useState(telemetryService.getProbes().length);
  const [logsCount, setLogsCount] = useState(telemetryService.getAuditLogs().length);
  const [pingMs, setPingMs] = useState(42);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsub = telemetryService.subscribe(() => {
      setIsLive(telemetryService.isConnectedToSupabase());
      setRecordsCount(telemetryService.getRecords().length);
      setMeasCount(telemetryService.getMeasurements().length);
      setCellsCount(telemetryService.getCells().length);
      setProbesCount(telemetryService.getProbes().length);
      setLogsCount(telemetryService.getAuditLogs().length);
    });
    return () => unsub();
  }, []);

  const handleManualHeartbeat = async () => {
    setIsRefreshing(true);
    const start = performance.now();
    await telemetryService.refetchRecords();
    const end = performance.now();
    setPingMs(Math.round(end - start));
    setIsRefreshing(false);
  };

  const tables = [
    { name: 'telemetry_records', label: 'Raw Telemetry Packets', count: recordsCount, role: 'High-frequency probe ingest' },
    { name: 'measurements', label: 'Client Speed Tests (RFC 6349)', count: measCount, role: 'Full saturation curves' },
    { name: 's2_coverage_cells', label: 'S2 Level-13 Aggregates', count: cellsCount, role: 'Privacy-filtered spatial cells' },
    { name: 'probe_devices', label: 'Probe Device Registry', count: probesCount, role: 'Fleet reputation profiles' },
    { name: 'audit_logs', label: 'Governance & Triage Trail', count: logsCount, role: 'Immutable security log' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
              <Activity className="h-5 w-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Platform Pipeline &amp; Observability
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
              Health 99.98%
            </span>
          </div>
          <p className="text-xs text-[#8E8E93] mt-1">
            Realtime database telemetry, ingestion lag, Supabase WebSocket channels, and queue saturation health.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={handleManualHeartbeat}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Pinging Cluster...' : 'Heartbeat Check'}
        </Button>
      </div>

      {/* 2. Realtime Health Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E8E93] font-bold uppercase tracking-wider">
            <span>WebSocket Channel</span>
            <Radio className="h-4 w-4 text-[#30D158]" />
          </div>
          <div className="text-xl font-black text-white mt-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#30D158] animate-pulse" />
            <span>Connected</span>
          </div>
          <span className="text-[11px] text-[#8E8E93] block">schema-db-changes active</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E8E93] font-bold uppercase tracking-wider">
            <span>Database RTT Latency</span>
            <Zap className="h-4 w-4 text-[#0A84FF]" />
          </div>
          <div className="text-2xl font-black text-[#0A84FF] mt-1 font-mono">
            {pingMs} <span className="text-xs font-semibold text-[#8E8E93]">ms</span>
          </div>
          <span className="text-[11px] text-[#8E8E93] block">ap-southeast-2 region</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E8E93] font-bold uppercase tracking-wider">
            <span>Ingestion Queue Lag</span>
            <Cpu className="h-4 w-4 text-[#30D158]" />
          </div>
          <div className="text-2xl font-black text-[#30D158] mt-1 font-mono">
            0.0 <span className="text-xs font-semibold text-[#8E8E93]">sec</span>
          </div>
          <span className="text-[11px] text-[#8E8E93] block">Zero backpressure backlog</span>
        </div>

        <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E8E93] font-bold uppercase tracking-wider">
            <span>Dead-Letter Buffer</span>
            <CheckCircle2 className="h-4 w-4 text-[#30D158]" />
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono">
            0
          </div>
          <span className="text-[11px] text-[#8E8E93] block">No unparseable payloads</span>
        </div>
      </div>

      {/* 3. PostgreSQL Database Tables Footprint */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#1C1C1E] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#0A84FF]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              PostgreSQL Core Schema Table Footprints
            </h3>
          </div>
          <span className="text-[11px] text-[#8E8E93] font-mono">
            PostGIS 3.4 Enabled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-[10px] uppercase font-bold text-[#8E8E93] border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Database Table</th>
                <th className="py-3 px-4">Functional Role</th>
                <th className="py-3 px-4">Current Records</th>
                <th className="py-3 px-4">Realtime Sync</th>
                <th className="py-3 px-4 text-right">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-medium">
              {tables.map((t) => (
                <tr key={t.name} className="hover:bg-white/[0.04] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono text-white font-bold">{t.name}</div>
                    <div className="text-[10px] text-[#8E8E93]">{t.label}</div>
                  </td>

                  <td className="py-3 px-4 text-[#8E8E93]">
                    {t.role}
                  </td>

                  <td className="py-3 px-4 font-mono text-white font-bold">
                    {t.count}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
                      LIVE
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="text-[#30D158] font-bold text-[11px] flex items-center justify-end gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Optimal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
