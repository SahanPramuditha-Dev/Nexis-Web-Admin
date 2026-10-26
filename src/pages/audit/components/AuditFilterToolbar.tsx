import React from 'react';
import { Search, X } from 'lucide-react';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';

interface AuditFilterToolbarProps {
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  categoryCounts: { all: number; approvals: number; defense: number; policy: number; purges: number };
  search: string;
  onSearchChange: (q: string) => void;
}

export const AuditFilterToolbar: React.FC<AuditFilterToolbarProps> = ({
  categoryFilter,
  onCategoryFilterChange,
  categoryCounts,
  search,
  onSearchChange
}) => {
  return (
    <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
      
      {/* Category Tabs */}
      <div className="overflow-x-auto pb-1 lg:pb-0">
        <SegmentedControl
          options={[
            { id: 'ALL', label: 'All Actions', count: categoryCounts.all },
            { id: 'APPROVALS', label: 'Approvals', count: categoryCounts.approvals },
            { id: 'DEFENSE', label: 'Quarantine & Bans', count: categoryCounts.defense },
            { id: 'POLICY', label: 'Rules & Policy', count: categoryCounts.policy },
            { id: 'PURGES', label: 'Purges', count: categoryCounts.purges }
          ]}
          value={categoryFilter}
          onChange={onCategoryFilterChange}
        />
      </div>

      {/* Right Search Input */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E8E93]" />
        <input
          type="text"
          placeholder="Search by action, admin username, or target ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-1.5 bg-black/50 border border-white/[0.08] rounded-xl text-xs text-white placeholder-[#8E8E93] focus:outline-hidden focus:border-[#0A84FF]"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

    </div>
  );
};
