import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "../components/sidebar";
import { ProposalList } from "./components/proposal-list";

export default async function ProposalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const proposals = await prisma.proposal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      status: true,
      createdAt: true,
      jobId: true,
      job: {
        select: {
          jobSummary: true,
          description: true,
        },
      },
    },
  });

  // Serialize dates before passing to Client Component
  const serialized = proposals.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <ProposalList initialProposals={serialized} />
        </div>
      </main>
    </div>
  );
}
