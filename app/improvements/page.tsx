const improvements = [
  {
    title: "1. Multi-format ingestion and visual consistency checks",
    problem:
      "Round 2 focuses on text-only review. Real brand content includes DOCX, PDF, posters, and social images.",
    plan: [
      "Add DOCX and PDF parsing with clause-level extraction.",
      "Add PNG/JPG ingestion with OCR for embedded text.",
      "Implement deterministic visual checks for logo clear space, minimum logo size, approved palette, and contrast.",
      "Use a vision model only for subjective image observations, labelled as low-confidence advisory findings."
    ],
    impact:
      "This makes BrandSentry usable for campaigns, posters, and documents, not just plain text."
  },
  {
    title: "2. Grounded LLM review with citation verification",
    problem:
      "The Round 2 demo uses a local grounded verifier and deterministic heuristics. The full proposal requires AI-assisted tone, messaging, and claim review with reliable citations.",
    plan: [
      "Integrate Claude or another LLM behind a provider-agnostic interface.",
      "Force structured JSON output with clause ID, quoted rule text, and flagged span.",
      "Add a programmatic verifier that confirms every quoted rule exists and every flagged span exists in the draft.",
      "Add abstention: if the model cannot ground a finding, it becomes a low-confidence human note, not a violation."
    ],
    impact:
      "This improves reliability, reduces false positives, and aligns the product with the proposal's grounded-or-silent principle."
  },
  {
    title: "3. Governance dashboard and Guideline Ambiguity Radar",
    problem:
      "Reviewing individual drafts is only half the problem. Brand teams also need to know which rules are repeatedly broken or unclear.",
    plan: [
      "Build analytics for recurring violations by team, channel, category, and time period.",
      "Track dismissal reasons, reviewer disagreement, and repeated escalations.",
      "Flag guideline clauses that may be ambiguous or outdated.",
      "Add Claim Ledger health alerts for expiring or frequently contradicted claims."
    ],
    impact:
      "This turns BrandSentry from a checker into a governance system that improves guidelines over time."
  }
];

export default function ImprovementsPage() {
  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">Round 3 improvement plan</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          These are the three substantial improvements planned after the Round 2
          working MVP. They directly extend the original BrandSentry proposal and
          address the hackathon judging criteria.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {improvements.map((item) => (
          <section key={item.title} className="card">
            <h2 className="text-lg font-semibold">{item.title}</h2>

            <div className="mt-3">
              <div className="text-sm font-medium text-slate-200">Problem</div>
              <p className="mt-1 text-sm text-slate-300">{item.problem}</p>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium text-slate-200">Plan</div>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {item.plan.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium text-slate-200">Impact</div>
              <p className="mt-1 text-sm text-slate-300">{item.impact}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}