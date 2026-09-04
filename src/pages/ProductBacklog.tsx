import React, { useState, useMemo, useCallback } from 'react';
import {
  Plus, GripVertical, Search, Filter, ChevronUp, ChevronDown,
  MoreHorizontal, Edit3, Copy, Trash2, ArrowUpDown, SlidersHorizontal
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useAppContext } from '@/context/AppContext';
import { PriorityBadge, RefinementStageBadge, QualityRing, EmptyState, ConfirmDialog } from '@/components/ui';
import { StoryDrawer } from '@/components/stories/StoryDrawer';
import { StoryFormModal } from '@/components/stories/StoryFormModal';
import type { UserStory, Priority, RefinementStage } from '@/types';
import { REFINEMENT_STAGE_LABELS, PRIORITY_LABELS } from '@/utils/helpers';

type SortKey = 'position' | 'priority' | 'storyPoints' | 'qualityScore' | 'refinementStage';
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const REFINEMENT_STAGE_ORDER: Record<RefinementStage, number> = {
  draft: 0, 'needs-refinement': 1, 'under-review': 2, ready: 3
};

// ─── Sortable Row ─────────────────────────────────────────────────────────────
function SortableRow({
  story,
  onOpen,
  onDelete,
  onDuplicate,
}: {
  story: UserStory;
  onOpen: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: story.id });
  const [menuOpen, setMenuOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="table-row cursor-pointer group"
      onClick={onOpen}
    >
      {/* Grip */}
      <td className="table-cell w-8 pr-0 pl-2">
        <span
          {...attributes}
          {...listeners}
          className="text-text-secondary/40 hover:text-text-secondary cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </span>
      </td>
      <td className="table-cell w-20">
        <span className="text-xs font-mono text-text-secondary">{story.id}</span>
      </td>
      <td className="table-cell">
        <div>
          <p className="font-medium text-text-primary text-sm">{story.title}</p>
          {story.asA && (
            <p className="text-xs text-text-secondary mt-0.5 truncate max-w-xs">
              As a {story.asA}
            </p>
          )}
        </div>
      </td>
      <td className="table-cell">
        <PriorityBadge priority={story.priority} />
      </td>
      <td className="table-cell">
        <RefinementStageBadge stage={story.refinementStage} />
      </td>
      <td className="table-cell text-center">
        {story.storyPoints > 0 ? (
          <span className="text-sm font-semibold text-text-primary">{story.storyPoints}</span>
        ) : (
          <span className="text-xs text-text-secondary">—</span>
        )}
      </td>
      <td className="table-cell">
        <div className="flex items-center gap-2">
          <QualityRing score={story.qualityScore} size={28} />
          <span className="text-sm font-medium text-text-primary">{story.qualityScore}%</span>
        </div>
      </td>
      <td className="table-cell text-xs text-text-secondary">
        {story.sprint || '—'}
      </td>
      <td className="table-cell" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((m) => !m)}
            className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-7 bg-surface border border-border rounded-md shadow-dropdown z-20 py-1 min-w-[140px]">
                <button
                  onClick={() => { onOpen(); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-text-primary hover:bg-ivory flex items-center gap-2"
                >
                  <Edit3 size={12} /> View / Edit
                </button>
                <button
                  onClick={() => { onDuplicate(); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-text-primary hover:bg-ivory flex items-center gap-2"
                >
                  <Copy size={12} /> Duplicate
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => { onDelete(); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-terracotta hover:bg-terracotta-light flex items-center gap-2"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Product Backlog Page ────────────────────────────────────────────────────
export function ProductBacklog() {
  const { stories, reorderStories, deleteStory, duplicateStory, sprints, team, addToast } = useAppContext();

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterSprint, setFilterSprint] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('position');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const selectedStory = stories.find((s) => s.id === selectedStoryId) ?? null;
  const deleteTarget = stories.find((s) => s.id === deleteConfirmId);

  // Sort helper
  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const filtered = useMemo(() => {
    let result = [...stories];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.asA.toLowerCase().includes(q) ||
          s.iWant.toLowerCase().includes(q) ||
          s.assignee.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filterPriority) result = result.filter((s) => s.priority === filterPriority);
    if (filterStage) result = result.filter((s) => s.refinementStage === filterStage);
    if (filterSprint) result = result.filter((s) => s.sprint === filterSprint);
    if (filterAssignee) result = result.filter((s) => s.assignee === filterAssignee);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'position': cmp = a.position - b.position; break;
        case 'priority': cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]; break;
        case 'refinementStage': cmp = REFINEMENT_STAGE_ORDER[a.refinementStage] - REFINEMENT_STAGE_ORDER[b.refinementStage]; break;
        case 'storyPoints': cmp = a.storyPoints - b.storyPoints; break;
        case 'qualityScore': cmp = a.qualityScore - b.qualityScore; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [stories, search, filterPriority, filterStage, filterSprint, filterAssignee, sortKey, sortDir]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = filtered.map((s) => s.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    const newOrder = arrayMove(ids, oldIndex, newIndex);

    // Apply new order to full stories list
    const positionMap = new Map(newOrder.map((id, idx) => [id, idx]));
    const allIds = stories
      .map((s) => ({ id: s.id, pos: positionMap.has(s.id) ? positionMap.get(s.id)! : s.position + 1000 }))
      .sort((a, b) => a.pos - b.pos)
      .map((s) => s.id);

    reorderStories(allIds);
    addToast('Backlog priority updated');
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ArrowUpDown size={11} className="opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />;
  }

  const assignees = useMemo(() => {
    return [...new Set(stories.map((s) => s.assignee).filter(Boolean))];
  }, [stories]);

  const activeFiltersCount = [filterPriority, filterStage, filterSprint, filterAssignee].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 py-5 border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Product Backlog</h1>
            <p className="text-sm text-text-secondary mt-1">
              Refine, prioritize and prepare stories for development.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus size={15} /> New User Story
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-ivory border border-border rounded text-sm flex-1 max-w-sm">
            <Search size={13} className="text-text-secondary flex-shrink-0" />
            <input
              type="text"
              placeholder="Search stories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-text-primary placeholder-text-secondary flex-1"
            />
          </div>
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`btn-secondary ${activeFiltersCount > 0 ? 'border-sage text-sage' : ''}`}
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-sage text-white text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <span className="text-sm text-text-secondary ml-auto">
            {filtered.length} of {stories.length} stories
          </span>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-3 grid grid-cols-4 gap-3 p-4 bg-ivory rounded-md border border-border">
            <div>
              <label className="label-base">Priority</label>
              <select className="input-base text-xs" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option value="">All</option>
                {(['critical','high','medium','low'] as const).map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-base">Refinement Stage</label>
              <select className="input-base text-xs" value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                <option value="">All</option>
                {Object.entries(REFINEMENT_STAGE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-base">Sprint</label>
              <select className="input-base text-xs" value={filterSprint} onChange={(e) => setFilterSprint(e.target.value)}>
                <option value="">All</option>
                {sprints.map((sp) => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-base">Assignee</label>
              <select className="input-base text-xs" value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
                <option value="">All</option>
                {assignees.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            {activeFiltersCount > 0 && (
              <div className="col-span-4 flex justify-end">
                <button
                  onClick={() => { setFilterPriority(''); setFilterStage(''); setFilterSprint(''); setFilterAssignee(''); }}
                  className="text-xs text-terracotta hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState
            title="No stories found"
            description={search || activeFiltersCount > 0 ? 'Try changing your filters or search query.' : 'Create your first user story to get started.'}
            action={
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                <Plus size={14} /> Create User Story
              </button>
            }
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <table className="w-full">
                <thead className="bg-ivory sticky top-0 z-10 border-b border-border">
                  <tr>
                    <th className="w-8" />
                    <th className="table-header w-20">ID</th>
                    <th className="table-header">User Story</th>
                    <th className="table-header">
                      <button onClick={() => toggleSort('priority')} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                        Priority <SortIcon k="priority" />
                      </button>
                    </th>
                    <th className="table-header">
                      <button onClick={() => toggleSort('refinementStage')} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                        Stage <SortIcon k="refinementStage" />
                      </button>
                    </th>
                    <th className="table-header text-center">
                      <button onClick={() => toggleSort('storyPoints')} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                        Points <SortIcon k="storyPoints" />
                      </button>
                    </th>
                    <th className="table-header">
                      <button onClick={() => toggleSort('qualityScore')} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                        Quality <SortIcon k="qualityScore" />
                      </button>
                    </th>
                    <th className="table-header">Sprint</th>
                    <th className="table-header w-12" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((story) => (
                    <SortableRow
                      key={story.id}
                      story={story}
                      onOpen={() => setSelectedStoryId(story.id)}
                      onDelete={() => setDeleteConfirmId(story.id)}
                      onDuplicate={() => {
                        duplicateStory(story.id);
                        addToast('Story duplicated');
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modals & Drawer */}
      {showCreateModal && (
        <StoryFormModal onClose={() => setShowCreateModal(false)} />
      )}

      {selectedStory && (
        <StoryDrawer
          story={selectedStory}
          onClose={() => setSelectedStoryId(null)}
          onOpenStory={setSelectedStoryId}
        />
      )}

      {deleteConfirmId && deleteTarget && (
        <ConfirmDialog
          title="Delete User Story?"
          message={`Permanently delete ${deleteTarget.id}: "${deleteTarget.title}"? This cannot be undone.`}
          confirmLabel="Delete Story"
          onConfirm={() => {
            deleteStory(deleteConfirmId);
            addToast('User story deleted');
            setDeleteConfirmId(null);
          }}
          onCancel={() => setDeleteConfirmId(null)}
          danger
        />
      )}
    </div>
  );
}
