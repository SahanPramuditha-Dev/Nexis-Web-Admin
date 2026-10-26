import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface MeasurementFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  ispFilter: string;
  setIspFilter: (val: string) => void;
  availableIsps: string[];
  gradeFilter: string;
  setGradeFilter: (val: string) => void;
  sortBy: 'recent' | 'download' | 'latency' | 'bufferbloat';
  setSortBy: (val: 'recent' | 'download' | 'latency' | 'bufferbloat') => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export const MeasurementFilters: React.FC<MeasurementFiltersProps> = ({
  search,
  setSearch,
  ispFilter,
  setIspFilter,
  availableIsps,
  gradeFilter,
  setGradeFilter,
  sortBy,
  setSortBy,
  onResetFilters,
  isFiltered
}) => {
  const grades = ['ALL', 'A+', 'A', 'B', 'C', 'D', 'F'];

  return (
    <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/[0.08] shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E8E93]" />
          <input
            type="text"
            placeholder="Search by Test ID, ISP, ASN, City, or Client IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#0A84FF] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ISP Selector */}
          <select
            value={ispFilter}
            onChange={(e) => setIspFilter(e.target.value)}
            className="px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-[#0A84FF] transition-all cursor-pointer"
          >
            <option value="ALL">All ISPs & Carriers</option>
            {availableIsps.map((isp) => (
              <option key={isp} value={isp}>{isp}</option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white focus:outline-none focus:border-[#0A84FF] transition-all cursor-pointer"
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="download">Sort: Highest Download</option>
            <option value="latency">Sort: Lowest Latency</option>
            <option value="bufferbloat">Sort: Highest Bufferbloat</option>
          </select>

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Bufferbloat Grade Chips */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/[0.04]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] mr-1.5">
          Grade:
        </span>
        {grades.map((g) => (
          <button
            key={g}
            onClick={() => setGradeFilter(g)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
              gradeFilter === g
                ? 'bg-[#0A84FF] text-white shadow-sm'
                : 'bg-black/30 border border-white/[0.06] text-[#8E8E93] hover:text-white'
            }`}
          >
            {g === 'ALL' ? 'All Grades' : `Grade ${g}`}
          </button>
        ))}
      </div>
    </div>
  );
};
