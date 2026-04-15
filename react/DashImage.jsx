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
  ...imgProps
}) {
  const [loaded, setLoaded] = useState(false);

  if (!image || !image.url) return null;

  const variants = image.variants_ready ? image.variants : null;
  const avifSet = variants ? buildSrcSet(variants.avif) : "";
  const webpSet = variants ? buildSrcSet(variants.webp) : "";

  // Largest variant for the <img> fallback (browsers without <picture>).
  const fallback = variants?.webp?.[variants.webp.length - 1]?.url || image.url;

  const handleLoad = (e) => {
    setLoaded(true);
    onLoad?.(e);
  };

  // The wrapper paints the LQIP. Position is relative so the image sits inside.
  const wrapperStyle = {
    position: "relative",
    overflow: "hidden",
    backgroundImage: !blurDisabled && image.lqip ? `url(${image.lqip})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    ...style,
  };

  // Fade in once the real image paints to hide the LQIP transition.
  const imgStyle = {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 200ms ease-out",
    opacity: loaded ? 1 : 0,
  };

  return (
    <span style={wrapperStyle} className={className}>
      <picture>
        {avifSet && <source type="image/avif" srcSet={avifSet} sizes={sizes} />}
        {webpSet && <source type="image/webp" srcSet={webpSet} sizes={sizes} />}
        <img
          src={fallback}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchpriority={priority ? "high" : undefined}
          onLoad={handleLoad}
          style={imgStyle}
          {...imgProps}
        />
      </picture>
    </span>
  );
}

export default DashImage;
