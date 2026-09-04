import React, { useState } from 'react';
import { Zap, Plus, CheckCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { DevStatusBadge, PriorityBadge } from '@/components/ui';
import { StoryDrawer } from '@/components/stories/StoryDrawer';
import { formatDate, createActivity } from '@/utils/helpers';

export function Sprints() {
  const { sprints, stories, updateStory, addToast } = useAppContext();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const selectedStory = stories.find((s) => s.id === selectedStoryId) ?? null;

  const unassignedStories = stories.filter((s) => !s.sprint);

  return (
    <div className="p-6 space-y-6">
      {sprints.map((sprint) => {
        const sprintStories = stories.filter((s) => s.sprint === sprint.id);
        const totalPoints = sprintStories.reduce((sum, s) => sum + s.storyPoints, 0);
        const completedPoints = sprintStories.filter((s) => s.devStatus === 'done').reduce((sum, s) => sum + s.storyPoints, 0);
        const progress = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

        return (
          <div key={sprint.id} className="card">
            {/* Sprint header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-text-primary">{sprint.name}</h3>
                  {sprint.active && (
                    <span className="badge bg-sage-light text-sage-dark border border-sage/20 text-xs">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary">{formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}</p>
                {sprint.goal && <p className="text-sm text-text-secondary mt-1 italic">"{sprint.goal}"</p>}
              </div>
              <div className="flex gap-6 text-right">
                <div>
                  <p className="text-xl font-bold text-text-primary">{sprintStories.length}</p>
                  <p className="text-xs text-text-secondary">Stories</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-text-primary">{totalPoints}</p>
                  <p className="text-xs text-text-secondary">Total pts</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-sage">{completedPoints}</p>
                  <p className="text-xs text-text-secondary">Completed</p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-5 py-2 border-b border-border">
              <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-ivory rounded-full overflow-hidden">
                <div
                  className="h-full bg-sage rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stories list */}
            <div className="divide-y divide-border">
              {sprintStories.length === 0 ? (
                <p className="px-5 py-4 text-sm text-text-secondary">No stories in this sprint yet.</p>
              ) : (
                sprintStories.map((story) => (
                  <div
                    key={story.id}
                    className="flex items-center gap-3 px-5 py-2.5 hover:bg-ivory cursor-pointer transition-colors"
                    onClick={() => setSelectedStoryId(story.id)}
                  >
                    <span className="text-xs font-mono text-text-secondary w-14 flex-shrink-0">{story.id}</span>
                    <p className="text-sm text-text-primary flex-1 truncate">{story.title}</p>
                    <PriorityBadge priority={story.priority} />
                    <DevStatusBadge status={story.devStatus} />
                    <span className="text-xs text-text-secondary w-10 text-right">
                      {story.storyPoints > 0 ? `${story.storyPoints}pt` : '—'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Assign unassigned stories */}
            {unassignedStories.length > 0 && (
              <div className="px-5 py-3 border-t border-border bg-ivory/50">
                <div className="flex items-center gap-3">
                  <Plus size={13} className="text-text-secondary flex-shrink-0" />
                  <span className="text-xs text-text-secondary">Assign story to this sprint:</span>
                  <select
                    className="input-base text-xs py-1 flex-1 max-w-xs"
                    value=""
                    onChange={(e) => {
                      const storyId = e.target.value;
                      if (!storyId) return;
                      const story = stories.find((s) => s.id === storyId);
                      if (!story) return;
                      const act = createActivity('sprint', `Assigned to ${sprint.name}`, 'Unassigned', sprint.name);
                      updateStory(storyId, { sprint: sprint.id }, act);
                      addToast(`${storyId} assigned to ${sprint.name}`);
                    }}
                  >
                    <option value="">Select a story...</option>
                    {unassignedStories.map((s) => (
                      <option key={s.id} value={s.id}>{s.id}: {s.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        );
      })}

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
