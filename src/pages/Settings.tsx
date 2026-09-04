import React, { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { ConfirmDialog } from '@/components/ui';
import { PRIORITY_LABELS, DEV_STATUS_LABELS, REFINEMENT_STAGE_LABELS } from '@/utils/helpers';
import type { Priority, DevStatus, RefinementStage } from '@/types';

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        {description && <p className="text-sm text-text-secondary mt-0.5">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function Settings() {
  const { settings, updateSettings, resetDemoData, addToast } = useAppContext();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  function handleSave(changes: Parameters<typeof updateSettings>[0]) {
    updateSettings(changes);
    addToast('Settings saved');
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Workspace */}
      <Section title="Workspace" description="Configure your workspace name and identity.">
        <div>
          <label className="label-base">Product / Workspace Name</label>
          <input
            className="input-base"
            defaultValue={settings.workspaceName}
            onBlur={(e) => handleSave({ workspaceName: e.target.value })}
            placeholder="E.g. E-Commerce Platform"
          />
        </div>
      </Section>

      {/* Backlog Defaults */}
      <Section title="Backlog Defaults" description="Default values applied when creating new user stories.">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-base">Default Priority</label>
            <select
              className="input-base"
              value={settings.defaultPriority}
              onChange={(e) => handleSave({ defaultPriority: e.target.value as Priority })}
            >
              {(['critical','high','medium','low'] as Priority[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Default Dev Status</label>
            <select
              className="input-base"
              value={settings.defaultDevStatus}
              onChange={(e) => handleSave({ defaultDevStatus: e.target.value as DevStatus })}
            >
              {(['draft','in-progress','blocked','done'] as DevStatus[]).map((s) => (
                <option key={s} value={s}>{DEV_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Default Refinement</label>
            <select
              className="input-base"
              value={settings.defaultRefinementStage}
              onChange={(e) => handleSave({ defaultRefinementStage: e.target.value as RefinementStage })}
            >
              {(['draft','needs-refinement','under-review','ready'] as RefinementStage[]).map((s) => (
                <option key={s} value={s}>{REFINEMENT_STAGE_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* Quality */}
      <Section
        title="Quality & Definition of Ready"
        description="Configure the minimum quality threshold for the Definition of Ready."
      >
        <div>
          <label className="label-base">DoR Quality Score Threshold</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              defaultValue={settings.dorQualityThreshold}
              onMouseUp={(e) => handleSave({ dorQualityThreshold: Number((e.target as HTMLInputElement).value) })}
              className="flex-1 accent-sage"
            />
            <span className="text-sm font-semibold text-sage w-8">{settings.dorQualityThreshold}</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Minimum quality score required for a story to meet the Definition of Ready. Currently set to {settings.dorQualityThreshold}/100.
          </p>
        </div>

        <div className="bg-ivory rounded-md p-4 border border-border">
          <p className="text-xs font-semibold text-text-primary mb-2">Current Definition of Ready Criteria</p>
          <ul className="space-y-1 text-xs text-text-secondary">
            <li>✓ Story follows standard format (As a / I want / So that)</li>
            <li>✓ At least one acceptance criterion defined</li>
            <li>✓ At least one testable acceptance criterion</li>
            <li>✓ Priority assigned</li>
            <li>✓ Story has been estimated (story points)</li>
            <li>✓ Dependencies identified and reviewed</li>
            <li>✓ All acceptance criteria have complete Given/When/Then</li>
            <li>✓ Quality score ≥ {settings.dorQualityThreshold}</li>
          </ul>
        </div>
      </Section>

      {/* Data Management */}
      <Section
        title="Data Management"
        description="Manage application data and reset demo content."
      >
        <div>
          <p className="text-sm text-text-primary mb-3">
            Reset all stories, sprints, and settings to the original demo data. Useful during presentations.
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn-secondary text-terracotta border-terracotta/30 hover:bg-terracotta-light"
          >
            <RotateCcw size={14} />
            Reset Demo Data
          </button>
        </div>
      </Section>

      {/* About */}
      <div className="px-1 text-xs text-text-secondary space-y-1">
        <p><strong>RefineBoard</strong> — Software Product Backlog Refinement Tool</p>
        <p>Quality scores and testability assessments are project-defined refinement metrics, not industry standards.</p>
        <p>All data is persisted locally in this browser using localStorage.</p>
      </div>

      {showResetConfirm && (
        <ConfirmDialog
          title="Reset Demo Data?"
          message="This will delete all current stories and restore the original demo data. The page will reload. This cannot be undone."
          confirmLabel="Reset Demo Data"
          onConfirm={resetDemoData}
          onCancel={() => setShowResetConfirm(false)}
          danger
        />
      )}
    </div>
  );
}
