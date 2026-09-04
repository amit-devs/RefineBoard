import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { Toast } from '@/types';
import { useAppContext } from '@/context/AppContext';

const ICONS = {
  success: <CheckCircle size={15} className="text-sage" />,
  error: <AlertCircle size={15} className="text-terracotta" />,
  info: <Info size={15} className="text-amber" />,
  warning: <AlertTriangle size={15} className="text-amber" />,
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useAppContext();
  return (
    <div className="flex items-start gap-2.5 bg-surface border border-border rounded-md shadow-card px-4 py-3 animate-toast-in min-w-[260px] max-w-[360px]">
      <span className="flex-shrink-0 mt-0.5">{ICONS[toast.type]}</span>
      <p className="text-sm text-text-primary flex-1">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 text-text-secondary hover:text-text-primary ml-1"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useAppContext();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[100]">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
import type { Priority, DevStatus, RefinementStage } from '@/types';
import { PRIORITY_LABELS, DEV_STATUS_LABELS, REFINEMENT_STAGE_LABELS } from '@/utils/helpers';

const PRIORITY_STYLES: Record<Priority, string> = {
  critical: 'bg-terracotta-light text-terracotta-dark border border-terracotta/20',
  high: 'bg-amber-light text-amber-dark border border-amber/20',
  medium: 'bg-sage-light text-sage-dark border border-sage/20',
  low: 'bg-border/50 text-text-secondary border border-border',
};

const DEV_STATUS_STYLES: Record<DevStatus, string> = {
  draft: 'bg-border/50 text-text-secondary border border-border',
  'in-progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  blocked: 'bg-red-50 text-red-700 border border-red-200',
  done: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const REFINEMENT_STAGE_STYLES: Record<RefinementStage, string> = {
  draft: 'bg-border/50 text-text-secondary border border-border',
  'needs-refinement': 'bg-terracotta-light text-terracotta-dark border border-terracotta/20',
  'under-review': 'bg-amber-light text-amber-dark border border-amber/20',
  ready: 'bg-sage-light text-sage-dark border border-sage/20',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge ${PRIORITY_STYLES[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function DevStatusBadge({ status }: { status: DevStatus }) {
  return (
    <span className={`badge ${DEV_STATUS_STYLES[status]}`}>
      {DEV_STATUS_LABELS[status]}
    </span>
  );
}

export function RefinementStageBadge({ stage }: { stage: RefinementStage }) {
  return (
    <span className={`badge ${REFINEMENT_STAGE_STYLES[stage]}`}>
      {REFINEMENT_STAGE_LABELS[stage]}
    </span>
  );
}

// ─── Confirm Dialog ──────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] animate-fade-in p-4">
      <div className="bg-surface rounded-lg shadow-modal w-full max-w-sm p-6 animate-fade-in">
        <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-ivory flex items-center justify-center mb-4 text-text-secondary">
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// ─── Quality Score Ring ───────────────────────────────────────────────────────
export function QualityRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? '#667A63' : score >= 60 ? '#C59A45' : '#B86F5B';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} className="quality-ring-track" strokeWidth={5} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        className="quality-ring-fill"
        strokeWidth={5}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
export function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <span className="relative group inline-flex">
      {children}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-charcoal text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 max-w-[200px] whitespace-normal text-center">
        {content}
      </span>
    </span>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
