import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { useAppContext } from '@/context/AppContext';
import { PRIORITY_LABELS, DEV_STATUS_LABELS, REFINEMENT_STAGE_LABELS } from '@/utils/helpers';

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

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      {subtitle && <p className="text-xs text-text-secondary mt-0.5 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      {children}
    </div>
  );
}

export function Reports() {
  const { stories, sprints } = useAppContext();

  const refData = useMemo(() => {
    const counts: Record<string, number> = {};
    stories.forEach((s) => { counts[s.refinementStage] = (counts[s.refinementStage] ?? 0) + 1; });
    return Object.entries(counts).map(([stage, value]) => ({
      name: REFINEMENT_STAGE_LABELS[stage] ?? stage,
      value,
      fill: REFINEMENT_STAGE_COLORS[stage] ?? '#E4E3DE',
    }));
  }, [stories]);

  const devData = useMemo(() => {
    const counts: Record<string, number> = {};
    stories.forEach((s) => { counts[s.devStatus] = (counts[s.devStatus] ?? 0) + 1; });
    return Object.entries(counts).map(([status, value]) => ({
      name: DEV_STATUS_LABELS[status] ?? status,
      value,
      fill: DEV_STATUS_COLORS[status] ?? '#E4E3DE',
    }));
  }, [stories]);

  const priorityData = useMemo(() => {
    const colors: Record<string, string> = { critical: '#B86F5B', high: '#C59A45', medium: '#667A63', low: '#9CA3AF' };
    return (['critical','high','medium','low'] as const).map((p) => ({
      name: PRIORITY_LABELS[p],
      value: stories.filter((s) => s.priority === p).length,
      fill: colors[p],
    }));
  }, [stories]);

  const sprintPointsData = useMemo(() => {
    return sprints.map((sp) => {
      const spStories = stories.filter((s) => s.sprint === sp.id);
      return {
        name: sp.name,
        total: spStories.reduce((sum, s) => sum + s.storyPoints, 0),
        completed: spStories.filter((s) => s.devStatus === 'done').reduce((sum, s) => sum + s.storyPoints, 0),
      };
    });
  }, [stories, sprints]);

  const qualityBuckets = useMemo(() => {
    const buckets = [
      { name: '0–39', min: 0, max: 39, value: 0 },
      { name: '40–59', min: 40, max: 59, value: 0 },
      { name: '60–79', min: 60, max: 79, value: 0 },
      { name: '80–100', min: 80, max: 100, value: 0 },
    ];
    stories.forEach((s) => {
      const b = buckets.find((b) => s.qualityScore >= b.min && s.qualityScore <= b.max);
      if (b) b.value++;
    });
    return buckets;
  }, [stories]);

  const tooltipStyle = { fontSize: 12, border: '1px solid #E4E3DE', borderRadius: 6, backgroundColor: '#fff' };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-xs text-text-secondary bg-ivory rounded px-3 py-2 border border-border w-fit">
        All metrics are computed from current application state and reflect live backlog data.
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Refinement Stage Distribution" subtitle="Stories by current refinement stage">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={refData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2}>
                  {refData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [`${v} stories`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 flex-1">
              {refData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill, border: '1px solid #ccc' }} />
                  <span className="text-xs text-text-secondary flex-1">{d.name}</span>
                  <span className="text-xs font-semibold text-text-primary">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Development Status Distribution" subtitle="Stories by execution status">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={devData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2}>
                  {devData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [`${v} stories`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 flex-1">
              {devData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill, border: '1px solid #ccc' }} />
                  <span className="text-xs text-text-secondary flex-1">{d.name}</span>
                  <span className="text-xs font-semibold text-text-primary">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Priority Distribution" subtitle="Stories by priority level">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={priorityData} layout="vertical" margin={{ left: 0, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={70} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} stories`]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Story Points by Sprint" subtitle="Total vs completed story points">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sprintPointsData} margin={{ left: 0, right: 16 }}>
              <CartesianGrid vertical={false} stroke="#E4E3DE" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="total" name="Total Points" fill="#E5EBE2" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#667A63" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Quality Score Distribution" subtitle="Stories grouped by quality score range">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={qualityBuckets} margin={{ left: 0, right: 16 }}>
              <CartesianGrid vertical={false} stroke="#E4E3DE" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} stories`]} />
              <Bar dataKey="value" name="Stories" radius={[4, 4, 0, 0]}>
                {qualityBuckets.map((_, i) => (
                  <Cell key={i} fill={['#F3E2DC','#F5ECD5','#E5EBE2','#667A63'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
