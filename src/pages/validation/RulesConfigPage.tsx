import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { telemetryService } from '../../services/telemetryService';
import { ValidationRuleConfig, TelemetryRecord } from '../../types/telemetry';
import { RulesHeader } from './components/RulesHeader';
import { RulesSimulationBanner } from './components/RulesSimulationBanner';
import { RulesSpeedCeilings } from './components/RulesSpeedCeilings';
import { RulesKinematicsAndPhysicsProps } from './components/RulesKinematicsAndPhysics';
import { RulesPrivacyAndSecurity } from './components/RulesPrivacyAndSecurity';
import { RulesUnsavedBar } from './components/RulesUnsavedBar';

const RULE_PRESETS: Record<string, { name: string; desc: string; rules: Partial<ValidationRuleConfig> }> = {
  itut: {
    name: 'ITU-T Standard',
    desc: 'Standard international physical bounds and differential privacy for crowdsourced cellular telemetry.',
    rules: {
      maxSpeed5GMbps: 2500,
      maxSpeed4GMbps: 600,
      maxSpeed3GMbps: 45,
      maxSpeedWifiMbps: 3500,
      minAllowedLatencyMs: 0.8,
      maxTransitVelocityKmH: 950,
      rejectMockLocations: true,
      rateLimitMaxPerHour: 60,
      hmacSignatureEnforced: true,
      iqrOutlierMultiplier: 1.5,
      autoQuarantineThresholdScore: 60,
      minContributorPrivacyThreshold: 5
    }
  },
  carrier: {
    name: 'Carrier Strict',
    desc: 'Tight production bounds for national cellular benchmarks and regulatory SLA audits.',
    rules: {
      maxSpeed5GMbps: 1800,
      maxSpeed4GMbps: 450,
      maxSpeed3GMbps: 30,
      maxSpeedWifiMbps: 2000,
      minAllowedLatencyMs: 1.2,
      maxTransitVelocityKmH: 700,
      rejectMockLocations: true,
      rateLimitMaxPerHour: 40,
      hmacSignatureEnforced: true,
      iqrOutlierMultiplier: 1.2,
      autoQuarantineThresholdScore: 70,
      minContributorPrivacyThreshold: 8
    }
  },
  hardened: {
    name: 'Anti-Spoof Hardened',
    desc: 'Maximum zero-trust defense posture against emulator injections and burst script flooding.',
    rules: {
      maxSpeed5GMbps: 2000,
      maxSpeed4GMbps: 500,
      maxSpeed3GMbps: 35,
      maxSpeedWifiMbps: 2500,
      minAllowedLatencyMs: 1.5,
      maxTransitVelocityKmH: 600,
      rejectMockLocations: true,
      rateLimitMaxPerHour: 30,
      hmacSignatureEnforced: true,
      iqrOutlierMultiplier: 1.0,
      autoQuarantineThresholdScore: 75,
      minContributorPrivacyThreshold: 10
    }
  },
  permissive: {
    name: 'Lab Permissive',
    desc: 'Expanded bounds for 5G mmWave laboratory stress-testing and high-speed transit trials.',
    rules: {
      maxSpeed5GMbps: 4500,
      maxSpeed4GMbps: 1200,
      maxSpeed3GMbps: 80,
      maxSpeedWifiMbps: 6000,
      minAllowedLatencyMs: 0.4,
      maxTransitVelocityKmH: 1400,
      rejectMockLocations: false,
      rateLimitMaxPerHour: 180,
      hmacSignatureEnforced: true,
      iqrOutlierMultiplier: 2.5,
      autoQuarantineThresholdScore: 40,
      minContributorPrivacyThreshold: 2
    }
  }
};

export const RulesConfigPage: React.FC = () => {
  const [savedRules, setSavedRules] = useState<ValidationRuleConfig>(telemetryService.getRules());
  const [draftRules, setDraftRules] = useState<ValidationRuleConfig>(telemetryService.getRules());
  const [records, setRecords] = useState<TelemetryRecord[]>(telemetryService.getRecords());
  const [isSaved, setIsSaved] = useState(false);
  const [isPurged, setIsPurged] = useState(false);

  useEffect(() => {
    const unsub = telemetryService.subscribe(() => {
      setSavedRules(telemetryService.getRules());
      setRecords(telemetryService.getRecords());
    });
    return () => unsub();
  }, []);

  const handleUpdateDraft = (updated: Partial<ValidationRuleConfig>) => {
    setDraftRules((prev) => ({ ...prev, ...updated }));
  };

  const handleApplyPreset = (key: string) => {
    const preset = RULE_PRESETS[key];
    if (preset) {
      setDraftRules((prev) => ({ ...prev, ...preset.rules }));
    }
  };

  const handleReset = () => {
    setDraftRules({ ...savedRules });
  };

  const handleSave = async () => {
    await telemetryService.updateRules(draftRules);
    setSavedRules({ ...draftRules });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handlePurgeExpired = async () => {
    await telemetryService.purgeExpiredRecords(30);
    setIsPurged(true);
    setTimeout(() => setIsPurged(false), 3000);
  };

  // Compute diffs between draft and saved
  const diffSummary = useMemo(() => {
    const diffs: string[] = [];
    if (draftRules.maxSpeed5GMbps !== savedRules.maxSpeed5GMbps) {
      diffs.push(`5G: ${savedRules.maxSpeed5GMbps} → ${draftRules.maxSpeed5GMbps} Mbps`);
    }
    if (draftRules.maxSpeed4GMbps !== savedRules.maxSpeed4GMbps) {
      diffs.push(`4G: ${savedRules.maxSpeed4GMbps} → ${draftRules.maxSpeed4GMbps} Mbps`);
    }
    if (draftRules.maxSpeed3GMbps !== savedRules.maxSpeed3GMbps) {
      diffs.push(`3G: ${savedRules.maxSpeed3GMbps} → ${draftRules.maxSpeed3GMbps} Mbps`);
    }
    if (draftRules.maxSpeedWifiMbps !== savedRules.maxSpeedWifiMbps) {
      diffs.push(`WiFi: ${savedRules.maxSpeedWifiMbps} → ${draftRules.maxSpeedWifiMbps} Mbps`);
    }
    if (draftRules.maxTransitVelocityKmH !== savedRules.maxTransitVelocityKmH) {
      diffs.push(`Velocity: ${savedRules.maxTransitVelocityKmH} → ${draftRules.maxTransitVelocityKmH} km/h`);
    }
    if (draftRules.minAllowedLatencyMs !== savedRules.minAllowedLatencyMs) {
      diffs.push(`Latency Floor: ${savedRules.minAllowedLatencyMs} → ${draftRules.minAllowedLatencyMs} ms`);
    }
    if (draftRules.rateLimitMaxPerHour !== savedRules.rateLimitMaxPerHour) {
      diffs.push(`Rate Limit: ${savedRules.rateLimitMaxPerHour} → ${draftRules.rateLimitMaxPerHour}/hr`);
    }
    if (draftRules.iqrOutlierMultiplier !== savedRules.iqrOutlierMultiplier) {
      diffs.push(`IQR Fence: ${savedRules.iqrOutlierMultiplier}x → ${draftRules.iqrOutlierMultiplier}x`);
    }
    if (draftRules.autoQuarantineThresholdScore !== savedRules.autoQuarantineThresholdScore) {
      diffs.push(`Auto-Quarantine: <${savedRules.autoQuarantineThresholdScore} → <${draftRules.autoQuarantineThresholdScore}`);
    }
    if (draftRules.minContributorPrivacyThreshold !== savedRules.minContributorPrivacyThreshold) {
      diffs.push(`k-Anon: ${savedRules.minContributorPrivacyThreshold} → ${draftRules.minContributorPrivacyThreshold} devices`);
    }
    if (draftRules.rejectMockLocations !== savedRules.rejectMockLocations) {
      diffs.push(`Mock GPS: ${savedRules.rejectMockLocations ? 'Enforced' : 'Off'} → ${draftRules.rejectMockLocations ? 'Enforced' : 'Off'}`);
    }
    return diffs;
  }, [draftRules, savedRules]);

  const hasChanges = diffSummary.length > 0;

  // Real-time Dry-Run Impact Simulator
  const simulation = useMemo(() => {
    const total = records.length;
    if (total === 0) {
      return {
        currentPassRate: 100,
        simulatedPassRate: 100,
        currentQuarantined: 0,
        simulatedQuarantined: 0,
        totalEvaluated: 0
      };
    }

    const currentVerified = records.filter((r) => r.status === 'VERIFIED').length;
    const currentQuarantined = records.filter(
      (r) => r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK'
    ).length;
    const currentPassRate = Math.round((currentVerified / total) * 100);

    // Run proposed rules against every record
    let simulatedQuarantined = 0;
    records.forEach((r) => {
      let isViolation = false;

      // 1. Radio ceiling
      if (r.networkType === '5G' && r.downloadMbps > draftRules.maxSpeed5GMbps) isViolation = true;
      if (r.networkType === 'LTE' && r.downloadMbps > draftRules.maxSpeed4GMbps) isViolation = true;
      if (r.networkType === '3G' && r.downloadMbps > draftRules.maxSpeed3GMbps) isViolation = true;
      if (r.networkType === 'WIFI' && r.downloadMbps > draftRules.maxSpeedWifiMbps) isViolation = true;

      // 2. Latency floor
      if (r.latencyMedianMs < draftRules.minAllowedLatencyMs) isViolation = true;

      // 3. Velocity ceiling
      if (r.velocityKmH && r.velocityKmH > draftRules.maxTransitVelocityKmH) isViolation = true;

      // 4. Mock location
      if (draftRules.rejectMockLocations && (r.proof?.isMockDetected || r.status === 'SPOOFED_MOCK')) {
        isViolation = true;
      }

      // 5. Score cutoff
      if (r.nexisScore < draftRules.autoQuarantineThresholdScore) isViolation = true;

      // If already quarantined originally or triggered violation
      if (isViolation || r.status === 'QUARANTINED' || r.status === 'SPOOFED_MOCK') {
        simulatedQuarantined++;
      }
    });

    const simulatedVerified = total - simulatedQuarantined;
    const simulatedPassRate = Math.max(0, Math.round((simulatedVerified / total) * 100));

    return {
      currentPassRate,
      simulatedPassRate,
      currentQuarantined,
      simulatedQuarantined,
      totalEvaluated: total
    };
  }, [records, draftRules]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-24">
      
      {/* 1. Header & Presets Toolbar */}
      <RulesHeader
        onApplyPreset={handleApplyPreset}
        onReset={handleReset}
        onSave={handleSave}
        hasChanges={hasChanges}
        isSaved={isSaved}
      />

      {/* 2. Live Dry-Run Simulation Banner */}
      <RulesSimulationBanner
        currentPassRate={simulation.currentPassRate}
        simulatedPassRate={simulation.simulatedPassRate}
        currentQuarantined={simulation.currentQuarantined}
        simulatedQuarantined={simulation.simulatedQuarantined}
        totalEvaluated={simulation.totalEvaluated}
      />

      {/* 3. Radio Speed Ceilings */}
      <RulesSpeedCeilings
        rules={draftRules}
        onChange={handleUpdateDraft}
      />

      {/* 4. Kinematics, Latency & IQR Statistical Outlier Fences */}
      <RulesKinematicsAndPhysicsProps
        rules={draftRules}
        onChange={handleUpdateDraft}
      />

      {/* 5. Zero-Trust Confidence & Privacy */}
      <RulesPrivacyAndSecurity
        rules={draftRules}
        onChange={handleUpdateDraft}
        onPurgeExpired={handlePurgeExpired}
        isPurged={isPurged}
      />

      {/* 6. Floating Unsaved Changes Tray */}
      <RulesUnsavedBar
        modifiedCount={diffSummary.length}
        diffSummary={diffSummary}
        onSave={handleSave}
        onRevert={handleReset}
      />

    </div>
  );
};

export default RulesConfigPage;
