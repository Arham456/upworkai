import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "../components/sidebar";
import { ProfileForm } from "./components/profile-form";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const [profile, user] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: {
        skills: true,
        niche: true,
        experience: true,
        upworkUrl: true,
        sampleProposals: true,
        voiceDNA: true,
        updatedAt: true,
      },
    }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } }),
  ]);

  const isPro = user?.plan === "pro";

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <ProfileForm
            initialData={profile ? { ...profile, updatedAt: profile.updatedAt.toISOString() } : null}
            isPro={isPro}
            voiceDNA={profile?.voiceDNA ?? null}
          />
        </div>
      </main>
    </div>
  );
}
