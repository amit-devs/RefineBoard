import React, { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { DevStatusBadge } from '@/components/ui';

export function Team() {
  const { team, stories } = useAppContext();

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-5">
        {team.map((member) => {
          const memberStories = stories.filter((s) => s.assignee === member.name);
          const avgQuality = memberStories.length > 0
            ? Math.round(memberStories.reduce((s, st) => s + st.qualityScore, 0) / memberStories.length)
            : 0;
          const devStatusCounts = memberStories.reduce<Record<string, number>>((acc, s) => {
            acc[s.devStatus] = (acc[s.devStatus] ?? 0) + 1;
            return acc;
          }, {});

          return (
            <div key={member.id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0"
                  style={{ backgroundColor: member.avatarColor }}
                >
                  {member.avatar}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{member.name}</p>
                  <p className="text-xs text-text-secondary">{member.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-ivory rounded p-2.5 text-center">
                  <p className="text-xl font-bold text-text-primary">{memberStories.length}</p>
                  <p className="text-xs text-text-secondary">Stories</p>
                </div>
                <div className="bg-ivory rounded p-2.5 text-center">
                  <p className="text-xl font-bold text-text-primary">{avgQuality}</p>
                  <p className="text-xs text-text-secondary">Avg Quality</p>
                </div>
              </div>

              {Object.entries(devStatusCounts).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-2">Dev Status breakdown</p>
                  <div className="space-y-1">
                    {Object.entries(devStatusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <DevStatusBadge status={status as any} />
                        <span className="text-xs font-semibold text-text-primary">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {memberStories.length === 0 && (
                <p className="text-xs text-text-secondary text-center py-2">No assigned stories</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
