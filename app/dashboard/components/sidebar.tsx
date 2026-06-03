"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Search,
  PenLine,
  FolderOpen,
  UserCircle,
  Sparkles,
  LogOut,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze Job", href: "/dashboard/analyze", icon: Search },
  { label: "Write Proposal", href: "/dashboard/write", icon: PenLine },
  { label: "My Proposals", href: "/dashboard/proposals", icon: FolderOpen },
  { label: "Profile Setup", href: "/dashboard/profile", icon: UserCircle },
  { label: "Upgrade to Pro", href: "/dashboard/upgrade", icon: Zap },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-zinc-800 bg-zinc-900/50 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20">
          <Sparkles className="w-4 h-4 text-green-400" />
        </div>
        <span className="font-semibold text-white tracking-tight">UpworkAI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-green-500/15 text-green-400"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div className="px-4 py-4 border-t border-zinc-800 space-y-3">
        <div className="flex items-center gap-3 min-w-0">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? "User"}
              className="w-8 h-8 rounded-full shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-700 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-zinc-500 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
