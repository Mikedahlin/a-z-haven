"use client";

import { type ImgHTMLAttributes } from "react";

export type ResponsiveSource = {
  srcSet: string;
  type: string;
  media?: string;
};

type Props = {
  /** Add AVIF/WebP here when you drop files into `public/images/`. */
  sources?: ResponsiveSource[];
  fallbackSrc: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  imgProps?: Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "alt" | "width" | "height"
  >;
};

/**
 * Static files from `/public` — uses native `<img>` (not `next/image`) so assets
 * load directly as `/images/...` without the image optimizer. That avoids
 * broken `/_next/image` responses in some environments (extensions, proxies, CSP).
 */
export function ResponsiveImage({
  sources = [],
  fallbackSrc,
  alt,
  width,
  height,
  className,
  priority,
  sizes,
  imgProps,
}: Props) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- intentional: public static assets
    <img
      src={fallbackSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className="h-auto w-full select-none object-cover"
      {...imgProps}
    />
  );

  return (
    <picture className={className}>
      {sources.map((s) => (
        <source
          key={`${s.type}-${s.srcSet}`}
          srcSet={s.srcSet}
          type={s.type}
          media={s.media}
        />
      ))}
      {img}
    </picture>
  );
}
