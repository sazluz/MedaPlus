import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/db";
import { matchRequests } from "@/db/schema";
import { desc } from "drizzle-orm";
import RequestPageClient from "@/components/requests/RequestPageClient";
import { MessageSquare, RefreshCw } from "lucide-react";

async function RequestsContent() {
  await connection();
  const list = await db
    .select()
    .from(matchRequests)
    .orderBy(desc(matchRequests.votes), desc(matchRequests.createdAt));

  return <RequestPageClient initialRequests={list as any} />;
}

function RequestsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-12 animate-pulse">
      <div className="lg:col-span-5 h-96 rounded-2xl bg-[#0E1017] border border-neutral-800" />
      <div className="lg:col-span-7 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-[#0E1017] border border-neutral-800" />
        ))}
      </div>
    </div>
  );
}

export default function RequestMatchPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 text-white min-h-screen">
      <div className="flex items-center gap-3 border-b border-neutral-900 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E50914]/20 border border-[#E50914]/30 text-[#E50914]">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white">
            Fan Match Requests
          </h1>
          <p className="text-xs text-neutral-400">
            Vote for your favorite matches or submit a fixture to be broadcast live.
          </p>
        </div>
      </div>

      <Suspense fallback={<RequestsSkeleton />}>
        <RequestsContent />
      </Suspense>
    </div>
  );
}