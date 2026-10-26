import React from 'react';
import { Radio, CheckCircle2, AlertTriangle, Smartphone, MapPin } from 'lucide-react';
import { MetricTile } from '../../../components/ui/MetricTile';

interface DashboardKpiGridProps {
  total: number;
  verified: number;
  quarantined: number;
  probesCount: number;
  cellsCount: number;
  timeWindowLabel: string;
}

export const DashboardKpiGrid: React.FC<DashboardKpiGridProps> = ({
  total,
  verified,
  quarantined,
  probesCount,
  cellsCount,
  timeWindowLabel
}) => {
  const verifiedPct = total > 0 ? Math.round((verified / total) * 100) : 100;
  
  // Grade pass rate
  const passTint: 'green' | 'orange' | 'red' = 
    verifiedPct >= 90 ? 'green' : verifiedPct >= 75 ? 'orange' : 'red';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      <MetricTile
        label="Total Telemetry Ingested"
        value={total}
        subValue="payloads"
        icon={Radio}
        tint="blue"
        trend={{
          direction: 'neutral',
          text: `${timeWindowLabel}`
        }}
      />

      <MetricTile
        label="Zero-Trust Pass Rate"
        value={`${verifiedPct}%`}
        subValue={`${verified} cryptographically verified`}
        icon={CheckCircle2}
        tint={passTint}
        trend={{
          direction: verifiedPct >= 90 ? 'up' : 'down',
          text: verifiedPct >= 90 ? 'Sound RF physics & proofs' : 'Elevated rejection rate'
        }}
      />

      <MetricTile
        label="Quarantine & Spoofed"
        value={quarantined}
        subValue={quarantined > 0 ? 'review required' : 'all clean'}
        icon={AlertTriangle}
        tint={quarantined > 0 ? 'red' : 'gray'}
        trend={{
          direction: quarantined > 0 ? 'down' : 'neutral',
          text: quarantined > 0 ? `${quarantined} anomalous events` : 'Zero active breaches'
        }}
      />

      <MetricTile
        label="Registered Fleet Probes"
        value={probesCount}
        subValue={`${cellsCount} S2 cells mapped`}
        icon={Smartphone}
        tint="purple"
        trend={{
          direction: 'up',
          text: 'Decentralized crowdsource'
        }}
      />
    </div>
  );
};
