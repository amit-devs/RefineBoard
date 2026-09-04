/**
 * Storage Service
 * Abstracts localStorage access so a real API can be swapped in later
 * by changing only this file.
 */

import type { UserStory, Sprint, TeamMember, AppSettings } from '@/types';
import { SAMPLE_STORIES, SAMPLE_SPRINTS, SAMPLE_TEAM, DEFAULT_SETTINGS } from '@/data/sampleData';

const KEYS = {
  stories: 'refineboard_stories',
  sprints: 'refineboard_sprints',
  team: 'refineboard_team',
  settings: 'refineboard_settings',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[StorageService] Failed to save key: ${key}`);
  }
}

export const storageService = {
  loadStories: (): UserStory[] => {
    const stories = load<UserStory[]>(KEYS.stories, SAMPLE_STORIES);
    if (stories && stories.length > 0 && ('status' in stories[0])) {
      console.warn('[StorageService] Legacy data detected in stories. Resetting to sample data.');
      save(KEYS.stories, SAMPLE_STORIES);
      return SAMPLE_STORIES;
    }
    return stories;
  },
  saveStories: (stories: UserStory[]): void => save(KEYS.stories, stories),

  loadSprints: (): Sprint[] => load<Sprint[]>(KEYS.sprints, SAMPLE_SPRINTS),
  saveSprints: (sprints: Sprint[]): void => save(KEYS.sprints, sprints),

  loadTeam: (): TeamMember[] => load<TeamMember[]>(KEYS.team, SAMPLE_TEAM),
  saveTeam: (team: TeamMember[]): void => save(KEYS.team, team),

  loadSettings: (): AppSettings => {
    const settings = load<AppSettings>(KEYS.settings, DEFAULT_SETTINGS);
    if ('defaultStatus' in settings) {
      console.warn('[StorageService] Legacy data detected in settings. Resetting to default.');
      save(KEYS.settings, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return settings;
  },
  saveSettings: (settings: AppSettings): void => save(KEYS.settings, settings),

  resetAll: (): void => {
    save(KEYS.stories, SAMPLE_STORIES);
    save(KEYS.sprints, SAMPLE_SPRINTS);
    save(KEYS.team, SAMPLE_TEAM);
    save(KEYS.settings, DEFAULT_SETTINGS);
  },
};
