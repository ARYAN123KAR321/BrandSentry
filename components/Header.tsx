"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context";
import { Role } from "@/lib/types";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/submission", label: "Review Workspace" },
  { href: "/approvals", label: "Approvals" },
  { href: "/knowledge", label: "Knowledge Base" },
  { href: "/improvements", label: "Round 3 Plan" }
];

export default function Header() {
  const { state, setRole } = useApp();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <Link href="/" className="text-lg font-semibold text-white">
            BrandSentry
          </Link>
          <p className="text-xs text-slate-400">
            Pre-publication brand governance MVP
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm ${
                pathname === link.href
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <select
            value={state.role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="ml-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            title="Switch role for demo"
          >
            <option value="creator">Creator</option>
            <option value="manager">Manager</option>
            <option value="legal">Legal</option>
            <option value="accessibility">Accessibility</option>
            <option value="admin">Guideline Admin</option>
          </select>
        </nav>
      </div>
    </header>
  );
}