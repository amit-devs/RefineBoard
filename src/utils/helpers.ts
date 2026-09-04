import type { StoryActivity } from '@/types';

let counter = 0;

export function generateId(prefix = ''): string {
  counter++;
  return `${prefix}${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateStoryId(existingIds: string[]): string {
  const nums = existingIds
    .map((id) => parseInt(id.replace('US-', ''), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `US-${String(next).padStart(3, '0')}`;
}

export function now(): string {
  return new Date().toISOString();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function createActivity(
  field: string,
  description: string,
  oldValue?: string,
  newValue?: string,
  author = 'You'
): StoryActivity {
  return {
    id: generateId('act-'),
    timestamp: now(),
    field,
    description,
    oldValue,
    newValue,
    author,
  };
}

export const STORY_POINTS = [0, 1, 2, 3, 5, 8, 13] as const;

export const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const DEV_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  'in-progress': 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
};

export const REFINEMENT_STAGE_LABELS: Record<string, string> = {
  draft: 'Draft',
  'needs-refinement': 'Needs Refinement',
  'under-review': 'Under Review',
  ready: 'Ready for Development',
};

export const TAGS = [
  'Authentication',
  'Security',
  'Frontend',
  'Backend',
  'Payment',
  'Performance',
  'Bug',
  'Technical Debt',
  'API',
  'UI/UX',
  'Database',
  'Mobile',
  'Email',
  'Notifications',
  'Admin',
  'Reporting',
];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
