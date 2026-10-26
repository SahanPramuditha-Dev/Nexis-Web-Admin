import React, { useState, useMemo } from 'react';
import { Radio, Search, ArrowUpDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CarrierStats } from '../types';

interface CarriersBenchmarkTableProps {
  carriers: CarrierStats[];
  selectedCarrierName: string;
  onSelectCarrier: (name: string) => void;
}

type SortField = 'name' | 'samples' | 'avgDownload' | 'avgUpload' | 'avgLatency' | 'avgJitter' | 'avgLoss' | 'pct5G' | 'slaOverallPass';
type SortDirection = 'asc' | 'desc';

export const CarriersBenchmarkTable: React.FC<CarriersBenchmarkTableProps> = ({
  carriers,
  selectedCarrierName,
  onSelectCarrier
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('samples');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  const filteredAndSortedCarriers = useMemo(() => {
    let list = carriers.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (Number(aVal) - Number(bVal)) : (Number(bVal) - Number(aVal));
    });

    return list;
  }, [carriers, searchQuery, sortField, sortDirection]);

  // Operator Brand Styling
  const getCarrierColor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('dialog')) return '#FF5E00';
    if (lower.includes('mobitel')) return '#0A84FF';
    if (lower.includes('airtel')) return '#FF3B30';
    if (lower.includes('hutch')) return '#FF9500';
    if (lower.includes('slt')) return '#64D2FF';
    return '#8E8E93';
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#1C1C1E] overflow-hidden shadow-sm space-y-0">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/20">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-[#0A84FF]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            All Network Operators Scorecard Table
          </h3>
          <span className="text-[11px] text-[#8E8E93] ml-1">
            ({filteredAndSortedCarriers.length} of {carriers.length})
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8E8E93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter operators..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#0A84FF] transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/40 text-[10px] uppercase font-bold text-[#8E8E93] border-b border-white/[0.08]">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Operator
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('samples')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Samples
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('avgDownload')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Download
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('avgUpload')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Upload
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('avgLatency')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Latency
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('avgJitter')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Jitter
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('avgLoss')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Loss
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('pct5G')}
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  5G Share
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('slaOverallPass')}
                className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  SLA Score
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] font-medium">
            {filteredAndSortedCarriers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs text-[#8E8E93]">
                  No network operators match the filter criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedCarriers.map((c) => {
                const isSelected = selectedCarrierName === c.name;
                const brandColor = getCarrierColor(c.name);

                return (
                  <tr
                    key={c.name}
                    onClick={() => onSelectCarrier(c.name)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#0A84FF]/10 hover:bg-[#0A84FF]/15'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: brandColor }}
                        />
                        <span className={`font-bold ${isSelected ? 'text-[#0A84FF]' : 'text-white'}`}>
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-[#8E8E93]">
                      <div className="text-white">{c.samples.toLocaleString()}</div>
                      <div className="text-[10px] text-[#8E8E93]">{c.sampleSharePct}% of total</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-[#30D158] font-bold">
                      {c.avgDownload} <span className="text-[10px] font-normal text-[#8E8E93]">Mbps</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-[#0A84FF] font-bold">
                      {c.avgUpload} <span className="text-[10px] font-normal text-[#8E8E93]">Mbps</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-white font-bold">
                      {c.avgLatency} <span className="text-[10px] font-normal text-[#8E8E93]">ms</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-[#8E8E93]">
                      &plusmn;{c.avgJitter} ms
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-[#8E8E93]">
                      {c.avgLoss}%
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-[#BF5AF2] font-bold">
                      {c.pct5G}%
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono-num text-[11px] font-bold border inline-flex items-center gap-1 ${
                        c.slaOverallPass >= 90
                          ? 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30'
                          : c.slaOverallPass >= 75
                          ? 'bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30'
                          : 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30'
                      }`}>
                        {c.slaOverallPass}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
