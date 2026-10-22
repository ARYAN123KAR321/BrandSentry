"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { formatDate, unresolvedBlockers } from "@/lib/utils";

export default function ApprovalsPage() {
  const { state, openSubmission } = useApp();
  const router = useRouter();

  const inReview = state.submissions.filter(
    (submission) => submission.status === "in_review"
  );

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Approvals queue</h1>
        <p className="mt-2 text-sm text-slate-300">
          Current role: <span className="font-medium">{state.role}</span>. Use
          this queue to open submissions awaiting review.
        </p>
      </section>

      <section className="card">
        {inReview.length === 0 ? (
          <p className="text-sm text-slate-400">
            No submissions are currently in review.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Title</th>
                  <th className="th">Required reviewers</th>
                  <th className="th">Approved</th>
                  <th className="th">Unresolved blockers</th>
                  <th className="th">Updated</th>
                  <th className="th">Action</th>
                </tr>
              </thead>
              <tbody>
                {inReview.map((submission) => (
                  <tr key={submission.id}>
                    <td className="td">{submission.title}</td>
                    <td className="td">
                      {submission.requiredReviewers.join(", ")}
                    </td>
                    <td className="td">
                      {submission.approvedReviewers.length === 0
                        ? "None yet"
                        : submission.approvedReviewers.join(", ")}
                    </td>
                    <td className="td">
                      {unresolvedBlockers(submission).length}
                    </td>
                    <td className="td">{formatDate(submission.updatedAt)}</td>
                    <td className="td">
                      <button
                        onClick={() => {
                          openSubmission(submission.id);
                          router.push("/submission");
                        }}
                        className="btn btn-primary"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}