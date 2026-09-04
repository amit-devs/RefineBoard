import React, { useState, useCallback, useEffect } from 'react';
import { AppContext } from './AppContext';
import type { AppContextValue } from './AppContext';
import type {
  UserStory,
  Sprint,
  TeamMember,
  AppSettings,
  Toast,
  AcceptanceCriterion,
  DependencyRef,
  StoryActivity,
} from '@/types';
import { storageService } from '@/services/storageService';
import { calculateQualityScore, assessTestability } from '@/utils/qualityEngine';
import { generateId, generateStoryId, now, createActivity } from '@/utils/helpers';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [stories, setStoriesRaw] = useState<UserStory[]>(() => storageService.loadStories());
  const [sprints] = useState<Sprint[]>(() => storageService.loadSprints());
  const [team] = useState<TeamMember[]>(() => storageService.loadTeam());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.loadSettings());
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persist stories on change
  const setStories = useCallback((updater: (prev: UserStory[]) => UserStory[]) => {
    setStoriesRaw((prev) => {
      const next = updater(prev);
      storageService.saveStories(next);
      return next;
    });
  }, []);

  // Recalculate quality score for a story
  function withQuality(story: UserStory): UserStory {
    const { score } = calculateQualityScore(story);
    return { ...story, qualityScore: score };
  }

  // ─── Toast ───────────────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = generateId('toast-');
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Story CRUD ───────────────────────────────────────────────────────────────
  const createStory = useCallback(
    (data: Omit<UserStory, 'id' | 'qualityScore' | 'position' | 'createdAt' | 'updatedAt' | 'activityLog'>): UserStory => {
      let newStory: UserStory;
      setStories((prev) => {
        const id = generateStoryId(prev.map((s) => s.id));
        const partial: UserStory = {
          ...data,
          id,
          qualityScore: 0,
          position: prev.length + 1,
          createdAt: now(),
          updatedAt: now(),
          activityLog: [
            createActivity('created', `Story ${id} created`),
          ],
        };
        newStory = withQuality(partial);
        return [...prev, newStory];
      });
      return newStory!;
    },
    [setStories]
  );

  const updateStory = useCallback(
    (id: string, changes: Partial<UserStory>, activityEntry?: StoryActivity) => {
      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const updated: UserStory = {
            ...s,
            ...changes,
            updatedAt: now(),
            activityLog: activityEntry
              ? [activityEntry, ...s.activityLog]
              : s.activityLog,
          };
          return withQuality(updated);
        })
      );
    },
    [setStories]
  );

  const deleteStory = useCallback(
    (id: string) => {
      setStories((prev) => prev.filter((s) => s.id !== id));
    },
    [setStories]
  );

  const duplicateStory = useCallback(
    (id: string) => {
      setStories((prev) => {
        const original = prev.find((s) => s.id === id);
        if (!original) return prev;
        const newId = generateStoryId(prev.map((s) => s.id));
        const duplicate: UserStory = {
          ...original,
          id: newId,
          title: `${original.title} (Copy)`,
          devStatus: 'draft',
          refinementStage: 'draft',
          position: prev.length + 1,
          createdAt: now(),
          updatedAt: now(),
          activityLog: [createActivity('created', `Duplicated from ${id}`)],
        };
        return [...prev, withQuality(duplicate)];
      });
    },
    [setStories]
  );

  const reorderStories = useCallback(
    (orderedIds: string[]) => {
      setStories((prev) => {
        const map = new Map(prev.map((s) => [s.id, s]));
        return orderedIds
          .map((id, idx) => {
            const s = map.get(id);
            if (!s) return null;
            return { ...s, position: idx + 1 };
          })
          .filter(Boolean) as UserStory[];
      });
    },
    [setStories]
  );

  // ─── Acceptance Criteria ──────────────────────────────────────────────────────
  const addCriterion = useCallback(
    (storyId: string, criterion: Omit<AcceptanceCriterion, 'id'>) => {
      const id = generateId('ac-');
      const newAc: AcceptanceCriterion = {
        ...criterion,
        id,
        testability: assessTestability({ ...criterion, id, completed: false }),
      };
      const activity = createActivity('ac-added', `Acceptance criterion added`);
      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== storyId) return s;
          const updated: UserStory = {
            ...s,
            acceptanceCriteria: [...s.acceptanceCriteria, newAc],
            updatedAt: now(),
            activityLog: [activity, ...s.activityLog],
          };
          return withQuality(updated);
        })
      );
    },
    [setStories]
  );

  const updateCriterion = useCallback(
    (storyId: string, criterionId: string, changes: Partial<AcceptanceCriterion>) => {
      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== storyId) return s;
          const updatedCriteria = s.acceptanceCriteria.map((ac) => {
            if (ac.id !== criterionId) return ac;
            const merged = { ...ac, ...changes };
            return { ...merged, testability: assessTestability(merged) };
          });
          return withQuality({ ...s, acceptanceCriteria: updatedCriteria, updatedAt: now() });
        })
      );
    },
    [setStories]
  );

  const deleteCriterion = useCallback(
    (storyId: string, criterionId: string) => {
      const activity = createActivity('ac-deleted', 'Acceptance criterion removed');
      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== storyId) return s;
          const updated: UserStory = {
            ...s,
            acceptanceCriteria: s.acceptanceCriteria.filter((ac) => ac.id !== criterionId),
            updatedAt: now(),
            activityLog: [activity, ...s.activityLog],
          };
          return withQuality(updated);
        })
      );
    },
    [setStories]
  );

  const toggleCriterion = useCallback(
    (storyId: string, criterionId: string) => {
      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== storyId) return s;
          const updatedCriteria = s.acceptanceCriteria.map((ac) =>
            ac.id === criterionId ? { ...ac, completed: !ac.completed } : ac
          );
          return withQuality({ ...s, acceptanceCriteria: updatedCriteria, updatedAt: now() });
        })
      );
    },
    [setStories]
  );

  // ─── Dependencies ─────────────────────────────────────────────────────────────
  const addDependency = useCallback(
    (storyId: string, dep: DependencyRef) => {
      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== storyId) return s;
          if (s.dependencies.some((d) => d.id === dep.id && d.type === dep.type)) return s;
          return withQuality({
            ...s,
            dependencies: [...s.dependencies, dep],
            updatedAt: now(),
          });
        })
      );
    },
    [setStories]
  );

  const removeDependency = useCallback(
    (storyId: string, depId: string) => {
      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== storyId) return s;
          return withQuality({
            ...s,
            dependencies: s.dependencies.filter((d) => d.id !== depId),
            updatedAt: now(),
          });
        })
      );
    },
    [setStories]
  );

  // ─── Settings ─────────────────────────────────────────────────────────────────
  const updateSettings = useCallback((changes: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...changes };
      storageService.saveSettings(next);
      return next;
    });
  }, []);

  const resetDemoData = useCallback(() => {
    storageService.resetAll();
    window.location.reload();
  }, []);

  const value: AppContextValue = {
    stories,
    sprints,
    team,
    settings,
    toasts,
    createStory,
    updateStory,
    deleteStory,
    duplicateStory,
    reorderStories,
    addCriterion,
    updateCriterion,
    deleteCriterion,
    toggleCriterion,
    addDependency,
    removeDependency,
    updateSettings,
    resetDemoData,
    addToast,
    removeToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
