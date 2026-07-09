---
name: .replitignore excluding build output or node_modules breaks deploys
description: Deployment fails with "Cannot find module dist/index.js" or "Cannot find package X" (ERR_MODULE_NOT_FOUND) even though the build succeeds, because .replitignore excludes dist/ and/or node_modules/.
---

If a deployment build log shows the build command completing successfully (e.g. `dist/index.js` written, assets emitted) but the runtime/promote step then fails with a health-check crash loop, check `.replitignore` for entries excluding paths the running container actually needs:
- `dist/` (or other build output dir) → runtime error `Cannot find module '.../dist/index.js'` (MODULE_NOT_FOUND)
- `node_modules/` → runtime error `Cannot find package '<dep>' imported from dist/index.js` (ERR_MODULE_NOT_FOUND), especially when the server bundle is built with esbuild `--packages=external` (deps not inlined, so they must ship with the container)

Both were found excluded simultaneously in one project; fixing `dist/` alone only revealed the second error on the next deploy attempt — check both at once.

**Why:** `.replitignore` controls what gets packaged into the deployed container. Aggressive project-size cleanups sometimes add these dirs to `.replitignore` (to shrink zip exports) without realizing the deployer also strips those paths from the production image — even though the build step regenerates/uses them fresh inside the build container just before packaging.

**How to apply:** When debugging a deploy failure, inspect `.replitignore` for `dist/` and `node_modules/` entries (and confirm `.replit`'s `[deployment]` `deploymentTarget` actually matches `getDeploymentInfo().deploymentType` — these two can drift independently) before assuming the issue is a build/dependency bug. Removing both entries from `.replitignore` and republishing resolves it.
