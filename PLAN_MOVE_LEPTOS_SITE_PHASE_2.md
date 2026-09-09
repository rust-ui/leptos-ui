# Phase 2 — deploy from `leptos-ui`

Goal: deploy the current Leptos website directly from this repository. Parent repository remains untouched.

## Completed

- Production workflow runs from this repository checkout.
- Docker build context is this repository.
- All current local Cargo path dependencies are present before `cargo chef cook`.
- Production compose file is available here for VPS deployment.
- SQLite bug-report storage persists through container replacement via a named Docker volume.
- Existing image name, secrets, VPS endpoint, health check, and Nginx contract remain unchanged.

## Deployment contract

- Trigger: GitHub Actions `workflow_dispatch` on `main`.
- Build: Docker image tagged with commit SHA and `latest`.
- Deploy: copy compose config, pull image, recreate app container.
- Health: request `http://localhost:4001/` on VPS.
- Persistence: `/tmp/bug_reports.db` backed by Docker volume `bug_reports_data`.
- Rollback: redeploy a previously published SHA image by setting `APP_IMAGE` on VPS.

## Still deferred

- Remove temporary duplicated `app_crates/**` after the replacement structure is stable.
- Remove obsolete parent deployment wiring only after this repository deploy is proven in production.
- Separate or migrate shared production infrastructure ownership.
- Verify SQLite persistence after container recreation.
- Run and document rollback drill using a previously published SHA image.
- Validate Tauri web, desktop, iOS, and iPad behavior and assign ownership.

## Validation checklist

- [x] Configure `DOCKER_USERNAME` and `SERVER_IP` as Actions Variables.
- [x] Configure `DOCKER_TOKEN`, `RESEND_TOKEN`, `RESEND_AUDIENCE_ID`, `BUG_REPORTS_API_KEY`, and `SERVER_SSH_KEY` as Actions Secrets.
- [x] Run `cargo check --workspace`.
- [x] Run `cargo check --manifest-path src-tauri/Cargo.toml`.
- [x] Run `docker build -f Dockerfile .` or the GitHub build job.
- [x] Trigger workflow from this repository.
- [x] Confirm `/` health check and real domain traffic.
- [ ] Submit bug report, recreate container, confirm SQLite data remains.
- [ ] Run rollback drill using a previously published SHA image.
- [ ] Validate Tauri web, desktop, iOS, and iPad behavior.
- [ ] Confirm old parent deployment still unchanged until cutover decision.
