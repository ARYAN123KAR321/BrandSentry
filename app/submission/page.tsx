"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import {
  canFinalApprove,
  canSubmit,
  formatDate,
  sortFindings,
  unresolvedBlockers
} from "@/lib/utils";

import FindingCard from "@/components/FindingCard";
import HistoryPanel from "@/components/HistoryPanel";
import CommentsPanel from "@/components/CommentsPanel";
import DisclosurePanel from "@/components/DisclosurePanel";

export default function SubmissionPage() {
  const {
    state,
    updateDraftFields,
    saveDraft,
    runReview,
    submitForApproval,
    approveSubmission,
    requestChanges,
    openSubmission
  } = useApp();

  const router = useRouter();
  const [tab, setTab] = useState<
    "findings" | "history" | "comments" | "disclosure"
  >("findings");

  const submission = state.submissions.find(
    (s) => s.id === state.currentSubmissionId
  );

  if (!submission) {
    return (
      <div className="card">
        <p className="text-sm text-slate-300">No submission selected.</p>

        <div className="mt-4 space-y-2">
          {state.submissions.map((s) => (
            <button
              key={s.id}
              onClick={() => openSubmission(s.id)}
              className="btn btn-secondary"
            >
              Open {s.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const findings = sortFindings(submission.findings);
  const blockers = unresolvedBlockers(submission);
  const submitAllowed = canSubmit(submission);
  const managerApprove =
    state.role === "manager" && canFinalApprove(submission);

  const legalNeeded =
    submission.requiredReviewers.includes("legal") &&
    !submission.approvedReviewers.includes("legal");

  const accessibilityNeeded =
    submission.requiredReviewers.includes("accessibility") &&
    !submission.approvedReviewers.includes("accessibility");

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{submission.title}</h1>
            <p className="mt-1 text-sm text-slate-400">
              Status: {submission.status} • Updated {formatDate(submission.updatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="badge border-slate-700 bg-slate-900 text-slate-300">
              Role: {state.role}
            </span>

            {submission.requiredReviewers.map((reviewer) => (
              <span
                key={reviewer}
                className="badge border-indigo-700 bg-indigo-950/40 text-indigo-300"
              >
                Required: {reviewer}
              </span>
            ))}

            {submission.approvedReviewers.map((reviewer) => (
              <span
                key={reviewer}
                className="badge border-emerald-700 bg-emerald-950/40 text-emerald-300"
              >
                Approved: {reviewer}
              </span>
            ))}
          </div>
        </div>

        {blockers.length > 0 && (
          <div className="mt-4 rounded-md border border-red-800 bg-red-950/30 p-3 text-sm text-red-200">
            Unresolved blockers: {blockers.length}. Blockers must be accepted,
            resolved, or escalated appropriately before final approval.
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <div className="card space-y-3">
            <input
              className="input"
              value={submission.title}
              onChange={(e) =>
                updateDraftFields(submission.id, { title: e.target.value })
              }
              disabled={submission.status === "approved"}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <select
                className="input"
                value={submission.contentType}
                onChange={(e) =>
                  updateDraftFields(submission.id, {
                    contentType: e.target.value
                  })
                }
                disabled={submission.status === "approved"}
              >
                <option>Social post</option>
                <option>Press release</option>
                <option>Product page</option>
                <option>Email</option>
                <option>Advertisement</option>
              </select>

              <select
                className="input"
                value={submission.channel}
                onChange={(e) =>
                  updateDraftFields(submission.id, { channel: e.target.value })
                }
                disabled={submission.status === "approved"}
              >
                <option>LinkedIn</option>
                <option>X</option>
                <option>Website</option>
                <option>Email</option>
                <option>Press</option>
              </select>
            </div>

            <input
              className="input"
              placeholder="Creator intent"
              value={submission.intent}
              onChange={(e) =>
                updateDraftFields(submission.id, { intent: e.target.value })
              }
              disabled={submission.status === "approved"}
            />

            <textarea
              className="input min-h-64 font-mono text-sm"
              value={submission.content}
              onChange={(e) =>
                updateDraftFields(submission.id, { content: e.target.value })
              }
              disabled={submission.status === "approved"}
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => runReview(submission.id)}
                className="btn btn-primary"
              >
                Run automated review
              </button>

              <button
                onClick={() => saveDraft(submission.id)}
                className="btn btn-secondary"
              >
                Save draft
              </button>

              {state.role === "creator" && (
                <button
                  onClick={() => submitForApproval(submission.id)}
                  disabled={!submitAllowed}
                  className="btn btn-primary"
                >
                  Submit for approval
                </button>
              )}
            </div>

            {!submitAllowed && state.role === "creator" && (
              <p className="text-xs text-slate-400">
                {!submission.disclosure
                  ? "Run the automated review before submitting."
                  : "Resolve open Blockers before submitting. Escalated blockers may proceed to reviewer clearance."}
              </p>
            )}
          </div>

          {submission.status === "in_review" && state.role !== "creator" && (
            <div className="card space-y-3">
              <h2 className="text-lg font-semibold">Reviewer actions</h2>

              <div className="flex flex-wrap gap-2">
                {state.role === "legal" && legalNeeded && (
                  <button
                    onClick={() =>
                      approveSubmission(
                        submission.id,
                        "legal",
                        "Legal cleared claim-related findings."
                      )
                    }
                    className="btn btn-primary"
                  >
                    Approve claims
                  </button>
                )}

                {state.role === "accessibility" && accessibilityNeeded && (
                  <button
                    onClick={() =>
                      approveSubmission(
                        submission.id,
                        "accessibility",
                        "Accessibility review completed."
                      )
                    }
                    className="btn btn-primary"
                  >
                    Approve accessibility
                  </button>
                )}

                {state.role === "manager" && (
                  <button
                    onClick={() =>
                      approveSubmission(
                        submission.id,
                        "manager",
                        "Final manager approval."
                      )
                    }
                    disabled={!managerApprove}
                    className="btn btn-primary"
                  >
                    Final approve
                  </button>
                )}

                <button
                  onClick={() => {
                    const note = window.prompt(
                      "What changes are needed?",
                      "Please revise the flagged findings."
                    );

                    if (note) {
                      requestChanges(submission.id, state.role, note);
                    }
                  }}
                  className="btn btn-danger"
                >
                  Request changes
                </button>
              </div>

              {state.role === "manager" && !managerApprove && (
                <p className="text-xs text-slate-400">
                  Manager approval unlocks after required domain approvals are
                  completed and no unresolved blockers remain.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="card">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTab("findings")}
                className={`btn ${tab === "findings" ? "btn-primary" : "btn-secondary"}`}
              >
                Findings
              </button>

              <button
                onClick={() => setTab("history")}
                className={`btn ${tab === "history" ? "btn-primary" : "btn-secondary"}`}
              >
                History
              </button>

              <button
                onClick={() => setTab("comments")}
                className={`btn ${tab === "comments" ? "btn-primary" : "btn-secondary"}`}
              >
                Comments
              </button>

              <button
                onClick={() => setTab("disclosure")}
                className={`btn ${tab === "disclosure" ? "btn-primary" : "btn-secondary"}`}
              >
                AI Disclosure
              </button>
            </div>
          </div>

          {tab === "findings" && (
            <div className="space-y-4">
              {findings.length === 0 ? (
                <div className="card text-sm text-slate-400">
                  No findings yet. Run the automated review.
                </div>
              ) : (
                findings.map((finding) => (
                  <FindingCard
                    key={finding.id}
                    submissionId={submission.id}
                    finding={finding}
                  />
                ))
              )}
            </div>
          )}

          {tab === "history" && <HistoryPanel submission={submission} />}

          {tab === "comments" && <CommentsPanel submission={submission} />}

          {tab === "disclosure" && <DisclosurePanel submission={submission} />}
        </section>
      </div>
    </div>
  );
}
