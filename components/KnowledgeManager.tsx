"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { ClaimEntry, Clause, TermRule } from "@/lib/types";

export default function KnowledgeManager() {
  const { state, addGuideline, addTerm, addClaim, resetData } = useApp();
  const isAdmin = state.role === "admin";

  const [clause, setClause] = useState<Omit<Clause, "id">>({
    code: "",
    title: "",
    text: "",
    version: "1",
    category: "tone"
  });

  const [term, setTerm] = useState<Omit<TermRule, "id">>({
    type: "banned",
    term: "",
    replacement: "",
    reason: "",
    sourceClauseId: state.guidelines[0]?.id || ""
  });

  const [claim, setClaim] = useState<Omit<ClaimEntry, "id">>({
    claim: "",
    approvedWording: "",
    evidence: "",
    owner: "",
    expiry: "",
    status: "active"
  });

  const submitClause = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clause.code || !clause.title || !clause.text) {
      alert("Clause code, title, and text are required.");
      return;
    }

    addGuideline(clause);

    setClause({
      code: "",
      title: "",
      text: "",
      version: "1",
      category: "tone"
    });
  };

  const submitTerm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!term.term || !term.reason || !term.sourceClauseId) {
      alert("Term, reason, and source clause are required.");
      return;
    }

    addTerm({
      ...term,
      replacement: term.replacement || undefined
    });

    setTerm({
      type: "banned",
      term: "",
      replacement: "",
      reason: "",
      sourceClauseId: state.guidelines[0]?.id || ""
    });
  };

  const submitClaim = (e: React.FormEvent) => {
    e.preventDefault();

    if (!claim.claim || !claim.approvedWording || !claim.evidence) {
      alert("Claim, approved wording, and evidence are required.");
      return;
    }

    addClaim({
      ...claim,
      expiry: claim.expiry || undefined
    });

    setClaim({
      claim: "",
      approvedWording: "",
      evidence: "",
      owner: "",
      expiry: "",
      status: "active"
    });
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Knowledge base</h1>
            <p className="mt-2 text-sm text-slate-300">
              Approved guidelines, terminology, and Claim Ledger entries used as
              the source of truth for review.
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm("Reset demo data? This clears local changes.")) {
                resetData();
              }
            }}
            className="btn btn-danger"
          >
            Reset demo data
          </button>
        </div>

        {!isAdmin && (
          <div className="mt-4 rounded-md border border-amber-800 bg-amber-950/30 p-3 text-sm text-amber-200">
            Switch role to <span className="font-semibold">Guideline Admin</span>{" "}
            in the header to add new knowledge-base entries.
          </div>
        )}
      </section>

      {isAdmin && (
        <div className="grid gap-6 xl:grid-cols-3">
          <section className="card">
            <h2 className="text-lg font-semibold">Add guideline clause</h2>

            <form onSubmit={submitClause} className="mt-4 space-y-3">
              <input
                className="input"
                placeholder="Clause code, e.g. VT-2.4"
                value={clause.code}
                onChange={(e) => setClause({ ...clause, code: e.target.value })}
              />

              <input
                className="input"
                placeholder="Clause title"
                value={clause.title}
                onChange={(e) => setClause({ ...clause, title: e.target.value })}
              />

              <textarea
                className="input min-h-28"
                placeholder="Clause text"
                value={clause.text}
                onChange={(e) => setClause({ ...clause, text: e.target.value })}
              />

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="input"
                  placeholder="Version"
                  value={clause.version}
                  onChange={(e) =>
                    setClause({ ...clause, version: e.target.value })
                  }
                />

                <select
                  className="input"
                  value={clause.category}
                  onChange={(e) =>
                    setClause({
                      ...clause,
                      category: e.target.value as Clause["category"]
                    })
                  }
                >
                  <option value="tone">tone</option>
                  <option value="terminology">terminology</option>
                  <option value="messaging">messaging</option>
                  <option value="visual">visual</option>
                  <option value="accessibility">accessibility</option>
                  <option value="claims">claims</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                Add clause
              </button>
            </form>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold">Add terminology rule</h2>

            <form onSubmit={submitTerm} className="mt-4 space-y-3">
              <select
                className="input"
                value={term.type}
                onChange={(e) =>
                  setTerm({ ...term, type: e.target.value as TermRule["type"] })
                }
              >
                <option value="banned">banned</option>
                <option value="preferred">preferred</option>
                <option value="casing">casing</option>
              </select>

              <input
                className="input"
                placeholder="Term to detect"
                value={term.term}
                onChange={(e) => setTerm({ ...term, term: e.target.value })}
              />

              <input
                className="input"
                placeholder="Replacement, if any"
                value={term.replacement || ""}
                onChange={(e) =>
                  setTerm({ ...term, replacement: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="Reason"
                value={term.reason}
                onChange={(e) => setTerm({ ...term, reason: e.target.value })}
              />

              <select
                className="input"
                value={term.sourceClauseId}
                onChange={(e) =>
                  setTerm({ ...term, sourceClauseId: e.target.value })
                }
              >
                {state.guidelines.map((guideline) => (
                  <option key={guideline.id} value={guideline.id}>
                    {guideline.code}
                  </option>
                ))}
              </select>

              <button type="submit" className="btn btn-primary">
                Add term rule
              </button>
            </form>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold">Add Claim Ledger entry</h2>

            <form onSubmit={submitClaim} className="mt-4 space-y-3">
              <input
                className="input"
                placeholder="Claim name"
                value={claim.claim}
                onChange={(e) => setClaim({ ...claim, claim: e.target.value })}
              />

              <input
                className="input"
                placeholder="Approved wording"
                value={claim.approvedWording}
                onChange={(e) =>
                  setClaim({ ...claim, approvedWording: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="Evidence source"
                value={claim.evidence}
                onChange={(e) =>
                  setClaim({ ...claim, evidence: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="Owner"
                value={claim.owner}
                onChange={(e) => setClaim({ ...claim, owner: e.target.value })}
              />

              <input
                className="input"
                type="date"
                value={claim.expiry || ""}
                onChange={(e) => setClaim({ ...claim, expiry: e.target.value })}
              />

              <button type="submit" className="btn btn-primary">
                Add claim
              </button>
            </form>
          </section>
        </div>
      )}

      <section className="card">
        <h2 className="text-lg font-semibold">Guideline clauses</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Code</th>
                <th className="th">Title</th>
                <th className="th">Text</th>
                <th className="th">Version</th>
                <th className="th">Category</th>
              </tr>
            </thead>
            <tbody>
              {state.guidelines.map((guideline) => (
                <tr key={guideline.id}>
                  <td className="td">{guideline.code}</td>
                  <td className="td">{guideline.title}</td>
                  <td className="td">{guideline.text}</td>
                  <td className="td">{guideline.version}</td>
                  <td className="td">{guideline.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card">
          <h2 className="text-lg font-semibold">Terminology rules</h2>

          <div className="mt-4 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Type</th>
                  <th className="th">Term</th>
                  <th className="th">Replacement</th>
                  <th className="th">Reason</th>
                  <th className="th">Source</th>
                </tr>
              </thead>
              <tbody>
                {state.terms.map((item) => (
                  <tr key={item.id}>
                    <td className="td">{item.type}</td>
                    <td className="td">{item.term}</td>
                    <td className="td">{item.replacement || "-"}</td>
                    <td className="td">{item.reason}</td>
                    <td className="td">{item.sourceClauseId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold">Claim Ledger</h2>

          <div className="mt-4 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="th">ID</th>
                  <th className="th">Claim</th>
                  <th className="th">Approved wording</th>
                  <th className="th">Evidence</th>
                  <th className="th">Owner</th>
                  <th className="th">Expiry</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody>
                {state.claims.map((item) => (
                  <tr key={item.id}>
                    <td className="td">{item.id}</td>
                    <td className="td">{item.claim}</td>
                    <td className="td">{item.approvedWording}</td>
                    <td className="td">{item.evidence}</td>
                    <td className="td">{item.owner}</td>
                    <td className="td">{item.expiry || "-"}</td>
                    <td className="td">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}