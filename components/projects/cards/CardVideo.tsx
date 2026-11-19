"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

// Video in a card media container: muted, looping and inline like a GIF, but with a Pause/Play
// button (WCAG 2.2.2) and no autoplay for prefers-reduced-motion. Playback also stops while the
// video is off screen, to save battery and data.
export default function CardVideo({ src, poster, label, fit }: { src: string; poster?: string; label: string; fit: "cover" | "contain" }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const wanted = useRef(true);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) wanted.current = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && wanted.current) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.2 });
    observer.observe(video);
    const sync = () => setPlaying(!video.paused);
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    return () => { observer.disconnect(); video.removeEventListener("play", sync); video.removeEventListener("pause", sync); };
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    wanted.current = video.paused;
    if (video.paused) video.play().catch(() => {}); else video.pause();
  };

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
      />
      <button type="button" className="card-media-toggle" onClick={toggle} aria-pressed={!playing} aria-label={playing ? `Pause video: ${label}` : `Play video: ${label}`}>
        {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
      </button>
    </>
  );
}
