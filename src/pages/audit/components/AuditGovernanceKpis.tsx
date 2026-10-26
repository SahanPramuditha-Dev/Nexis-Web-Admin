import React from 'react';
import { History, ShieldCheck, Sliders, Users } from 'lucide-react';

interface AuditGovernanceKpisProps {
  totalLogs: number;
  securityOverrides: number;
  ruleUpdates: number;
  activeOperators: number;
}

export const AuditGovernanceKpis: React.FC<AuditGovernanceKpisProps> = ({
  totalLogs,
  securityOverrides,
  ruleUpdates,
  activeOperators
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      
      {/* 1. Total Audit Events */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Total Audit Logs</span>
          <History className="h-3.5 w-3.5 text-[#0A84FF]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {totalLogs}
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">entries</span>
        </div>
      </div>

      {/* 2. Security Overrides */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Security Overrides</span>
          <ShieldCheck className="h-3.5 w-3.5 text-[#30D158]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {securityOverrides}
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">actions</span>
        </div>
      </div>

      {/* 3. Rule & Policy Alterations */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Policy Updates</span>
          <Sliders className="h-3.5 w-3.5 text-[#BF5AF2]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {ruleUpdates}
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">revisions</span>
        </div>
      </div>

      {/* 4. Active Admin Operators */}
      <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/[0.08] space-y-1">
        <div className="flex items-center justify-between text-[#8E8E93]">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Admin Operators</span>
          <Users className="h-3.5 w-3.5 text-[#64D2FF]" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-white font-mono-num">
          {activeOperators}
          <span className="text-xs font-normal text-[#8E8E93] ml-1.5">identities</span>
        </div>
      </div>

    </div>
  );
};
