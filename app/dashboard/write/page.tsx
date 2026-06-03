import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "../components/sidebar";
import { ProposalWriter } from "./components/proposal-writer";

interface Props {
  searchParams: Promise<{ jobId?: string }>;
}

export default async function WritePage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const { jobId } = await searchParams;

  let job = null;
  if (jobId) {
    job = await prisma.job.findFirst({
      where: { id: jobId, userId: session.user.id },
      select: {
        id: true,
        description: true,
        jobSummary: true,
        clientConcern: true,
        recommendedApproach: true,
        competitionLevel: true,
        matchScore: true,
        redFlags: true,
      },
    });
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <ProposalWriter job={job} />
        </div>
      </main>
    </div>
  );
}
