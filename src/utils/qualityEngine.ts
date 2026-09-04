import type { UserStory, AcceptanceCriterion, DorCheck, QualityFactor, Testability } from '@/types';

// ─── Quality Score Factors ────────────────────────────────────────────────────
// This is a project-defined refinement metric, not an industry standard.
// It evaluates user story completeness and refinement quality on a 0–100 scale.

interface QualityResult {
  score: number;
  factors: QualityFactor[];
}

export function calculateQualityScore(story: UserStory): QualityResult {
  const factors: QualityFactor[] = [
    {
      key: 'title',
      label: 'Title defined',
      passed: story.title.trim().length > 0,
      points: 5,
    },
    {
      key: 'asA',
      label: 'User role defined (As a...)',
      passed: story.asA.trim().length > 0,
      points: 10,
    },
    {
      key: 'iWant',
      label: 'Goal defined (I want...)',
      passed: story.iWant.trim().length > 0,
      points: 10,
    },
    {
      key: 'soThat',
      label: 'Business value defined (So that...)',
      passed: story.soThat.trim().length > 0,
      points: 10,
    },
    {
      key: 'hasAC',
      label: 'Acceptance criteria present',
      passed: story.acceptanceCriteria.length > 0,
      points: 15,
    },
    {
      key: 'acComplete',
      label: 'All AC have Given/When/Then defined',
      passed:
        story.acceptanceCriteria.length > 0 &&
        story.acceptanceCriteria.every(
          (ac: AcceptanceCriterion) =>
            ac.given.trim().length > 0 &&
            ac.when.trim().length > 0 &&
            ac.then.trim().length > 0
        ),
      points: 15,
    },
    {
      key: 'storyPoints',
      label: 'Story points assigned',
      passed: story.storyPoints > 0,
      points: 10,
    },
    {
      key: 'priority',
      label: 'Priority assigned',
      passed: !!story.priority,
      points: 10,
    },
    {
      key: 'sprint',
      label: 'Sprint assigned',
      passed: story.sprint.trim().length > 0,
      points: 5,
    },
    {
      key: 'dependenciesReviewed',
      label: 'Dependencies reviewed',
      // Reads the actual stored value — no assumption
      passed: story.dependenciesReviewed === true,
      points: 5,
    },
    {
      key: 'testable',
      label: 'At least one testable acceptance criterion',
      passed:
        story.acceptanceCriteria.length > 0 &&
        story.acceptanceCriteria.some((ac: AcceptanceCriterion) => ac.testability === 'good'),
      points: 5,
    },
  ];

  const score = factors
    .filter((f) => f.passed)
    .reduce((sum, f) => sum + f.points, 0);

  return { score, factors };
}

// ─── Definition of Ready Checks ───────────────────────────────────────────────
// Each check returns label, passed, and a hint shown when failed.

export function getDefinitionOfReadyChecks(story: UserStory, dorThreshold = 70): DorCheck[] {
  const { score, factors } = calculateQualityScore(story);
  const acComplete = factors.find((f) => f.key === 'acComplete')?.passed ?? false;

  return [
    {
      key: 'storyFormat',
      label: 'Story follows standard format',
      passed:
        story.asA.trim().length > 0 &&
        story.iWant.trim().length > 0 &&
        story.soThat.trim().length > 0,
      hint: 'Fill in the "As a", "I want", and "So that" fields to complete the story format.',
    },
    {
      key: 'hasAC',
      label: 'Acceptance criteria defined',
      passed: story.acceptanceCriteria.length > 0,
      hint: 'Add at least one acceptance criterion with Given/When/Then.',
    },
    {
      key: 'acTestable',
      label: 'Acceptance criteria are testable',
      passed:
        story.acceptanceCriteria.length > 0 &&
        story.acceptanceCriteria.some((ac) => ac.testability === 'good'),
      hint: 'At least one acceptance criterion must be marked as testable (has a clear expected outcome).',
    },
    {
      key: 'priority',
      label: 'Priority assigned',
      passed: !!story.priority,
      hint: 'Assign a priority level (Critical, High, Medium, or Low) to this story.',
    },
    {
      key: 'storyPoints',
      label: 'Story has been estimated',
      passed: story.storyPoints > 0,
      hint: 'Assign story points (1, 2, 3, 5, 8, or 13) to estimate effort.',
    },
    {
      key: 'dependenciesReviewed',
      label: 'Dependencies identified and reviewed',
      passed: story.dependenciesReviewed === true,
      hint: 'Mark the "Dependencies Reviewed" checkbox after reviewing any dependencies.',
    },
    {
      key: 'acStructure',
      label: 'All AC have complete Given/When/Then',
      passed: acComplete,
      hint: 'Every acceptance criterion must have all three fields: Given, When, and Then.',
    },
    {
      key: 'qualityThreshold',
      label: `Quality score ≥ ${dorThreshold}`,
      passed: score >= dorThreshold,
      hint: `Current quality score is ${score}. Complete more quality factors to reach ${dorThreshold}.`,
    },
  ];
}

// ─── Testability Assessment ───────────────────────────────────────────────────
// A criterion is considered testable if it has a clear "Then" outcome.
// Uses deterministic rules — no AI.

export function assessTestability(ac: AcceptanceCriterion): Testability {
  const then = ac.then.trim();
  if (then.length < 10) return 'needs-clarification';

  // Check for vague language
  const vagueTerms = [
    'might',
    'maybe',
    'possibly',
    'sometime',
    'appropriate',
    'relevant',
    'some',
    'adequately',
    'suitably',
  ];
  const hasVague = vagueTerms.some((term) => then.toLowerCase().includes(term));
  if (hasVague) return 'needs-clarification';

  // Check for observable outcome keywords
  const clearOutcomeTerms = [
    'should',
    'shall',
    'must',
    'will',
    'displays',
    'shows',
    'redirects',
    'receives',
    'sends',
    'returns',
    'contains',
    'prevents',
    'allows',
    'navigates',
    'appears',
    'is visible',
    'is hidden',
    'is enabled',
    'is disabled',
    'updates',
    'saves',
    'creates',
    'deletes',
    'logs',
    'generates',
    'validates',
    'rejects',
    'accepts',
  ];
  const hasClearOutcome = clearOutcomeTerms.some((term) =>
    then.toLowerCase().includes(term)
  );

  return hasClearOutcome && then.length >= 20 ? 'good' : 'needs-clarification';
}
