import React, { useState, useMemo } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { QualityRing, EmptyState } from '@/components/ui';
import { StoryDrawer } from '@/components/stories/StoryDrawer';
import { calculateQualityScore, getDefinitionOfReadyChecks } from '@/utils/qualityEngine';
import { PriorityBadge } from '@/components/ui';

export function QualityChecks() {
  const { stories, settings } = useAppContext();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const selectedStory = stories.find((s) => s.id === selectedStoryId) ?? null;

  const summary = useMemo(() => {
    if (stories.length === 0) return null;
    const avgQuality = Math.round(stories.reduce((s, st) => s + st.qualityScore, 0) / stories.length);
    const ready = stories.filter((s) => s.refinementStage === 'ready').length;
    const needsRefinement = stories.filter((s) => s.refinementStage === 'needs-refinement' || s.refinementStage === 'draft').length;
    const blocked = stories.filter((s) => s.devStatus === 'blocked').length;

    // Count failing checks across all stories
    const failCounts: Record<string, { label: string; count: number }> = {};
    stories.forEach((story) => {
      const checks = getDefinitionOfReadyChecks(story, settings.dorQualityThreshold);
      checks.forEach((check) => {
        if (!check.passed) {
          if (!failCounts[check.key]) failCounts[check.key] = { label: check.label, count: 0 };
          failCounts[check.key].count++;
        }
      });
    });
    const commonIssues = Object.values(failCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return { avgQuality, ready, needsRefinement, blocked, commonIssues };
  }, [stories, settings.dorQualityThreshold]);

  return (
    <div className="p-6 space-y-6">
      {/* Summary note */}
      <div className="flex items-center gap-2 text-xs text-text-secondary bg-ivory rounded px-3 py-2 border border-border w-fit">
        <ShieldCheck size={12} className="text-sage" />
        Quality Score is a project-defined refinement metric, not an industry standard.
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-5 gap-4">
          <div className="card p-4">
            <p className="text-xs text-text-secondary mb-1">Avg Quality Score</p>
            <div className="flex items-center gap-2">
              <QualityRing score={summary.avgQuality} size={36} />
              <span className="text-2xl font-bold text-text-primary">{summary.avgQuality}</span>
            </div>
          </div>
          <div className="card p-4">
            <p className="text-xs text-text-secondary mb-1">Stories Evaluated</p>
            <p className="text-2xl font-bold text-text-primary">{stories.length}</p>
          </div>
          <div className="card p-4 border-sage/20 bg-sage-light/10">
            <p className="text-xs text-text-secondary mb-1">Ready for Dev</p>
            <p className="text-2xl font-bold text-sage">{summary.ready}</p>
          </div>
          <div className="card p-4 border-terracotta/20 bg-terracotta-light/10">
            <p className="text-xs text-text-secondary mb-1">Needs Refinement</p>
            <p className="text-2xl font-bold text-terracotta">{summary.needsRefinement}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-text-secondary mb-1">Blocked</p>
            <p className="text-2xl font-bold text-text-primary">{summary.blocked}</p>
          </div>
        </div>
      )}

      {/* Common Issues */}
      {summary && summary.commonIssues.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-terracotta" />
            Most Common Quality Issues
          </h3>
          <div className="space-y-2">
            {summary.commonIssues.map((issue) => (
              <div key={issue.label} className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-ivory rounded-full overflow-hidden">
                  <div
                    className="h-full bg-terracotta-light rounded-full"
                    style={{ width: `${(issue.count / stories.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-text-secondary flex-[2]">{issue.label}</span>
                <span className="text-sm font-semibold text-terracotta w-12 text-right">{issue.count} stories</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-story table */}
      {stories.length === 0 ? (
        <EmptyState title="No stories to evaluate" description="Create user stories to see quality checks." />
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-ivory">
            <h3 className="text-sm font-semibold text-text-primary">Story Quality Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-header">Story</th>
                  <th className="table-header text-center">Quality</th>
                  <th className="table-header text-center">DoR Status</th>
                  <th className="table-header">Definition of Ready Checks</th>
                  <th className="table-header" />
                </tr>
              </thead>
              <tbody>
                {stories.map((story) => {
                  const checks = getDefinitionOfReadyChecks(story, settings.dorQualityThreshold);
                  const isReady = checks.every((c) => c.passed);
                  return (
                    <tr key={story.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-mono text-text-secondary">{story.id}</span>
                            <PriorityBadge priority={story.priority} />
                          </div>
                          <p className="text-sm font-medium text-text-primary">{story.title}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="relative">
                            <QualityRing score={story.qualityScore} size={32} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-text-primary">{story.qualityScore}</span>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-text-primary">{story.qualityScore}%</span>
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <span className={`badge text-xs font-medium ${isReady ? 'bg-sage-light text-sage-dark' : 'bg-terracotta-light text-terracotta-dark'}`}>
                          {isReady ? '✓ READY' : '✕ NOT READY'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1">
                          {checks.map((check) => (
                            <span
                              key={check.key}
                              title={check.passed ? check.label : `✕ ${check.label}: ${check.hint}`}
                              className={`text-xs ${check.passed ? 'text-sage' : 'text-terracotta'}`}
                            >
                              {check.passed ? '✓' : '✕'}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          {checks.filter(c => c.passed).length}/{checks.length} passed
                        </div>
                      </td>
                      <td className="table-cell">
                        {!isReady && (
                          <button
                            onClick={() => setSelectedStoryId(story.id)}
                            className="btn-secondary text-xs py-1 px-2 whitespace-nowrap"
                          >
                            Fix Issues
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedStory && (
        <StoryDrawer
          story={selectedStory}
          onClose={() => setSelectedStoryId(null)}
          onOpenStory={setSelectedStoryId}
        />
      )}
    </div>
  );
}
