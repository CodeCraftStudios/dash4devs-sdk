---
name: standalone-site-locations
description: Real client SDK sites that live directly under Desktop/projects instead of inside Dash4Devs/projects/
metadata:
  type: project
---

When a sweep task says "everything under Dash4Devs/ is off-limits except reading the SDK," that
excludes `Dash4Devs/projects/*` too — which is where MOST client sites live (hooked-on-belize,
carbon-extracts, verma, gashouse, thca-world, m-a-distro, etc. — see the client-sites section of
the user's own MEMORY.md). Don't assume the exclusion guts the task before checking: a handful of
real, currently-deployed dash4devs-sdk sites live OUTSIDE Dash4Devs/, directly under
`C:\Users\John\Desktop\projects\`, as separate git repos with their own GitHub remotes under
CodeCraftStudios/. Confirmed as of 2026-09-05:

- `lost-thc-splash` — clean git repo, remote `CodeCraftStudios/lostthc-splash`
- `bamthc-splash` — clean git repo, remote `CodeCraftStudios/bamthc-splash` (but check for
  remote divergence before pushing — it had 5 unpulled commits once)
- `NightNDayDetailing/dashfordevs-version` — git repo, remote
  `CodeCraftStudios/nightndaydetailing-dfd`; has the hand-placed "Developed By CodeCraft Studios"
  footer credit in BOTH `src/components/Footer.tsx` (public) and
  `src/components/admin/AdminLayout.tsx` (admin sidebar) — nofollow both
- `Zerdz/frontend` — SDK site (remote `CodeCraftStudios/zerdz`) but had uncommitted changes
  (`.claude/settings.local.json`, `next-env.d.ts`, `tsconfig.tsbuildinfo`) — skipped per the
  "don't commit into a dirty tree" rule even though they look like build artifacts
- `LostBlue/lostblue_dfd` — SDK site but has NO `.git` directory at all (not a repo) — can't
  commit/push here; the sibling `LostBlue/frontend` and top-level `lostblue-frontend` are a
  DIFFERENT, non-SDK (axios-based) repo despite the similar name, same git remote
  `CodeCraftStudios/lostblue-frontend`

Confirmed NOT SDK sites despite suggestive names: `ccs/frontend` (axios direct, no dash4devs
dep — matches user's memory note that CCS predates the SDK migration), `HealthDash/frontend`
(package name is literally "dashfordevs" but it's the internal dashboard product, not a
storefront — no dash4devs dependency).

To re-find this set: `Grep pattern:"dash4devs-sdk" glob:"package.json" path:Desktop/projects`,
then throw out every hit under `Dash4Devs/`.
