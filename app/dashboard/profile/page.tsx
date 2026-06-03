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

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      skills: true,
      niche: true,
      experience: true,
      upworkUrl: true,
      sampleProposals: true,
    },
  });

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <ProfileForm initialData={profile} />
        </div>
      </main>
    </div>
  );
}
