import { Finding, Role, Severity, Submission } from "./types";

export function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString();
}

export function severityRank(severity: Severity): number {
  if (severity === "Blocker") return 0;
  if (severity === "Should-fix") return 1;
  return 2;
}

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort(
    (a, b) => severityRank(a.severity) - severityRank(b.severity)
  );
}

export function deriveRequiredReviewers(findings: Finding[]): Role[] {
  const roles = new Set<Role>(["manager"]);

  const unresolved = findings.filter(
    (f) => f.status === "open" || f.status === "escalated"
  );

  if (unresolved.some((f) => f.category === "claims")) {
    roles.add("legal");
  }

  if (unresolved.some((f) => f.category === "accessibility")) {
    roles.add("accessibility");
  }

  return Array.from(roles);
}

export function unresolvedBlockers(submission: Submission): Finding[] {
  return submission.findings.filter(
    (f) =>
      f.severity === "Blocker" &&
      !["accepted", "resolved", "dismissed"].includes(f.status)
  );
}

export function canSubmit(submission: Submission): boolean {
  if (submission.status === "in_review" || submission.status === "approved") {
    return false;
  }

  if (!submission.disclosure) {
    return false;
  }

  return !submission.findings.some(
    (f) => f.severity === "Blocker" && f.status === "open"
  );
}

export function canFinalApprove(submission: Submission): boolean {
  if (submission.status !== "in_review") return false;

  const domainRoles = submission.requiredReviewers.filter(
    (r) => r !== "manager"
  );

  const domainsApproved = domainRoles.every((r) =>
    submission.approvedReviewers.includes(r)
  );

  return domainsApproved && unresolvedBlockers(submission).length === 0;
}