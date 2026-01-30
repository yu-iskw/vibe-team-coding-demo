# vibe-team-coding-demo

A demo project for Vibe team coding capabilities, demonstrating scalable AI engineering with multi-agent orchestration.

---

## Beyond the Prompt: Scaling AI Engineering

This repository showcases a professional AI development workflow that moves beyond single-agent "cowboy coding." We implement an **AI Swarm**—a hierarchical multi-agent system governed by engineering hygiene and scalable project management.

### Key Concepts

- **Strategic Orchestration**: The `vibe-orchestrator` manages high-level planning and architectural decisions (ADRs).
- **Tactical Execution**: Parallel `vibe-worker` agents handle implementation in isolated **Git Worktrees**.
- **Neuro-Sync Point**: The **Vibe Kanban Board** acts as the source of truth, synchronizing human intent with agent execution via the **MCP Server**.
- **Engineering Hygiene**: Automated **ADRs** and **Changelogs** prevent technical debt and ensure long-term maintainability.

Read the full story:

- [English Article: Beyond the Prompt](./docs/articles/medium_blog.md)
- [Japanese Article: プロンプトの先へ](./docs/articles/medium_blog.ja.md)

---

## Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/)
- Node.js (see `.node-version`)
- [Trunk](https://trunk.io/) (for linting and formatting)

### Installation

#### Install Trunk

On macOS, you can install Trunk using Homebrew:

```bash
brew install trunk-io
```

For other platforms, see the [Trunk installation guide](https://docs.trunk.io/references/cli/getting-started/install).

#### Install Dependencies

```bash
pnpm install
trunk install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Linting & Formatting

```bash
pnpm lint
pnpm format
```

---

## Project Structure

- `packages/`: Monorepo packages
  - `common/`: Shared utilities and types
  - `frontend/`: Vue 3 application
  - `backend/`: Node.js/tsoa application
- `docs/`: Documentation and assets
  - `adr/`: Architecture Decision Records (ADRs)
  - `articles/`: Technical articles and blogs
- `.cursor/`: Cursor-specific agent rules and skills
  - `rules/`: Standard Operating Procedures (SOPs) for AI agents
  - `skills/`: Specialized capabilities (ADR management, Changelogs, etc.)

## License

Apache-2.0
