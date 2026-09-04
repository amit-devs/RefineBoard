// ─── Priority ─────────────────────────────────────────────────────────────────
export type Priority = 'critical' | 'high' | 'medium' | 'low';

// ─── Development Status ────────────────────────────────────────────────────────
export type DevStatus =
  | 'draft'
  | 'in-progress'
  | 'blocked'
  | 'done';

// ─── Refinement Stage ─────────────────────────────────────────────────────────
export type RefinementStage =
  | 'draft'
  | 'needs-refinement'
  | 'under-review'
  | 'ready';

// ─── Story Points (Fibonacci) ──────────────────────────────────────────────────
export type StoryPoints = 0 | 1 | 2 | 3 | 5 | 8 | 13;

// ─── Testability ──────────────────────────────────────────────────────────────
export type Testability = 'good' | 'needs-clarification';

// ─── Acceptance Criterion ─────────────────────────────────────────────────────
export interface AcceptanceCriterion {
  id: string;
  given: string;
  when: string;
  then: string;
  completed: boolean;
  testability: Testability;
}

// ─── Story Activity (Refinement History) ──────────────────────────────────────
export interface StoryActivity {
  id: string;
  timestamp: string; // ISO string
  field: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  author?: string;
}

// ─── Dependency Reference ─────────────────────────────────────────────────────
export interface DependencyRef {
  id: string;       // e.g. 'US-001'
  title: string;
  type: 'depends-on' | 'blocks';
}

// ─── User Story ───────────────────────────────────────────────────────────────
export interface UserStory {
  id: string;               // e.g. 'US-001'
  title: string;
  asA: string;              // "As a ..."
  iWant: string;            // "I want ..."
  soThat: string;           // "So that ..."
  priority: Priority;
  devStatus: DevStatus;
  refinementStage: RefinementStage;
  storyPoints: StoryPoints;
  businessValue: number;    // 1–10, used in Priority Matrix
  effort: number;           // 1–13 (Fibonacci), used in Priority Matrix
  sprint: string;           // sprint id or ''
  assignee: string;         // team member name or ''
  tags: string[];
  dependencies: DependencyRef[];
  dependenciesReviewed: boolean;
  acceptanceCriteria: AcceptanceCriterion[];
  qualityScore: number;     // 0–100, recalculated on change
  position: number;         // for backlog ordering
  activityLog: StoryActivity[];
  createdAt: string;        // ISO string
  updatedAt: string;        // ISO string
}

// ─── Sprint ───────────────────────────────────────────────────────────────────
export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  active: boolean;
}

// ─── Team Member ──────────────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string; // initials
  avatarColor: string;
}

// ─── DoR Check Result ─────────────────────────────────────────────────────────
export interface DorCheck {
  key: string;
  label: string;
  passed: boolean;
  hint: string; // shown when failed
}

// ─── Quality Factor ───────────────────────────────────────────────────────────
export interface QualityFactor {
  key: string;
  label: string;
  passed: boolean;
  points: number;
}

export interface AppSettings {
  workspaceName: string;
  defaultPriority: Priority;
  defaultDevStatus: DevStatus;
  defaultRefinementStage: RefinementStage;
  dorQualityThreshold: number; // 0-100
  activeSprint: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
