import React, { useState } from 'react';
import {
  X, Plus, Trash2, Edit3, Check, ChevronDown, ChevronUp,
  HelpCircle, Clock, Link2, Tag, Activity, Shield
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import {
  PriorityBadge, DevStatusBadge, RefinementStageBadge, QualityRing, ConfirmDialog, Tooltip
} from '@/components/ui';
import { calculateQualityScore, getDefinitionOfReadyChecks } from '@/utils/qualityEngine';
import { STORY_POINTS, DEV_STATUS_LABELS, REFINEMENT_STAGE_LABELS, PRIORITY_LABELS, formatRelativeTime, createActivity } from '@/utils/helpers';
import type { UserStory, AcceptanceCriterion, Priority, DevStatus, RefinementStage, StoryPoints } from '@/types';
import { StoryFormModal } from './StoryFormModal';

interface StoryDrawerProps {
  story: UserStory;
  onClose: () => void;
  onOpenStory?: (id: string) => void;
}

type DrawerTab = 'details' | 'criteria' | 'quality' | 'history';

export function StoryDrawer({ story, onClose, onOpenStory }: StoryDrawerProps) {
  const { updateStory, addCriterion, updateCriterion, deleteCriterion, toggleCriterion, deleteStory, addToast, sprints, team, settings } = useAppContext();
  const [activeTab, setActiveTab] = useState<DrawerTab>('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [newCriterion, setNewCriterion] = useState({ given: '', when: '', then: '' });
  const [showAddCriterion, setShowAddCriterion] = useState(false);

  const { score, factors } = calculateQualityScore(story);
  const dorChecks = getDefinitionOfReadyChecks(story, settings.dorQualityThreshold);
  const isReady = dorChecks.every((c) => c.passed);

  const activeSprint = sprints.find((s) => s.id === story.sprint);

  function handleFieldChange(field: keyof UserStory, oldVal: string, newVal: string, label: string) {
    const activity = createActivity(field as string, `${label} changed`, oldVal, newVal);
    updateStory(story.id, { [field]: newVal } as Partial<UserStory>, activity);
  }

  function handleAddCriterion() {
    if (!newCriterion.given.trim() && !newCriterion.when.trim() && !newCriterion.then.trim()) return;
    addCriterion(story.id, { ...newCriterion, completed: false, testability: 'needs-clarification' });
    setNewCriterion({ given: '', when: '', then: '' });
    setShowAddCriterion(false);
    addToast('Acceptance criterion added');
  }

  function handleDeleteStory() {
    deleteStory(story.id);
    addToast('User story deleted');
    onClose();
  }

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="drawer-panel w-[560px] max-w-[95vw]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-start gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-text-secondary">{story.id}</span>
                <PriorityBadge priority={story.priority} />
                <DevStatusBadge status={story.devStatus} />
                <RefinementStageBadge stage={story.refinementStage} />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">{story.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => setShowEditModal(true)} className="btn-ghost text-xs">
              <Edit3 size={13} /> Edit
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="btn-ghost text-xs text-terracotta hover:text-terracotta">
              <Trash2 size={13} />
            </button>
            <button onClick={onClose} className="btn-ghost p-1.5" aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0 px-6">
          {(['details', 'criteria', 'quality', 'history'] as DrawerTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 px-3 text-sm border-b-2 transition-colors -mb-px capitalize ${
                activeTab === tab
                  ? 'border-sage text-sage font-medium'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === 'criteria' ? 'Acceptance Criteria' : tab === 'quality' ? 'Quality & DoR' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── Details Tab ─────────────────────────────────────────── */}
          {activeTab === 'details' && (
            <div className="p-6 space-y-5">
              {/* Story Format */}
              <div className="bg-sage-light/40 rounded-md p-4 space-y-3">
                <p className="text-xs font-semibold text-sage uppercase tracking-wide">User Story</p>
                <div>
                  <span className="text-xs text-text-secondary font-medium">As a </span>
                  <InlineEdit
                    value={story.asA}
                    onSave={(v) => handleFieldChange('asA', story.asA, v, 'User role')}
                    placeholder="user role"
                  />
                </div>
                <div>
                  <span className="text-xs text-text-secondary font-medium">I want </span>
                  <InlineEdit
                    value={story.iWant}
                    onSave={(v) => handleFieldChange('iWant', story.iWant, v, 'Goal')}
                    placeholder="goal"
                    multiline
                  />
                </div>
                <div>
                  <span className="text-xs text-text-secondary font-medium">So that </span>
                  <InlineEdit
                    value={story.soThat}
                    onSave={(v) => handleFieldChange('soThat', story.soThat, v, 'Business value')}
                    placeholder="business benefit"
                    multiline
                  />
                </div>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-4">
                <MetaField label="Priority">
                  <select
                    className="input-base py-1 text-xs"
                    value={story.priority}
                    onChange={(e) => {
                      const v = e.target.value as Priority;
                      const act = createActivity('priority', `Priority changed`, PRIORITY_LABELS[story.priority], PRIORITY_LABELS[v]);
                      updateStory(story.id, { priority: v }, act);
                      addToast('Priority updated');
                    }}
                  >
                    {(['critical','high','medium','low'] as Priority[]).map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </MetaField>
                <MetaField label="Dev Status">
                  <select
                    className="input-base py-1 text-xs"
                    value={story.devStatus}
                    onChange={(e) => {
                      const v = e.target.value as DevStatus;
                      const act = createActivity('devStatus', `Dev Status changed`, DEV_STATUS_LABELS[story.devStatus], DEV_STATUS_LABELS[v]);
                      updateStory(story.id, { devStatus: v }, act);
                      addToast('Development Status updated');
                    }}
                  >
                    {Object.entries(DEV_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </MetaField>
                <MetaField label="Refinement Stage">
                  <select
                    className="input-base py-1 text-xs"
                    value={story.refinementStage}
                    onChange={(e) => {
                      const v = e.target.value as RefinementStage;
                      const act = createActivity('refinementStage', `Refinement Stage changed`, REFINEMENT_STAGE_LABELS[story.refinementStage], REFINEMENT_STAGE_LABELS[v]);
                      updateStory(story.id, { refinementStage: v }, act);
                      addToast('Refinement Stage updated');
                    }}
                  >
                    {Object.entries(REFINEMENT_STAGE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </MetaField>
                <MetaField label="Story Points">
                  <select
                    className="input-base py-1 text-xs"
                    value={story.storyPoints}
                    onChange={(e) => {
                      const v = Number(e.target.value) as StoryPoints;
                      const act = createActivity('storyPoints', `Story points changed`, String(story.storyPoints), String(v));
                      updateStory(story.id, { storyPoints: v }, act);
                      addToast('Story points updated');
                    }}
                  >
                    <option value={0}>Not estimated</option>
                    {STORY_POINTS.filter((p) => p > 0).map((p) => (
                      <option key={p} value={p}>{p} pts</option>
                    ))}
                  </select>
                </MetaField>
                <MetaField label="Sprint">
                  <select
                    className="input-base py-1 text-xs"
                    value={story.sprint}
                    onChange={(e) => {
                      const v = e.target.value;
                      const sprintName = sprints.find((s) => s.id === v)?.name ?? 'Unassigned';
                      const oldName = sprints.find((s) => s.id === story.sprint)?.name ?? 'Unassigned';
                      const act = createActivity('sprint', `Sprint changed`, oldName, sprintName);
                      updateStory(story.id, { sprint: v }, act);
                      addToast('Sprint updated');
                    }}
                  >
                    <option value="">Unassigned</option>
                    {sprints.map((sp) => (
                      <option key={sp.id} value={sp.id}>{sp.name}</option>
                    ))}
                  </select>
                </MetaField>
                <MetaField label="Assignee">
                  <select
                    className="input-base py-1 text-xs"
                    value={story.assignee}
                    onChange={(e) => {
                      updateStory(story.id, { assignee: e.target.value });
                    }}
                  >
                    <option value="">Unassigned</option>
                    {team.map((m) => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </MetaField>
                <MetaField label={
                  <span className="flex items-center gap-1">
                    Business Value
                    <Tooltip content="Relative business value (1–10). Used in the Priority Matrix X-axis. Conceptually separate from Priority.">
                      <HelpCircle size={10} className="text-text-secondary cursor-help" />
                    </Tooltip>
                  </span>
                }>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min={1} max={10} step={1}
                      value={story.businessValue}
                      onChange={(e) => updateStory(story.id, { businessValue: Number(e.target.value) })}
                      className="flex-1 accent-sage"
                    />
                    <span className="text-xs font-semibold text-sage w-4 text-right">{story.businessValue}</span>
                  </div>
                </MetaField>
              </div>

              {/* Dependencies Reviewed */}
              <div className="flex items-center gap-2 p-3 rounded border border-border">
                <input
                  type="checkbox"
                  id={`dep-reviewed-${story.id}`}
                  checked={story.dependenciesReviewed}
                  onChange={(e) => {
                    const v = e.target.checked;
                    const act = createActivity('dependenciesReviewed', v ? 'Dependencies marked as reviewed' : 'Dependencies review cleared');
                    updateStory(story.id, { dependenciesReviewed: v }, act);
                    addToast(v ? 'Dependencies marked as reviewed' : 'Dependencies review cleared');
                  }}
                  className="w-4 h-4 accent-sage"
                />
                <label htmlFor={`dep-reviewed-${story.id}`} className="text-sm text-text-primary cursor-pointer flex-1">
                  Dependencies have been reviewed
                </label>
                <Tooltip content="Mark this after reviewing all story dependencies. Affects Quality Score and Definition of Ready.">
                  <HelpCircle size={11} className="text-text-secondary cursor-help" />
                </Tooltip>
              </div>

              {/* Tags */}
              {story.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-1"><Tag size={11} /> Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {story.tags.map((tag) => (
                      <span key={tag} className="badge bg-olive-light text-olive border border-olive/20">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dependencies */}
              {story.dependencies.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-1"><Link2 size={11} /> Dependencies</p>
                  <div className="space-y-1">
                    {story.dependencies.map((dep) => (
                      <div key={`${dep.id}-${dep.type}`} className="flex items-center gap-2 text-sm">
                        <span className={`badge text-xs ${dep.type === 'depends-on' ? 'bg-amber-light text-amber-dark' : 'bg-terracotta-light text-terracotta-dark'}`}>
                          {dep.type === 'depends-on' ? 'Depends on' : 'Blocks'}
                        </span>
                        <button
                          onClick={() => onOpenStory?.(dep.id)}
                          className="text-sage hover:underline font-mono text-xs"
                        >
                          {dep.id}
                        </button>
                        <span className="text-text-secondary">{dep.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Traceability */}
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-1">
                  <Shield size={11} /> Traceability
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    { label: 'User Story', done: true },
                    { label: `Acceptance Criteria (${story.acceptanceCriteria.length})`, done: story.acceptanceCriteria.length > 0 },
                    { label: `Quality Checks (${score}/100)`, done: score >= 60 },
                    { label: 'Ready for Development', done: isReady },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.done ? 'bg-sage' : 'bg-border'}`} />
                      <span className={`text-sm ${item.done ? 'text-text-primary' : 'text-text-secondary'}`}>{item.label}</span>
                      {i < 3 && <div className="ml-0.5 w-px h-3 bg-border" style={{ marginLeft: '3px', marginTop: '0', alignSelf: 'flex-end' }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Acceptance Criteria Tab ──────────────────────────── */}
          {activeTab === 'criteria' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Acceptance Criteria</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {story.acceptanceCriteria.filter((ac) => ac.completed).length} / {story.acceptanceCriteria.length} completed
                  </p>
                </div>
                <button onClick={() => setShowAddCriterion(true)} className="btn-primary text-xs py-1.5">
                  <Plus size={13} /> Add Criterion
                </button>
              </div>

              {/* Criteria list */}
              <div className="space-y-3">
                {story.acceptanceCriteria.map((ac) => (
                  <AcceptanceCriterionCard
                    key={ac.id}
                    ac={ac}
                    isEditing={editingCriterionId === ac.id}
                    onToggle={() => toggleCriterion(story.id, ac.id)}
                    onEdit={() => setEditingCriterionId(ac.id)}
                    onSave={(changes) => {
                      updateCriterion(story.id, ac.id, changes);
                      setEditingCriterionId(null);
                    }}
                    onCancel={() => setEditingCriterionId(null)}
                    onDelete={() => {
                      deleteCriterion(story.id, ac.id);
                      addToast('Acceptance criterion removed');
                    }}
                  />
                ))}

                {story.acceptanceCriteria.length === 0 && !showAddCriterion && (
                  <div className="text-center py-8 text-text-secondary">
                    <CheckSquareIcon />
                    <p className="text-sm mt-2">No acceptance criteria yet</p>
                    <p className="text-xs mt-1">Add criteria in Given/When/Then format</p>
                  </div>
                )}

                {/* Add new criterion form */}
                {showAddCriterion && (
                  <div className="border border-sage/30 rounded-md p-4 bg-sage-light/20 space-y-3">
                    <p className="text-xs font-semibold text-sage">New Acceptance Criterion</p>
                    {(['given', 'when', 'then'] as const).map((field) => (
                      <div key={field}>
                        <label className="label-base capitalize">{field}</label>
                        <textarea
                          className="input-base resize-none"
                          rows={2}
                          placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)}...`}
                          value={newCriterion[field]}
                          onChange={(e) => setNewCriterion((n) => ({ ...n, [field]: e.target.value }))}
                        />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button onClick={handleAddCriterion} className="btn-primary text-xs py-1.5">Add</button>
                      <button onClick={() => { setShowAddCriterion(false); setNewCriterion({ given: '', when: '', then: '' }); }} className="btn-secondary text-xs py-1.5">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Quality & DoR Tab ─────────────────────────────────── */}
          {activeTab === 'quality' && (
            <div className="p-6 space-y-5">
              {/* Score ring */}
              <div className="flex items-center gap-4 p-4 bg-ivory rounded-md border border-border">
                <div className="relative flex-shrink-0">
                  <QualityRing score={score} size={64} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-text-primary">{score}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Backlog Quality Score: {score}/100</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    A project-defined refinement metric based on story completeness.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className={`badge text-xs ${score >= 80 ? 'bg-sage-light text-sage-dark' : score >= 60 ? 'bg-amber-light text-amber-dark' : 'bg-terracotta-light text-terracotta-dark'}`}>
                      {score >= 80 ? 'Good' : score >= 60 ? 'Moderate' : 'Needs Work'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Factors */}
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Quality Factors</p>
                <div className="space-y-1.5">
                  {factors.map((f) => (
                    <div key={f.key} className="flex items-center gap-2.5">
                      {f.passed
                        ? <span className="text-sage text-sm">✓</span>
                        : <span className="text-terracotta text-sm">✕</span>
                      }
                      <span className={`text-sm ${f.passed ? 'text-text-primary' : 'text-text-secondary'}`}>{f.label}</span>
                      <span className="ml-auto text-xs text-text-secondary">{f.passed ? `+${f.points}` : `+0/${f.points}`}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Definition of Ready */}
              <div className="border border-border rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Definition of Ready</p>
                  <span className={`badge text-xs font-semibold ${isReady ? 'bg-sage-light text-sage-dark' : 'bg-terracotta-light text-terracotta-dark'}`}>
                    {isReady ? '✓ READY FOR DEVELOPMENT' : '✕ NOT READY'}
                  </span>
                </div>
                <div className="space-y-2">
                  {dorChecks.map((check) => (
                    <div key={check.key}>
                      <div className="flex items-center gap-2.5">
                        {check.passed
                          ? <span className="text-sage text-sm flex-shrink-0">✓</span>
                          : <span className="text-terracotta text-sm flex-shrink-0">✕</span>
                        }
                        <span className={`text-sm ${check.passed ? 'text-text-primary' : 'text-text-secondary'}`}>{check.label}</span>
                      </div>
                      {!check.passed && (
                        <p className="text-xs text-terracotta ml-5 mt-0.5">{check.hint}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── History Tab ───────────────────────────────────────── */}
          {activeTab === 'history' && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={14} className="text-text-secondary" />
                <h3 className="text-sm font-semibold text-text-primary">Refinement History</h3>
              </div>
              {story.activityLog.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">No activity recorded yet</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {story.activityLog.map((entry) => (
                      <div key={entry.id} className="flex gap-4 relative">
                        <div className="w-4 h-4 rounded-full bg-sage-light border-2 border-sage flex-shrink-0 mt-0.5 relative z-10 ml-0.5" />
                        <div className="pb-1">
                          <p className="text-sm text-text-primary">{entry.description}</p>
                          {entry.oldValue && entry.newValue && (
                            <p className="text-xs text-text-secondary mt-0.5">
                              <span className="line-through">{entry.oldValue}</span>
                              {' → '}
                              <span className="font-medium text-sage">{entry.newValue}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Clock size={10} className="text-text-secondary" />
                            <span className="text-xs text-text-secondary">{formatRelativeTime(entry.timestamp)}</span>
                            {entry.author && (
                              <span className="text-xs text-text-secondary">· {entry.author}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {showEditModal && (
        <StoryFormModal initialData={story} onClose={() => setShowEditModal(false)} />
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete User Story?"
          message={`This will permanently delete ${story.id}: "${story.title}". This action cannot be undone.`}
          confirmLabel="Delete Story"
          onConfirm={handleDeleteStory}
          onCancel={() => setShowDeleteConfirm(false)}
          danger
        />
      )}
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function MetaField({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-base">{label}</label>
      {children}
    </div>
  );
}

function InlineEdit({
  value,
  onSave,
  placeholder,
  multiline = false,
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    const props = {
      className: 'input-base mt-1',
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      autoFocus: true,
    };
    return (
      <span className="block">
        {multiline
          ? <textarea {...props} rows={2} className="input-base mt-1 resize-none w-full" />
          : <input {...props} className="input-base mt-1 w-full" />
        }
        <span className="flex gap-1 mt-1">
          <button onClick={() => { onSave(draft); setEditing(false); }} className="btn-primary text-xs py-1 px-2">Save</button>
          <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1 px-2">Cancel</button>
        </span>
      </span>
    );
  }

  return (
    <span
      className="inline text-sm text-text-primary cursor-pointer hover:text-sage transition-colors"
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click to edit"
    >
      {value || <span className="text-text-secondary italic">{placeholder}</span>}
    </span>
  );
}

function AcceptanceCriterionCard({
  ac,
  isEditing,
  onToggle,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  ac: AcceptanceCriterion;
  isEditing: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onSave: (changes: Partial<AcceptanceCriterion>) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState({ given: ac.given, when: ac.when, then: ac.then });

  return (
    <div className={`rounded-md border p-4 ${ac.completed ? 'border-sage/30 bg-sage-light/20' : 'border-border bg-surface'}`}>
      {isEditing ? (
        <div className="space-y-2">
          {(['given', 'when', 'then'] as const).map((f) => (
            <div key={f}>
              <label className="label-base capitalize">{f}</label>
              <textarea
                className="input-base resize-none"
                rows={2}
                value={draft[f]}
                onChange={(e) => setDraft((d) => ({ ...d, [f]: e.target.value }))}
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={() => onSave(draft)} className="btn-primary text-xs py-1.5">Save</button>
            <button onClick={onCancel} className="btn-secondary text-xs py-1.5">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2.5 mb-2">
            <button
              onClick={onToggle}
              className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                ac.completed ? 'bg-sage border-sage' : 'border-border hover:border-sage'
              }`}
              aria-label={ac.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {ac.completed && <Check size={10} className="text-white" />}
            </button>
            <div className="flex-1">
              <p className="text-xs text-text-secondary font-medium">GIVEN</p>
              <p className={`text-sm ${ac.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{ac.given || '—'}</p>
            </div>
          </div>
          <div className="ml-6.5 space-y-1.5">
            <div>
              <p className="text-xs text-text-secondary font-medium">WHEN</p>
              <p className="text-sm text-text-primary">{ac.when || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary font-medium">THEN</p>
              <p className="text-sm text-text-primary">{ac.then || '—'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
            <span className={`badge text-xs ${ac.testability === 'good' ? 'bg-sage-light text-sage-dark border-sage/20' : 'bg-amber-light text-amber-dark border-amber/20'}`}>
              Testability: {ac.testability === 'good' ? 'Good' : 'Needs Clarification'}
            </span>
            <div className="flex gap-1">
              <button onClick={onEdit} className="btn-ghost text-xs py-1 px-2"><Edit3 size={11} /></button>
              <button onClick={onDelete} className="btn-ghost text-xs py-1 px-2 text-terracotta hover:text-terracotta"><Trash2 size={11} /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CheckSquareIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-text-secondary/40">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
