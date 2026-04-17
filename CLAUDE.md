# ccmux — Claude Code Multiplexer

## Overview
Rust TUI tool for managing multiple Claude Code instances in split panes.

## Tech Stack
- Rust (stable), ratatui + crossterm, portable-pty, vt100

## Build & Run
```bash
cargo build          # Debug build
cargo build --release # Release build
cargo test           # Run tests
cargo run            # Run the app
```

## Architecture
- `main.rs` — Entry point, terminal setup, event loop
- `app.rs` — App state, event dispatching, layout tree
- `pane.rs` — PTY management, vt100 terminal emulation, shell detection
- `ui.rs` — ratatui rendering, layout calculation, theme
- `filetree.rs` — File tree sidebar
- `preview.rs` — File preview panel

## Key Design Decisions
- **vt100 crate** for terminal emulation (not ANSI stripping) — needed for Claude Code's interactive UI
- **Binary tree layout** for recursive pane splitting
- **Per-PTY reader threads** with mpsc channel to main event loop
- PTY resize via both `master_pty.resize()` and `vt100_parser.set_size()`

## Shell Detection Priority
- Windows: Git Bash → PowerShell
- Unix: $SHELL → /bin/sh

## Release Process
1. `Cargo.toml` 와 `npm/package.json` 의 버전을 같은 값으로 맞춰 올린다
2. 커밋 & `git push origin master`
3. `git tag vX.Y.Z && git push origin vX.Y.Z`
4. CI (`.github/workflows/release.yml`) 가 자동으로 실행:
   - 4개 플랫폼 (Windows x64, macOS x64/arm64, Linux x64) 릴리즈 빌드
   - GitHub Release 생성 + checksums.txt 생성
   - npm publish (Trusted Publishing)
- **직접 `npm publish` 나 `gh release create` 하지 말 것** — 버전 충돌의 원인이 됨

## Workflow Rules
- **Every implementation must be reviewed by the evaluator agent** before reporting done. This is a Rust TUI app, so Playwright MCP is not available — the evaluator should perform static review (diff analysis, edge cases, logic correctness, key conflict checks, layout math consistency).
