"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  PenLine,
  FolderOpen,
  UserCircle,
  Sparkles,
  LogOut,
  Zap,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze Job", href: "/dashboard/analyze", icon: Search },
  { label: "Write Proposal", href: "/dashboard/write", icon: PenLine },
  { label: "My Proposals", href: "/dashboard/proposals", icon: FolderOpen },
  { label: "Profile Setup", href: "/dashboard/profile", icon: UserCircle },
  { label: "Upgrade to Pro", href: "/dashboard/upgrade", icon: Zap },
];

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
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

      <div className="px-4 py-4 border-t border-zinc-800 space-y-3 shrink-0">
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
            <p className="text-xs text-zinc-500 truncate">
              {session?.user?.email}
            </p>
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
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── Mobile top bar ───────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between h-14 px-4 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-500/20">
            <Sparkles className="w-3.5 h-3.5 text-green-400" />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">
            UpworkAI
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile overlay ───────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile drawer ────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden fixed top-0 left-0 h-full z-50 w-72 flex flex-col bg-zinc-900 border-r border-zinc-800"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20">
                  <Sparkles className="w-4 h-4 text-green-400" />
                </div>
                <span className="font-semibold text-white tracking-tight">
                  UpworkAI
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <NavContent onLinkClick={() => setMobileOpen(false)} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ──────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 border-r border-zinc-800 bg-zinc-900/50 shrink-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-800">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20">
            <Sparkles className="w-4 h-4 text-green-400" />
          </div>
          <span className="font-semibold text-white tracking-tight">
            UpworkAI
          </span>
        </div>
        <NavContent />
      </aside>
    </>
  );
}
