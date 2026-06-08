import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "../components/sidebar";
import { RedFlagDetector } from "./components/red-flag-detector";

export default async function RedFlagsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <RedFlagDetector />
        </div>
      </main>
    </div>
  );
}
