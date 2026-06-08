import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "../components/sidebar";
import { WinTrackerDashboard } from "./components/win-tracker-dashboard";

export default async function WinTrackerPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const raw = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, createdAt: true, content: true },
  });

  const proposals = raw.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  const totalProposals = proposals.length;
  const wonProposals = proposals.filter((p) => p.status === "won").length;
  const lostProposals = proposals.filter((p) => p.status === "lost").length;
  const pendingProposals = proposals.filter((p) => p.status === "pending").length;
  const winRate =
    wonProposals + lostProposals > 0
      ? Math.round((wonProposals / (wonProposals + lostProposals)) * 100)
      : 0;

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <WinTrackerDashboard
            proposals={proposals}
            stats={{ totalProposals, wonProposals, lostProposals, pendingProposals, winRate }}
          />
        </div>
      </main>
    </div>
  );
}
