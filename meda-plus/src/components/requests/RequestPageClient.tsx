"use client";

import { useState } from "react";
import { 
  MessageSquarePlus, 
  ThumbsUp, 
  CheckCircle2, 
  Clock, 
  Send, 
  Flame, 
  Sparkles,
  Trophy
} from "lucide-react";

interface RequestItem {
  id: string;
  matchTitle: string;
  tournament: string;
  requestedBy: string;
  votes: number;
  status: "pending" | "scheduled" | "rejected";
  createdAt: string;
}

export default function RequestPageClient({ initialRequests }: { initialRequests: RequestItem[] }) {
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);
  const [matchTitle, setMatchTitle] = useState("");
  const [tournament, setTournament] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "scheduled">("all");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchTitle.trim() || !tournament.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchTitle: matchTitle.trim(),
          tournament: tournament.trim(),
          requestedBy: requestedBy.trim() || "Anonymous Fan",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRequests((prev) => [data.request, ...prev]);
        setVotedIds((prev) => [...prev, data.request.id]);
        setMatchTitle("");
        setTournament("");
        setRequestedBy("");
      } else {
        alert("Failed to submit request.");
      }
    } catch {
      alert("Network error submitting match request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (id: string) => {
    if (votedIds.includes(id)) return;

    // Optimistic UI update
    setVotedIds((prev) => [...prev, id]);
    setRequests((prev) =>
      prev
        .map((r) => (r.id === id ? { ...r, votes: r.votes + 1 } : r))
        .sort((a, b) => b.votes - a.votes)
    );

    await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const filteredRequests = requests.filter((r) => {
    if (activeFilter === "pending") return r.status === "pending";
    if (activeFilter === "scheduled") return r.status === "scheduled";
    return true;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Form: Submit Request (5 Cols) */}
      <div className="lg:col-span-5 h-fit rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-neutral-800/60 pb-3">
          <MessageSquarePlus className="h-5 w-5 text-[#E50914]" />
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Suggest a Fixture
            </h2>
            <p className="text-[11px] text-neutral-400">
              Admin team reviews the highest voted matches daily.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Match / Event Title *
            </label>
            <input
              value={matchTitle}
              onChange={(e) => setMatchTitle(e.target.value)}
              required
              placeholder="e.g. Ethiopia Bunna vs Saint George or Milan derby"
              className="w-full mt-1.5 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              League or Tournament *
            </label>
            <input
              value={tournament}
              onChange={(e) => setTournament(e.target.value)}
              required
              placeholder="e.g. Premier League, Serie A, CAF CL"
              className="w-full mt-1.5 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Your Fan Tag (Optional)
            </label>
            <input
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              placeholder="e.g. GunnerHabesha"
              className="w-full mt-1.5 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E50914] py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700 transition disabled:opacity-50 shadow-[0_0_20px_rgba(229,9,20,0.3)]"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Submitting..." : "Submit Fixture Request"}</span>
          </button>
        </form>

        <div className="rounded-xl border border-neutral-800/60 bg-[#07080B] p-3 text-[11px] text-neutral-400 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-[#E50914] shrink-0 mt-0.5" />
          <span>
            Matches with <strong>10+ community upvotes</strong> automatically get pinned to the admin switchboard with priority streaming servers.
          </span>
        </div>
      </div>

      {/* Right List: Voted Community Feed (7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Filter Pills */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                activeFilter === "all"
                  ? "bg-[#E50914] text-white"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                activeFilter === "pending"
                  ? "bg-[#E50914] text-white"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              Voting Now
            </button>
            <button
              onClick={() => setActiveFilter("scheduled")}
              className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                activeFilter === "scheduled"
                  ? "bg-[#00E676] text-black"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              Approved & Live
            </button>
          </div>

          <span className="text-xs font-mono text-neutral-500">
            {filteredRequests.length} Entries
          </span>
        </div>

        {/* Requests Feed */}
        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center text-xs text-neutral-500">
            No fixture requests found. Be the first to suggest one on the left!
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req, index) => {
              const hasVoted = votedIds.includes(req.id);
              const isTopVoted = index === 0 && req.votes > 1;

              return (
                <div
                  key={req.id}
                  className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                    req.status === "scheduled"
                      ? "border-emerald-500/40 bg-[#0B150F]"
                      : isTopVoted
                      ? "border-[#E50914]/40 bg-[#160E10]"
                      : "border-neutral-800/80 bg-[#0E1017] hover:border-neutral-700"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {req.tournament}
                      </span>

                      {req.status === "scheduled" ? (
                        <span className="flex items-center gap-1 rounded bg-[#00E676]/20 px-2 py-0.5 text-[9px] font-black uppercase text-[#00E676]">
                          <CheckCircle2 className="h-3 w-3" /> Scheduled
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded bg-neutral-900 px-2 py-0.5 text-[9px] font-bold text-neutral-400">
                          <Clock className="h-3 w-3" /> Under Review
                        </span>
                      )}

                      {isTopVoted && (
                        <span className="flex items-center gap-1 rounded bg-[#E50914]/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-[#E50914]">
                          <Flame className="h-3 w-3" /> Trending
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-sm sm:text-base text-white">
                      {req.matchTitle}
                    </h3>

                    <p className="text-[11px] text-neutral-500">
                      Suggested by <span className="text-neutral-400">{req.requestedBy}</span>
                    </p>
                  </div>

                  {/* Upvote Button */}
                  <button
                    onClick={() => handleVote(req.id)}
                    disabled={hasVoted || req.status === "scheduled"}
                    className={`flex flex-col items-center justify-center min-w-[54px] rounded-xl border p-2.5 transition ${
                      hasVoted
                        ? "border-[#E50914] bg-[#E50914]/20 text-[#E50914]"
                        : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white"
                    } ${req.status === "scheduled" ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${hasVoted ? "fill-current" : ""}`} />
                    <span className="text-xs font-black mt-1">{req.votes}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}