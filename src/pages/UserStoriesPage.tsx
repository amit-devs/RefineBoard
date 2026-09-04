import React, { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { PriorityBadge, DevStatusBadge, RefinementStageBadge, QualityRing, EmptyState } from '@/components/ui';
import { StoryDrawer } from '@/components/stories/StoryDrawer';
import { StoryFormModal } from '@/components/stories/StoryFormModal';
import { formatRelativeTime } from '@/utils/helpers';

export function UserStoriesPage() {
  const { stories } = useAppContext();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const selectedStory = stories.find((s) => s.id === selectedStoryId) ?? null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">User Stories</h2>
          <p className="text-sm text-text-secondary mt-1">{stories.length} total stories</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus size={15} /> New Story
        </button>
      </div>

      {stories.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={24} />}
          title="No user stories yet"
          description="Create your first user story to get started."
          action={
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              <Plus size={14} /> Create Story
            </button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {stories
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((story) => (
              <div
                key={story.id}
                onClick={() => setSelectedStoryId(story.id)}
                className="card p-4 cursor-pointer hover:shadow-card transition-shadow flex items-center gap-4"
              >
                <div className="flex-shrink-0 relative">
                  <QualityRing score={story.qualityScore} size={40} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-text-primary">{story.qualityScore}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-text-secondary">{story.id}</span>
                    <PriorityBadge priority={story.priority} />
                    <DevStatusBadge status={story.devStatus} />
                    <RefinementStageBadge stage={story.refinementStage} />
                  </div>
                  <p className="font-medium text-text-primary truncate">{story.title}</p>
                  {story.asA && (
                    <p className="text-xs text-text-secondary mt-0.5 truncate">
                      As a {story.asA}, I want {story.iWant}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right hidden md:block">
                  <p className="text-sm font-semibold text-text-primary">
                    {story.storyPoints > 0 ? `${story.storyPoints} pts` : '— pts'}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {story.acceptanceCriteria.length} criteria
                  </p>
                  <p className="text-xs text-text-secondary/60 mt-0.5">
                    {formatRelativeTime(story.updatedAt)}
                  </p>
                </div>
              </div>
            ))}
        </div>
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
