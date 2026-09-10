#!/usr/bin/env bash
#
# Production deploy for rust-ui/leptos-ui.
#
# Serves rust-ui.com + www.rust-ui.com + leptos.rust-ui.com (one container,
# leptos-ui-app-1, 127.0.0.1:4002 on the shared server).
#
# Runs the full local gate (typos, fmt, clippy, semver, audit, tests), tags the
# commit, then triggers .github/workflows/prod-vps.yml which builds
# everlabs/leptos-ui:latest and redeploys via docker-compose.shared-server.yml.
#
#   ./deploy_prod.sh                          full build + deploy
#   gh workflow run prod-vps.yml -f skip_build=true   redeploy current :latest
#
cd "$(dirname "$0")"

set -e

echo "🔒 Pre-flight checks..."
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Must be on main branch (currently on '$BRANCH')"
  exit 1
fi
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Uncommitted changes detected — commit or stash before deploying"
  exit 1
fi
echo "✅ On main, working tree clean"

echo "🔍 Checking for typos..."
typos --config _typos.toml .
echo "✅ No typos found"

echo "🎨 Formatting..."
cargo fmt --all
sleep 2
leptosfmt $(find . -name "*.rs" ! -path "./target/*")
if ! git diff --quiet; then
  echo "📝 Formatting changes detected, committing..."
  git add -A
  git commit -m "fmt: auto-format before deploy"
  git push origin main
fi
echo "✅ Formatting OK"

echo "📎 Running clippy..."
(cd crates/tw_merge && cargo clippy --all-features -- -D warnings)
(cd crates/tw_merge/tw_merge_variants && cargo clippy --all-features -- -D warnings)
echo "✅ Clippy OK"

echo "🔎 Checking semver compatibility..."
if ! command -v cargo-semver-checks &> /dev/null; then
  cargo binstall -y cargo-semver-checks
fi
(cd crates/tw_merge && cargo semver-checks)
echo "✅ No semver violations"

echo "🔒 Security audit..."
cargo audit
echo "✅ No vulnerabilities found"

echo "🧪 Running tests..."
cargo nextest run
echo "✅ All tests passed"

TAG_NAME="deploy_$(date +'%Y/%m/%d_%Hh%Mm%Ss')"

echo "Creating tag: $TAG_NAME"
git tag $TAG_NAME

echo "Pushing tag to origin..."
git push origin $TAG_NAME

echo "Triggering deployment workflow..."
gh workflow run prod-vps.yml --repo rust-ui/leptos-ui

echo "✅ Deploy tag created and workflow triggered!"
echo "Tag: $TAG_NAME"
