import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "../components/sidebar";
import { AuditDashboard } from "./components/audit-dashboard";

export default async function AuditPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const userId = session.user.id;

  const audits = await prisma.audit.findMany({
    where: { userId },
    orderBy: { id: "desc" },
    take: 20,
    select: {
      id: true,
      jobUrl: true,
      hireabilityScore: true,
      auditFeedback: true,
    },
  });

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <AuditDashboard userId={userId} initialAudits={audits} />
        </div>
      </main>
    </div>
  );
}
