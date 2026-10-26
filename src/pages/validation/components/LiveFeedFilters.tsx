import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Signal, ShieldAlert, X } from 'lucide-react';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';

export type FeedStatusFilter = 'ALL' | 'VERIFIED' | 'QUARANTINED';
export type SortOption = 'newest' | 'oldest' | 'speed_desc' | 'latency_asc' | 'score_asc';

interface LiveFeedFiltersProps {
  statusFilter: FeedStatusFilter;
  onStatusFilterChange: (s: FeedStatusFilter) => void;
  statusCounts: { all: number; verified: number; quarantined: number };
  
  selectedRats: string[];
  onToggleRat: (rat: string) => void;
  
  selectedCarrier: string;
  onCarrierChange: (c: string) => void;
  availableCarriers: string[];

  onlyWeakSignal: boolean;
  onToggleWeakSignal: () => void;

  onlyAnomalies: boolean;
  onToggleOnlyAnomalies: () => void;

  sortOption: SortOption;
  onSortChange: (s: SortOption) => void;

  searchQuery: string;
  onSearchChange: (q: string) => void;

  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const LiveFeedFilters: React.FC<LiveFeedFiltersProps> = ({
  statusFilter,
  onStatusFilterChange,
  statusCounts,
  selectedRats,
  onToggleRat,
  selectedCarrier,
  onCarrierChange,
  availableCarriers,
  onlyWeakSignal,
  onToggleWeakSignal,
  onlyAnomalies,
  onToggleOnlyAnomalies,
  sortOption,
  onSortChange,
  searchQuery,
  onSearchChange,
  onResetFilters,
  hasActiveFilters
}) => {
  const rats = ['5G', 'LTE', '3G', 'WIFI'];

  return (
    <div className="p-4 md:p-5 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] space-y-4">
      
      {/* Top Filter Row: Status Segmented Control + Search + Sort */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Status Segmented Control */}
        <SegmentedControl
          options={[
            { id: 'ALL', label: 'All', count: statusCounts.all },
            { id: 'VERIFIED', label: 'Verified', count: statusCounts.verified },
            { id: 'QUARANTINED', label: 'Quarantined', count: statusCounts.quarantined }
          ]}
          value={statusFilter}
          onChange={onStatusFilterChange}
          className="w-full lg:w-auto"
        />

        {/* Right Search & Sort */}
        <div className="flex items-center gap-2.5 flex-1 max-w-lg">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E8E93]" />
            <input
              type="text"
              placeholder="Filter by device, city, S2 cell, or carrier..."
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

          {/* Sort Selector */}
          <div className="relative shrink-0">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-black/50 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#0A84FF] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="speed_desc">Fastest Download</option>
              <option value="latency_asc">Lowest Latency</option>
              <option value="score_asc">Lowest Integrity Score</option>
            </select>
          </div>
        </div>

      </div>

      {/* Secondary Filter Row: RAT Pills, Carrier Filter, Signal Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs">
        
        {/* Left: RAT Pills & Carrier */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#8E8E93] uppercase mr-1">RAT:</span>
          {rats.map((rat) => {
            const isSelected = selectedRats.includes(rat);
            return (
              <button
                key={rat}
                type="button"
                onClick={() => onToggleRat(rat)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-[#0A84FF]/20 text-[#0A84FF] border-[#0A84FF]/40'
                    : 'bg-black/40 text-[#8E8E93] border-white/[0.06] hover:text-white'
                }`}
              >
                {rat}
              </button>
            );
          })}

          <span className="text-white/20 mx-1">•</span>

          {/* Carrier Dropdown */}
          <select
            value={selectedCarrier}
            onChange={(e) => onCarrierChange(e.target.value)}
            className="bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-[#0A84FF]"
          >
            <option value="ALL">All Carriers</option>
            {availableCarriers.map((carrier) => (
              <option key={carrier} value={carrier}>
                {carrier}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Quick Toggles (Weak Signal, Anomalies Only, Reset) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Weak Signal Toggle */}
          <button
            type="button"
            onClick={onToggleWeakSignal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              onlyWeakSignal
                ? 'bg-[#FF9F0A]/20 text-[#FF9F0A] border-[#FF9F0A]/40'
                : 'bg-black/40 text-[#8E8E93] border-white/[0.06] hover:text-white'
            }`}
          >
            <Signal className="h-3 w-3" />
            <span>Weak Signal (&lt; -100 dBm)</span>
          </button>

          {/* Anomalies Only Toggle */}
          <button
            type="button"
            onClick={onToggleOnlyAnomalies}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              onlyAnomalies
                ? 'bg-[#FF453A]/20 text-[#FF453A] border-[#FF453A]/40'
                : 'bg-black/40 text-[#8E8E93] border-white/[0.06] hover:text-white'
            }`}
          >
            <ShieldAlert className="h-3 w-3" />
            <span>Anomalies Only</span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] text-[#8E8E93] hover:text-white underline cursor-pointer ml-1"
            >
              Reset
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
