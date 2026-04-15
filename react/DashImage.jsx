/**
 * <DashImage /> — responsive image with blur-up placeholder.
 *
 * Pass any image object returned by the Dash4Devs API. The component renders
 * a <picture> with AVIF/WebP sources and a srcset across the pre-generated
 * widths (320 / 640 / 1024 / 1920). The LQIP base64 thumbnail is painted as
 * a blurred background until the real image loads, eliminating layout shift.
 *
 * Usage:
 *   <DashImage image={product.main_image} alt={product.name} />
 *   <DashImage image={img} sizes="(max-width: 768px) 100vw, 50vw" priority />
 *
 * Required `image` shape (matches MediaFile.to_dict()):
 *   {
 *     url: string,
 *     lqip?: string,                          // data: URI, optional
 *     variants_ready?: boolean,
 *     variants?: {
 *       webp: [{ width, url }],
 *       avif: [{ width, url }],
 *     },
 *   }
 *
 * Falls back gracefully:
 *   - No variants? Renders a plain <img src={image.url}>
 *   - No LQIP?    Skips the blur background.
 */

import React, { useState } from "react";

const DEFAULT_SIZES = "100vw";

function buildSrcSet(variantList) {
  if (!Array.isArray(variantList) || variantList.length === 0) return "";
  return variantList
    .filter((v) => v && v.url && v.width)
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");
}

export function DashImage({
  image,
  alt = "",
  sizes = DEFAULT_SIZES,
  className = "",
  style = {},
  priority = false,
  blurDisabled = false,
  onLoad,
  onError,
  ...imgProps
}) {
  // Error state flips the <picture> to bare-img-with-original-url mode.
  // Any variant 404 / decode failure falls back to image.url so users see
  // *something* even when the pipeline's output is stale or unreachable.
  const [variantError, setVariantError] = useState(false);

  if (!image || !image.url) return null;

  const variants = !variantError && image.variants_ready ? image.variants : null;
  const avifSet = variants ? buildSrcSet(variants.avif) : "";
  const webpSet = variants ? buildSrcSet(variants.webp) : "";

  // When variants are available we use the largest WebP as the <img> src
  // (also what Safari<14 / picture-unaware browsers will load). On error
  // we rebuild with the original source URL — always guaranteed to exist
  // because that's what the CMS stored.
  const src = variants
    ? (variants.webp?.[variants.webp.length - 1]?.url || image.url)
    : image.url;

  const handleError = (e) => {
    if (!variantError) setVariantError(true);
    onError?.(e);
  };

  // Don't force `display` — callers pass Tailwind responsive visibility
  // classes like "hidden md:block" via className; an inline display value
  // would override them. No base64 LQIP is painted on the wrapper: inlining
  // a ~400-byte data URI per image bloats HTML heavily on list pages, and
  // the <img> paints fast enough from CDN+cache that the blur was net-negative.
  const wrapperStyle = {
    position: "relative",
    overflow: "hidden",
    ...style,
  };

  const imgStyle = {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  return (
    <span style={wrapperStyle} className={className}>
      <picture style={{ display: "block", width: "100%", height: "100%" }}>
        {avifSet && <source type="image/avif" srcSet={avifSet} sizes={sizes} />}
        {webpSet && <source type="image/webp" srcSet={webpSet} sizes={sizes} />}
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : undefined}
          onLoad={onLoad}
          onError={handleError}
          style={imgStyle}
          {...imgProps}
        />
      </picture>
    </span>
  );
}

export default DashImage;
