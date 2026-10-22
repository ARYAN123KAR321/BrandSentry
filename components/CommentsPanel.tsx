"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { Submission } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function CommentsPanel({
  submission
}: {
  submission: Submission;
}) {
  const { state, addComment } = useApp();
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    addComment(submission.id, text.trim());
    setText("");
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="text-sm text-slate-300">
          Commenting as <span className="font-medium">{state.role}</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input mt-3 min-h-24"
          placeholder="Add a comment for creators or reviewers..."
        />

        <button onClick={submit} className="btn btn-primary mt-3">
          Add comment
        </button>
      </div>

      <div className="space-y-3">
        {submission.comments.length === 0 && (
          <p className="text-sm text-slate-400">No comments yet.</p>
        )}

        {submission.comments
          .slice()
          .reverse()
          .map((comment) => (
            <div key={comment.id} className="card">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">{comment.author}</div>
                <div className="text-xs text-slate-500">
                  {formatDate(comment.createdAt)}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-300">{comment.text}</p>
            </div>
          ))}
      </div>
    </div>
  );
}