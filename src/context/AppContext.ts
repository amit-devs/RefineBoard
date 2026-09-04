import { createContext, useContext } from 'react';
import type { UserStory, Sprint, TeamMember, AppSettings, Toast, AcceptanceCriterion, DependencyRef, StoryActivity } from '@/types';

export interface AppContextValue {
  // Data
  stories: UserStory[];
  sprints: Sprint[];
  team: TeamMember[];
  settings: AppSettings;
  toasts: Toast[];

  // Story CRUD
  createStory: (data: Omit<UserStory, 'id' | 'qualityScore' | 'position' | 'createdAt' | 'updatedAt' | 'activityLog'>) => UserStory;
  updateStory: (id: string, changes: Partial<UserStory>, activityEntry?: StoryActivity) => void;
  deleteStory: (id: string) => void;
  duplicateStory: (id: string) => void;
  reorderStories: (orderedIds: string[]) => void;

  // Acceptance Criteria
  addCriterion: (storyId: string, criterion: Omit<AcceptanceCriterion, 'id'>) => void;
  updateCriterion: (storyId: string, criterionId: string, changes: Partial<AcceptanceCriterion>) => void;
  deleteCriterion: (storyId: string, criterionId: string) => void;
  toggleCriterion: (storyId: string, criterionId: string) => void;

  // Dependencies
  addDependency: (storyId: string, dep: DependencyRef) => void;
  removeDependency: (storyId: string, depId: string) => void;

  // Settings
  updateSettings: (changes: Partial<AppSettings>) => void;
  resetDemoData: () => void;

  // Toasts
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
