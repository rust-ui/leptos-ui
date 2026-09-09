# Phase 3 — remove migrated Leptos site from parent repository

## Goal

After Phase 2 is proven in production, remove from the parent repository all website and Leptos application material that now lives in `leptos-ui`.

This phase is cleanup and ownership correction only. It does not introduce Dioxus and does not redesign the website.

## Preconditions

- Phase 2 deploy succeeds directly from `leptos-ui`.
- Production health checks pass from the new repository workflow.
- Real domain traffic reaches the new deployment.
- Bug reports work through remote forwarding and local SQLite fallback.
- SQLite persistence survives container recreation.
- Tauri web, desktop, iOS, and iPad behavior has an explicit owner and tested source.
- Rollback to the previous parent deployment is documented and tested.
- The parent repository contains no unique Leptos asset that is not copied or intentionally retained.
- A final inventory diff has been reviewed before deletion.

## Non-goals

- No Dioxus migration.
- No component redesign or route redesign.
- No production database reset or data rewrite.
- No deletion of shared infrastructure still used by other projects.
- No deletion of platform scripts merely because their execution root changes.
- No destructive cleanup before the production rollback window expires.

## Ownership after Phase 3

### `leptos-ui` owns

- Leptos website source and server entry points.
- Website application crates and routes.
- Leptos UI, icons, markdown, form, and class-merging dependencies used by the site.
- Website assets, styles, generated site content, and end-to-end tests.
- Website `Cargo.toml`, lockfile policy, Node package files, and build metadata.
- Website Dockerfile, production compose file, deployment workflow, and site-specific configuration.
- Tauri source/configuration that belongs to the Leptos website, if still built from this app.

### Parent repository retains

- The `leptos-ui` submodule/reference until the ownership strategy is finalized.
- Shared crates still consumed by Dioxus or other packages.
- Shared public infrastructure and repository-level governance.
- Internal registry/build tooling and its platform scripts.
- Desktop/iOS deployment scripts in their current tooling repository unless a later phase moves them.
- Nginx, VPS, certificates, credentials, and infrastructure that serve multiple applications.
- Dioxus-specific source and crates.

## Migration inventory and deletion candidates

Review each item against the Phase 1 copy manifest and mark it `delete`, `retain`, or `shared`:

- `app/`, `server/`, and Leptos application entry points.
- `app_crates/` packages used only by the Leptos website.
- Leptos-specific folders under `crates/`.
- Website `public/`, `style/`, `e2e/`, and generated content.
- Website root `Cargo.toml` members, dependencies, profiles, and Leptos metadata.
- Website Node manifests and lockfiles.
- Tauri source/configuration and root platform files copied for the website.
- Website Docker, compose, Nginx, and CI workflow files.
- Website README, CONTRIBUTING, license references, ownership files, and issue templates.
- Parent scripts containing website build, test, tag, or workflow assumptions.
- Parent submodule entry and any generated submodule metadata.

Do not delete a file solely because it mentions Leptos. First verify whether it is a shared crate, documentation reference, release asset, or compatibility layer.

## Execution stages

### 3.1 Freeze and archive references

- Record the last parent commit that can roll back production.
- Record the first production commit deployed from `leptos-ui`.
- Save route, asset, health, bug-report, and Tauri validation results.
- Record every deletion candidate and its replacement path.
- Confirm no uncommitted user work is included in cleanup commits.

### 3.2 Classify parent files

For each candidate, classify:

- `migrated`: exact working copy exists in `leptos-ui`.
- `replaced`: parent copy is superseded by another maintained implementation.
- `shared`: still required by retained parent code.
- `generated`: reproducible output with a maintained generator.
- `external-infra`: remains outside website ownership.
- `unknown`: block deletion until resolved.

Any `unknown` item blocks destructive cleanup.

### 3.3 Remove duplicate website source

- Remove only classified `migrated` or `replaced` website directories from the parent.
- Remove obsolete workspace members and path dependencies.
- Remove stale root build metadata and package scripts.
- Remove duplicate assets and generated site outputs.
- Keep shared crates as independent members or convert them to explicit dependencies.
- Run `cargo metadata` after each workspace edit.

### 3.4 Clean CI and deployment wiring

- Remove parent website build/deploy workflows after the new workflow is proven.
- Remove parent Docker/compose files only when no retained service uses them.
- Update parent scripts to stop building the removed website.
- Keep internal registry/build tooling and platform scripts where they are.
- Keep a documented manual rollback command until the observation window ends.
- Search workflow paths, working directories, image names, artifact paths, and secret names for stale parent assumptions.

### 3.5 Clean governance and documentation

- Update parent README and contributor documentation to describe the new ownership.
- Update links, badges, repository paths, issue templates, CODEOWNERS, and release notes.
- Remove duplicated website instructions from the parent.
- Preserve license and attribution obligations in both repositories.
- Add a short migration note with effective commit and rollback reference.

### 3.6 Remove the temporary submodule only if approved

- Decide whether the parent keeps `leptos-ui` as a submodule, uses a normal repository relationship, or drops the reference.
- Do not remove the submodule automatically as part of source cleanup.
- If removed, verify no tooling, documentation, or release automation depends on it.
- Make submodule removal a separate commit from source deletion.

### 3.7 Validate parent after cleanup

- `cargo metadata --no-deps --format-version 1` succeeds.
- Parent retained packages compile with no deleted path dependencies.
- Parent CI workflows reference only existing paths.
- Registry/build tooling still resolves its intended source directories.
- Desktop/iOS scripts either still work or clearly target `leptos-ui`.
- No stale website Docker or deployment artifact remains.
- Search confirms no accidental absolute local paths or obsolete checkout assumptions.
- Git diff contains only reviewed deletions and ownership updates.

## Edge cases

- Parent and `leptos-ui` both contain files with the same name but different content.
- Nested repositories or submodules hide tracked files during inventory.
- A crate appears Leptos-specific but is consumed by Dioxus or registry tooling.
- Generated registry output has no reproducible generator in the new repository.
- Parent CI references files through glob patterns rather than explicit paths.
- Release workflows use tags or artifacts from the old repository.
- Tauri scripts resolve project root from their own directory and silently target the wrong checkout.
- Nginx or VPS deployment still points at an old image or compose file.
- Docker volumes or database paths change during cleanup even though source code is unchanged.
- Documentation, badges, package repository metadata, and issue links still point to parent.
- Git submodule status looks dirty because the new repository commit differs from the recorded parent pointer.
- Local ignored files make a deleted tracked file appear to remain available.
- Rollback requires restoring both code and generated assets from the same release.

## Commit strategy

Use small, reversible commits:

1. Documentation and ownership updates.
2. CI/deployment wiring changes.
3. Shared workspace and dependency cleanup.
4. Website source/assets deletion.
5. Optional submodule/reference cleanup.

Push and validate each logical commit. Never combine database, infrastructure, and source deletion into one unreviewed change.

## Exit criteria

Phase 3 is complete only when:

- Parent no longer contains duplicate Leptos website source.
- `leptos-ui` remains independently buildable and deployable.
- Parent retained workspace and internal tooling remain healthy.
- Website deploy workflow has one clear source of truth.
- Tauri/platform ownership is explicit and tested.
- Production persistence and rollback are unchanged and verified.
- Governance/docs point to the correct repository.
- No `unknown` inventory item remains.
- Cleanup commits are pushed and production monitoring shows no regression.

## Deferred next phase

Dioxus replacement is separate. It starts only after this cleanup phase has completed and receives its own plan and migration gates.
