"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, RefreshCw, Volume2, VolumeX } from "lucide-react";

interface HlsPlayerProps {
  streamUrl: string;
  poster?: string;
  autoPlay?: boolean;
}

export default function HlsPlayer({
  streamUrl,
  poster,
  autoPlay = true,
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setError(null);
    setIsBuffering(true);
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        if (autoPlay) {
          video.play().catch(() => {
            // Autoplay with audio was blocked by browser policy
            video.muted = true;
            setIsMuted(true);
            video.play();
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              setError("Broadcast stream disconnected. Click reconnect.");
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Safari / iOS support
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsBuffering(false);
        if (autoPlay) video.play();
      });
    } else {
      setError("Your browser does not support HLS video streams.");
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [streamUrl, autoPlay]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMute = !videoRef.current.muted;
    videoRef.current.muted = newMute;
    setIsMuted(newMute);
  };

  const handleRetry = () => {
    setError(null);
    setIsBuffering(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-neutral-800/80 shadow-2xl">
      <video
        ref={videoRef}
        poster={poster}
        controls
        playsInline
        className="h-full w-full object-contain"
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
      />

      {/* Buffering Indicator */}
      {isBuffering && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E50914] border-t-transparent" />
        </div>
      )}

      {/* Stream Disconnected Fallback */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0A0D14]/95 p-4 text-center">
          <AlertCircle className="h-8 w-8 text-[#E50914]" />
          <p className="text-xs font-semibold text-neutral-300">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reconnect
          </button>
        </div>
      )}

      {/* Quick Mute Action Button */}
      <button
        onClick={toggleMute}
        aria-label="Toggle mute"
        className="absolute top-4 right-4 z-20 rounded-full bg-black/60 p-2 text-white backdrop-blur-md hover:bg-black/80 transition"
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  );
}