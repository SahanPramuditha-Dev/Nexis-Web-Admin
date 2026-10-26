import React, { useState, useEffect } from 'react';
import { telemetryService } from '../../services/telemetryService';
import { PrivacyHeader } from './components/PrivacyHeader';
import { PrivacyKpis } from './components/PrivacyKpis';
import { PrivacyComplianceMeter } from './components/PrivacyComplianceMeter';
import { PrivacyGuardrailForm } from './components/PrivacyGuardrailForm';
import { PrivacyGdprPurgeCard } from './components/PrivacyGdprPurgeCard';

export const PrivacyControlPage: React.FC = () => {
  const [rules, setRules] = useState(telemetryService.getRules());
  const [cells, setCells] = useState(telemetryService.getCells());
  const [records, setRecords] = useState(telemetryService.getRecords());
  const [kAnonThreshold, setKAnonThreshold] = useState<number>(rules.minContributorPrivacyThreshold || 5);
  const [retentionDays, setRetentionDays] = useState<number>(30);

  useEffect(() => {
    const unsub = telemetryService.subscribe(() => {
      setRules(telemetryService.getRules());
      setCells(telemetryService.getCells());
      setRecords(telemetryService.getRecords());
    });
    return () => unsub();
  }, []);

  const totalCells = cells.length;
  const passedCells = cells.filter((c) => c.kAnonPassed).length;
  const suppressedCells = totalCells - passedCells;
  const privacyCompliancePct = totalCells > 0 ? Math.round((passedCells / totalCells) * 100) : 100;

  const handleSaveThreshold = async (threshold: number) => {
    const updated = {
      ...rules,
      minContributorPrivacyThreshold: threshold
    };
    await telemetryService.updateRules(updated, 'PrivacyOfficer');
  };

  const handleExecutePurge = async (days: number) => {
    await telemetryService.purgeExpiredRecords(days, 'PrivacyOfficer');
  };

  const handleRefresh = () => {
    setRules(telemetryService.getRules());
    setCells(telemetryService.getCells());
    setRecords(telemetryService.getRecords());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Header with Live Status & Re-evaluate */}
      <PrivacyHeader
        totalCells={totalCells}
        compliancePct={privacyCompliancePct}
        onRefresh={handleRefresh}
      />

      {/* 2. Privacy Pillars KPI Tiles */}
      <PrivacyKpis
        kAnonThreshold={kAnonThreshold}
        retentionDays={retentionDays}
        compliancePct={privacyCompliancePct}
        passedCells={passedCells}
        totalCells={totalCells}
      />

      {/* 3. Live k-Anonymity Audit Meter */}
      <PrivacyComplianceMeter
        totalCells={totalCells}
        passedCells={passedCells}
        suppressedCells={suppressedCells}
        compliancePct={privacyCompliancePct}
        kAnonThreshold={kAnonThreshold}
      />

      {/* 4. Two-Column Controls: Dynamic Threshold Adjustment & GDPR Retention Prune */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PrivacyGuardrailForm
          kAnonThreshold={kAnonThreshold}
          setKAnonThreshold={setKAnonThreshold}
          onSave={handleSaveThreshold}
        />

        <PrivacyGdprPurgeCard
          retentionDays={retentionDays}
          setRetentionDays={setRetentionDays}
          onPurge={handleExecutePurge}
        />
      </div>
    </div>
  );
};

export default PrivacyControlPage;
