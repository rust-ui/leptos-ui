# Phase 1 — move working Leptos website into `leptos-ui`

## Goal

Create independent temporary copy of Leptos website inside `leptos-ui` repository. Website must build and run from repository root, matching current site behavior. Tauri desktop/iOS target included now. Keep source parent untouched. Duplication allowed during migration.

Phase boundaries:

- Phase 1: copy and make current Leptos website + Tauri work.
- Phase 2: deploy from `leptos-ui`, then remove temporary `app_crates` structure. See `PLAN_MOVE_LEPTOS_SITE_PHASE_2.md`.
- Phase 3: replace Leptos with Dioxus. See `PLAN_MOVE_LEPTOS_SITE_PHASE_3.md`.

Phase 1 does not migrate production deployment ownership and does not remove `app_crates`.

## Source → destination

Destination is repository root. Preserve relative paths unless noted.

### 1. Application crates — copy all files

Copy every tracked file under these paths:

```text
RUST-UI/app/**                 → leptos-ui/app/**
RUST-UI/server/**              → leptos-ui/server/**
RUST-UI/app_crates/**          → leptos-ui/app_crates/**
```

Includes all Rust modules, `Cargo.toml`, `build.rs`, registry code, demos, hooks, routes, server middleware, and Leptos components.

Required package groups:

```text
app
server
app_crates/app_components
app_crates/app_config
app_crates/app_domain
app_crates/app_routes
app_crates/registry
```

### 2. Local Rust dependencies — copy all files

```text
RUST-UI/crates/leptos_ui/**       → leptos-ui/crates/leptos_ui/**
RUST-UI/crates/icons/**           → leptos-ui/crates/icons/**
RUST-UI/crates/_markdown_crate/** → leptos-ui/crates/_markdown_crate/**
RUST-UI/crates/autoform/**        → leptos-ui/crates/autoform/**
RUST-UI/crates/tw_merge/**        → leptos-ui/crates/tw_merge/**
```

Notes:

- `crates/leptos_ui` is the actual `leptos_ui` library crate. Keep its destination path unchanged.
- `crates/icons` contains both Leptos and Dioxus implementations. Copy whole crate now; enable only `leptos` / `leptos_animated` features in website manifests. Split Dioxus code later if useful.
- `_markdown_crate` needs its Leptos feature and nested `src/leptos/**` modules.
- `autoform` is a proc-macro used by Leptos registry demos.
- `tw_merge` and `tw_merge_variants` are shared build dependencies.
- Do not copy nested `.git` directories as project files. Keep destination repository as one Git repository.

Crate classification from `RUST-UI/crates`:

| Crate | Leptos status | Migration action |
|---|---|---|
| `crates/leptos_ui` | Leptos-only | Copy whole crate; local workspace member |
| `crates/_markdown_crate` | Shared core + Leptos feature/modules | Copy whole crate; enable `leptos` feature |
| `crates/autoform` | Leptos proc-macro output | Copy whole crate |
| `crates/icons` | Leptos + Dioxus feature-gated code | Copy whole crate now; website enables Leptos features only |
| `crates/tw_merge` | Framework-agnostic; used by Leptos UI | Copy `tw_merge` and `tw_merge_variants` |
| `crates/_markdown_config` | Shared data/config types; no framework dependency | Copy if registry metadata requires it |
| `crates/ui-cli` | Leptos-focused tooling, not website runtime | Keep optional; add later for CLI development |
| `crates/_starters/start-dioxus-fullstack` | Dioxus | Exclude |
| `crates/_starters/start-tauri*` | Tauri/desktop | Exclude |

Registry-generated files are copied for Phase 1. Registry build tooling stays outside this repository. `crates/_markdown_config/**` is included only when required by external registry generation. Decide whether generated files under `public/` and `app/src/__registry__/` are committed artifacts or CI outputs. Do not let destination website depend on source parent paths.

Important Leptos-only file groups inside shared crates:

```text
crates/_markdown_crate/src/leptos/**
crates/icons/src/leptos/**
crates/icons/src/leptos_animated/**
```

`crates/icons/src/common/**` is required by both icon implementations and must move too. Keep `src/dioxus/**` and `src/dioxus_animated/**` only as feature-gated dormant code until crate split.

### 3. Website assets — copy all files

```text
RUST-UI/public/** → leptos-ui/public/**
RUST-UI/style/**  → leptos-ui/style/**
RUST-UI/e2e/**    → leptos-ui/e2e/**
```

Includes registry Markdown/JSON, generated/static images, JavaScript helpers, CSS, icons, sitemap files, and Playwright tests/config.

### 4. Root build/runtime files — copy these exact files

```text
.cargo/config.toml
.dockerignore
.gitattributes
.gitignore
.mcp.json
.taurignore                         # keep only if tooling still requires it
Cargo.toml
Cargo.lock
Dockerfile
LICENSE
README.md                            # replace with Leptos website README later
_typos.toml
clippy.toml
justfile
leptosfmt.toml
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
biome.json
rust-toolchain.toml
rustfmt.toml
tailwind.css
```

Phase 2 deployment inventory only. Do not move or activate deployment ownership in Phase 1:

```text
.github/workflows/**
docker-compose.prod.yml
nginx.conf
parent deployment scripts and setup docs
```

These files stay source-of-truth inventory for Phase 2. Rewrite only during Phase 2:

```text
.github/workflows/prod-vps.yml
Dockerfile
docker-compose.prod.yml
nginx.conf
parent deployment scripts and setup docs
```

Update repository name, Docker image, GitHub secrets, server paths, domain routing, health URL, and Leptos output paths. Never copy real `.env` or secret values.

Bug reports need explicit migration decision:

```text
app/src/domain/bug_report/bug_reports.rs
app/src/domain/bug_report/bug_reports_sqlite.rs
```

Current behavior:

- Every SSR bug report writes SQLite first.
- Debug builds use `bug_reports.db` in current directory.
- Release builds use `/tmp/bug_reports.db`.
- `RUSTIFY_API_URL` + `BUG_REPORTS_API_KEY` optionally send same report to remote RUSTIFY API.
- Current production Compose has no volume; SQLite data disappears when container is recreated.

Migration choices to document before production cutover:

1. Keep ephemeral `/tmp` storage and rely on RUSTIFY as durable system of record.
2. Add persistent Docker volume/host mount and configurable `BUG_REPORTS_DB_PATH`.
3. Remove local SQLite after remote API reliability is proven.

Do not copy `bug_reports.db` binary from source. Copy code, schema/migration behavior, env names, and operational backup/retention policy. Test report creation, admin listing, deletion, remote API failure, and container restart.

### 7. Migration edge cases

Check before declaring standalone repo ready:

- `app/build.rs` hashes CSS using paths containing `target/site` and output name `deploy_rust_ui`; update if package/output name changes.
- Docker `cargo chef cook` must see every local path dependency before cook, not only `crates/tw_merge` and `_markdown_crate`.
- Root and nested lockfiles must be intentionally regenerated or retained: `Cargo.lock`, `src-tauri/Cargo.lock`, `e2e/pnpm-lock.yaml`, and `crates/tw_merge/Cargo.lock`.
- `.gitignore` may ignore registry tooling and `src-tauri/gen/`; adjust destination ignore rules if tracked Tauri files are required.
- External registry builder writes generated files into app/public paths; preserve its working directory and input/output paths.
- `crates/icons`, `_markdown_crate`, and `tw_merge` currently contain nested repository metadata or standalone workspace assumptions; destination must have one coherent Git/Cargo workspace.
- `Cargo.toml` package names and output names can collide with the old project; choose stable names before release and update Tauri/Leptos config together.
- `nginx.conf` contains both Rust UI and Dioxus virtual-host blocks. Keep Dioxus routing only if shared server still owns it; otherwise split config.
- Hard-coded `rust-ui.com`, `rust-ui/ui`, `dioxus.rust-ui.com`, Docker image, analytics, canonical URLs, SEO URLs, and GitHub links need intentional keep/change decisions.
- Tauri generated files can encode old product name, package name, URL, Apple team ID, bundle ID, and signing settings.
- GitHub Actions must receive new repository secrets/permissions; workflow push/tag behavior must not assume parent repository.
- Verify static files required at runtime are copied into image: `public/`, registry Markdown, generated CSS/JS, and Tauri offline resources.
- Verify SSR filesystem paths under local dev, Docker, VPS, and Tauri production separately.
- Keep `.gitmodules` out of standalone repo unless intentional; no dependency may resolve through parent checkout.
- Preserve route compatibility and redirects for existing SEO URLs before changing host/path ownership.
- Verify `robots.txt`, sitemaps, feeds, canonical URLs, Open Graph assets, favicon, and analytics still point to intended production host.
- Check case-sensitive paths on Linux; macOS local filesystem may hide filename/path casing mistakes.
- Check clean checkout build, not only copied working tree; generated files and ignored files must be reproducible.
- Check concurrent SSR bug-report writes, SQLite locking, container restart, and remote API duplicate reports.

### 6. Desktop, iOS, and Tauri targets — copy for future parity

Leptos website currently has Tauri wrapper files. Keep them in migration scope so web, desktop, and mobile can share same Leptos app:

```text
src-tauri/**
__DisableContentInsetAdjustment.m
__HideKeyboardAccessory.m
.taurignore
.github/workflows/desktop-release-all.yml
```

`src-tauri/**` includes Tauri code, configs, generated Apple project files, Android/iOS assets, icons, entitlements, and offline resources. Exclude only build output (`target/**`, `node_modules/**`).

Platform scripts stay in source parent for now; do not move them:

```text
parent desktop/iOS deployment and generation scripts
```

They may later receive a separate adapter/config update for `leptos-ui`. Never copy certificates, provisioning profiles, private keys, or secret values. Tauri must remain optional; it must not block SSR/hydrate builds.

Do not copy secrets or machine state:

```text
.env
.env.*                         # copy only sanitized `.env.example` if created
bug_reports.db
target/**
node_modules/**
```

## Explicit exclusions

Do not copy these paths in first migration:

```text
dioxus-ui/**
crates/_starters/**
crates/ui-cli/**                    # optional tooling; not website runtime
X__TMP/**
specs/**
```

Keep parent-only deployment, setup, desktop/iOS scripts, and internal research/assets outside this repository.

Inside `crates/icons`, Dioxus modules may remain because crate currently shares source:

```text
crates/icons/src/dioxus/**
crates/icons/src/dioxus_animated/**
```

They must not become website runtime dependencies. Verify feature graph before removing them.

## Manifest rewrite

In copied `leptos-ui/Cargo.toml`:

1. Create workspace for `app`, `server`, `app_crates/*`, and selected local crates.
2. Change every parent-relative path to local path.
3. Keep Leptos versions/features aligned with current working website.
4. Keep `dioxus-ui`, `src-tauri`, and starter projects outside workspace.
5. Preserve `[workspace.metadata.leptos]` settings, especially:
   - `lib-package = "app"`
   - `bin-package = "server"`
   - `site-root = "target/site"`
   - `assets-dir = "public"`
   - `tailwind-input-file = "style/tailwind.css"`

Expected local workspace members:

```toml
members = [
  "app",
  "server",
  "app_crates/*",
  "crates/leptos_ui",
  "crates/autoform",
  "crates/_markdown_crate",
  "crates/icons",
  "crates/tw_merge/tw_merge",
  "crates/tw_merge/tw_merge_variants",
]
```

## Copy order

1. Root build files.
2. Local dependency crates.
3. `app_crates`.
4. `app`.
5. `server`.
6. `style`, `public`, `e2e`.
7. Deployment files and production workflow.
8. Rewrite manifests and path dependencies.
9. Rewrite Docker, CI/CD, Nginx, VPS, and domain references.
10. Remove parent-only references.
11. Build, run, containerize, and smoke-test from `leptos-ui`.

## Required checks

Run from `leptos-ui`:

```bash
cargo metadata --no-deps
cargo check --workspace
cargo check -p app --features hydrate
cargo check -p server --features ssr
cargo leptos build
pnpm exec playwright test
```

Then verify:

```text
/                         home loads
/docs                     docs loads
/components               component registry loads
/hooks                    hooks registry loads
/blocks                   blocks load
/charts                   charts load
/icons                    icons load
/create                   theme/customizer page loads
```

## Definition of done

- `leptos-ui` contains complete Leptos website copy.
- Parent `RUST-UI` files unchanged.
- No dependency resolves through `../RUST-UI`.
- No Dioxus/Tauri package enters Leptos website workspace.
- SSR and hydrate builds pass.
- Website runs from `leptos-ui` root.
- Migration commits stay inside `leptos-ui` repository until parent submodule pointer is intentionally updated.

## Exhaustive inventory command

Use this command to print every source file selected by this plan before copying:

```bash
find app server app_crates crates/leptos_ui crates/icons crates/_markdown_crate crates/autoform crates/tw_merge style public e2e -type f \
  ! -path '*/.git/*' \
  ! -path '*/target/*' \
  ! -path '*/node_modules/*' \
  ! -path 'crates/icons/src/dioxus/*' \
  ! -path 'crates/icons/src/dioxus_animated/*' \
  | sort
```

This output is the exact initial file inventory for sections 1–3, excluding dormant Dioxus icon adapters. Add `crates/_markdown_config/**` if `cargo metadata` or registry imports require it. Deployment inventory is the exact list in section 4/5. Root files are the explicit list in section 4.

## Repository identity and governance

`rust-ui/ui` is source of truth for repository-level policy and documentation. Copy/adapt these files into `leptos-ui`:

```text
CLAUDE.md
CONTRIBUTING.md
LICENSE
README.md
README_WINDOWS.md
SECURITY.md                         # copy/adapt from source repository policy
_typos.toml
.gitattributes
.gitignore
.dockerignore
.mcp.json
clippy.toml
leptosfmt.toml
rustfmt.toml
rust-toolchain.toml
justfile
```

Copy GitHub automation selectively:

```text
.github/scripts/triage.py
.github/workflows/cleanup-worktree.yml
.github/workflows/codspeed.yml
.github/workflows/issue-triage.yml
.github/workflows/prod-vps.yml
.github/workflows/semver.yml
```

Exclude Dioxus/Tauri-only automation:

```text
.github/workflows/desktop-release-all.yml
```

Do not copy parent `.gitmodules` unchanged. New repository must not depend on `dioxus-ui`. Add only intentional future submodules. Rewrite all copied docs/config references from `rust-ui/ui` to `rust-ui/leptos-ui` where repository identity matters; keep historical links only when explicitly marked historical.

Governance checks:

- `LICENSE` remains authoritative and unchanged unless explicitly decided.
- `CONTRIBUTING.md`, `CLAUDE.md`, `SECURITY.md`, and `README.md` describe `leptos-ui`, not parent workspace or Dioxus app.
- CI badges, clone URLs, issue URLs, package links, deployment repository, and branch names point to `rust-ui/leptos-ui`.
- No secrets, local DB, build output, nested `.git`, or parent-only submodule metadata enter new repository.
