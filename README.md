# BrandSentry

**Live Website:** [https://brandsentry.netlify.app/]

BrandSentry is a pre-publication brand-governance web application. It helps creators review content before publishing it by checking drafts against approved brand guidelines, terminology rules, accessibility practices, and claim evidence.

Instead of simply rejecting content, BrandSentry explains what was flagged, why it was flagged, which rule or source is involved, and how the issue can be fixed while preserving the creator’s original intent.

---

## What BrandSentry Does

BrandSentry allows a user to:

- Draft or paste content for review.
- Run an automated brand review.
- See evidence-linked findings with severity levels.
- Accept, edit, dismiss, or escalate suggested fixes.
- Submit content for approval.
- Route findings to relevant reviewer roles such as Legal, Accessibility, or Manager.
- Maintain a revision history of changes and approvals.
- View an AI disclosure and verification summary.
- Manage approved guidelines, terminology rules, and claim ledger entries.

The application is designed to keep humans in control. The system recommends actions, but the final decision always belongs to the user or reviewer.

---

## Live Demo

You can use the deployed version directly:

[https://brandsentry.netlify.app/]

No login is required for the demo.

---

## Features

### 1. Draft Creation

Users can create a submission by providing:

- Title
- Content
- Content type
- Channel
- Creator intent

The creator intent field helps preserve the purpose of the message during review and corrections.

---

### 2. Automated Review Engine

BrandSentry reviews content against the loaded knowledge base and generates findings in categories such as:

- Tone
- Terminology
- Messaging
- Accessibility
- Unsupported or contradicted claims

Each finding includes:

- Severity level
- Category
- Confidence
- Flagged text
- Suggested fix
- Explanation
- Source reference
- Quoted rule

---

### 3. Evidence-Linked Findings

Findings are not shown as generic warnings. Each finding is linked to an approved source such as:

- A brand guideline clause
- A terminology rule
- A claim ledger entry
- An accessibility rule

This makes the review explainable and auditable.

---

### 4. Intent-Preserving Fixes

For each finding, the user can:

- **Accept fix**
- **Edit fix**
- **Dismiss with reason**
- **Escalate to reviewer**

The system does not silently rewrite content. All changes are user-controlled.

---

### 5. Role-Based Workflow

BrandSentry includes the following roles:

- Creator
- Manager
- Legal
- Accessibility
- Guideline Admin

The role switcher in the header allows users to move between roles and experience the full workflow.

---

### 6. Approval Routing

When a submission contains specific types of findings, the system determines which reviewers are required.

For example:

- Claim-related findings may require Legal review.
- Accessibility-related findings may require Accessibility review.
- Manager approval is required for final sign-off.

---

### 7. Revision History

Every major action is stored in the submission history, including:

- Draft creation
- Review execution
- Accepted fixes
- Dismissed findings
- Escalated findings
- Reviewer approvals
- Final approval

This creates a clear audit trail.

---

### 8. Comments

Users and reviewers can add comments to a submission to discuss required changes, exceptions, or clarifications.

---

### 9. AI Disclosure Ledger

The AI Disclosure panel shows:

- Deterministic checks performed
- AI-assisted checks performed
- External services used
- Redaction summary
- Model or engine information
- Total findings
- Verified citation count

This helps users understand how the review was produced.

---

### 10. Knowledge Base Management

Guideline Admins can view and add:

- Guideline clauses
- Terminology rules
- Claim ledger entries

The demo comes preloaded with sample knowledge-base data.

---

### 11. Round 3 Improvement Plan

The application includes a dedicated **Round 3 Plan** page inside the website. It explains the planned future improvements of BrandSentry.

---

## Technologies Used

| Technology | Purpose |
|---|---|
| Next.js | Frontend application framework |
| React | UI components |
| TypeScript | Type-safe application logic |
| Tailwind CSS | Styling |
| React Context | Global state management |
| localStorage | Browser-based demo persistence |
| Deterministic rule engine | Exact terminology and accessibility checks |
| Local heuristic engine | AI-assisted checks for tone, claims, and messaging |
| Netlify | Deployment |

---

## Run Locally 
```bash
npm install
npm run dev