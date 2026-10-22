import { AppState, Submission } from "./types";
import { nowISO } from "./utils";

export function seedState(): AppState {
  const now = nowISO();

  const demoSubmission: Submission = {
    id: "demo-submission",
    title: "Pro Plan launch post",
    content:
      "Our all-new Pro plan is the fastest in India and guarantees 100% uptime!! Click here to learn more.",
    contentType: "Social post",
    channel: "LinkedIn",
    intent: "Announce the new Pro Plan and drive clicks to the product page.",
    status: "draft",
    createdAt: now,
    updatedAt: now,
    findings: [],
    versions: [
      {
        version: 1,
        content:
          "Our all-new Pro plan is the fastest in India and guarantees 100% uptime!! Click here to learn more.",
        intent: "Announce the new Pro Plan and drive clicks to the product page.",
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

  return {
    role: "creator",
    currentSubmissionId: demoSubmission.id,
    guidelines: [
      {
        id: "VT-2.3",
        code: "Voice & Tone 2.3",
        title: "Confident, not hyped",
        text:
          "Use a confident, calm tone. Avoid repeated exclamation marks, exaggerated language, and unsubstantiated superlatives.",
        version: "4",
        category: "tone"
      },
      {
        id: "TERM-1",
        code: "Terminology 1",
        title: "Product naming",
        text: 'Write the product name as "Pro Plan" with capital P and capital P.',
        version: "2",
        category: "terminology"
      },
      {
        id: "CLM-1",
        code: "Claims Policy 1",
        title: "Evidence-backed claims",
        text:
          "All promotional and factual claims must be supported by an approved Claim Ledger entry. Unsupported claims require Legal sign-off.",
        version: "3",
        category: "claims"
      },
      {
        id: "ACC-2.4.4",
        code: "WCAG 2.4.4",
        title: "Link purpose",
        text:
          'Link text must describe the destination. Avoid generic phrases such as "click here".',
        version: "1",
        category: "accessibility"
      },
      {
        id: "MSG-1",
        code: "Messaging 1",
        title: "Approved launch messaging",
        text:
          'Launch descriptors such as "all-new" must be approved by product marketing and match current campaign messaging.',
        version: "1",
        category: "messaging"
      }
    ],
    terms: [
      {
        id: "term-pro-plan",
        type: "casing",
        term: "Pro plan",
        replacement: "Pro Plan",
        reason: "Approved product naming uses capital P and capital P.",
        sourceClauseId: "TERM-1"
      },
      {
        id: "term-number-one",
        type: "banned",
        term: "#1",
        replacement: "",
        reason: '"#1" is an unsupported ranking claim unless approved.',
        sourceClauseId: "CLM-1"
      }
    ],
    claims: [
      {
        id: "C-014",
        claim: "Uptime SLA",
        approvedWording: "99.9% uptime",
        evidence: "Service SLA v2.1",
        owner: "Product",
        expiry: "2026-12-31",
        status: "active"
      },
      {
        id: "C-020",
        claim: "Performance positioning",
        approvedWording: "designed for fast performance",
        evidence: "Benchmark summary approved by Product",
        owner: "Marketing",
        expiry: "2026-06-30",
        status: "active"
      }
    ],
    submissions: [demoSubmission]
  };
}