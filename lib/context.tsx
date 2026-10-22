"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import {
  AppState,
  ClaimEntry,
  Clause,
  Role,
  Submission,
  TermRule
} from "./types";

import { seedState } from "./seed";
import { reviewContent } from "./review";
import { deriveRequiredReviewers, nowISO, uid } from "./utils";

const STORAGE_KEY = "brandsentry-round2-v1";

interface CreateSubmissionInput {
  title: string;
  content: string;
  contentType: string;
  channel: string;
  intent: string;
}

interface AppContextValue {
  state: AppState;
  setRole: (role: Role) => void;
  openSubmission: (id: string) => void;
  createSubmission: (input: CreateSubmissionInput) => string;
  updateDraftFields: (
    id: string,
    fields: Partial<
      Pick<Submission, "title" | "content" | "intent" | "channel" | "contentType">
    >
  ) => void;
  saveDraft: (id: string) => void;
  runReview: (id: string) => void;
  applyFinding: (
    submissionId: string,
    findingId: string,
    customReplacement?: string
  ) => void;
  dismissFinding: (submissionId: string, findingId: string, reason: string) => void;
  escalateFinding: (submissionId: string, findingId: string) => void;
  resolveFinding: (submissionId: string, findingId: string, note?: string) => void;
  submitForApproval: (id: string) => void;
  approveSubmission: (id: string, role: Role, note?: string) => void;
  requestChanges: (id: string, role: Role, note: string) => void;
  addComment: (submissionId: string, text: string) => void;
  addGuideline: (clause: Omit<Clause, "id">) => void;
  addTerm: (term: Omit<TermRule, "id">) => void;
  addClaim: (claim: Omit<ClaimEntry, "id">) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setState(raw ? JSON.parse(raw) : seedState());
    } catch {
      setState(seedState());
    }
  }, []);

  useEffect(() => {
    if (state) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const setRole = useCallback((role: Role) => {
    setState((prev) => (prev ? { ...prev, role } : prev));
  }, []);

  const openSubmission = useCallback((id: string) => {
    setState((prev) => (prev ? { ...prev, currentSubmissionId: id } : prev));
  }, []);

  const createSubmission = useCallback((input: CreateSubmissionInput) => {
    const id = uid();
    const now = nowISO();

    const submission: Submission = {
      id,
      title: input.title || "Untitled submission",
      content: input.content,
      contentType: input.contentType,
      channel: input.channel,
      intent: input.intent,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      findings: [],
      versions: [
        {
          version: 1,
          content: input.content,
          intent: input.intent,
          createdAt: now,
          author: "creator",
          note: "Draft created"
        }
      ],
      comments: [],
      decisions: [],
      requiredReviewers: ["manager"],
      approvedReviewers: []
    };

    setState((prev) =>
      prev
        ? {
            ...prev,
            currentSubmissionId: id,
            submissions: [submission, ...prev.submissions]
          }
        : prev
    );

    return id;
  }, []);

  const updateDraftFields = useCallback(
    (
      id: string,
      fields: Partial<
        Pick<
          Submission,
          "title" | "content" | "intent" | "channel" | "contentType"
        >
      >
    ) => {
      setState((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          submissions: prev.submissions.map((s) =>
            s.id === id ? { ...s, ...fields, updatedAt: nowISO() } : s
          )
        };
      });
    },
    []
  );

  const saveDraft = useCallback((id: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const role = prev.role;

      return {
        ...prev,
        submissions: prev.submissions.map((s) => {
          if (s.id !== id) return s;

          const last = s.versions[s.versions.length - 1];

          if (last && last.content === s.content && last.intent === s.intent) {
            return s;
          }

          const version = {
            version: s.versions.length + 1,
            content: s.content,
            intent: s.intent,
            createdAt: nowISO(),
            author: role,
            note: "Saved draft edits"
          };

          return {
            ...s,
            versions: [...s.versions, version],
            updatedAt: nowISO()
          };
        })
      };
    });
  }, []);

  const runReview = useCallback((id: string) => {
    setState((prev) => {
      if (!prev) return prev;

      const role = prev.role;
      const kb = {
        guidelines: prev.guidelines,
        terms: prev.terms,
        claims: prev.claims
      };

      return {
        ...prev,
        submissions: prev.submissions.map((s) => {
          if (s.id !== id) return s;

          const result = reviewContent(s.content, s.intent, kb);

          const version = {
            version: s.versions.length + 1,
            content: s.content,
            intent: s.intent,
            createdAt: nowISO(),
            author: role,
            note: `Automated review completed: ${result.findings.length} findings`
          };

          return {
            ...s,
            findings: result.findings,
            disclosure: result.disclosure,
            requiredReviewers: deriveRequiredReviewers(result.findings),
            approvedReviewers: [],
            versions: [...s.versions, version],
            updatedAt: nowISO()
          };
        })
      };
    });
  }, []);

  const applyFinding = useCallback(
    (submissionId: string, findingId: string, customReplacement?: string) => {
      setState((prev) => {
        if (!prev) return prev;
        const role = prev.role;

        return {
          ...prev,
          submissions: prev.submissions.map((s) => {
            if (s.id !== submissionId) return s;

            const finding = s.findings.find((f) => f.id === findingId);
            if (!finding) return s;

            const replacement = customReplacement ?? finding.suggestion;
            let content = s.content;

            if (content.includes(finding.flaggedText)) {
              content = content.replace(finding.flaggedText, replacement);
            }

            const findings = s.findings.map((f) =>
              f.id === findingId
                ? { ...f, status: "accepted" as const, suggestion: replacement }
                : f
            );

            const version = {
              version: s.versions.length + 1,
              content,
              intent: s.intent,
              createdAt: nowISO(),
              author: role,
              note: `Applied fix for ${finding.category}: "${finding.flaggedText}"`
            };

            return {
              ...s,
              content,
              findings,
              requiredReviewers: deriveRequiredReviewers(findings),
              versions: [...s.versions, version],
              updatedAt: nowISO()
            };
          })
        };
      });
    },
    []
  );

  const dismissFinding = useCallback(
    (submissionId: string, findingId: string, reason: string) => {
      setState((prev) => {
        if (!prev) return prev;
        const role = prev.role;

        return {
          ...prev,
          submissions: prev.submissions.map((s) => {
            if (s.id !== submissionId) return s;

            const finding = s.findings.find((f) => f.id === findingId);
            if (!finding) return s;

            if (role === "creator" && finding.severity === "Blocker") {
              return s;
            }

            const findings = s.findings.map((f) =>
              f.id === findingId
                ? {
                    ...f,
                    status: "dismissed" as const,
                    dismissalReason: reason
                  }
                : f
            );

            const version = {
              version: s.versions.length + 1,
              content: s.content,
              intent: s.intent,
              createdAt: nowISO(),
              author: role,
              note: `Dismissed ${finding.category} finding: ${reason}`
            };

            return {
              ...s,
              findings,
              requiredReviewers: deriveRequiredReviewers(findings),
              versions: [...s.versions, version],
              updatedAt: nowISO()
            };
          })
        };
      });
    },
    []
  );

  const escalateFinding = useCallback(
    (submissionId: string, findingId: string) => {
      setState((prev) => {
        if (!prev) return prev;
        const role = prev.role;

        return {
          ...prev,
          submissions: prev.submissions.map((s) => {
            if (s.id !== submissionId) return s;

            const finding = s.findings.find((f) => f.id === findingId);
            if (!finding) return s;

            const findings = s.findings.map((f) =>
              f.id === findingId ? { ...f, status: "escalated" as const } : f
            );

            const version = {
              version: s.versions.length + 1,
              content: s.content,
              intent: s.intent,
              createdAt: nowISO(),
              author: role,
              note: `Escalated ${finding.category} finding to reviewer`
            };

            return {
              ...s,
              findings,
              requiredReviewers: deriveRequiredReviewers(findings),
              versions: [...s.versions, version],
              updatedAt: nowISO()
            };
          })
        };
      });
    },
    []
  );

  const resolveFinding = useCallback(
    (submissionId: string, findingId: string, note?: string) => {
      setState((prev) => {
        if (!prev) return prev;
        const role = prev.role;

        return {
          ...prev,
          submissions: prev.submissions.map((s) => {
            if (s.id !== submissionId) return s;

            const finding = s.findings.find((f) => f.id === findingId);
            if (!finding) return s;

            const findings = s.findings.map((f) =>
              f.id === findingId ? { ...f, status: "resolved" as const } : f
            );

            const version = {
              version: s.versions.length + 1,
              content: s.content,
              intent: s.intent,
              createdAt: nowISO(),
              author: role,
              note: note || `Reviewer resolved ${finding.category} finding`
            };

            return {
              ...s,
              findings,
              requiredReviewers: deriveRequiredReviewers(findings),
              versions: [...s.versions, version],
              updatedAt: nowISO()
            };
          })
        };
      });
    },
    []
  );

  const submitForApproval = useCallback((id: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const role = prev.role;

      return {
        ...prev,
        submissions: prev.submissions.map((s) => {
          if (s.id !== id) return s;

          const allowed =
            s.status !== "in_review" &&
            s.status !== "approved" &&
            !!s.disclosure &&
            !s.findings.some(
              (f) => f.severity === "Blocker" && f.status === "open"
            );

          if (!allowed) return s;

          const requiredReviewers = deriveRequiredReviewers(s.findings);

          const version = {
            version: s.versions.length + 1,
            content: s.content,
            intent: s.intent,
            createdAt: nowISO(),
            author: role,
            note: "Submitted for approval"
          };

          return {
            ...s,
            status: "in_review" as const,
            requiredReviewers,
            approvedReviewers: [],
            versions: [...s.versions, version],
            updatedAt: nowISO()
          };
        })
      };
    });
  }, []);

  const approveSubmission = useCallback(
    (id: string, role: Role, note?: string) => {
      setState((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          submissions: prev.submissions.map((s) => {
            if (s.id !== id || s.status !== "in_review") return s;

            if (role !== "manager" && !s.requiredReviewers.includes(role)) {
              return s;
            }

            let findings = s.findings;

            if (role === "legal") {
              findings = findings.map((f) =>
                f.category === "claims" &&
                (f.status === "open" || f.status === "escalated")
                  ? { ...f, status: "resolved" as const }
                  : f
              );
            }

            if (role === "accessibility") {
              findings = findings.map((f) =>
                f.category === "accessibility" &&
                (f.status === "open" || f.status === "escalated")
                  ? { ...f, status: "resolved" as const }
                  : f
              );
            }

            const approvedReviewers = s.approvedReviewers.includes(role)
              ? s.approvedReviewers
              : [...s.approvedReviewers, role];

            const requiredReviewers = deriveRequiredReviewers(findings);

            const domainsApproved = requiredReviewers
              .filter((r) => r !== "manager")
              .every((r) => approvedReviewers.includes(r));

            const noBlockers = !findings.some(
              (f) =>
                f.severity === "Blocker" &&
                !["accepted", "resolved", "dismissed"].includes(f.status)
            );

            const finalStatus =
              role === "manager" && domainsApproved && noBlockers
                ? ("approved" as const)
                : ("in_review" as const);

            const decisions = [
              ...s.decisions,
              {
                role,
                decision: "approved" as const,
                note,
                at: nowISO()
              }
            ];

            const version = {
              version: s.versions.length + 1,
              content: s.content,
              intent: s.intent,
              createdAt: nowISO(),
              author: role,
              note:
                finalStatus === "approved"
                  ? "Final approval granted"
                  : `${role} approved domain review`
            };

            return {
              ...s,
              findings,
              approvedReviewers,
              requiredReviewers,
              status: finalStatus,
              decisions,
              versions: [...s.versions, version],
              updatedAt: nowISO()
            };
          })
        };
      });
    },
    []
  );

  const requestChanges = useCallback(
    (id: string, role: Role, note: string) => {
      setState((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          submissions: prev.submissions.map((s) => {
            if (s.id !== id) return s;

            const decisions = [
              ...s.decisions,
              {
                role,
                decision: "changes_requested" as const,
                note,
                at: nowISO()
              }
            ];

            const version = {
              version: s.versions.length + 1,
              content: s.content,
              intent: s.intent,
              createdAt: nowISO(),
              author: role,
              note: `Requested changes: ${note}`
            };

            return {
              ...s,
              status: "changes_requested" as const,
              decisions,
              versions: [...s.versions, version],
              updatedAt: nowISO()
            };
          })
        };
      });
    },
    []
  );

  const addComment = useCallback((submissionId: string, text: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const role = prev.role;

      return {
        ...prev,
        submissions: prev.submissions.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                comments: [
                  ...s.comments,
                  {
                    id: uid(),
                    author: role,
                    text,
                    createdAt: nowISO()
                  }
                ]
              }
            : s
        )
      };
    });
  }, []);

  const addGuideline = useCallback((clause: Omit<Clause, "id">) => {
    setState((prev) =>
      prev
        ? { ...prev, guidelines: [...prev.guidelines, { ...clause, id: uid() }] }
        : prev
    );
  }, []);

  const addTerm = useCallback((term: Omit<TermRule, "id">) => {
    setState((prev) =>
      prev
        ? { ...prev, terms: [...prev.terms, { ...term, id: uid() }] }
        : prev
    );
  }, []);

  const addClaim = useCallback((claim: Omit<ClaimEntry, "id">) => {
    setState((prev) =>
      prev
        ? { ...prev, claims: [...prev.claims, { ...claim, id: uid() }] }
        : prev
    );
  }, []);

  const resetData = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(seedState());
  }, []);

  if (!state) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-300">
        Loading BrandSentry…
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        state,
        setRole,
        openSubmission,
        createSubmission,
        updateDraftFields,
        saveDraft,
        runReview,
        applyFinding,
        dismissFinding,
        escalateFinding,
        resolveFinding,
        submitForApproval,
        approveSubmission,
        requestChanges,
        addComment,
        addGuideline,
        addTerm,
        addClaim,
        resetData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}