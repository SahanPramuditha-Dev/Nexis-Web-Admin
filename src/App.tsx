import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { LiveFeedPage } from './pages/validation/LiveFeedPage';
import { QuarantinePage } from './pages/validation/QuarantinePage';
import { RulesConfigPage } from './pages/validation/RulesConfigPage';
import { S2MapPage } from './pages/spatial/S2MapPage';
import { MeasurementExplorerPage } from './pages/measurements/MeasurementExplorerPage';
import { CarriersPage } from './pages/carriers/CarriersPage';
import { PrivacyControlPage } from './pages/privacy/PrivacyControlPage';
import { ProbesPage } from './pages/probes/ProbesPage';
import { AuditPage } from './pages/audit/AuditPage';
import { TeamManagementPage } from './pages/team/TeamManagementPage';
import { ObservabilityPage } from './pages/platform/ObservabilityPage';
import { FeatureFlagsPage } from './pages/platform/FeatureFlagsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<DashboardPage />} />
          <Route path="validation/feed" element={<LiveFeedPage />} />
          <Route path="validation/quarantine" element={<QuarantinePage />} />
          <Route path="validation/rules" element={<RulesConfigPage />} />
          <Route path="measurements" element={<MeasurementExplorerPage />} />
          <Route path="carriers" element={<CarriersPage />} />
          <Route path="privacy" element={<PrivacyControlPage />} />
          <Route path="spatial/map" element={<S2MapPage />} />
          <Route path="probes" element={<ProbesPage />} />
          <Route path="admin/team" element={<TeamManagementPage />} />
          <Route path="platform/observability" element={<ObservabilityPage />} />
          <Route path="platform/flags" element={<FeatureFlagsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
