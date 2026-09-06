---
name: divergent-repo-push-protocol
description: What to do when a client site repo's origin/main has commits you don't have locally, mid-sweep
metadata:
  type: feedback
---

On a multi-site sweep (bump a dependency, tweak a footer link, etc. across many independent
client repos that autodeploy on push), always `git fetch origin` and check
`git log HEAD..origin/main` BEFORE assuming the local checkout is current — these are
long-lived local clones and other sessions/people push to them independently. Two of five sites
in a 2026-09-05 sweep had diverged (one by 5 commits, one by 1 commit with real feature work:
new pages, redirects, A2P 10DLC compliance changes).

**Why:** the task's own safety rule ("if a repo has uncommitted work already in the tree, don't
commit — report and skip") is about not clobbering someone else's in-flight work. A diverged
*remote* is the same hazard one layer up — a naive `git push` gets rejected (good, fails safe),
but the fix must never be `--force`: that would discard real pushed work.

**How to apply:** commit your change locally first, then `git rebase origin/main` (not merge —
keeps history linear and puts your commit last, which is easier to reason about). If
`package-lock.json` conflicts (it will, since it's generated and the remote likely touched
dependencies too): `git checkout --theirs package-lock.json && git add package-lock.json`, then
re-run whatever install command produced your change (e.g.
`npm install dash4devs@github:CodeCraftStudios/dash4devs-sdk`) so the lockfile picks up BOTH the
remote's other dependency changes and your bump, then `git rebase --continue`. After the rebase,
re-grep the newly-pulled-in files for anything your sweep pattern was looking for (footer
credits, raw `<img>` tags) — new files came in that your original one-time grep never saw.
Re-typecheck after the rebase, then push (should fast-forward cleanly).
