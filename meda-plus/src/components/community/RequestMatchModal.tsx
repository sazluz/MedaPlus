"use client";

import { useState } from "react";
import { submitMatchRequest, upvoteRequest } from "@/app/actions/matchActions";
import { 
  MessageSquarePlus, 
  X, 
  Send, 
  Flame, 
  Check, 
  ThumbsUp, 
  TrendingUp 
} from "lucide-react";

export interface RequestItem {
  id: string;
  matchTitle: string;
  tournament: string | null;
  votes: number | null;
  status: string | null;
}

const SAMPLE_REQUESTS: RequestItem[] = [
  {
    id: "req-1",
    matchTitle: "UFC 335: Makhachev vs Arman 2",
    tournament: "UFC PPV",
    votes: 42,
    status: "pending",
  },
  {
    id: "req-2",
    matchTitle: "Al Nassr vs Al Hilal",
    tournament: "Saudi Pro League",
    votes: 28,
    status: "pending",
  },
  {
    id: "req-3",
    matchTitle: "Fury vs Joshua",
    tournament: "Heavyweight Championship",
    votes: 19,
    status: "pending",
  },
];

export default function RequestMatchModal({
  initialRequests = SAMPLE_REQUESTS,
}: {
  initialRequests?: RequestItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("matchTitle") as string;
    const tournament = formData.get("tournament") as string;

    try {
      await submitMatchRequest(formData);

      // Add to local preview instantly
      const newReq: RequestItem = {
        id: `local-${Date.now()}`,
        matchTitle: title,
        tournament: tournament || "General",
        votes: 1,
        status: "pending",
      };
      setRequests((prev) => [newReq, ...prev]);
      setSuccess(true);
      form.reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // In case server action fails or runs offline
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id: string) => {
    if (votedIds.has(id)) return;
    setVotedIds((prev) => new Set(prev).add(id));

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, votes: (r.votes || 0) + 1 } : r
      ).sort((a, b) => (b.votes || 0) - (a.votes || 0))
    );

    try {
      await upvoteRequest(id);
    } catch {
      // fallback
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Positioned cleanly above mobile bottom nav) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex items-center gap-2 rounded-full border border-neutral-800 bg-[#0A0C12]/95 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-2xl backdrop-blur-md transition-all hover:border-[#E50914] hover:bg-[#12141D] hover:shadow-[0_0_20px_rgba(229,9,20,0.3)]"
      >
        <MessageSquarePlus className="h-4 w-4 text-[#E50914]" />
        <span>Request Match</span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-800/80 bg-[#0A0C12] p-6 shadow-2xl">
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-neutral-400 hover:bg-neutral-900 hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E50914]">
              <Flame className="h-4 w-4" />
              <span>Community Queue</span>
            </div>
            <h3 className="mt-1 text-xl font-black uppercase tracking-tight text-white">
              Request an Event or Match
            </h3>
            <p className="mt-1 text-xs text-neutral-400">
              Can't find your game? Submit it below. The admin reviews and sources high-voted matches first.
            </p>

            {/* Feedback alert */}
            {success && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400">
                <Check className="h-4 w-4 shrink-0" />
                <span>Your request has been added to the queue!</span>
              </div>
            )}

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Event / Match Title
                </label>
                <input
                  name="matchTitle"
                  required
                  placeholder="e.g. Al Hilal vs Al Nassr or UFC 335"
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-[#10121A] px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  League / Tournament (Optional)
                </label>
                <input
                  name="tournament"
                  placeholder="e.g. Saudi Pro League, Boxing, CAF"
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-[#10121A] px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E50914] py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {loading ? "Submitting..." : "Submit to Community Queue"}
              </button>
            </form>

            {/* Live Trending Requests Queue */}
            {requests.length > 0 && (
              <div className="mt-6 border-t border-neutral-900 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-neutral-400">
                    <TrendingUp className="h-3.5 w-3.5 text-[#E50914]" />
                    <span>Top Fan Requests</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">Upvote games you want</span>
                </div>

                <div className="max-h-40 space-y-2 overflow-y-auto pr-1 no-scrollbar">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between rounded-xl border border-neutral-800/60 bg-[#10121A] px-3.5 py-2 text-xs"
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-white truncate">{req.matchTitle}</div>
                        <div className="text-[10px] text-neutral-500">{req.tournament}</div>
                      </div>

                      <button
                        onClick={() => handleVote(req.id)}
                        disabled={votedIds.has(req.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition shrink-0 ${
                          votedIds.has(req.id)
                            ? "bg-neutral-800 text-neutral-500"
                            : "bg-[#E50914]/10 text-[#E50914] hover:bg-[#E50914]/20 border border-[#E50914]/20"
                        }`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>{req.votes}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}