"use client";

import { useApp } from "@/lib/context";
import { Finding } from "@/lib/types";

const severityStyles: Record<string, string> = {
  Blocker: "border-red-500 bg-red-950/20",
  "Should-fix": "border-amber-500 bg-amber-950/20",
  Advisory: "border-sky-500 bg-sky-950/20"
};

const statusStyles: Record<string, string> = {
  open: "border-slate-700 bg-slate-900 text-slate-300",
  accepted: "border-emerald-700 bg-emerald-950/40 text-emerald-300",
  dismissed: "border-slate-700 bg-slate-900 text-slate-400",
  escalated: "border-purple-700 bg-purple-950/40 text-purple-300",
  resolved: "border-emerald-700 bg-emerald-950/40 text-emerald-300"
};

export default function FindingCard({
  submissionId,
  finding
}: {
  submissionId: string;
  finding: Finding;
}) {
  const {
    state,
    applyFinding,
    dismissFinding,
    escalateFinding,
    resolveFinding
  } = useApp();

  const role = state.role;
  const isCreator = role === "creator";

  const canResolve =
    role === "manager" ||
    (role === "legal" && finding.category === "claims") ||
    (role === "accessibility" && finding.category === "accessibility");

  const actionable = finding.status === "open" || finding.status === "escalated";

  const accept = () => applyFinding(submissionId, finding.id);

  const edit = () => {
    const value = window.prompt(
      "Edit the suggested replacement:",
      finding.suggestion
    );

    if (value !== null) {
      applyFinding(submissionId, finding.id, value);
    }
  };

  const dismiss = () => {
    const reason = window.prompt(
      "Reason for dismissal:",
      "False alarm"
    );

    if (reason) {
      dismissFinding(submissionId, finding.id, reason);
    }
  };

  const escalate = () => escalateFinding(submissionId, finding.id);

  const resolve = () =>
    resolveFinding(
      submissionId,
      finding.id,
      `${role} approved exception or resolved finding`
    );

  return (
    <article
      className={`rounded-xl border-l-4 p-4 ${severityStyles[finding.severity]}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge border-slate-700 bg-slate-950 text-slate-200">
          {finding.severity}
        </span>
        <span className="badge border-slate-700 bg-slate-950 text-slate-200">
          {finding.category}
        </span>
        <span className="badge border-slate-700 bg-slate-950 text-slate-200">
          Confidence: {finding.confidence}
        </span>
        <span className={`badge ${statusStyles[finding.status]}`}>
          {finding.status}
        </span>
        <span className="badge border-slate-700 bg-slate-950 text-slate-400">
          {finding.aiUsed ? "AI-assisted" : "Deterministic"}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-200">{finding.message}</p>

      <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Flagged text
          </div>
          <div className="mt-1 rounded-md border border-slate-800 bg-slate-950 p-2 font-mono text-xs">
            {finding.flaggedText}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Suggested fix
          </div>
          <div className="mt-1 rounded-md border border-slate-800 bg-slate-950 p-2 font-mono text-xs">
            {finding.suggestion || "Remove phrase"}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Source
          </div>
          <div className="mt-1 text-slate-300">{finding.sourceRef}</div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Quoted rule
          </div>
          <div className="mt-1 text-slate-300">{finding.quotedRule}</div>
        </div>
      </div>

      {finding.dismissalReason && (
        <div className="mt-3 rounded-md border border-slate-800 bg-slate-950 p-2 text-sm text-slate-300">
          Dismissal reason: {finding.dismissalReason}
        </div>
      )}

      {actionable && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={accept} className="btn btn-primary">
            Accept fix
          </button>

          <button onClick={edit} className="btn btn-secondary">
            Edit fix
          </button>

          {isCreator && finding.severity !== "Blocker" && finding.status === "open" && (
            <button onClick={dismiss} className="btn btn-secondary">
              Dismiss
            </button>
          )}

          {isCreator && finding.severity === "Blocker" && finding.status === "open" && (
            <button onClick={escalate} className="btn btn-secondary">
              Escalate to reviewer
            </button>
          )}

          {!isCreator && canResolve && (
            <button onClick={resolve} className="btn btn-primary">
              Mark resolved / approve exception
            </button>
          )}
        </div>
      )}
    </article>
  );
}