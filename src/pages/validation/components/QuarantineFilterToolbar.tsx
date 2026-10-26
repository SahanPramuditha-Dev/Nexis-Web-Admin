import React from 'react';
import { Search, Filter, CheckSquare, Square, X } from 'lucide-react';

interface QuarantineFilterToolbarProps {
  anomalyFilter: string;
  onAnomalyFilterChange: (a: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCount: number;
  totalFiltered: number;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
}

export const QuarantineFilterToolbar: React.FC<QuarantineFilterToolbarProps> = ({
  anomalyFilter,
  onAnomalyFilterChange,
  searchQuery,
  onSearchChange,
  selectedCount,
  totalFiltered,
  onToggleSelectAll,
  isAllSelected
}) => {
  return (
    <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      
      {/* Left: Master Checkbox & Count */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSelectAll}
          className="flex items-center gap-2 font-semibold text-[#8E8E93] hover:text-white transition-colors cursor-pointer select-none"
        >
          {isAllSelected && totalFiltered > 0 ? (
            <CheckSquare className="h-4 w-4 text-[#0A84FF]" />
          ) : (
            <Square className="h-4 w-4 text-[#8E8E93]" />
          )}
          <span>
            {selectedCount > 0 ? (
              <span className="text-white">
                {selectedCount} of {totalFiltered} Selected
              </span>
            ) : (
              `Select All (${totalFiltered})`
            )}
          </span>
        </button>
      </div>

      {/* Right: Anomaly Filter Dropdown & Search */}
      <div className="flex items-center gap-2.5 flex-1 max-w-lg justify-end">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E8E93]" />
          <input
            type="text"
            placeholder="Search by device ID, carrier, city, S2 cell..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-black/50 border border-white/[0.08] rounded-xl text-xs text-white placeholder-[#8E8E93] focus:outline-hidden focus:border-[#0A84FF]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Anomaly Category Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Filter className="h-3.5 w-3.5 text-[#8E8E93]" />
          <select
            value={anomalyFilter}
            onChange={(e) => onAnomalyFilterChange(e.target.value)}
            className="bg-black/50 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#0A84FF] cursor-pointer"
          >
            <option value="ALL">All Threat Categories</option>
            <option value="MOCK_LOCATION_ACTIVE">GPS Mock Location</option>
            <option value="IMPOSSIBLE_SPEED_FOR_TECH">Radio Speed Ceiling Breached</option>
            <option value="VELOCITY_TELEPORTATION">Velocity Teleportation (&gt; 950 km/h)</option>
            <option value="IMPOSSIBLE_LOW_LATENCY">Impossible Low Latency (&lt; 0.8 ms)</option>
            <option value="HMAC_SIGNATURE_MISMATCH">HMAC Signature Mismatch</option>
          </select>
        </div>
      </div>

    </div>
  );
};
