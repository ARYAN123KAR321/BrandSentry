"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { state, createSubmission, openSubmission } = useApp();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    content: "",
    contentType: "Social post",
    channel: "LinkedIn",
    intent: ""
  });

  const loadDemo = () => {
    setForm({
      title: "Pro Plan launch post",
      content:
        "Our all-new Pro plan is the fastest in India and guarantees 100% uptime!! Click here to learn more.",
      contentType: "Social post",
      channel: "LinkedIn",
      intent: "Announce the new Pro Plan and drive clicks to the product page."
    });
  };

  const create = () => {
    if (!form.content.trim()) {
      alert("Paste or write content first.");
      return;
    }

    createSubmission(form);
    router.push("/submission");
  };

  const stats = [
    { label: "Total submissions", value: state.submissions.length },
    {
      label: "In review",
      value: state.submissions.filter((s) => s.status === "in_review").length
    },
    {
      label: "Approved",
      value: state.submissions.filter((s) => s.status === "approved").length
    },
    { label: "Guideline clauses", value: state.guidelines.length }
  ];

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">BrandSentry Round 2 MVP</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          This demo implements the core pre-publication governance loop:
          draft content, run an evidence-backed review, fix or escalate findings,
          route to reviewers, and approve with a full audit trail.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card">
              <div className="text-sm text-slate-400">{stat.label}</div>
              <div className="mt-1 text-2xl font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/submission" className="btn btn-primary">
            Open demo review workspace
          </Link>
          <Link href="/approvals" className="btn btn-secondary">
            Open approvals queue
          </Link>
          <Link href="/knowledge" className="btn btn-secondary">
            View knowledge base
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="text-lg font-semibold">Create a new submission</h2>

          <div className="mt-4 space-y-3">
            <input
              className="input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <select
                className="input"
                value={form.contentType}
                onChange={(e) =>
                  setForm({ ...form, contentType: e.target.value })
                }
              >
                <option>Social post</option>
                <option>Press release</option>
                <option>Product page</option>
                <option>Email</option>
                <option>Advertisement</option>
              </select>

              <select
                className="input"
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
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
              placeholder="Creator intent, e.g. announce pricing to existing customers"
              value={form.intent}
              onChange={(e) => setForm({ ...form, intent: e.target.value })}
            />

            <textarea
              className="input min-h-40 font-mono text-sm"
              placeholder="Paste content here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />

            <div className="flex flex-wrap gap-2">
              <button onClick={loadDemo} className="btn btn-secondary">
                Load demo draft
              </button>
              <button onClick={create} className="btn btn-primary">
                Create and review
              </button>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold">Judge demo script</h2>

          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-slate-300">
            <li>
              Open <span className="text-white">Review Workspace</span>. The demo
              draft is already loaded.
            </li>
            <li>
              Click <span className="text-white">Run automated review</span>.
            </li>
            <li>
              Accept fixes, edit fixes, dismiss advisories, or escalate blockers.
            </li>
            <li>
              When no open blockers remain, click{" "}
              <span className="text-white">Submit for approval</span>.
            </li>
            <li>
              Switch role to <span className="text-white">Legal</span>,{" "}
              <span className="text-white">Accessibility</span>, or{" "}
              <span className="text-white">Manager</span> as needed.
            </li>
            <li>
              Approve domain reviews, then final approve as Manager.
            </li>
            <li>
              Check <span className="text-white">History</span> and{" "}
              <span className="text-white">AI Disclosure</span> tabs.
            </li>
          </ol>
        </section>
      </div>

      <section className="card">
        <h2 className="text-lg font-semibold">Recent submissions</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Title</th>
                <th className="th">Status</th>
                <th className="th">Updated</th>
                <th className="th">Action</th>
              </tr>
            </thead>
            <tbody>
              {state.submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="td">{submission.title}</td>
                  <td className="td">
                    <span className="badge border-slate-700 bg-slate-900 text-slate-300">
                      {submission.status}
                    </span>
                  </td>
                  <td className="td">{formatDate(submission.updatedAt)}</td>
                  <td className="td">
                    <button
                      onClick={() => {
                        openSubmission(submission.id);
                        router.push("/submission");
                      }}
                      className="btn btn-secondary"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}