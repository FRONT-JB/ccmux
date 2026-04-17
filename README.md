# ccmux

Claude Code Multiplexer — TUI 분할 창에서 여러 Claude Code 인스턴스를 관리합니다.

여러 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 세션을 나란히 실행하기 위해 만들어진 가벼운 터미널 멀티플렉서입니다.

![ccmux screenshot](screenshot.png)

## 기능

- **다중 창 터미널** — 세로/가로 분할, 독립적인 PTY 셸 실행
- **탭 워크스페이스** — 여러 프로젝트 탭, 클릭으로 전환
- **파일 트리 사이드바** — 아이콘 표시, 디렉터리 펼침/접기
- **문법 강조 미리보기** — 언어별 색상으로 파일 내용 표시
- **Claude Code 감지** — Claude Code 실행 중일 때 창 테두리가 주황색으로 변경
- **cd 추적** — 디렉터리 이동 시 파일 트리와 탭 이름 자동 업데이트
- **마우스 지원** — 클릭으로 포커스, 테두리 드래그로 크기 조정, 히스토리 스크롤
- **스크롤백** — 창당 터미널 히스토리 10,000줄
- **다크 테마** — Claude 영감의 색상 구성
- **크로스 플랫폼** — Windows, macOS, Linux
- **단일 바이너리** — ~1MB, 런타임 의존성 없음

## 설치

### npm으로 설치 (권장)

```bash
npm install -g ccmux-cli
```

### 바이너리 다운로드

[Releases](https://github.com/Shin-sibainu/ccmux/releases)에서 최신 바이너리를 다운로드하세요:

| 플랫폼 | 파일 |
|--------|------|
| Windows (x64) | `ccmux-windows-x64.exe` |
| macOS (Apple Silicon) | `ccmux-macos-arm64` |
| macOS (Intel) | `ccmux-macos-x64` |
| Linux (x64) | `ccmux-linux-x64` |

> **Windows:** 바이너리가 코드 서명되지 않아 Microsoft Defender SmartScreen 경고가 표시될 수 있습니다. "추가 정보" → "실행"을 클릭하여 진행하세요. 서명되지 않은 오픈소스 소프트웨어에서는 정상적인 동작입니다.

> **macOS/Linux:** 다운로드 후 실행 권한을 부여하세요: `chmod +x ccmux-*`

### 소스에서 빌드

```bash
git clone https://github.com/Shin-sibainu/ccmux.git
cd ccmux
cargo build --release
# 바이너리 위치: target/release/ccmux (Windows는 ccmux.exe)
```

[Rust](https://rustup.rs/) 툴체인이 필요합니다.

## 사용법

```bash
ccmux
```

어느 디렉터리에서든 실행하면 됩니다. 파일 트리는 현재 작업 디렉터리를 표시합니다.

## 키 바인딩

### 창 모드 (기본)

| 키 | 동작 |
|----|------|
| `Ctrl+D` | 가로 분할 |
| `Ctrl+E` | 세로 분할 |
| `Ctrl+W` | 창 / 탭 닫기 |
| `Alt+T` / `Ctrl+T` | 새 탭 |
| `Alt+1..9` | N번 탭으로 이동 |
| `Alt+Left/Right` | 이전 / 다음 탭 |
| `Alt+R` | 탭 이름 변경 (세션 한정) |
| `Alt+S` | 상태바 토글 |
| `Ctrl+F` | 파일 트리 토글 |
| `Ctrl+P` | 미리보기/터미널 레이아웃 교체 |
| `Ctrl+Right/Left` | 포커스 순환 (사이드바, 미리보기, 창) |
| `Ctrl+Q` | 종료 |

### 파일 트리 모드 (`Ctrl+F` 이후)

| 키 | 동작 |
|----|------|
| `j` / `k` | 선택 이동 |
| `Enter` | 파일 열기 / 디렉터리 펼치기 |
| `.` | 숨김 파일 토글 |
| `Esc` | 창으로 돌아가기 |

### 미리보기 모드 (미리보기에 포커스 후)

| 키 | 동작 |
|----|------|
| `j` / `k` | 세로 스크롤 |
| `h` / `l` | 가로 스크롤 |
| `Ctrl+W` | 미리보기 닫기 |
| `Esc` | 창으로 돌아가기 |

### 마우스

| 동작 | 효과 |
|------|------|
| 창 클릭 | 포커스 이동 |
| 탭 클릭 | 탭 전환 |
| 탭 더블클릭 | 탭 이름 변경 |
| `+` 클릭 | 새 탭 |
| 테두리 드래그 | 패널 크기 조정 |
| 스크롤 휠 | 파일 트리 / 미리보기 / 터미널 히스토리 스크롤 |

## 아키텍처

```
src/
├── main.rs       # 진입점, 이벤트 루프, 패닉 훅
├── app.rs        # 워크스페이스/탭 상태, 레이아웃 트리, 키/마우스 처리
├── pane.rs       # PTY 관리, vt100 에뮬레이션, 셸 감지
├── ui.rs         # ratatui 렌더링, 테마, 레이아웃
├── filetree.rs   # 파일 트리 스캔, 네비게이션
└── preview.rs    # 문법 강조 파일 미리보기
```

**주요 설계 결정:**
- `vt100` 크레이트로 터미널 에뮬레이션 (ANSI 스트리핑이 아님) — Claude Code의 인터랙티브 UI에 필요
- 가변 비율로 재귀 창 분할을 위한 이진 트리 레이아웃
- 메인 이벤트 루프에 mpsc 채널로 연결된 창별 PTY 리더 스레드
- 자동 cd 추적을 위한 OSC 7 감지
- 유휴 시 CPU 사용 최소화를 위한 더티 플래그 렌더링

## 기술 스택

- [ratatui](https://ratatui.rs/) + [crossterm](https://github.com/crossterm-rs/crossterm) — TUI 프레임워크
- [portable-pty](https://github.com/nickelc/portable-pty) — PTY 추상화 (Windows에서는 ConPTY)
- [vt100](https://crates.io/crates/vt100) — 터미널 에뮬레이션
- [syntect](https://github.com/trishume/syntect) — 문법 강조

## Claude Code 더 알아보기

Claude Code가 처음이신가요? [Claude Code Academy](https://claude-code-academy.dev)에서 튜토리얼과 가이드를 확인해보세요.

## 라이선스

MIT
