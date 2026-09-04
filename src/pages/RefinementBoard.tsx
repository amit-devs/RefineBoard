import React, { useState, useMemo } from 'react';
import { Info, Plus } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverEvent, DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useAppContext } from '@/context/AppContext';
import { PriorityBadge, QualityRing, EmptyState } from '@/components/ui';
import { StoryDrawer } from '@/components/stories/StoryDrawer';
import { StoryFormModal } from '@/components/stories/StoryFormModal';
import { getDefinitionOfReadyChecks } from '@/utils/qualityEngine';
import { REFINEMENT_STAGE_LABELS, createActivity } from '@/utils/helpers';
import type { UserStory, RefinementStage } from '@/types';

const COLUMNS = [
  { id: 'Draft', stage: 'draft' as RefinementStage },
  { id: 'Needs Refinement', stage: 'needs-refinement' as RefinementStage },
  { id: 'Under Review', stage: 'under-review' as RefinementStage },
  { id: 'Ready for Development', stage: 'ready' as RefinementStage },
];

// ─── Story Card ───────────────────────────────────────────────────────────────
function StoryCard({ story, onOpen }: { story: UserStory; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: story.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card p-3.5 cursor-pointer hover:shadow-card transition-shadow group"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-mono text-text-secondary">{story.id}</span>
        <div className="flex items-center gap-1">
          <PriorityBadge priority={story.priority} />
          <div
            className="text-text-secondary/30 hover:text-text-secondary cursor-grab opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            ⠿
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-text-primary mb-3 line-clamp-2">{story.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <QualityRing score={story.qualityScore} size={28} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-bold text-text-primary">{story.qualityScore}</span>
            </div>
          </div>
          <div className="text-xs text-text-secondary">
            {story.storyPoints > 0 ? `${story.storyPoints} pts` : '?pts'}
          </div>
        </div>
        <span className="text-xs text-text-secondary">{story.acceptanceCriteria.length} AC</span>
      </div>
      {story.assignee && (
        <p className="text-xs text-text-secondary mt-2 truncate">{story.assignee}</p>
      )}
    </div>
  );
}

// ─── DoR Gate Modal ───────────────────────────────────────────────────────────
function DorGateModal({
  story,
  onClose,
  onFix,
  settings,
}: {
  story: UserStory;
  onClose: () => void;
  onFix: () => void;
  settings: { dorQualityThreshold: number };
}) {
  const checks = getDefinitionOfReadyChecks(story, settings.dorQualityThreshold);
  const failing = checks.filter((c) => !c.passed);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4">
      <div className="bg-surface rounded-lg shadow-modal w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-text-primary mb-1">Story is not ready yet</h3>
        <p className="text-sm text-text-secondary mb-4">
          {story.id} must meet all Definition of Ready criteria before moving to Ready for Development.
        </p>
        <div className="space-y-2 mb-5">
          {checks.map((check) => (
            <div key={check.key} className="flex items-start gap-2">
              <span className={`text-sm flex-shrink-0 ${check.passed ? 'text-sage' : 'text-terracotta'}`}>
                {check.passed ? '✓' : '✕'}
              </span>
              <div>
                <p className={`text-sm ${check.passed ? 'text-text-secondary' : 'text-text-primary font-medium'}`}>
                  {check.label}
                </p>
                {!check.passed && (
                  <p className="text-xs text-terracotta mt-0.5">{check.hint}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onFix} className="btn-primary flex-1">Review Story</button>
        </div>
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────
function Column({
  columnId,
  stories,
  onCardOpen,
}: {
  columnId: string;
  stories: UserStory[];
  onCardOpen: (id: string) => void;
}) {
  const COLUMN_COLORS: Record<string, string> = {
    'Draft': 'bg-border/30',
    'Needs Refinement': 'bg-terracotta-light/30',
    'Under Review': 'bg-amber-light/30',
    'Ready for Development': 'bg-sage-light/40',
  };

  return (
    <div className={`flex flex-col rounded-md ${COLUMN_COLORS[columnId] ?? 'bg-ivory'} p-3 min-h-[500px] w-64 flex-shrink-0`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">{columnId}</h3>
        <span className="text-xs bg-white border border-border rounded-full px-1.5 py-0.5 text-text-secondary font-medium">
          {stories.length}
        </span>
      </div>
      <SortableContext items={stories.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} onOpen={() => onCardOpen(story.id)} />
          ))}
          {stories.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-xs text-text-secondary/60 py-8 border-2 border-dashed border-text-secondary/20 rounded-md">
              Drop stories here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Refinement Board Page ────────────────────────────────────────────────────
export function RefinementBoard() {
  const { stories, updateStory, settings, addToast } = useAppContext();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dorGateStory, setDorGateStory] = useState<UserStory | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const selectedStory = stories.find((s) => s.id === selectedStoryId) ?? null;

  // Map column id to list of stories
  const columnStories = useMemo(() => {
    const map: Record<string, UserStory[]> = {};
    COLUMNS.forEach((col) => {
      map[col.id] = stories
        .filter((s) => s.refinementStage === col.stage)
        .sort((a, b) => a.position - b.position);
    });
    return map;
  }, [stories]);

  function getColumnForStage(stage: RefinementStage): string {
    const col = COLUMNS.find((c) => c.stage === stage);
    return col ? col.id : 'Draft';
  }

  function getColumnForStory(storyId: string): string {
    const story = stories.find((s) => s.id === storyId);
    if (!story) return 'Draft';
    return getColumnForStage(story.refinementStage);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const storyId = active.id as string;
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;

    // Determine target column: over.id could be a story id or a column id
    let targetColumn: string | undefined;
    if (COLUMNS.some((c) => c.id === over.id)) {
      targetColumn = over.id as string;
    } else {
      targetColumn = getColumnForStory(over.id as string);
    }

    if (!targetColumn) return;

    const sourceColumn = getColumnForStage(story.refinementStage);
    if (sourceColumn === targetColumn) return; // same column, no status change needed

    // Gate check for Ready for Development
    if (targetColumn === 'Ready for Development') {
      const checks = getDefinitionOfReadyChecks(story, settings.dorQualityThreshold);
      if (!checks.every((c) => c.passed)) {
        setDorGateStory(story);
        return;
      }
    }

    const newStage = COLUMNS.find((c) => c.id === targetColumn)?.stage ?? 'draft';
    const activity = createActivity(
      'refinementStage',
      `Moved to ${targetColumn} on Refinement Board`,
      REFINEMENT_STAGE_LABELS[story.refinementStage],
      REFINEMENT_STAGE_LABELS[newStage]
    );
    updateStory(storyId, { refinementStage: newStage }, activity);
    addToast(`Story moved to ${targetColumn}`);
  }

  const activeStory = activeId ? stories.find((s) => s.id === activeId) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 py-5 border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Backlog Refinement Board</h1>
            <p className="text-sm text-text-secondary mt-1 max-w-2xl">
              Backlog Refinement is the ongoing process of reviewing, clarifying, estimating, prioritizing,
              and validating user stories before they enter a development sprint.
            </p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex-shrink-0">
            <Plus size={15} /> New Story
          </button>
        </div>

        {/* Info bar */}
        <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary bg-ivory rounded px-3 py-2 border border-border w-fit">
          <Info size={12} className="text-sage flex-shrink-0" />
          Drag stories between columns to update their refinement status. Moving to Ready for Development requires all Definition of Ready criteria to be met.
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(e.active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 min-w-max">
              {COLUMNS.map((col) => (
                <Column
                  key={col.id}
                  columnId={col.id}
                  stories={columnStories[col.id] ?? []}
                  onCardOpen={setSelectedStoryId}
                />
              ))}
            </div>
            <DragOverlay>
              {activeStory && (
                <div className="card p-3.5 opacity-90 shadow-modal w-64">
                  <p className="text-xs font-mono text-text-secondary mb-1">{activeStory.id}</p>
                  <p className="text-sm font-medium text-text-primary">{activeStory.title}</p>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* DoR Gate */}
      {dorGateStory && (
        <DorGateModal
          story={dorGateStory}
          settings={settings}
          onClose={() => setDorGateStory(null)}
          onFix={() => {
            setSelectedStoryId(dorGateStory.id);
            setDorGateStory(null);
          }}
        />
      )}

      {selectedStory && (
        <StoryDrawer
          story={selectedStory}
          onClose={() => setSelectedStoryId(null)}
          onOpenStory={setSelectedStoryId}
        />
      )}

      {showCreateModal && (
        <StoryFormModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
