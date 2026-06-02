/**
 * <DashImage /> — responsive image with LQIP blur-up + progressive loading.
 *
 * Pass any image object returned by the Dash4Devs API. The component renders
 * a raw <img> with srcset across pre-generated WebP widths (320/640/1024/1920)
 * served directly from the CDN — no /_next/image proxy, no on-demand re-encode.
 *
 * The LQIP base64 thumbnail is painted as a blurred CSS background behind the
 * image. Once the real pixels load, the blur clears. If no LQIP is available,
 * an animated shimmer placeholder is shown instead.
 *
 * Usage:
 *   <DashImage image={product.main_image_data} alt={product.name} />
 *   <DashImage image={img} sizes="(max-width: 768px) 100vw, 50vw" priority />
 *
 * Required `image` shape (matches get_image_object()):
 *   {
 *     url: string,
 *     lqip?: string | null,           // base64 data URI
 *     variants_ready?: boolean,
 *     variants?: {
 *       webp?: [{ width, url }],
 *       avif?: [{ width, url }],
 *     },
 *   }
 */

import React, { useState, useRef, useEffect } from "react";

// Animated shimmer SVG — shown when no LQIP is available.
const SHIMMER_SVG = `data:image/svg+xml;base64,${typeof window === "undefined"
  ? Buffer.from(`<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#222"><animate attributeName="offset" values="-2;1" dur="1.4s" repeatCount="indefinite"/></stop><stop offset="50%" stop-color="#2a2a2a"><animate attributeName="offset" values="-1;2" dur="1.4s" repeatCount="indefinite"/></stop><stop offset="100%" stop-color="#222"><animate attributeName="offset" values="0;3" dur="1.4s" repeatCount="indefinite"/></stop></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/></svg>`).toString("base64")
  : btoa(`<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#222"><animate attributeName="offset" values="-2;1" dur="1.4s" repeatCount="indefinite"/></stop><stop offset="50%" stop-color="#2a2a2a"><animate attributeName="offset" values="-1;2" dur="1.4s" repeatCount="indefinite"/></stop><stop offset="100%" stop-color="#222"><animate attributeName="offset" values="0;3" dur="1.4s" repeatCount="indefinite"/></stop></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/></svg>`)}`;

function buildSrcSet(variantList) {
  if (!Array.isArray(variantList) || variantList.length === 0) return undefined;
  return variantList
    .filter((v) => v && v.url && v.width)
    .sort((a, b) => a.width - b.width)
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");
}

export function DashImage({
  image,
  alt = "",
  sizes = "100vw",
  className = "",
  style = {},
  priority = false,
  noBlur = false,
  fill = false,
  onLoad,
  onError,
  ...imgProps
}) {
  const [loaded, setLoaded] = useState(false);
  const [variantError, setVariantError] = useState(false);
  const imgRef = useRef(null);

  // Detect already-cached images on hydrate
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  if (!image || !image.url) return null;

  const variants = !variantError && image.variants_ready ? image.variants : null;
  const webpSet = variants ? buildSrcSet(variants.webp) : undefined;

  // Primary src: mid-size variant (never the heavy original) when available
  const sorted = (variants?.webp || [])
    .filter((v) => v && v.url && v.width)
    .sort((a, b) => a.width - b.width);
  const primarySrc = sorted.length
    ? (sorted.find((v) => v.width >= 1024) || sorted[sorted.length - 1]).url
    : image.url;

  const handleError = (e) => {
    if (!variantError) setVariantError(true);
    setLoaded(true);
    onError?.(e);
  };

  const handleLoad = (e) => {
    setLoaded(true);
    onLoad?.(e);
  };

  // LQIP blur-up: real LQIP if available, shimmer fallback for variant images, nothing otherwise
  const blur = !loaded && !noBlur
    ? (image.lqip || (sorted.length ? SHIMMER_SVG : null))
    : null;

  const mergedStyle = {
    ...(blur
      ? { backgroundImage: `url("${blur}")`, backgroundSize: "cover", backgroundPosition: "center" }
      : {}),
    ...(fill
      ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
      : {}),
    ...style,
  };

  const img = (
    <img
      ref={imgRef}
      src={primarySrc}
      srcSet={webpSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      onLoad={handleLoad}
      onError={handleError}
      className={className}
      style={mergedStyle}
      {...imgProps}
    />
  );

  return img;
}

export default DashImage;
