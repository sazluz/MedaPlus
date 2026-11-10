"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, RefreshCw, VolumeX, ShieldCheck, ShieldAlert } from "lucide-react";

interface UniversalVideoPlayerProps {
  src: string;
  poster?: string;
  serverName: string;
}

export default function HlsVideoPlayer({ src, poster, serverName }: UniversalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [strictSandbox, setStrictSandbox] = useState(true);

  const isHls =
    src.includes(".m3u8") ||
    src.includes("/hls/") ||
    src.startsWith("blob:") ||
    src.includes("application/x-mpegURL");

  const loadHlsStream = (streamUrl: string) => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setIsLoading(true);
    setHasError(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setHasError(true);
              setIsLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      });
      video.addEventListener("error", () => {
        setHasError(true);
        setIsLoading(false);
      });
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isHls) {
      loadHlsStream(src);
    } else {
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, isHls]);

  const toggleMute = () => {
    if (videoRef.current) {
      const target = !videoRef.current.muted;
      videoRef.current.muted = target;
      setIsMuted(target);
    }
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      {/* Top Protection Bar */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
        {!isHls && (
          <button
            onClick={() => setStrictSandbox(!strictSandbox)}
            className="flex items-center gap-1.5 rounded-full bg-neutral-950/85 backdrop-blur-md border border-neutral-800 px-3 py-1 text-[10px] font-mono transition hover:border-neutral-600"
            title="Click to toggle sandbox mode if the stream complains about restrictions"
          >
            {strictSandbox ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-neutral-200">Shield: Strict</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-300">Shield: Compatibility Mode</span>
              </>
            )}
          </button>
        )}
      </div>

      {isHls ? (
        /* Native HLS / .m3u8 */
        <>
          <video
            ref={videoRef}
            controls
            playsInline
            poster={poster}
            className="h-full w-full object-contain"
          />

          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-2.5">
              <RefreshCw className="h-8 w-8 animate-spin text-[#E50914]" />
              <span className="text-xs font-black uppercase tracking-widest text-neutral-300">
                Buffering {serverName}...
              </span>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#07080B]/95 p-6 text-center">
              <AlertCircle className="h-10 w-10 text-[#E50914] mb-2" />
              <h4 className="text-sm font-black uppercase text-white">Stream Signal Failed</h4>
              <p className="mt-1 max-w-sm text-xs text-neutral-400">
                The stream on <span className="text-white font-bold">{serverName}</span> failed to load.
              </p>
              <button
                onClick={() => loadHlsStream(src)}
                className="mt-4 flex items-center gap-1.5 rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-2 text-xs font-bold text-neutral-200 hover:text-white hover:border-[#E50914] transition"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reconnect
              </button>
            </div>
          )}

          {isMuted && !isLoading && !hasError && (
            <button
              onClick={toggleMute}
              className="absolute bottom-16 right-4 z-20 flex items-center gap-2 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg hover:bg-neutral-900 transition"
            >
              <VolumeX className="h-4 w-4 text-[#E50914]" />
              <span>Click to Unmute</span>
            </button>
          )}
        </>
      ) : (
        /* Sandboxed Embed */
        <iframe
          key={strictSandbox ? "strict" : "compat"}
          src={src}
          title={serverName}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          sandbox={
            strictSandbox
              ? "allow-scripts allow-same-origin allow-forms allow-presentation"
              : undefined // Disables sandbox for stubborn sources that refuse sandboxing
          }
          className="h-full w-full border-0 bg-black"
        />
      )}
    </div>
  );
}