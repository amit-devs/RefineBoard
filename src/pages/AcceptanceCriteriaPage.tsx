import React, { useState } from 'react';
import {
  CheckSquare, CheckCircle, HelpCircle, Trash2, Edit3,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { EmptyState } from '@/components/ui';
import { StoryDrawer } from '@/components/stories/StoryDrawer';
import type { AcceptanceCriterion, UserStory } from '@/types';

// ─── Testability badge ────────────────────────────────────────────────────────
function TestabilityBadge({ testability }: { testability: AcceptanceCriterion['testability'] }) {
  if (testability === 'good') {
    return (
      <span className="badge bg-sage-light text-sage-dark border border-sage/20 text-xs whitespace-nowrap">
        Testable
      </span>
    );
  }
  return (
    <span className="badge bg-amber-light text-amber-dark border border-amber/20 text-xs whitespace-nowrap">
      Needs Clarification
    </span>
  );
}

// ─── Inline edit form for a criterion ────────────────────────────────────────
function CriterionEditRow({
  criterion,
  onSave,
  onCancel,
}: {
  criterion: AcceptanceCriterion;
  onSave: (changes: Partial<AcceptanceCriterion>) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState({
    given: criterion.given,
    when: criterion.when,
    then: criterion.then,
  });

  return (
    <tr className="bg-sage-light/20">
      <td colSpan={8} className="px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['given', 'when', 'then'] as const).map((field) => (
            <div key={field}>
              <label className="label-base capitalize">{field}</label>
              <textarea
                className="input-base resize-none text-xs"
                rows={2}
                value={draft[field]}
                onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => onSave(draft)} className="btn-primary text-xs py-1.5 px-3">Save</button>
          <button onClick={onCancel} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
        </div>
      </td>
    </tr>
  );
}

// ─── Story group header row ───────────────────────────────────────────────────
function StoryGroupHeader({
  story,
  expanded,
  onToggle,
  onOpenDrawer,
}: {
  story: UserStory;
  expanded: boolean;
  onToggle: () => void;
  onOpenDrawer: (id: string) => void;
}) {
  return (
    <tr className="bg-ivory/80 hover:bg-sage-light/30 transition-colors cursor-pointer" onClick={onToggle}>
      <td colSpan={8} className="px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="text-text-secondary hover:text-sage transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            className="font-mono text-xs text-sage hover:underline font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDrawer(story.id);
            }}
          >
            {story.id}
          </button>
          <span className="text-sm font-semibold text-text-primary">{story.title}</span>
          <span className="ml-auto text-xs text-text-secondary">
            {story.acceptanceCriteria.length} criteria ·{' '}
            {story.acceptanceCriteria.filter((ac) => ac.completed).length} completed
          </span>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function AcceptanceCriteriaPage() {
  const { stories, toggleCriterion, updateCriterion, deleteCriterion, addToast } = useAppContext();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null); // `${storyId}::${criterionId}`
  const [collapsedStories, setCollapsedStories] = useState<Set<string>>(new Set());

  const selectedStory = stories.find((s) => s.id === selectedStoryId) ?? null;

  // Only stories with acceptance criteria
  const storiesWithCriteria = stories.filter((s) => s.acceptanceCriteria.length > 0);

  // Summary metrics
  const allCriteria = stories.flatMap((s) => s.acceptanceCriteria);
  const totalCount = allCriteria.length;
  const completedCount = allCriteria.filter((ac) => ac.completed).length;
  const testableCount = allCriteria.filter((ac) => ac.testability === 'good').length;
  const needsClarificationCount = allCriteria.filter((ac) => ac.testability === 'needs-clarification').length;

  function toggleStoryCollapse(storyId: string) {
    setCollapsedStories((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  }

  function handleToggleCriterion(storyId: string, criterionId: string) {
    toggleCriterion(storyId, criterionId);
  }

  function handleDeleteCriterion(storyId: string, criterionId: string) {
    deleteCriterion(storyId, criterionId);
    addToast('Acceptance criterion deleted');
  }

  function handleSaveCriterion(storyId: string, criterionId: string, changes: Partial<AcceptanceCriterion>) {
    updateCriterion(storyId, criterionId, changes);
    setEditingKey(null);
    addToast('Criterion updated');
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Criteria',
            value: totalCount,
            icon: <CheckSquare size={16} className="text-sage" />,
            color: 'bg-sage-light',
          },
          {
            label: 'Completed',
            value: completedCount,
            icon: <CheckCircle size={16} className="text-sage" />,
            color: 'bg-sage-light',
          },
          {
            label: 'Testable',
            value: testableCount,
            icon: <CheckCircle size={16} className="text-sage" />,
            color: 'bg-sage-light',
          },
          {
            label: 'Needs Clarification',
            value: needsClarificationCount,
            icon: <HelpCircle size={16} className="text-amber-dark" />,
            color: 'bg-amber-light',
          },
        ].map((m) => (
          <div key={m.label} className="card p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.color}`}>
              {m.icon}
            </div>
            <div>
              <p className="text-xs text-text-secondary">{m.label}</p>
              <p className="text-xl font-bold text-text-primary">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="card px-5 py-3 flex items-center gap-4">
          <span className="text-xs text-text-secondary flex-shrink-0">Overall Completion</span>
          <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all"
              style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-text-primary flex-shrink-0">
            {completedCount}/{totalCount} ({totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%)
          </span>
        </div>
      )}

      {/* Main table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">All Acceptance Criteria</h2>
          <span className="text-xs text-text-secondary">{storiesWithCriteria.length} stories</span>
        </div>

        {storiesWithCriteria.length === 0 ? (
          <EmptyState
            icon={<CheckSquare size={22} />}
            title="No acceptance criteria yet"
            description="Add acceptance criteria to your user stories in Given/When/Then format."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-ivory/60">
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary w-10">✓</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary whitespace-nowrap">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Given</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">When</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Then</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-text-secondary whitespace-nowrap">Testability</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {storiesWithCriteria.map((story) => {
                  const isCollapsed = collapsedStories.has(story.id);
                  return (
                    <React.Fragment key={story.id}>
                      {/* Story group header */}
                      <StoryGroupHeader
                        story={story}
                        expanded={!isCollapsed}
                        onToggle={() => toggleStoryCollapse(story.id)}
                        onOpenDrawer={(id) => setSelectedStoryId(id)}
                      />

                      {/* Criterion rows */}
                      {!isCollapsed &&
                        story.acceptanceCriteria.map((ac, idx) => {
                          const key = `${story.id}::${ac.id}`;
                          const isEditing = editingKey === key;

                          if (isEditing) {
                            return (
                              <CriterionEditRow
                                key={key}
                                criterion={ac}
                                onSave={(changes) => handleSaveCriterion(story.id, ac.id, changes)}
                                onCancel={() => setEditingKey(null)}
                              />
                            );
                          }

                          return (
                            <tr
                              key={key}
                              className={`hover:bg-ivory/30 transition-colors ${ac.completed ? 'opacity-70' : ''}`}
                            >
                              {/* Completion checkbox */}
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleToggleCriterion(story.id, ac.id)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    ac.completed ? 'bg-sage border-sage' : 'border-border hover:border-sage'
                                  }`}
                                  aria-label={ac.completed ? 'Mark incomplete' : 'Mark complete'}
                                >
                                  {ac.completed && (
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </button>
                              </td>

                              {/* Criterion # */}
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-xs text-text-secondary font-mono">AC-{idx + 1}</span>
                              </td>

                              {/* Given */}
                              <td className="px-4 py-3 max-w-[180px]">
                                <p className={`text-xs ${ac.completed ? 'line-through text-text-secondary' : 'text-text-primary'} truncate`}>
                                  {ac.given || <span className="italic text-text-secondary">—</span>}
                                </p>
                              </td>

                              {/* When */}
                              <td className="px-4 py-3 max-w-[180px]">
                                <p className="text-xs text-text-primary truncate">
                                  {ac.when || <span className="italic text-text-secondary">—</span>}
                                </p>
                              </td>

                              {/* Then */}
                              <td className="px-4 py-3 max-w-[180px]">
                                <p className="text-xs text-text-primary truncate">
                                  {ac.then || <span className="italic text-text-secondary">—</span>}
                                </p>
                              </td>

                              {/* Testability */}
                              <td className="px-4 py-3 text-center">
                                <TestabilityBadge testability={ac.testability} />
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => setEditingKey(key)}
                                    className="btn-ghost text-xs p-1.5"
                                    title="Edit criterion"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCriterion(story.id, ac.id)}
                                    className="btn-ghost text-xs p-1.5 text-terracotta hover:text-terracotta"
                                    title="Delete criterion"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Story Drawer */}
      {selectedStory && (
        <StoryDrawer
          story={selectedStory}
          onClose={() => setSelectedStoryId(null)}
          onOpenStory={(id) => setSelectedStoryId(id)}
        />
      )}
    </div>
  );
}
