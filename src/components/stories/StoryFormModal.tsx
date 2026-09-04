import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Tooltip } from '@/components/ui';
import type { Priority, DevStatus, RefinementStage, StoryPoints, UserStory } from '@/types';
import { STORY_POINTS, TAGS } from '@/utils/helpers';

interface StoryFormProps {
  initialData?: Partial<UserStory>;
  onClose: () => void;
  onSave?: (story: UserStory) => void;
}

export function StoryFormModal({ initialData, onClose, onSave }: StoryFormProps) {
  const { createStory, updateStory, sprints, team, stories, addToast } = useAppContext();
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    asA: initialData?.asA ?? '',
    iWant: initialData?.iWant ?? '',
    soThat: initialData?.soThat ?? '',
    priority: (initialData?.priority ?? 'medium') as Priority,
    devStatus: (initialData?.devStatus ?? 'draft') as DevStatus,
    refinementStage: (initialData?.refinementStage ?? 'draft') as RefinementStage,
    storyPoints: (initialData?.storyPoints ?? 0) as StoryPoints,
    businessValue: initialData?.businessValue ?? 5,
    effort: initialData?.effort ?? 5,
    sprint: initialData?.sprint ?? '',
    assignee: initialData?.assignee ?? '',
    tags: initialData?.tags ?? [] as string[],
    dependenciesReviewed: initialData?.dependenciesReviewed ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.asA.trim()) e.asA = 'User role is required';
    if (!form.iWant.trim()) e.iWant = 'Goal is required';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (isEditing && initialData?.id) {
      updateStory(initialData.id, { ...form });
      addToast('User story updated successfully');
      onClose();
    } else {
      const story = createStory({
        ...form,
        soThat: form.soThat,
        dependencies: initialData?.dependencies ?? [],
        acceptanceCriteria: initialData?.acceptanceCriteria ?? [],
      });
      addToast('User story created successfully');
      onSave?.(story);
      onClose();
    }
  }

  function toggleTag(tag: string) {
    set('tags', form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag]);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 overflow-y-auto py-8 px-4 animate-fade-in">
      <div className="bg-surface rounded-lg shadow-modal w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              {isEditing ? 'Edit User Story' : 'New User Story'}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Follow the standard Agile user story format
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="label-base">Story Title *</label>
            <input
              className={`input-base ${errors.title ? 'border-terracotta' : ''}`}
              placeholder="e.g. Password Reset"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
            {errors.title && <p className="text-xs text-terracotta mt-1">{errors.title}</p>}
          </div>

          {/* Story Format */}
          <div className="bg-sage-light/50 rounded-md p-4 space-y-3">
            <p className="text-xs font-semibold text-sage uppercase tracking-wide">Story Format</p>
            <div>
              <label className="label-base">As a... (user role) *</label>
              <input
                className={`input-base ${errors.asA ? 'border-terracotta' : ''}`}
                placeholder="e.g. registered user"
                value={form.asA}
                onChange={(e) => set('asA', e.target.value)}
              />
              {errors.asA && <p className="text-xs text-terracotta mt-1">{errors.asA}</p>}
            </div>
            <div>
              <label className="label-base">I want... (goal) *</label>
              <textarea
                className={`input-base resize-none ${errors.iWant ? 'border-terracotta' : ''}`}
                rows={2}
                placeholder="e.g. to reset my password through email verification"
                value={form.iWant}
                onChange={(e) => set('iWant', e.target.value)}
              />
              {errors.iWant && <p className="text-xs text-terracotta mt-1">{errors.iWant}</p>}
            </div>
            <div>
              <label className="label-base">So that... (business value)</label>
              <textarea
                className="input-base resize-none"
                rows={2}
                placeholder="e.g. I can regain access to my account without contacting support"
                value={form.soThat}
                onChange={(e) => set('soThat', e.target.value)}
              />
            </div>
          </div>

          {/* Priority, Dev Status, Refinement Stage, Points */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="label-base">Priority</label>
              <select
                className="input-base"
                value={form.priority}
                onChange={(e) => set('priority', e.target.value as Priority)}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="label-base">Dev Status</label>
              <select
                className="input-base"
                value={form.devStatus}
                onChange={(e) => set('devStatus', e.target.value as DevStatus)}
              >
                <option value="draft">Draft</option>
                <option value="in-progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="label-base">Refinement</label>
              <select
                className="input-base"
                value={form.refinementStage}
                onChange={(e) => set('refinementStage', e.target.value as RefinementStage)}
              >
                <option value="draft">Draft</option>
                <option value="needs-refinement">Needs Refinement</option>
                <option value="under-review">Under Review</option>
                <option value="ready">Ready for Dev</option>
              </select>
            </div>
            <div>
              <label className="label-base flex items-center gap-1">
                Story Points
                <Tooltip content="Story points represent relative effort, complexity, and uncertainty — not direct hours.">
                  <HelpCircle size={11} className="text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <select
                className="input-base"
                value={form.storyPoints}
                onChange={(e) => set('storyPoints', Number(e.target.value) as StoryPoints)}
              >
                <option value={0}>Not estimated</option>
                {STORY_POINTS.filter((p) => p > 0).map((p) => (
                  <option key={p} value={p}>{p} pts</option>
                ))}
              </select>
            </div>
          </div>

          {/* Business Value + Effort */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-base flex items-center gap-1">
                Business Value (1–10)
                <Tooltip content="Relative business value (1 = low, 10 = high). Used in the Priority Matrix. This is separate from Priority — a story can be low-priority but still have high long-term business value.">
                  <HelpCircle size={11} className="text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={form.businessValue}
                onChange={(e) => set('businessValue', Number(e.target.value))}
                className="w-full accent-sage"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-0.5">
                <span>1 — Low</span>
                <span className="font-semibold text-sage">{form.businessValue}</span>
                <span>10 — High</span>
              </div>
            </div>
            <div>
              <label className="label-base flex items-center gap-1">
                Effort (Fibonacci)
                <Tooltip content="Estimated effort on a Fibonacci scale (1, 2, 3, 5, 8, 13). Used as the X-axis in the Priority Matrix.">
                  <HelpCircle size={11} className="text-text-secondary cursor-help" />
                </Tooltip>
              </label>
              <select
                className="input-base"
                value={form.effort}
                onChange={(e) => set('effort', Number(e.target.value))}
              >
                {[1, 2, 3, 5, 8, 13].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sprint + Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-base">Sprint</label>
              <select
                className="input-base"
                value={form.sprint}
                onChange={(e) => set('sprint', e.target.value)}
              >
                <option value="">Unassigned</option>
                {sprints.map((sp) => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-base">Assignee</label>
              <select
                className="input-base"
                value={form.assignee}
                onChange={(e) => set('assignee', e.target.value)}
              >
                <option value="">Unassigned</option>
                {team.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label-base">Tags</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    form.tags.includes(tag)
                      ? 'bg-sage text-white border-sage'
                      : 'bg-surface text-text-secondary border-border hover:border-sage/40'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Dependencies Reviewed */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.dependenciesReviewed}
              onChange={(e) => set('dependenciesReviewed', e.target.checked)}
              className="w-4 h-4 accent-sage rounded"
            />
            <span className="text-sm text-text-primary">Dependencies have been reviewed</span>
            <Tooltip content="Check this after you have identified and reviewed all story dependencies. This contributes to the Quality Score.">
              <HelpCircle size={11} className="text-text-secondary cursor-help" />
            </Tooltip>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Save Changes' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
