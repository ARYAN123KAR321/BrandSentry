import { Submission } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function HistoryPanel({
  submission
}: {
  submission: Submission;
}) {
  const versions = submission.versions.slice().reverse();

  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <div key={version.version} className="card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium">
              Version {version.version}
            </div>
            <div className="text-xs text-slate-400">
              {formatDate(version.createdAt)}
            </div>
          </div>

          <div className="mt-2 text-sm text-slate-300">{version.note}</div>
          <div className="mt-1 text-xs text-slate-500">
            Author role: {version.author}
          </div>

          <pre className="mt-3 whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
            {version.content.slice(0, 500)}
            {version.content.length > 500 ? "..." : ""}
          </pre>
        </div>
      ))}
    </div>
  );
}