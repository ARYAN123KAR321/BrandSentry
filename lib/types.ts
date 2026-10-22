export type Role =
  | "creator"
  | "manager"
  | "legal"
  | "accessibility"
  | "admin";

export type Severity = "Blocker" | "Should-fix" | "Advisory";

export type FindingStatus =
  | "open"
  | "accepted"
  | "dismissed"
  | "escalated"
  | "resolved";

export type Category =
  | "tone"
  | "terminology"
  | "messaging"
  | "visual"
  | "accessibility"
  | "claims";

export type SubmissionStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "changes_requested"
  | "rejected";

export type TermType = "banned" | "preferred" | "casing";

export interface Clause {
  id: string;
  code: string;
  title: string;
  text: string;
  version: string;
  category: Category;
}

export interface TermRule {
  id: string;
  type: TermType;
  term: string;
  replacement?: string;
  reason: string;
  sourceClauseId: string;
}

export interface ClaimEntry {
  id: string;
  claim: string;
  approvedWording: string;
  evidence: string;
  owner: string;
  expiry?: string;
  status: "active" | "expired";
}

export interface Finding {
  id: string;
  category: Category;
  severity: Severity;
  confidence: "High" | "Medium" | "Low";
  ruleId: string;
  sourceRef: string;
  quotedRule: string;
  flaggedText: string;
  suggestion: string;
  message: string;
  status: FindingStatus;
  dismissalReason?: string;
  aiUsed: boolean;
  deterministic: boolean;
}

export interface Comment {
  id: string;
  author: Role;
  text: string;
  createdAt: string;
}

export interface ApprovalDecision {
  role: Role;
  decision: "approved" | "changes_requested" | "rejected";
  note?: string;
  at: string;
}

export interface ReviewDisclosure {
  timestamp: string;
  deterministicChecks: string[];
  aiChecks: string[];
  externalServices: string;
  redactions: string[];
  model: string;
  totalFindings: number;
  verifiedCitations: number;
}

export interface SubmissionVersion {
  version: number;
  content: string;
  intent: string;
  createdAt: string;
  author: Role;
  note: string;
}

export interface Submission {
  id: string;
  title: string;
  content: string;
  contentType: string;
  channel: string;
  intent: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  findings: Finding[];
  versions: SubmissionVersion[];
  comments: Comment[];
  decisions: ApprovalDecision[];
  disclosure?: ReviewDisclosure;
  requiredReviewers: Role[];
  approvedReviewers: Role[];
}

export interface KnowledgeBase {
  guidelines: Clause[];
  terms: TermRule[];
  claims: ClaimEntry[];
}

export interface AppState {
  role: Role;
  currentSubmissionId?: string;
  guidelines: Clause[];
  terms: TermRule[];
  claims: ClaimEntry[];
  submissions: Submission[];
}