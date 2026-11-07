"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Server, 
  Radio, 
  Tv,
  LogOut, 
  ArrowRight, 
  Save, 
  RefreshCw,
  Edit3,
  X
} from "lucide-react";

interface StreamServer {
  name: string;
  url: string;
  quality: string;
}

const DEFAULT_SERVERS: StreamServer[] = [
  { name: "Server 1 (Primary)", url: "", quality: "1080P 50FPS" },
  { name: "Server 2 (Backup)", url: "", quality: "720P HD" },
];

export default function AdminDashboard() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"events" | "channels">("events");

  // Data Lists
  const [events, setEvents] = useState<any[]>([]);
  const [channelsList, setChannelsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- Match Form State ---
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [id, setId] = useState("");
  const [type, setType] = useState("team_match");
  const [title, setTitle] = useState("");
  const [tournament, setTournament] = useState("");
  const [backdropUrl, setBackdropUrl] = useState("https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeLogo, setHomeLogo] = useState("");
  const [awayLogo, setAwayLogo] = useState("");
  const [timeOrStatus, setTimeOrStatus] = useState("20:00");
  const [qualityBadge, setQualityBadge] = useState("1080P");
  const [isLive, setIsLive] = useState(false);
  const [eventServers, setEventServers] = useState<StreamServer[]>(DEFAULT_SERVERS);

  // --- Channel Form State ---
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [channelId, setChannelId] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelCategory, setChannelCategory] = useState("Sports");
  const [channelLogoUrl, setChannelLogoUrl] = useState("");
  const [channelStatus, setChannelStatus] = useState("online");
  const [channelServers, setChannelServers] = useState<StreamServer[]>(DEFAULT_SERVERS);

  // Auth & Initial Fetch
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => res.json())
      .then((data) => {
        setAuthed(data.authenticated);
        if (data.authenticated) {
          loadEvents();
          loadChannels();
        }
      });
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events || []);
    }
    setLoading(false);
  };

  const loadChannels = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/channels");
    if (res.ok) {
      const data = await res.json();
      setChannelsList(data.channels || []);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase: passphrase.trim() }),
    });
    if (res.ok) {
      setAuthed(true);
      loadEvents();
      loadChannels();
    } else {
      setAuthError("Invalid master passphrase.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
  };

  // --- Event Handlers ---
  const handleStartEditEvent = (evt: any) => {
    setEditingEventId(evt.id);
    setId(evt.id);
    setType(evt.type || "team_match");
    setTitle(evt.title || "");
    setTournament(evt.tournament || "");
    setBackdropUrl(evt.backdropUrl || "");
    setHomeTeam(evt.homeTeam || "");
    setAwayTeam(evt.awayTeam || "");
    setHomeLogo(evt.homeLogo || "");
    setAwayLogo(evt.awayLogo || "");
    setTimeOrStatus(evt.timeOrStatus || "20:00");
    setQualityBadge(evt.qualityBadge || "1080P");
    setIsLive(Boolean(evt.isLive));
    setEventServers(evt.servers?.length > 0 ? evt.servers : DEFAULT_SERVERS);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEditEvent = () => {
    setEditingEventId(null);
    setId("");
    setTitle("");
    setHomeTeam("");
    setAwayTeam("");
    setHomeLogo("");
    setAwayLogo("");
    setEventServers(DEFAULT_SERVERS);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eventServers.length === 0 || eventServers.some((s) => !s.url.trim())) {
      alert("Provide at least 1 server with a valid .m3u8 URL.");
      return;
    }

    setIsSaving(true);
    const payload = {
      id: id.trim(),
      type,
      title: title.trim(),
      tournament: tournament.trim(),
      backdropUrl: backdropUrl.trim(),
      homeTeam: type === "team_match" ? homeTeam.trim() : null,
      awayTeam: type === "team_match" ? awayTeam.trim() : null,
      homeLogo: type === "team_match" ? homeLogo.trim() : null,
      awayLogo: type === "team_match" ? awayLogo.trim() : null,
      timeOrStatus: timeOrStatus.trim(),
      isLive,
      qualityBadge: qualityBadge.trim(),
      servers: eventServers,
    };

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await loadEvents();
      handleCancelEditEvent();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to save match.");
    }
    setIsSaving(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm(`Delete ${eventId}?`)) return;
    await fetch(`/api/admin/events?id=${eventId}`, { method: "DELETE" });
    if (editingEventId === eventId) handleCancelEditEvent();
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // --- Channel Handlers ---
  const handleStartEditChannel = (ch: any) => {
    setEditingChannelId(ch.id);
    setChannelId(ch.id);
    setChannelName(ch.name || "");
    setChannelCategory(ch.category || "Sports");
    setChannelLogoUrl(ch.logoUrl || "");
    setChannelStatus(ch.status || "online");
    setChannelServers(ch.servers?.length > 0 ? ch.servers : DEFAULT_SERVERS);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEditChannel = () => {
    setEditingChannelId(null);
    setChannelId("");
    setChannelName("");
    setChannelLogoUrl("");
    setChannelCategory("Sports");
    setChannelServers(DEFAULT_SERVERS);
  };

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (channelServers.length === 0 || channelServers.some((s) => !s.url.trim())) {
      alert("Provide at least 1 server stream for this channel.");
      return;
    }

    setIsSaving(true);
    const payload = {
      id: channelId.trim(),
      name: channelName.trim(),
      category: channelCategory.trim(),
      logoUrl: channelLogoUrl.trim(),
      status: channelStatus,
      servers: channelServers,
    };

    const res = await fetch("/api/admin/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await loadChannels();
      handleCancelEditChannel();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to save channel.");
    }
    setIsSaving(false);
  };

  const handleDeleteChannel = async (chId: string) => {
    if (!confirm(`Delete channel ${chId}?`)) return;
    await fetch(`/api/admin/channels?id=${chId}`, { method: "DELETE" });
    if (editingChannelId === chId) handleCancelEditChannel();
    setChannelsList((prev) => prev.filter((c) => c.id !== chId));
  };

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07080B] text-neutral-500">
        <RefreshCw className="h-6 w-6 animate-spin text-[#E50914]" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07080B] p-4 text-white">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-8 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E50914] text-white font-black">
              M+
            </div>
            <div>
              <h1 className="text-base font-black uppercase text-white">Meda Control Deck</h1>
              <p className="text-[11px] text-neutral-400">Broadcast Switchboard</p>
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
              <input
                type="password"
                required
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter ADMIN_SECRET_KEY"
                className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E50914] py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-red-700 transition"
            >
              <span>Access Control</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-8 text-white bg-[#07080B] min-h-screen">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E50914] font-black text-white">
            M+
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              Broadcast Switchboard
            </h1>
            <p className="text-xs text-neutral-400">
              Matches ({events.length}) • 24/7 Channels ({channelsList.length})
            </p>
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-900">
        <button
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            activeTab === "events"
              ? "border-[#E50914] text-[#E50914]"
              : "border-transparent text-neutral-500 hover:text-white"
          }`}
        >
          <Radio className="h-4 w-4" /> Live Broadcasts
        </button>

        <button
          onClick={() => setActiveTab("channels")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            activeTab === "channels"
              ? "border-[#E50914] text-[#E50914]"
              : "border-transparent text-neutral-500 hover:text-white"
          }`}
        >
          <Tv className="h-4 w-4" /> 24/7 TV Channels
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LIVE MATCHES                                      */}
      {/* ======================================================== */}
      {activeTab === "events" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Form */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-5 h-fit space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                {editingEventId ? (
                  <>
                    <Edit3 className="h-4 w-4 text-amber-400" />
                    <span className="text-amber-400">Editing: /{editingEventId}</span>
                  </>
                ) : (
                  <>
                    <Radio className="h-4 w-4 text-[#E50914]" />
                    <span>Publish Match Event</span>
                  </>
                )}
              </div>

              {editingEventId && (
                <button
                  type="button"
                  onClick={handleCancelEditEvent}
                  className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-white transition"
                >
                  <X className="h-3.5 w-3.5" /> Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Match ID (Slug) *
                  </label>
                  <input
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    disabled={Boolean(editingEventId)}
                    required
                    placeholder="e.g. match-2"
                    className={`w-full mt-1 rounded-xl border border-neutral-800 px-3.5 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none ${
                      editingEventId ? "bg-neutral-900/60 text-neutral-400 cursor-not-allowed" : "bg-[#07080B] focus:border-[#E50914]"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Event Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white focus:border-[#E50914] focus:outline-none"
                  >
                    <option value="team_match">Team Match (vs)</option>
                    <option value="single_event">Single Event (UFC/F1)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Title *
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Real Madrid vs Barcelona"
                    className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Tournament *
                  </label>
                  <input
                    value={tournament}
                    onChange={(e) => setTournament(e.target.value)}
                    required
                    placeholder="La Liga • El Clásico"
                    className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                  />
                </div>
              </div>

              {type === "team_match" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Home Team
                      </label>
                      <input
                        value={homeTeam}
                        onChange={(e) => setHomeTeam(e.target.value)}
                        placeholder="Real Madrid"
                        className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Away Team
                      </label>
                      <input
                        value={awayTeam}
                        onChange={(e) => setAwayTeam(e.target.value)}
                        placeholder="Barcelona"
                        className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Home Logo URL
                      </label>
                      <input
                        value={homeLogo}
                        onChange={(e) => setHomeLogo(e.target.value)}
                        placeholder="https://.../541.png"
                        className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Away Logo URL
                      </label>
                      <input
                        value={awayLogo}
                        onChange={(e) => setAwayLogo(e.target.value)}
                        placeholder="https://.../529.png"
                        className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Time / Status
                  </label>
                  <input
                    value={timeOrStatus}
                    onChange={(e) => setTimeOrStatus(e.target.value)}
                    placeholder="22:00 or LIVE"
                    className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Quality
                  </label>
                  <input
                    value={qualityBadge}
                    onChange={(e) => setQualityBadge(e.target.value)}
                    placeholder="1080P"
                    className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Backdrop URL
                  </label>
                  <input
                    value={backdropUrl}
                    onChange={(e) => setBackdropUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#E50914] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isLiveEvent"
                  checked={isLive}
                  onChange={(e) => setIsLive(e.target.checked)}
                  className="accent-[#E50914] h-4 w-4"
                />
                <label htmlFor="isLiveEvent" className="text-xs font-bold text-neutral-300">
                  Mark as LIVE Broadcast (Pulsing badge)
                </label>
              </div>

              {/* Server Repeater */}
              <div className="pt-3 border-t border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-white">
                    <Server className="h-4 w-4 text-[#E50914]" />
                    <span>Stream Mirrors ({eventServers.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEventServers((prev) => [
                        ...prev,
                        { name: `Server ${prev.length + 1}`, url: "", quality: "1080P" },
                      ])
                    }
                    className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider rounded-lg border border-[#E50914]/40 bg-[#E50914]/15 px-2.5 py-1 text-[#E50914] hover:bg-[#E50914]/25 transition"
                  >
                    <Plus className="h-3 w-3" /> Add Server
                  </button>
                </div>

                <div className="space-y-2">
                  {eventServers.map((srv, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-800 bg-[#07080B] p-2.5"
                    >
                      <input
                        value={srv.name}
                        onChange={(e) =>
                          setEventServers((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, name: e.target.value } : s))
                          )
                        }
                        placeholder="Server Name"
                        className="w-28 rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-[11px] font-bold text-white focus:outline-none"
                      />
                      <input
                        value={srv.url}
                        onChange={(e) =>
                          setEventServers((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, url: e.target.value } : s))
                          )
                        }
                        placeholder="https://.../live.m3u8"
                        className="flex-1 min-w-[200px] rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-[11px] font-mono text-white focus:outline-none"
                      />
                      <input
                        value={srv.quality}
                        onChange={(e) =>
                          setEventServers((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, quality: e.target.value } : s))
                          )
                        }
                        placeholder="1080P"
                        className="w-20 rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-[11px] font-bold text-white focus:outline-none"
                      />
                      {eventServers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEventServers((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className={`w-full mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider text-white transition ${
                  editingEventId ? "bg-amber-600 hover:bg-amber-500" : "bg-[#E50914] hover:bg-red-700"
                }`}
              >
                <Save className="h-4 w-4" />
                <span>
                  {isSaving ? "Saving..." : editingEventId ? `Update Match (/${editingEventId})` : "Publish Broadcast"}
                </span>
              </button>
            </form>
          </div>

          {/* Matches List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                Matches In Database ({events.length})
              </span>
              <button onClick={loadEvents} className="text-neutral-500 hover:text-white transition">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {events.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
                No matches found.
              </div>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  className={`rounded-2xl border p-4 space-y-2 transition-all ${
                    editingEventId === evt.id
                      ? "border-amber-500 bg-[#16140E] ring-1 ring-amber-500"
                      : "border-neutral-800/80 bg-[#0E1017]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#E50914]">/{evt.id}</span>
                        {evt.isLive && (
                          <span className="bg-[#E50914]/20 border border-[#E50914]/30 text-[#E50914] text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                            LIVE
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-neutral-400">{evt.timeOrStatus}</span>
                      </div>
                      <h3 className="font-black text-sm text-white mt-0.5">{evt.title}</h3>
                      <p className="text-[10px] text-neutral-400">{evt.tournament}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEditEvent(evt)}
                        className="p-1.5 rounded-lg border bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white transition"
                        title="Edit"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-900 flex flex-wrap gap-1.5">
                    {evt.servers?.map((s: StreamServer, idx: number) => (
                      <span
                        key={idx}
                        className="rounded bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[9px] font-mono text-neutral-400"
                      >
                        {s.name} ({s.quality})
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 24/7 CHANNELS                                     */}
      {/* ======================================================== */}
      {activeTab === "channels" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Channel Form */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-800/80 bg-[#0E1017] p-5 h-fit space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                {editingChannelId ? (
                  <>
                    <Edit3 className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Editing Channel: /{editingChannelId}</span>
                  </>
                ) : (
                  <>
                    <Tv className="h-4 w-4 text-[#00E676]" />
                    <span>Add 24/7 TV Channel</span>
                  </>
                )}
              </div>

              {editingChannelId && (
                <button
                  type="button"
                  onClick={handleCancelEditChannel}
                  className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-white transition"
                >
                  <X className="h-3.5 w-3.5" /> Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveChannel} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Channel ID (Slug) *
                  </label>
                  <input
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    disabled={Boolean(editingChannelId)}
                    required
                    placeholder="e.g. ss-premier-league"
                    className={`w-full mt-1 rounded-xl border border-neutral-800 px-3.5 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none ${
                      editingChannelId ? "bg-neutral-900/60 text-neutral-400 cursor-not-allowed" : "bg-[#07080B] focus:border-[#00E676]"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Category
                  </label>
                  <select
                    value={channelCategory}
                    onChange={(e) => setChannelCategory(e.target.value)}
                    className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white focus:border-[#00E676] focus:outline-none"
                  >
                    <option value="Sports">Sports</option>
                    <option value="Football">Football</option>
                    <option value="News">News</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Channel Name *
                </label>
                <input
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  required
                  placeholder="SuperSport Premier League"
                  className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#00E676] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Logo URL
                </label>
                <input
                  value={channelLogoUrl}
                  onChange={(e) => setChannelLogoUrl(e.target.value)}
                  placeholder="https://.../supersport.png"
                  className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:border-[#00E676] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  Status
                </label>
                <select
                  value={channelStatus}
                  onChange={(e) => setChannelStatus(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-neutral-800 bg-[#07080B] px-3.5 py-2 text-xs text-white focus:border-[#00E676] focus:outline-none"
                >
                  <option value="online">Online</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {/* Channel Server Repeater */}
              <div className="pt-3 border-t border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-white">
                    <Server className="h-4 w-4 text-[#00E676]" />
                    <span>Channel Streams ({channelServers.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setChannelServers((prev) => [
                        ...prev,
                        { name: `Server ${prev.length + 1}`, url: "", quality: "1080P" },
                      ])
                    }
                    className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider rounded-lg border border-[#00E676]/40 bg-[#00E676]/15 px-2.5 py-1 text-[#00E676] hover:bg-[#00E676]/25 transition"
                  >
                    <Plus className="h-3 w-3" /> Add Server
                  </button>
                </div>

                <div className="space-y-2">
                  {channelServers.map((srv, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-800 bg-[#07080B] p-2.5"
                    >
                      <input
                        value={srv.name}
                        onChange={(e) =>
                          setChannelServers((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, name: e.target.value } : s))
                          )
                        }
                        placeholder="Server Name"
                        className="w-28 rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-[11px] font-bold text-white focus:outline-none"
                      />
                      <input
                        value={srv.url}
                        onChange={(e) =>
                          setChannelServers((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, url: e.target.value } : s))
                          )
                        }
                        placeholder="https://.../live.m3u8"
                        className="flex-1 min-w-[200px] rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-[11px] font-mono text-white focus:outline-none"
                      />
                      <input
                        value={srv.quality}
                        onChange={(e) =>
                          setChannelServers((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, quality: e.target.value } : s))
                          )
                        }
                        placeholder="1080P"
                        className="w-20 rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-[11px] font-bold text-white focus:outline-none"
                      />
                      {channelServers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setChannelServers((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className={`w-full mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider text-white transition ${
                  editingChannelId ? "bg-emerald-600 hover:bg-emerald-500" : "bg-[#00E676] text-black font-black hover:bg-emerald-400"
                }`}
              >
                <Save className="h-4 w-4" />
                <span>
                  {isSaving ? "Saving..." : editingChannelId ? `Update Channel (/${editingChannelId})` : "Add 24/7 Channel"}
                </span>
              </button>
            </form>
          </div>

          {/* Channels List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                Channels In Database ({channelsList.length})
              </span>
              <button onClick={loadChannels} className="text-neutral-500 hover:text-white transition">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {channelsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
                No channels found.
              </div>
            ) : (
              channelsList.map((ch) => (
                <div
                  key={ch.id}
                  className={`rounded-2xl border p-4 space-y-2 transition-all ${
                    editingChannelId === ch.id
                      ? "border-emerald-500 bg-[#0B150F] ring-1 ring-emerald-500"
                      : "border-neutral-800/80 bg-[#0E1017]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {ch.logoUrl ? (
                        <img
                          src={ch.logoUrl}
                          alt={ch.name}
                          className="h-10 w-10 rounded-xl object-contain bg-neutral-900 border border-neutral-800 p-1 shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-neutral-400 shrink-0">
                          TV
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#00E676]">/{ch.id}</span>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">{ch.category}</span>
                        </div>
                        <h3 className="font-black text-sm text-white mt-0.5">{ch.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStartEditChannel(ch)}
                        className="p-1.5 rounded-lg border bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white transition"
                        title="Edit"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteChannel(ch.id)}
                        className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-900 flex flex-wrap gap-1.5">
                    {ch.servers?.map((s: StreamServer, idx: number) => (
                      <span
                        key={idx}
                        className="rounded bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[9px] font-mono text-neutral-400"
                      >
                        {s.name} ({s.quality})
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}