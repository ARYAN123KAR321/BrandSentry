import { Submission } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DisclosurePanel({
  submission
}: {
  submission: Submission;
}) {
  if (!submission.disclosure) {
    return (
      <p className="text-sm text-slate-400">
        Run the automated review to generate an AI and data disclosure ledger.
      </p>
    );
  }

  const d = submission.disclosure;

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="text-sm text-slate-400">Review timestamp</div>
        <div className="mt-1 text-sm">{formatDate(d.timestamp)}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="text-sm font-semibold">Deterministic checks</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {d.deterministicChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold">AI-assisted checks</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {d.aiChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="text-sm font-semibold">External services</h3>
          <p className="mt-2 text-sm text-slate-300">{d.externalServices}</p>

          <h3 className="mt-4 text-sm font-semibold">Model</h3>
          <p className="mt-2 text-sm text-slate-300">{d.model}</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold">Confidentiality</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {d.redactions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold">Reliability summary</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
            <div className="text-xs text-slate-500">Total findings</div>
            <div className="mt-1 text-xl font-semibold">{d.totalFindings}</div>
          </div>

          <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
            <div className="text-xs text-slate-500">
              Findings with verified citations
            </div>
            <div className="mt-1 text-xl font-semibold">
              {d.verifiedCitations}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}