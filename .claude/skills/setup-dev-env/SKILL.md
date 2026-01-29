---
name: setup-dev-env
description: Set up the development environment for the project. Use when starting work on the project, when dependencies are out of sync, or to fix environment setup failures.
---

# Setup Development Environment

This skill automates the process of setting up the development environment to ensure all tools and dependencies are correctly installed and configured.

## Workflow Checklist

- [ ] **Step 1: Environment Validation**
  - [ ] Check Node.js version against `.node-version`
  - [ ] Check for `trunk` installation
- [ ] **Step 2: Dependency Installation**
  - [ ] Run `pnpm install`
- [ ] **Step 3: Tooling Setup**
  - [ ] Run `trunk install` to fetch managed linters and formatters
- [ ] **Step 4: Workflow Tooling**
  - [ ] Check for `changie` (Changelog management)
  - [ ] Check for `adr-tools` (ADR management)
  - [ ] Verify `vibe-kanban` accessibility

## Detailed Instructions

### 1. Environment Validation

#### Node.js Version

Read the `.node-version` file in the workspace root. Ensure the current Node.js environment matches this version. If there's a mismatch, inform the user to switch Node versions (e.g., using `nvm` or `fnm`).

#### Trunk CLI

Check if `trunk` is installed by running `trunk --version`.
If `trunk` is not found, advise the user to install it. On macOS, use:

```bash
brew install trunk-io
```

For other platforms, refer to the [Trunk installation documentation](https://docs.trunk.io/references/cli/getting-started/install).

### 2. Dependency Installation

Run the following command at the workspace root to install all project dependencies. Refer to [../common-references/pnpm-commands.md](../common-references/pnpm-commands.md) for more pnpm commands.

```bash
pnpm install
```

### 3. Tooling Setup

Trunk manages linters and formatters hermetically. Run the following command to ensure all required tools are downloaded and ready. Refer to [../common-references/trunk-commands.md](../common-references/trunk-commands.md) for more Trunk commands.

```bash
trunk install
```

### 4. Workflow Tooling

This project relies on several tools for workflow management. If you use Homebrew, you can install the necessary binaries in one command:

```bash
brew install changie adr-tools
```

#### Changie

`changie` is used for managing changelog fragments. Check if it's installed:

```bash
changie --version
```

If not using Homebrew, follow the [Changie installation guide](https://changie.dev/docs/installation/).

#### ADR-Tools

`adr-tools` is used for managing Architecture Decision Records. Check if it's installed:

```bash
adr help
```

If not using Homebrew, follow the [adr-tools installation guide](https://github.com/npryce/adr-tools).

#### Vibe Kanban

`vibe-kanban` is used for task tracking. You can launch the server process using the project script:

```bash
pnpm vibe-kanban:server
```

This will run `npx vibe-kanban start`.

## Success Criteria

- All `pnpm` dependencies are installed successfully.
- `trunk` is installed and all managed tools are initialized.
- `changie` and `adr-tools` are available in the shell.
- `vibe-kanban` server can be started.
- The Node.js version matches the requirement in `.node-version`.

## Post-Setup Verification

To ensure the environment is fully operational:

1. **Invoke Verifier**: Run the `verifier` subagent ([../../agents/verifier.md](../../agents/verifier.md)). This confirms that the freshly installed dependencies allow for a successful build, pass lint checks, and satisfy all unit tests.
2. **Handle Failure**: If the `verifier` fails, follow its reporting to resolve environment-specific issues.
