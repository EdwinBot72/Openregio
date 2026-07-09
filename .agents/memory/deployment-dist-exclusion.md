---
name: .replitignore excluding build output breaks deploys
description: Deployment fails with "Cannot find module dist/index.js" even though the build succeeds, because dist/ is listed in .replitignore.
---

If a deployment build log shows the build command completing successfully (e.g. `dist/index.js` written, assets emitted) but the runtime/promote step then fails with `Cannot find module '.../dist/index.js'` (MODULE_NOT_FOUND) or a health-check crash loop, check `.replitignore` for an entry excluding the build output directory (e.g. `dist/`).

**Why:** `.replitignore` controls what gets packaged into the deployed container. Aggressive project-size cleanups sometimes add build output dirs to `.replitignore` (to shrink zip exports) without realizing the deployer also strips those paths from the production image — even though the build step regenerates them fresh inside the build container just before packaging.

**How to apply:** When debugging a deploy failure, always inspect `.replitignore` (and confirm `.replit`'s `[deployment]` `deploymentTarget` actually matches `getDeploymentInfo().deploymentType` — these two can drift independently) before assuming the issue is a build/dependency bug. Removing the build-output entry from `.replitignore` and republishing resolves it.
