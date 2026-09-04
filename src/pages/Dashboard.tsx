import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, CheckCircle, AlertCircle, Clock, TrendingUp,
  ArrowUpRight, ArrowRight, Users, Zap
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';
import { useAppContext } from '@/context/AppContext';
import { QualityRing } from '@/components/ui';
import { formatRelativeTime, DEV_STATUS_LABELS, REFINEMENT_STAGE_LABELS } from '@/utils/helpers';

const DEV_STATUS_COLORS: Record<string, string> = {
  draft: '#E4E3DE',
  'in-progress': '#dbeafe',
  blocked: '#fee2e2',
  done: '#d1fae5',
};

const REFINEMENT_STAGE_COLORS: Record<string, string> = {
  draft: '#E4E3DE',
  'needs-refinement': '#F3E2DC',
  'under-review': '#F5ECD5',
  ready: '#E5EBE2',
};

function KPICard({
  title, value, subtitle, color, icon, trend,
}: {
  title: string; value: string | number; subtitle?: string;
  color?: string; icon: React.ReactNode; trend?: string;
}) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary font-medium">{title}</p>
        <span className={`w-8 h-8 rounded flex items-center justify-center ${color ?? 'bg-sage-light text-sage'}`}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold text-text-primary">{value}</p>
        {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs text-sage font-medium">
          <TrendingUp size={11} />
          {trend}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { stories, sprints, settings } = useAppContext();
  const navigate = useNavigate();

  const activeSprint = sprints.find((s) => s.id === settings.activeSprint);

  const stats = useMemo(() => {
    const total = stories.length;
    const ready = stories.filter((s) => s.refinementStage === 'ready').length;
    const needsRefinement = stories.filter((s) =>
      s.refinementStage === 'needs-refinement' || s.refinementStage === 'draft'
    ).length;
    const high = stories.filter((s) => s.priority === 'critical' || s.priority === 'high').length;
    const avgQuality = total > 0
      ? Math.round(stories.reduce((sum, s) => sum + s.qualityScore, 0) / total)
      : 0;

    const refCounts = stories.reduce<Record<string, number>>((acc, s) => {
      acc[s.refinementStage] = (acc[s.refinementStage] ?? 0) + 1;
      return acc;
    }, {});

    const devCounts = stories.reduce<Record<string, number>>((acc, s) => {
      acc[s.devStatus] = (acc[s.devStatus] ?? 0) + 1;
      return acc;
    }, {});

    const priorityCounts = [
      { name: 'Critical', value: stories.filter((s) => s.priority === 'critical').length, color: '#B86F5B' },
      { name: 'High', value: stories.filter((s) => s.priority === 'high').length, color: '#C59A45' },
      { name: 'Medium', value: stories.filter((s) => s.priority === 'medium').length, color: '#667A63' },
      { name: 'Low', value: stories.filter((s) => s.priority === 'low').length, color: '#9CA3AF' },
    ];

    const refData = Object.entries(refCounts).map(([stage, count]) => ({
      name: REFINEMENT_STAGE_LABELS[stage] ?? stage,
      value: count,
      fill: REFINEMENT_STAGE_COLORS[stage] ?? '#E4E3DE',
    }));

    const devData = Object.entries(devCounts).map(([status, count]) => ({
      name: DEV_STATUS_LABELS[status] ?? status,
      value: count,
      fill: DEV_STATUS_COLORS[status] ?? '#E4E3DE',
    }));

    return { total, ready, needsRefinement, high, avgQuality, priorityCounts, refData, devData };
  }, [stories]);

  // Recent activity from all story logs
  const recentActivity = useMemo(() => {
    return stories
      .flatMap((s) =>
        s.activityLog.map((entry) => ({
          ...entry,
          storyId: s.id,
          storyTitle: s.title,
        }))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [stories]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{greeting}, Product Team</h1>
          <p className="text-text-secondary mt-1">Backlog health and refinement overview</p>
        </div>
        <div className="flex items-center gap-2">
          {activeSprint && (
            <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-md">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              <span className="text-sm font-medium text-text-primary">{activeSprint.name}</span>
              <span className="text-xs text-text-secondary">Active Sprint</span>
            </div>
          )}
          <button
            onClick={() => navigate('/backlog')}
            className="btn-primary"
          >
            <ArrowRight size={14} /> Open Backlog
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard
          title="Total Stories"
          value={stats.total}
          subtitle={`Across ${sprints.length} sprints`}
          icon={<BookOpen size={16} />}
          color="bg-sage-light text-sage"
          trend="+6 this sprint"
        />
        <KPICard
          title="Ready for Dev"
          value={stats.ready}
          subtitle="Passed Definition of Ready"
          icon={<CheckCircle size={16} />}
          color="bg-sage-light text-sage"
        />
        <KPICard
          title="Needs Refinement"
          value={stats.needsRefinement}
          subtitle="Requires attention"
          icon={<AlertCircle size={16} />}
          color="bg-terracotta-light text-terracotta"
        />
        <KPICard
          title="High Priority"
          value={stats.high}
          subtitle="Critical + High"
          icon={<Clock size={16} />}
          color="bg-amber-light text-amber"
        />
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary font-medium">Backlog Quality</p>
            <QualityRing score={stats.avgQuality} size={36} />
          </div>
          <div>
            <p className="text-3xl font-bold text-text-primary">{stats.avgQuality}%</p>
            <p className="text-xs text-text-secondary mt-1">Average quality score</p>
          </div>
          <div className="text-xs text-text-secondary italic">Project-defined metric</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Refinement Stage Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Refinement Stage</h2>
              <p className="text-xs text-text-secondary mt-0.5">Backlog refinement distribution</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={stats.refData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {stats.refData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} stories`, name]}
                  contentStyle={{ fontSize: 12, border: '1px solid #E4E3DE', borderRadius: 6 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full grid grid-cols-2 gap-x-2 gap-y-2 mt-4">
              {stats.refData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-text-secondary truncate">{item.name}</span>
                  <span className="ml-auto text-xs font-semibold text-text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Development Status Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Development Status</h2>
              <p className="text-xs text-text-secondary mt-0.5">Execution distribution</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={stats.devData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {stats.devData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} stories`, name]}
                  contentStyle={{ fontSize: 12, border: '1px solid #E4E3DE', borderRadius: 6 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full grid grid-cols-2 gap-x-2 gap-y-2 mt-4">
              {stats.devData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-text-secondary truncate">{item.name}</span>
                  <span className="ml-auto text-xs font-semibold text-text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-text-primary mb-1">Priority Distribution</h2>
          <p className="text-xs text-text-secondary mb-4">Stories by priority level</p>
          <div className="space-y-3">
            {stats.priorityCounts.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-secondary">{p.name}</span>
                  <span className="text-xs font-semibold text-text-primary">{p.value}</span>
                </div>
                <div className="h-1.5 bg-ivory rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: stats.total > 0 ? `${(p.value / stats.total) * 100}%` : '0%',
                      backgroundColor: p.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Sprint summary */}
          {activeSprint && (
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={12} className="text-sage" />
                <p className="text-xs font-semibold text-text-primary">{activeSprint.name}</p>
              </div>
              <p className="text-xs text-text-secondary">{activeSprint.goal}</p>
              <div className="flex gap-3 mt-2">
                <div className="text-center">
                  <p className="text-sm font-bold text-text-primary">
                    {stories.filter((s) => s.sprint === settings.activeSprint).length}
                  </p>
                  <p className="text-xs text-text-secondary">Stories</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-text-primary">
                    {stories
                      .filter((s) => s.sprint === settings.activeSprint)
                      .reduce((sum, s) => sum + s.storyPoints, 0)}
                  </p>
                  <p className="text-xs text-text-secondary">Points</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Refinement Activity</h2>
            <p className="text-xs text-text-secondary mt-0.5">Recent backlog changes</p>
          </div>
          <button onClick={() => navigate('/backlog')} className="btn-ghost text-xs">
            View backlog <ArrowUpRight size={12} />
          </button>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-6">No activity recorded yet. Start refining your backlog!</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6">
            {recentActivity.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-2.5 border-b border-border last:border-b-0">
                <div className="w-6 h-6 rounded-full bg-sage-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sage text-xs font-semibold">{(entry.author ?? 'T').charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{entry.author ?? 'Team'}</span>{' '}
                    <span className="text-text-secondary">{entry.description.toLowerCase()}</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-mono text-text-secondary">{entry.storyId}</span>
                    <span className="text-xs text-text-secondary truncate">{entry.storyTitle}</span>
                  </div>
                  <p className="text-xs text-text-secondary/70 mt-0.5">{formatRelativeTime(entry.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
