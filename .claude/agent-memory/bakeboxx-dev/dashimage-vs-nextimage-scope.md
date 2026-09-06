---
name: dashimage-vs-nextimage-scope
description: A task to "replace <img> with DashImage" does not include next/image <Image> usage
metadata:
  type: feedback
---

When asked to replace raw `<img>` tags with the SDK's `DashImage` component, that is scoped to
literal `<img>` elements only. Sites that already use `next/image`'s `<Image>` component are out
of scope even though `<Image>` is also "not DashImage" — converting next/image usage to
DashImage is a materially different, higher-risk change (different optimization pipeline,
different prop shape) that nobody asked for. Confirmed with the user's own instruction wording
("Replace raw <img> tags... where it applies") on the 2026-09-05 sweep, where `lost-thc-splash`
and `bamthc-splash` had zero raw `<img>` tags — only `next/image` `<Image>` in a few pages — and
were correctly left untouched and reported as "no raw img tags; next/image only, out of scope."

`grep` for this distinction carefully: a naive `<img[^>]*>|next/image|<Image\b` pattern lumps
both together in the files-with-matches view. Re-run with just `<img\b` to isolate true raw-img
hits before deciding whether the DashImage swap applies to a given site.
