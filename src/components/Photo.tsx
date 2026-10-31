/* eslint-disable @next/next/no-img-element */
import { mediaUrl } from "@/lib/media-url";

type Props = { file: string; thumb?: string | null; blur?: string | null; alt: string; sizes?: string; className?: string; priority?: boolean; width?: number | null; height?: number | null };

/** Responsive image for uploaded media (720px thumb + 2000px large WebP). */
export function Photo({ file, thumb, blur, alt, sizes = "(min-width: 1024px) 33vw, 100vw", className = "", priority, width, height }: Props) {
  const lg = mediaUrl(file)!;
  const sm = thumb ? mediaUrl(thumb) : null;
  return (
    <img
      src={sm ?? lg}
      srcSet={sm ? `${sm} 720w, ${lg} 2000w` : undefined}
      sizes={sm ? sizes : undefined}
      alt={alt}
      width={width ?? undefined}
      height={height ?? undefined}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={className}
      style={blur ? { backgroundImage: `url(${blur})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    />
  );
}
