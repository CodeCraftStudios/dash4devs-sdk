/**
 * DashVideo — local ffmpeg transcoding step for `dash4devs build`.
 *
 * For every video under public/ it produces, into public/_dashvideo/<name>/:
 *   - h264 mp4 renditions at 1080p / 720p / 640p (skipping any taller than the
 *     source — i.e. videos > 1080p are downgraded, never upscaled)
 *   - poster.webp (first frame) for the blur-up / low-res-first paint
 *   - meta.json describing the renditions + dimensions
 *
 * These land in public/, so the existing build step uploads them to the CDN.
 * Gracefully no-ops when ffmpeg isn't installed or there are no videos.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { step, success, warn } from "./ui.js";

const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm", ".mkv", ".m4v", ".avi"]);
const HEIGHTS = [1080, 720, 640];

function hasBinary(bin) {
  try {
    const r = spawnSync(bin, ["-version"], { stdio: "ignore" });
    return r.status === 0;
  } catch {
    return false;
  }
}

function listVideos(dir) {
  const out = [];
  const walk = (d) => {
    let entries = [];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === "_dashvideo") continue; // don't reprocess our output
        walk(full);
      } else if (VIDEO_EXTS.has(path.extname(e.name).toLowerCase())) {
        out.push(full);
      }
    }
  };
  walk(dir);
  return out;
}

function probeHeight(ffprobe, file) {
  const r = spawnSync(ffprobe, [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height",
    "-of", "json", file,
  ], { encoding: "utf8" });
  try {
    const s = JSON.parse(r.stdout).streams?.[0] || {};
    return { width: s.width || 0, height: s.height || 0 };
  } catch {
    return { width: 0, height: 0 };
  }
}

export async function processVideos(cfg) {
  const ffmpeg = hasBinary("ffmpeg") ? "ffmpeg" : null;
  const ffprobe = hasBinary("ffprobe") ? "ffprobe" : null;
  if (!ffmpeg || !ffprobe) {
    warn("DashVideo: ffmpeg/ffprobe not found on PATH — skipping video transcoding");
    return { processed: 0, renditions: 0 };
  }

  const publicDir = path.join(cfg.cwd, cfg.publicDir || "public");
  if (!fs.existsSync(publicDir)) return { processed: 0, renditions: 0 };

  const videos = listVideos(publicDir);
  if (videos.length === 0) return { processed: 0, renditions: 0 };

  step("DashVideo: transcoding", `${videos.length} video(s) via ffmpeg`);

  let processed = 0, renditions = 0;
  for (const file of videos) {
    const base = path.basename(file, path.extname(file)).replace(/[^a-zA-Z0-9-_]/g, "_");
    const outDir = path.join(publicDir, "_dashvideo", base);
    fs.mkdirSync(outDir, { recursive: true });

    const { width, height } = probeHeight(ffprobe, file);
    if (!height) { warn(`  ${base}: could not probe — skipped`); continue; }

    // Poster (first frame) for blur-up / low-res-first paint.
    const poster = path.join(outDir, "poster.webp");
    if (!fs.existsSync(poster)) {
      spawnSync(ffmpeg, ["-y", "-i", file, "-vframes", "1", "-vf", "scale=-2:480", poster], { stdio: "ignore" });
    }

    const made = [];
    for (const h of HEIGHTS) {
      if (h > height) continue; // never upscale; >1080p sources get downgraded to 1080/720/640
      const out = path.join(outDir, `${h}.mp4`);
      if (fs.existsSync(out)) { made.push(h); continue; }
      const r = spawnSync(ffmpeg, [
        "-y", "-i", file,
        "-vf", `scale=-2:${h}`,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
        out,
      ], { stdio: "ignore" });
      if (r.status === 0) { made.push(h); renditions++; }
      else warn(`  ${base}: ${h}p failed`);
    }

    fs.writeFileSync(path.join(outDir, "meta.json"), JSON.stringify({
      source: path.relative(publicDir, file).replace(/\\/g, "/"),
      width, height,
      poster: `/_dashvideo/${base}/poster.webp`,
      renditions: made.sort((a, b) => a - b).map((h) => ({ height: h, src: `/_dashvideo/${base}/${h}.mp4` })),
    }, null, 2));
    processed++;
  }

  success(`DashVideo: ${processed} video(s), ${renditions} rendition(s) → public/_dashvideo/`);
  return { processed, renditions };
}
