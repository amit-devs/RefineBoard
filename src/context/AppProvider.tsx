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
import { api } from '@/services/api';
import { storageService } from '@/services/storageService';
import { useAuth } from '@/context/AuthContext';
import { calculateQualityScore, assessTestability } from '@/utils/qualityEngine';
import { generateId, generateStoryId, now, createActivity } from '@/utils/helpers';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  const [stories, setStoriesRaw] = useState<UserStory[]>(() => storageService.loadStories());
  const [sprints, setSprints] = useState<Sprint[]>(() => storageService.loadSprints());
  const [team, setTeam] = useState<TeamMember[]>(() => storageService.loadTeam());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.loadSettings());
  const [toasts, setToasts] = useState<Toast[]>([]);

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

  // Recalculate quality score for a story
  function withQuality(story: UserStory): UserStory {
    const { score } = calculateQualityScore(story);
    return { ...story, qualityScore: score };
  }

  // ─── Fetch from REST API on Authenticated Mount ─────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    async function loadDataFromApi() {
      try {
        const [apiStories, apiSprints, apiTeam, apiSettings] = await Promise.allSettled([
          api.stories.getAll(),
          api.sprints.getAll(),
          api.team.getAll(),
          api.settings.get(),
        ]);

        if (!isMounted) return;

        if (apiStories.status === 'fulfilled' && Array.isArray(apiStories.value)) {
          setStoriesRaw(apiStories.value.map(withQuality));
          storageService.saveStories(apiStories.value);
        }
        if (apiSprints.status === 'fulfilled' && Array.isArray(apiSprints.value) && apiSprints.value.length > 0) {
          setSprints(apiSprints.value);
          storageService.saveSprints(apiSprints.value);
        }
        if (apiTeam.status === 'fulfilled' && Array.isArray(apiTeam.value) && apiTeam.value.length > 0) {
          setTeam(apiTeam.value);
          storageService.saveTeam(apiTeam.value);
        }
        if (apiSettings.status === 'fulfilled' && apiSettings.value) {
          setSettings(apiSettings.value);
          storageService.saveSettings(apiSettings.value);
        }
      } catch (err) {
        console.warn('[AppProvider] Error loading data from API, using cached data.', err);
      }
    }

    loadDataFromApi();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Persist stories on change (local cache)
  const setStories = useCallback((updater: (prev: UserStory[]) => UserStory[]) => {
    setStoriesRaw((prev) => {
      const next = updater(prev);
      storageService.saveStories(next);
      return next;
    });
  }, []);

  // ─── Story CRUD ───────────────────────────────────────────────────────────────
  const createStory = useCallback(
    (data: Omit<UserStory, 'id' | 'qualityScore' | 'position' | 'createdAt' | 'updatedAt' | 'activityLog'>): UserStory => {
      const id = generateStoryId(stories.map((s) => s.id));
      const partial: UserStory = {
        ...data,
        id,
        qualityScore: 0,
        position: stories.length + 1,
        createdAt: now(),
        updatedAt: now(),
        activityLog: [createActivity('created', `Story ${id} created`)],
      };
      const newStory = withQuality(partial);

      setStories((prev) => [...prev, newStory]);

      // Sync with API
      api.stories
        .create({
          ...newStory,
          sprint: newStory.sprint || null,
        })
        .catch((err) => {
          console.error('[API Error] Failed to create story on server:', err);
          addToast('Saved locally; server sync pending', 'info');
        });

      return newStory;
    },
    [stories, setStories, addToast]
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
            activityLog: activityEntry ? [activityEntry, ...s.activityLog] : s.activityLog,
          };
          return withQuality(updated);
        })
      );

      // Sync with API
      api.stories.update(id, changes, activityEntry).catch((err) => {
        console.error('[API Error] Failed to update story on server:', err);
      });
    },
    [setStories]
  );

  const deleteStory = useCallback(
    (id: string) => {
      setStories((prev) => prev.filter((s) => s.id !== id));

      api.stories.delete(id).catch((err) => {
        console.error('[API Error] Failed to delete story on server:', err);
      });
    },
    [setStories]
  );

  const duplicateStory = useCallback(
    (id: string) => {
      const original = stories.find((s) => s.id === id);
      if (!original) return;

      const newId = generateStoryId(stories.map((s) => s.id));
      const duplicate: UserStory = {
        ...original,
        id: newId,
        title: `${original.title} (Copy)`,
        devStatus: 'draft',
        refinementStage: 'draft',
        position: stories.length + 1,
        createdAt: now(),
        updatedAt: now(),
        activityLog: [createActivity('created', `Duplicated from ${id}`)],
      };
      const formatted = withQuality(duplicate);

      setStories((prev) => [...prev, formatted]);

      api.stories.create(formatted).catch((err) => {
        console.error('[API Error] Failed to duplicate story on server:', err);
      });
    },
    [stories, setStories]
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

      api.stories.reorder(orderedIds).catch((err) => {
        console.error('[API Error] Failed to reorder stories on server:', err);
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
      const activity = createActivity('ac-added', 'Acceptance criterion added');

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

      api.criteria.create(storyId, newAc).catch((err) => {
        console.error('[API Error] Failed to add criterion on server:', err);
      });
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

      api.criteria.update(criterionId, changes).catch((err) => {
        console.error('[API Error] Failed to update criterion on server:', err);
      });
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

      api.criteria.delete(criterionId).catch((err) => {
        console.error('[API Error] Failed to delete criterion on server:', err);
      });
    },
    [setStories]
  );

  const toggleCriterion = useCallback(
    (storyId: string, criterionId: string) => {
      let targetCompleted = false;
      setStories((prev) =>
        prev.map((s) => {
          if (s.id !== storyId) return s;
          const updatedCriteria = s.acceptanceCriteria.map((ac) => {
            if (ac.id === criterionId) {
              targetCompleted = !ac.completed;
              return { ...ac, completed: targetCompleted };
            }
            return ac;
          });
          return withQuality({ ...s, acceptanceCriteria: updatedCriteria, updatedAt: now() });
        })
      );

      api.criteria.update(criterionId, { completed: targetCompleted }).catch((err) => {
        console.error('[API Error] Failed to toggle criterion on server:', err);
      });
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

      api.stories
        .addDependency(storyId, {
          targetStoryId: dep.id,
          title: dep.title,
          type: dep.type,
        })
        .catch((err) => {
          console.error('[API Error] Failed to add dependency on server:', err);
        });
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

      api.stories.removeDependency(storyId, depId).catch((err) => {
        console.error('[API Error] Failed to remove dependency on server:', err);
      });
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

    api.settings.update(changes).catch((err) => {
      console.error('[API Error] Failed to update settings on server:', err);
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
