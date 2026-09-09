# Contributing

Thanks for your interest in contributing to Rust/UI. Please take a moment to review this before submitting your first pull request.

## About this repository

This is a monorepo for the Rust/UI component registry, built with Leptos and Tailwind CSS. Support for the Dioxus framework is planned for the future.

```
app/                    # Leptos app (shell, routing)
app_crates/
└── registry/
    └── src/
        ├── ui/         # Component source (Button, Input, etc.)
        └── demos/      # Demo/showcase components
crates/                 # Supporting crates (tw_merge, icons, ui-cli, ...)
public/
├── docs/               # MDX documentation files
└── registry/           # Auto-generated registry (do not edit manually)
```

## Development

### Clone and install

```bash
git clone git@github.com:rust-ui/ui.git rust-ui
cd rust-ui
pnpm install
cargo install --locked cargo-leptos
```

### Run the dev server

```bash
cargo leptos watch
```

### Format

Always run both formatters before committing:

```bash
cargo fmt && leptosfmt **/*.rs
```

## Scope of contributions

The main focus of contributions is:

- **Bug fixes** — incorrect behavior, broken styles, rendering issues
- **Cross-platform compatibility** — ensuring components work correctly across:
  - OS: Windows, macOS, Linux
  - Targets: Web, Desktop, iOS, Android

If you'd like to propose a new component, please [open a discussion](https://github.com/rust-ui/ui/discussions) — we're happy to talk about it.

## Commit convention

Follow the `category(scope): message` format:

| Category | When to use |
|----------|-------------|
| `feat` | New component or feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `refactor` | Code change that isn't a fix or feature |
| `build` | Build system or dependency changes |
| `test` | Adding or updating tests |
| `ci` | CI configuration changes |
| `chore` | Everything else |

**Example:** `feat(button): add loading state with spinner`

## Pull requests

1. Fork the repo and create a branch: `git checkout -b feat/my-component`
2. Make your changes following the steps above
3. Ensure `cargo fmt && leptosfmt **/*.rs` passes
4. Open a pull request with a clear description of what changed and why

## Bug reports

If you encounter a bug, please [open an issue](https://github.com/rust-ui/ui/issues).

## Need help?

Feel free to reach out on [LinkedIn](https://www.linkedin.com/in/max-wells-rs).
