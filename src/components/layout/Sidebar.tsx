import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  ListOrdered,
  Kanban,
  Target,
  ShieldCheck,
  BarChart3,
  BookOpen,
  CheckSquare,
  Zap,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Diamond,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
}

const WORKSPACE_NAV: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={15} />, to: '/' },
  { label: 'Product Backlog', icon: <ListOrdered size={15} />, to: '/backlog' },
  { label: 'Refinement Board', icon: <Kanban size={15} />, to: '/refinement' },
  { label: 'Priority Matrix', icon: <Target size={15} />, to: '/matrix' },
  { label: 'Quality Checks', icon: <ShieldCheck size={15} />, to: '/quality' },
  { label: 'Reports', icon: <BarChart3 size={15} />, to: '/reports' },
];

const MANAGEMENT_NAV: NavItem[] = [
  { label: 'User Stories', icon: <BookOpen size={15} />, to: '/stories' },
  { label: 'Acceptance Criteria', icon: <CheckSquare size={15} />, to: '/criteria' },
  { label: 'Sprints', icon: <Zap size={15} />, to: '/sprints' },
  { label: 'Team', icon: <Users size={15} />, to: '/team' },
];

function NavSection({ title, items, collapsed }: { title: string; items: NavItem[]; collapsed: boolean }) {
  return (
    <div className="mb-4">
      {!collapsed && (
        <p className="px-3 mb-1 text-xs font-semibold text-text-secondary/60 uppercase tracking-widest">
          {title}
        </p>
      )}
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-surface border-r border-border transition-all duration-200 flex-shrink-0 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-border ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="flex-shrink-0 w-7 h-7 bg-sage rounded flex items-center justify-center">
          <Diamond size={14} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-text-primary leading-tight">RefineBoard</p>
            <p className="text-xs text-text-secondary leading-tight">Backlog Refinement</p>
          </div>
        )}
      </div>

      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <NavSection title="Workspace" items={WORKSPACE_NAV} collapsed={collapsed} />
        <NavSection title="Management" items={MANAGEMENT_NAV} collapsed={collapsed} />
      </div>

      {/* Bottom links */}
      <div className="border-t border-border py-3 px-2">
        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={15} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <div
          className={`sidebar-item cursor-pointer hover:bg-ivory ${collapsed ? 'justify-center px-2' : ''}`}
          title={user?.email ? `${user.name} (${user.email})` : 'Product Team'}
          onClick={() => logout()}
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-[10px] font-semibold">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'PT'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-text-primary truncate">{user?.name || 'Product Team'}</p>
              <p className="text-[10px] text-text-secondary truncate">Sign Out</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-6 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center shadow-soft hover:bg-ivory transition-colors z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
