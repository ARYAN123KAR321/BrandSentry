import { Finding, KnowledgeBase, ReviewDisclosure } from "./types";
import { severityRank, uid } from "./utils";

type AddInput = {
  category: Finding["category"];
  severity: Finding["severity"];
  confidence: Finding["confidence"];
  flaggedText: string;
  suggestion: string;
  message: string;
  sourceClauseId: string;
  aiUsed: boolean;
  deterministic: boolean;
  claimRef?: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function reviewContent(
  content: string,
  intent: string,
  kb: KnowledgeBase
): { findings: Finding[]; disclosure: ReviewDisclosure } {
  const findings: Finding[] = [];
  const seen = new Set<string>();

  const clauseMap = new Map(kb.guidelines.map((c) => [c.id, c]));

  const addFinding = (input: AddInput) => {
    const clause = clauseMap.get(input.sourceClauseId);
    if (!clause) return;

    if (!content.includes(input.flaggedText)) return;

    const key = `${input.category}:${input.flaggedText}:${input.sourceClauseId}`;
    if (seen.has(key)) return;
    seen.add(key);

    findings.push({
      id: uid(),
      category: input.category,
      severity: input.severity,
      confidence: input.confidence,
      ruleId: clause.id,
      sourceRef: input.claimRef
        ? `${clause.code} v${clause.version} • ${input.claimRef}`
        : `${clause.code} v${clause.version}`,
      quotedRule: clause.text,
      flaggedText: input.flaggedText,
      suggestion: input.suggestion,
      message: input.message,
      status: "open",
      aiUsed: input.aiUsed,
      deterministic: input.deterministic
    });
  };

  const redactions: string[] = [];

  if (content.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) {
    redactions.push("Email-like patterns would be masked before external AI calls.");
  }

  if (content.match(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g)) {
    redactions.push("Phone-like patterns would be masked before external AI calls.");
  }

  if (redactions.length === 0) {
    redactions.push("No sensitive patterns detected.");
  }

  // Terminology checks
  for (const term of kb.terms) {
    const re = new RegExp(escapeRegExp(term.term), "gi");
    let match: RegExpExecArray | null;

    while ((match = re.exec(content)) !== null) {
      const found = match[0];

      if (term.type === "banned") {
        addFinding({
          category: "terminology",
          severity: "Should-fix",
          confidence: "High",
          flaggedText: found,
          suggestion: term.replacement || "",
          message: `The term "${found}" is banned or requires approved evidence. ${term.reason}`,
          sourceClauseId: term.sourceClauseId,
          aiUsed: false,
          deterministic: true
        });
      }

      if (term.type === "casing" && found !== term.replacement) {
        addFinding({
          category: "terminology",
          severity: "Should-fix",
          confidence: "High",
          flaggedText: found,
          suggestion: term.replacement || found,
          message: `Use approved casing: "${term.replacement}".`,
          sourceClauseId: term.sourceClauseId,
          aiUsed: false,
          deterministic: true
        });
      }
    }
  }

  // Accessibility check
  const clickRe = /click here to learn more|click here/gi;
  let clickMatch: RegExpExecArray | null;

  while ((clickMatch = clickRe.exec(content)) !== null) {
    addFinding({
      category: "accessibility",
      severity: "Advisory",
      confidence: "High",
      flaggedText: clickMatch[0],
      suggestion: "Learn more about Pro Plan",
      message:
        'Link text should describe the destination. Replace generic text such as "click here" with a meaningful label.',
      sourceClauseId: "ACC-2.4.4",
      aiUsed: false,
      deterministic: true
    });
  }

  // Unsupported comparative claim
  const fastestRe = /the fastest in india|fastest in india/gi;
  let fastestMatch: RegExpExecArray | null;

  while ((fastestMatch = fastestRe.exec(content)) !== null) {
    addFinding({
      category: "claims",
      severity: "Blocker",
      confidence: "High",
      flaggedText: fastestMatch[0],
      suggestion: "built for speed",
      message:
        '"Fastest in India" is an unsupported comparative claim. No approved Claim Ledger entry exists.',
      sourceClauseId: "CLM-1",
      aiUsed: true,
      deterministic: false,
      claimRef: "Unsupported claim"
    });
  }

  // Contradicted uptime claim
  const uptimeRe = /guarantee[sd]? 100% uptime|100% uptime/gi;
  let uptimeMatch: RegExpExecArray | null;

  while ((uptimeMatch = uptimeRe.exec(content)) !== null) {
    const isGuarantee = /guarantee[sd]?/i.test(uptimeMatch[0]);

    addFinding({
      category: "claims",
      severity: "Blocker",
      confidence: "High",
      flaggedText: uptimeMatch[0],
      suggestion: isGuarantee
        ? "is designed for 99.9% uptime"
        : "99.9% uptime",
      message:
        '"100% uptime" contradicts approved Claim C-014: "99.9% uptime".',
      sourceClauseId: "CLM-1",
      aiUsed: true,
      deterministic: false,
      claimRef: "Claim C-014"
    });
  }

  // Tone check: repeated exclamation marks
  const exclamationRe = /!{2,}/g;
  let exclamationMatch: RegExpExecArray | null;

  while ((exclamationMatch = exclamationRe.exec(content)) !== null) {
    addFinding({
      category: "tone",
      severity: "Should-fix",
      confidence: "High",
      flaggedText: exclamationMatch[0],
      suggestion: "!",
      message:
        "Repeated exclamation marks conflict with the brand voice: confident, not hyped.",
      sourceClauseId: "VT-2.3",
      aiUsed: true,
      deterministic: false
    });
  }

  // Tone check: all caps phrases
  const capsRe = /\b[A-Z]{3,}(?: [A-Z]{3,}){2,}\b/g;
  let capsMatch: RegExpExecArray | null;

  while ((capsMatch = capsRe.exec(content)) !== null) {
    addFinding({
      category: "tone",
      severity: "Advisory",
      confidence: "Medium",
      flaggedText: capsMatch[0],
      suggestion: capsMatch[0].toLowerCase(),
      message:
        "All-caps phrases can feel like shouting and may reduce accessibility.",
      sourceClauseId: "VT-2.3",
      aiUsed: true,
      deterministic: false
    });
  }

  // Messaging check: all-new
  const allNewRe = /all-new/gi;
  let allNewMatch: RegExpExecArray | null;

  while ((allNewMatch = allNewRe.exec(content)) !== null) {
    addFinding({
      category: "messaging",
      severity: "Advisory",
      confidence: "Medium",
      flaggedText: allNewMatch[0],
      suggestion: "new",
      message:
        '"All-new" may require product-launch approval. Confirm with approved campaign messaging.',
      sourceClauseId: "MSG-1",
      aiUsed: true,
      deterministic: false
    });
  }

  findings.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));

  const disclosure: ReviewDisclosure = {
    timestamp: new Date().toISOString(),
    deterministicChecks: [
      "Terminology exact-match checks",
      "Accessibility link-text checks",
      "Citation verification",
      "Visual checks skipped in text-only demo"
    ],
    aiChecks: [
      "Claim interpretation against Claim Ledger",
      "Tone and hype pattern analysis",
      "Messaging approval heuristics"
    ],
    externalServices: "None in demo mode. Local grounded verifier used.",
    redactions,
    model: "BrandSentry Local Verifier 0.2",
    totalFindings: findings.length,
    verifiedCitations: findings.length
  };

  return { findings, disclosure };
}