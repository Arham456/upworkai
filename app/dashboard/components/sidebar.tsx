"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  ShieldAlert,
  Sparkles,
  FolderOpen,
  Trophy,
  UserCircle,
  LogOut,
  Menu,
  X,
  Zap,
  ChevronRight,
} from "lucide-react";
import { HawkLogo } from "@/components/hawk-logo";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze Job", href: "/dashboard/analyze", icon: Search },
  { label: "Red Flag Detector", href: "/dashboard/red-flags", icon: ShieldAlert },
  { label: "Personalize Proposal", href: "/dashboard/personalize", icon: Sparkles },
  { label: "My Proposals", href: "/dashboard/proposals", icon: FolderOpen },
  { label: "Win Tracker", href: "/dashboard/win-tracker", icon: Trophy },
  { label: "Profile Setup", href: "/dashboard/profile", icon: UserCircle },
];

function NavItem({
  item,
  pathname,
  onClick,
}: {
  item: (typeof navItems)[0];
  pathname: string;
  onClick?: () => void;
}) {
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group relative flex items-center gap-3 rounded-lg mx-2 px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-violet-500/10 text-violet-300"
          : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
      }`}
    >
      {isActive && (
        <motion.span
          layoutId="activeNavBar"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-violet-500 rounded-r-full"
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
      <Icon
        className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
          isActive ? "text-violet-400" : ""
        }`}
      />
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  );
}

function SidebarContent({
  pathname,
  isPro,
  name,
  email,
  image,
  onClose,
}: {
  pathname: string;
  isPro: boolean;
  name: string;
  email: string;
  image?: string | null;
  onClose?: () => void;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[60px] shrink-0 border-b border-zinc-800/80">
        <HawkLogo size={26} />
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-white tracking-tight text-sm truncate">
            RefinedHawk
          </span>
          {isPro && (
            <span className="shrink-0 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[9px] font-bold px-1.5 py-0.5 tracking-wide uppercase">
              Pro
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            pathname={pathname}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Upgrade banner */}
      {!isPro && (
        <div className="px-3 pb-3">
          <Link
            href="/dashboard/upgrade"
            onClick={onClose}
            className="group flex items-center gap-3 rounded-xl bg-gradient-to-br from-violet-600/[0.12] to-purple-600/[0.06] border border-violet-500/20 hover:border-violet-500/35 px-4 py-3 transition-all duration-200"
          >
            <div className="w-7 h-7 shrink-0 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-violet-300 leading-none">
                Upgrade to Pro
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">
                Unlock all features
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-violet-600 shrink-0 group-hover:translate-x-0.5 transition-transform duration-150" />
          </Link>
        </div>
      )}

      {/* User */}
      <div className="border-t border-zinc-800/80 px-3 py-3 shrink-0">
        <div className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-white/[0.03] transition-colors cursor-default">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700/80 shrink-0"
            />
          ) : (
            <div className="w-7 h-7 shrink-0 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400 ring-1 ring-violet-500/30">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-300 truncate leading-none">
              {name || email}
            </p>
            {name && (
              <p className="text-[10px] text-zinc-600 truncate mt-0.5">{email}</p>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 text-zinc-600 hover:text-zinc-300"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPro = session?.user?.plan === "pro";
  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";
  const image = session?.user?.image;

  const sharedProps = { pathname, isPro, name, email, image };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3.5 left-4 z-40 md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-[#111111] border border-zinc-800 text-zinc-400 hover:text-white transition-colors shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 w-60 bg-[#111111] border-r border-zinc-800 md:hidden shadow-2xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors z-10"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent
                {...sharedProps}
                onClose={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col h-screen sticky top-0 bg-[#111111] border-r border-zinc-800">
        <SidebarContent {...sharedProps} />
      </aside>
    </>
  );
}
