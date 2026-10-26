import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ProofInspectorModal } from '../inspector/ProofInspectorModal';
import { GlobalCommandPalette } from '../common/GlobalCommandPalette';
import { TelemetryRecord } from '../../types/telemetry';

export const Shell: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [inspectedRecord, setInspectedRecord] = useState<TelemetryRecord | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Content View with Inspector Modal Context pass-through */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <Outlet context={{ onInspect: setInspectedRecord }} />
        </main>
      </div>

      {/* Global Modals */}
      <GlobalCommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <ProofInspectorModal
        record={inspectedRecord}
        onClose={() => setInspectedRecord(null)}
      />

    </div>
  );
};
