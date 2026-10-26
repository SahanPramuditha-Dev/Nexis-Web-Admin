import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  ShieldAlert, 
  Mail, 
  Clock, 
  Trash2, 
  Key, 
  Check, 
  X,
  Lock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export type AdminRole = 'SuperAdmin' | 'TriageAnalyst' | 'Auditor' | 'ReadOnly';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  lastActive: string;
}

const INITIAL_TEAM: AdminUser[] = [
  {
    id: 'usr-adm-01',
    name: 'Sahan Pramuditha',
    email: 'admin@nexis.io',
    role: 'SuperAdmin',
    status: 'ACTIVE',
    lastActive: 'Just now'
  },
  {
    id: 'usr-anl-02',
    name: 'Kasun Bandara',
    email: 'k.bandara@nexis.io',
    role: 'TriageAnalyst',
    status: 'ACTIVE',
    lastActive: '24 mins ago'
  },
  {
    id: 'usr-aud-03',
    name: 'Dilini Perera',
    email: 'd.perera@telecom-reg.gov.lk',
    role: 'Auditor',
    status: 'ACTIVE',
    lastActive: 'Yesterday at 17:42'
  },
  {
    id: 'usr-ro-04',
    name: 'Network Ops NOC',
    email: 'noc@dialog.lk',
    role: 'ReadOnly',
    status: 'ACTIVE',
    lastActive: '3 days ago'
  }
];

export const TeamManagementPage: React.FC = () => {
  const [team, setTeam] = useState<AdminUser[]>(INITIAL_TEAM);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('TriageAnalyst');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    const newUser: AdminUser = {
      id: `usr-${Date.now().toString(36)}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'INVITED',
      lastActive: 'Invitation pending'
    };

    setTeam([...team, newUser]);
    setIsInviteOpen(false);
    setInviteEmail('');
    setInviteName('');
  };

  const handleRemove = (id: string) => {
    if (confirm('Revoke administrative access for this user?')) {
      setTeam(team.filter((u) => u.id !== id));
    }
  };

  const roleBadges: Record<AdminRole, string> = {
    SuperAdmin: 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30',
    TriageAnalyst: 'bg-[#0A84FF]/15 text-[#0A84FF] border-[#0A84FF]/30',
    Auditor: 'bg-[#BF5AF2]/15 text-[#BF5AF2] border-[#BF5AF2]/30',
    ReadOnly: 'bg-white/10 text-[#8E8E93] border-white/20'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
              <Users className="h-5 w-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Administration &amp; Team RBAC
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30">
              Supabase Auth Guard
            </span>
          </div>
          <p className="text-xs text-[#8E8E93] mt-1">
            Manage administrative console permissions, operator roles, and zero-trust triage access credentials.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={UserPlus}
          onClick={() => setIsInviteOpen(true)}
        >
          Invite Administrator
        </Button>
      </div>

      {/* 2. Team Roster Table */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#1C1C1E] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Active Administrators ({team.length})
          </h3>
          <span className="text-[11px] text-[#8E8E93] font-mono">
            Role-Based Access Control Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 text-[10px] uppercase font-bold text-[#8E8E93] border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-medium">
              {team.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-[#0A84FF]/20 border border-[#0A84FF]/40 text-[#0A84FF] flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-[#8E8E93] flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadges[u.role]}`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {u.status === 'ACTIVE' && (
                      <span className="text-[#30D158] font-bold text-[11px] flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#30D158]" />
                        Active
                      </span>
                    )}
                    {u.status === 'INVITED' && (
                      <span className="text-[#FF9F0A] font-bold text-[11px] flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF9F0A]" />
                        Invited
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-[#8E8E93] font-mono text-[11px]">
                    {u.lastActive}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {u.role !== 'SuperAdmin' ? (
                      <button
                        onClick={() => handleRemove(u.id)}
                        className="p-1.5 rounded-lg text-[#8E8E93] hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors"
                        title="Revoke access"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#8E8E93] font-mono">Primary Admin</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Role Permissions Hierarchy Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FF453A] uppercase tracking-wider">SuperAdmin</span>
            <Lock className="h-4 w-4 text-[#FF453A]" />
          </div>
          <p className="text-[11px] text-[#8E8E93] leading-relaxed">
            Unrestricted access: modifies physical speed ceilings, executes retention data purges, manages team roles, and issues shadow bans.
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0A84FF] uppercase tracking-wider">TriageAnalyst</span>
            <ShieldCheck className="h-4 w-4 text-[#0A84FF]" />
          </div>
          <p className="text-[11px] text-[#8E8E93] leading-relaxed">
            Operations level: inspects incoming live feed, approves or quarantines anomalies, injects sandbox test simulations.
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#BF5AF2] uppercase tracking-wider">Auditor</span>
            <Clock className="h-4 w-4 text-[#BF5AF2]" />
          </div>
          <p className="text-[11px] text-[#8E8E93] leading-relaxed">
            Regulatory & compliance: read-only access to governance audit logs, carrier SLA scorecards, and k-anonymity reports.
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">ReadOnly</span>
            <Key className="h-4 w-4 text-[#8E8E93]" />
          </div>
          <p className="text-[11px] text-[#8E8E93] leading-relaxed">
            Executive view: read access to Command Center dashboard, S2 spatial coverage map, and high-level charts.
          </p>
        </div>
      </div>

      {/* 4. Invite Administrator Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#1C1C1E] border border-white/[0.12] rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[#0A84FF]" />
                Invite Administrator
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-[#8E8E93] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div>
                <label className="text-[#8E8E93] font-semibold mb-1 block">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyantha Silva"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/[0.08] rounded-xl text-white placeholder-[#8E8E93] focus:outline-hidden focus:border-[#0A84FF]"
                />
              </div>

              <div>
                <label className="text-[#8E8E93] font-semibold mb-1 block">Work Email:</label>
                <input
                  type="email"
                  required
                  placeholder="priyantha@nexis.io"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/[0.08] rounded-xl text-white placeholder-[#8E8E93] focus:outline-hidden focus:border-[#0A84FF]"
                />
              </div>

              <div>
                <label className="text-[#8E8E93] font-semibold mb-1 block">Assigned Role:</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/[0.08] rounded-xl text-white focus:outline-hidden focus:border-[#0A84FF]"
                >
                  <option value="TriageAnalyst">TriageAnalyst (Triage & Approvals)</option>
                  <option value="Auditor">Auditor (Compliance & Logs)</option>
                  <option value="ReadOnly">ReadOnly (Dashboard Viewer)</option>
                  <option value="SuperAdmin">SuperAdmin (Full Permissions)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Send Access Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
