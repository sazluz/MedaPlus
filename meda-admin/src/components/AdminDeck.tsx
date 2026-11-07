"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addEvent,
  updateEventStream,
  deleteEvent,
  addChannel,
  deleteChannel,
  updateRequestStatus,
} from "@/app/actions";
import {
  Radio,
  Tv,
  MessageSquare,
  Plus,
  Trash2,
  Save,
  LogOut,
  ExternalLink,
  Check,
  X,
} from "lucide-react";

interface AdminDeckProps {
  events: any[];
  channels: any[];
  requests: any[];
  mainSiteUrl: string;
}

export default function AdminDeck({
  events,
  channels,
  requests,
  mainSiteUrl,
}: AdminDeckProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"events" | "channels" | "requests">("events");

  // Hot swap state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editBackup, setEditBackup] = useState("");
  const [editIsLive, setEditIsLive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const startHotSwap = (evt: any) => {
    setEditingId(evt.id);
    setEditUrl(evt.streamUrl);
    setEditBackup(evt.backupStreamUrl || "");
    setEditIsLive(Boolean(evt.isLive));
  };

  const saveHotSwap = async (id: string) => {
    setIsSaving(true);
    await updateEventStream(id, editUrl, editBackup, editIsLive);
    setIsSaving(false);
    setEditingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E50914] font-black text-white">
            M+
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              Meda Command Center
            </h1>
            <p className="text-xs text-neutral-400">
              Isolated Remote Node • Controlling{" "}
              <a
                href={mainSiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#E50914] hover:underline inline-flex items-center gap-1"
              >
                {mainSiteUrl} <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-[#0E1017] px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:border-red-600 hover:text-white transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Session</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-black uppercase tracking-wider">
            <span>Matches & Events</span>
            <Radio className="h-4 w-4 text-[#E50914]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
            {events.length}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-black uppercase tracking-wider">
            <span>24/7 TV Channels</span>
            <Tv className="h-4 w-4 text-[#00E676]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
            {channels.length}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-black uppercase tracking-wider">
            <span>Fan Requests Queue</span>
            <MessageSquare className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
            {requests.filter((r) => r.status === "pending").length}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-900">
        <button
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            activeTab === "events"
              ? "border-[#E50914] text-[#E50914]"
              : "border-transparent text-neutral-500 hover:text-white"
          }`}
        >
          <Radio className="h-4 w-4" /> Live Broadcasts
        </button>

        <button
          onClick={() => setActiveTab("channels")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            activeTab === "channels"
              ? "border-[#E50914] text-[#E50914]"
              : "border-transparent text-neutral-500 hover:text-white"
          }`}
        >
          <Tv className="h-4 w-4" /> 24/7 Channels
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            activeTab === "requests"
              ? "border-[#E50914] text-[#E50914]"
              : "border-transparent text-neutral-500 hover:text-white"
          }`}
        >
          <MessageSquare className="h-4 w-4" /> Community Requests
        </button>
      </div>

      {/* Tab 1: Live Broadcasts */}
      {activeTab === "events" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Add Form */}
          <div className="lg:col-span-4 rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-5 h-fit">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
              <Plus className="h-4 w-4 text-[#E50914]" />
              <span>Publish Match or Event</span>
            </div>

            <form
              action={async (formData) => {
                await addEvent(formData);
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Event Title
                </label>
                <input
                  name="title"
                  required
                  placeholder="Arsenal vs Chelsea or UFC 335"
                  className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Tournament / League
                </label>
                <input
                  name="tournament"
                  required
                  placeholder="Premier League, UFC, F1"
                  className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Primary Stream URL (.m3u8)
                </label>
                <input
                  name="streamUrl"
                  required
                  placeholder="https://.../live.m3u8"
                  className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Backup Stream URL
                </label>
                <input
                  name="backupStreamUrl"
                  placeholder="https://.../backup.m3u8"
                  className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Time / Kickoff
                </label>
                <input
                  name="startTime"
                  placeholder="LIVE, 21:00, or Tomorrow"
                  className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  name="isLive"
                  id="isLive"
                  className="accent-[#E50914] h-4 w-4"
                />
                <label htmlFor="isLive" className="text-xs font-bold text-neutral-300">
                  Mark as LIVE immediately
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-3 rounded-xl bg-[#E50914] py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700 transition"
              >
                Publish Broadcast
              </button>
            </form>
          </div>

          {/* List with Hot Swap */}
          <div className="lg:col-span-8 space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-4 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{evt.title}</span>
                      <span className="text-[10px] font-bold text-neutral-400">
                        • {evt.tournament}
                      </span>
                      {evt.isLive ? (
                        <span className="flex items-center gap-1 rounded bg-[#E50914]/20 px-2 py-0.5 text-[10px] font-black text-[#E50914]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#E50914] animate-ping" />
                          LIVE
                        </span>
                      ) : (
                        <span className="rounded bg-neutral-900 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
                          {evt.startTime}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500 mt-1 truncate max-w-sm">
                      {evt.streamUrl}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        editingId === evt.id ? setEditingId(null) : startHotSwap(evt)
                      }
                      className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-200 hover:text-[#E50914] transition"
                    >
                      {editingId === evt.id ? "Cancel" : "Hot-Swap URL"}
                    </button>
                    <button
                      onClick={() => deleteEvent(evt.id)}
                      className="rounded-lg border border-red-900/40 p-2 text-red-400 hover:bg-red-950/30 transition"
                      title="Delete Match"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {editingId === evt.id && (
                  <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Primary Stream URL
                      </label>
                      <input
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="w-full mt-1 rounded-xl border border-neutral-700 bg-[#07080B] px-3 py-2 text-xs font-mono text-white focus:border-[#E50914] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Backup Stream URL
                      </label>
                      <input
                        value={editBackup}
                        onChange={(e) => setEditBackup(e.target.value)}
                        className="w-full mt-1 rounded-xl border border-neutral-700 bg-[#07080B] px-3 py-2 text-xs font-mono text-white focus:border-[#E50914] focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                        <input
                          type="checkbox"
                          checked={editIsLive}
                          onChange={(e) => setEditIsLive(e.target.checked)}
                          className="accent-[#E50914] h-4 w-4"
                        />
                        Currently Live Now
                      </label>

                      <button
                        onClick={() => saveHotSwap(evt.id)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 rounded-xl bg-[#E50914] px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700 transition"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>{isSaving ? "Updating..." : "Save Stream"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: 24/7 Channels */}
      {activeTab === "channels" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-5 h-fit">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
              <Plus className="h-4 w-4 text-[#E50914]" />
              <span>Add 24/7 Channel</span>
            </div>

            <form
              action={async (formData) => {
                await addChannel(formData);
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Channel Name
                </label>
                <input
                  name="name"
                  required
                  placeholder="SuperSport Football"
                  className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3 py-2 text-xs text-white focus:border-[#E50914] focus:outline-none"
                >
                  <option value="Sports">Sports</option>
                  <option value="News">News</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Stream URL (.m3u8)
                </label>
                <input
                  name="streamUrl"
                  required
                  placeholder="https://.../stream.m3u8"
                  className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Logo URL
                </label>
                <input
                  name="logoUrl"
                  placeholder="https://.../logo.png"
                  className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-3 rounded-xl bg-[#E50914] py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700 transition"
              >
                Add 24/7 Channel
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={ch.logoUrl}
                      alt={ch.name}
                      className="h-10 w-10 rounded-xl object-contain bg-neutral-900 border border-neutral-800 p-1"
                    />
                    <div className="truncate">
                      <div className="font-black text-sm text-white truncate">{ch.name}</div>
                      <span className="text-[10px] text-neutral-400 uppercase font-bold">
                        {ch.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteChannel(ch.id)}
                    className="p-2 rounded-lg text-neutral-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span className="truncate pr-2">{ch.streamUrl}</span>
                  <span className="text-[#00E676] font-bold">ONLINE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Community Requests */}
      {activeTab === "requests" && (
        <div className="rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-5">
          <div className="flex items-center justify-between mb-4 border-b border-neutral-800/60 pb-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Fan Requested Broadcasts
              </h3>
              <p className="text-xs text-neutral-400">
                Sorted by community upvotes from the public site.
              </p>
            </div>
            <span className="text-xs font-mono text-[#E50914]">
              {requests.length} Requests
            </span>
          </div>

          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-800/60 bg-[#07080B] p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{req.matchTitle}</span>
                    <span className="text-[10px] text-neutral-400">• {req.tournament}</span>
                    <span className="rounded bg-[#E50914]/15 border border-[#E50914]/20 px-2 py-0.5 text-[10px] font-black text-[#E50914]">
                      {req.votes} Votes
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Status: <span className="uppercase font-bold text-neutral-300">{req.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateRequestStatus(req.id, "scheduled")}
                    className="flex items-center gap-1.5 rounded-lg bg-[#E50914]/20 border border-[#E50914]/30 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#E50914] hover:bg-[#E50914]/30 transition"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => updateRequestStatus(req.id, "rejected")}
                    className="flex items-center gap-1.5 rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs font-bold text-neutral-400 hover:text-white transition"
                  >
                    <X className="h-3.5 w-3.5" /> Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}