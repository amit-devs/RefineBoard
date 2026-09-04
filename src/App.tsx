import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/context/AppProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ToastContainer } from '@/components/ui';

import { Dashboard } from '@/pages/Dashboard';
import { ProductBacklog } from '@/pages/ProductBacklog';
import { RefinementBoard } from '@/pages/RefinementBoard';
import { PriorityMatrix } from '@/pages/PriorityMatrix';
import { QualityChecks } from '@/pages/QualityChecks';
import { Reports } from '@/pages/Reports';
import { UserStoriesPage } from '@/pages/UserStoriesPage';
import { AcceptanceCriteriaPage } from '@/pages/AcceptanceCriteriaPage';
import { Sprints } from '@/pages/Sprints';
import { Team } from '@/pages/Team';
import { Settings } from '@/pages/Settings';

interface RouteConfig {
  path: string;
  title: string;
  subtitle?: string;
  element: React.ReactNode;
}

const ROUTES: RouteConfig[] = [
  { path: '/', title: 'Dashboard', subtitle: 'Backlog health and refinement overview', element: <Dashboard /> },
  { path: '/backlog', title: 'Product Backlog', subtitle: 'Refine, prioritize, and prepare stories for development', element: <ProductBacklog /> },
  { path: '/refinement', title: 'Refinement Board', element: <RefinementBoard /> },
  { path: '/matrix', title: 'Priority Matrix', element: <PriorityMatrix /> },
  { path: '/quality', title: 'Quality Checks', subtitle: 'Backlog quality analysis and story readiness evaluation', element: <QualityChecks /> },
  { path: '/reports', title: 'Reports', subtitle: 'Backlog health metrics and quality insights', element: <Reports /> },
  { path: '/stories', title: 'User Stories', subtitle: 'Manage all user stories', element: <UserStoriesPage /> },
  { path: '/criteria', title: 'Acceptance Criteria', subtitle: 'All acceptance criteria across stories', element: <AcceptanceCriteriaPage /> },
  { path: '/sprints', title: 'Sprints', subtitle: 'Sprint planning and management', element: <Sprints /> },
  { path: '/team', title: 'Team', subtitle: 'Team members and workload', element: <Team /> },
  { path: '/settings', title: 'Settings', subtitle: 'Workspace and application preferences', element: <Settings /> },
];

function AppLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-ivory overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {ROUTES.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <AppLayout title={route.title} subtitle={route.subtitle}>
                  {route.element}
                </AppLayout>
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
