import Image from "next/image";
import CardVideo from "@/components/projects/cards/CardVideo";
import { mediaKind } from "@/lib/project-card";
import type { HomeMedia as HomeMediaValue } from "@/lib/home-content";

// One homepage media slot (owner request, 2026-11-25): a still image, an animated GIF (served
// unoptimised so it keeps moving) or a video. Decorative videos loop muted with a Pause/Play
// button (WCAG 2.2.2); an episode video gets the native controls instead. Fills its parent.
export default function HomeMedia({ media, sizes, fit: slotFit = "cover", controls = false, priority = false, showToggle = true, className = "" }: {
  media: HomeMediaValue; sizes: string; fit?: "cover" | "contain"; controls?: boolean; priority?: boolean; showToggle?: boolean; className?: string;
}) {
  const kind = mediaKind(media.src, media.kind);
  // "Display" chosen in Admin → Content wins; otherwise the slot's default.
  const fit = media.fit ?? slotFit;
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";
  if (kind === "video") {
    return controls
      ? <video src={media.src} poster={media.poster} controls preload="metadata" playsInline aria-label={media.alt} className={`absolute inset-0 h-full w-full ${fitClass} ${className}`} />
      : <CardVideo src={media.src} poster={media.poster} label={media.alt} fit={fit} showToggle={showToggle} />;
  }
  return <Image src={media.src} alt={media.alt} fill sizes={sizes} priority={priority} unoptimized={kind === "gif"} className={`${fitClass} ${className}`} />;
}
