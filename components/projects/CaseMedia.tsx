import Image from "next/image";
import CardVideo from "@/components/projects/cards/CardVideo";
import { mediaKind, type MediaKind } from "@/lib/project-card";

// One piece of case-study media: a still image, an animated GIF (served unoptimised so it keeps
// animating) or a muted looping video with its own Pause/Play control. Interface screens default
// to "contain" so nothing is cropped.
export type CaseMediaItem = { url: string; alt: string; caption?: string; kind?: MediaKind; fit?: "cover" | "contain"; poster?: string };

export default function CaseMedia({ item, defaultFit = "contain", ratio = "16 / 10", sizes = "(max-width: 768px) 100vw, 900px" }: { item: CaseMediaItem; defaultFit?: "cover" | "contain"; ratio?: string; sizes?: string }) {
  const kind = mediaKind(item.url, item.kind);
  const fit = item.fit ?? defaultFit;
  return (
    <figure className="case-media">
      <div className="case-media-frame" style={{ aspectRatio: ratio }} data-media-kind={kind} data-parallax="">
        {kind === "video" ? (
          <CardVideo src={item.url} poster={item.poster} label={item.alt} fit={fit} />
        ) : (
          <Image src={item.url} alt={item.alt} fill unoptimized={kind === "gif"} sizes={sizes} className={fit === "contain" ? "object-contain" : "object-cover"} />
        )}
      </div>
      {item.caption && <figcaption className="mt-3 type-small text-text-tertiary">{item.caption}</figcaption>}
    </figure>
  );
}

export function CaseMediaSet({ media, defaultFit = "contain", columns }: { media: CaseMediaItem[]; defaultFit?: "cover" | "contain"; columns?: 1 | 2 | 3 }) {
  const cols = columns ?? (media.length === 1 ? 1 : media.length === 2 || media.length === 4 ? 2 : 3);
  return (
    <div className={`case-media-set case-media-cols-${cols}`}>
      {media.map((item, index) => <CaseMedia key={`${item.url}-${index}`} item={item} defaultFit={defaultFit} sizes={cols === 1 ? "(max-width: 768px) 100vw, 1100px" : "(max-width: 768px) 100vw, 50vw"} />)}
    </div>
  );
}
