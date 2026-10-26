import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';

interface ProbesFilterToolbarProps {
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  statusCounts: { all: number; active: number; probationary: number; shadowBanned: number };
  platformFilter: string;
  onPlatformFilterChange: (p: string) => void;
  sortOption: string;
  onSortChange: (s: string) => void;
  search: string;
  onSearchChange: (q: string) => void;
}

export const ProbesFilterToolbar: React.FC<ProbesFilterToolbarProps> = ({
  statusFilter,
  onStatusFilterChange,
  statusCounts,
  platformFilter,
  onPlatformFilterChange,
  sortOption,
  onSortChange,
  search,
  onSearchChange
}) => {
  return (
    <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
      
      {/* Left: Status Segmented Control */}
      <div className="overflow-x-auto pb-1 lg:pb-0">
        <SegmentedControl
          options={[
            { id: 'ALL', label: 'All Fleets', count: statusCounts.all },
            { id: 'ACTIVE', label: 'Active', count: statusCounts.active },
            { id: 'PROBATIONARY', label: 'Probationary', count: statusCounts.probationary },
            { id: 'SHADOW_BANNED', label: 'Shadow-Banned', count: statusCounts.shadowBanned }
          ]}
          value={statusFilter}
          onChange={onStatusFilterChange}
        />
      </div>

      {/* Right: Search, Platform & Sort */}
      <div className="flex items-center gap-2.5 flex-1 max-w-lg justify-end">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E8E93]" />
          <input
            type="text"
            placeholder="Search probes by ID, phone model, location..."
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

        {/* Platform Dropdown */}
        <select
          value={platformFilter}
          onChange={(e) => onPlatformFilterChange(e.target.value)}
          className="bg-black/50 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#0A84FF] cursor-pointer"
        >
          <option value="ALL">All Platforms</option>
          <option value="Android">Android</option>
          <option value="iOS">iOS</option>
          <option value="Web">Web Client</option>
        </select>

        {/* Sort Dropdown */}
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-black/50 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#0A84FF] cursor-pointer"
        >
          <option value="trust_desc">Highest Trust Score</option>
          <option value="trust_asc">Lowest Trust Score</option>
          <option value="submissions_desc">Most Submissions</option>
          <option value="recent">Recently Active</option>
        </select>
      </div>

    </div>
  );
};
