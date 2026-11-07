"use client";

import { useState, useEffect } from "react";
import {
  addEvent,
  updateEventStream,
  deleteEvent,
  addChannel,
  deleteChannel,
  updateRequestStatus,
} from "./actions";
import {
  Radio,
  Tv,
  MessageSquare,
  Plus,
  Trash2,
  Save,
  LogOut,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  Check,
  X,
} from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState<"events" | "channels" | "requests">("events");
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [channelsList, setChannelsList] = useState<any[]>([]);
  const [requestsList, setRequestsList] = useState<any[]>([]);

  // Hot Swap Editor State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editBackup, setEditBackup] = useState("");
  const [editIsLive, setEditIsLive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check auth and fetch initial state cleanly via API (No Server Action in useEffect)
  const fetchSessionAndData = async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setEventsList(data.events || []);
        setChannelsList(data.channels || []);
        setRequestsList(data.requests || []);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    fetchSessionAndData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: passphrase.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setPassphrase("");
        await fetchSessionAndData();
      } else {
        setAuthError(data.error || "Authentication failed.");
      }
    } catch {
      setAuthError("Failed to connect to authentication server.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
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
    setEventsList((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, streamUrl: editUrl, backupStreamUrl: editBackup, isLive: editIsLive } : e
      )
    );
    setIsSaving(false);
    setEditingId(null);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await deleteEvent(id);
    setEventsList((prev) => prev.filter((e) => e.id !== id));
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm("Delete this channel?")) return;
    await deleteChannel(id);
    setChannelsList((prev) => prev.filter((c) => c.id !== id));
  };

  const handleRequestStatus = async (id: string, status: "scheduled" | "rejected") => {
    await updateRequestStatus(id, status);
    setRequestsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  // Loading spinner while checking initial cookie
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07080B] text-neutral-500">
        <RefreshCw className="h-6 w-6 animate-spin text-[#E50914]" />
      </div>
    );
  }

  // Login view if unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07080B] p-4 text-white">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-8 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E50914] text-white font-black text-lg shadow-[0_0_15px_rgba(229,9,20,0.4)]">
              M+
            </div>
            <div>
              <h1 className="text-base font-black uppercase tracking-wider text-white">
                Meda Command Deck
              </h1>
              <p className="text-[11px] text-neutral-400">Restricted Broadcast Access</p>
            </div>
          </div>

          {authError && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-center text-xs font-semibold text-red-400">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Master Passphrase
              </label>
              <div className="relative mt-1">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter ADMIN_SECRET_KEY"
                  className="w-full rounded-xl border border-neutral-800 bg-[#07080B] py-2.5 pl-3.5 pr-10 text-xs font-mono text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E50914] py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {isLoggingIn ? "Verifying..." : "Access Control"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main Dashboard view
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 text-white bg-[#07080B] min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E50914] font-black text-white">
            M+
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              Broadcast Switchboard
            </h1>
            <p className="text-xs text-neutral-400">Live stream hot-swapping and channel routing</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-[#0E1017] px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:border-red-600 hover:text-white transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Deck</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-black uppercase tracking-wider">
            <span>Matches & Events</span>
            <Radio className="h-4 w-4 text-[#E50914]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
            {eventsList.length}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-black uppercase tracking-wider">
            <span>24/7 Channels</span>
            <Tv className="h-4 w-4 text-[#00E676]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
            {channelsList.length}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-black uppercase tracking-wider">
            <span>Pending Requests</span>
            <MessageSquare className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
            {requestsList.filter((r) => r.status === "pending").length}
          </div>
        </div>
      </div>

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

      {activeTab === "events" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-5 h-fit">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
              <Plus className="h-4 w-4 text-[#E50914]" />
              <span>Publish Broadcast</span>
            </div>

            <form
              action={async (formData) => {
                await addEvent(formData);
                await fetchSessionAndData();
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

          <div className="lg:col-span-8 space-y-3">
            {eventsList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center text-xs text-neutral-500">
                No events currently in schedule.
              </div>
            ) : (
              eventsList.map((evt) => (
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
                        onClick={() => handleDeleteEvent(evt.id)}
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
              ))
            )}
          </div>
        </div>
      )}

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
                await fetchSessionAndData();
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
            {channelsList.map((ch) => (
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
                    onClick={() => handleDeleteChannel(ch.id)}
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

      {activeTab === "requests" && (
        <div className="rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-5">
          <div className="flex items-center justify-between mb-4 border-b border-neutral-800/60 pb-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Fan Requested Broadcasts
              </h3>
              <p className="text-xs text-neutral-400">Sorted by community upvotes.</p>
            </div>
            <span className="text-xs font-mono text-[#E50914]">
              {requestsList.length} Requests
            </span>
          </div>

          <div className="space-y-3">
            {requestsList.map((req) => (
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
                    onClick={() => handleRequestStatus(req.id, "scheduled")}
                    className="flex items-center gap-1.5 rounded-lg bg-[#E50914]/20 border border-[#E50914]/30 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#E50914] hover:bg-[#E50914]/30 transition"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleRequestStatus(req.id, "rejected")}
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