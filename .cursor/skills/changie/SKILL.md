---
name: changie
description: Manage changelogs using Changie. Provides tools to initialize, add change fragments, batch releases, and merge version notes.
---

# Changie Skill

This skill enables the agent to manage project changelogs efficiently using [Changie](https://github.com/miniscruff/changie). It supports the full lifecycle from initialization to release.

## When to Use

- When you need to initialize a changelog for a new project.
- When you want to record a change (feature, bug fix, etc.) after completing a task.
- When preparing for a new release and batching unreleased changes.
- When you want to automate changelog updates based on git history.

## Instructions

### 1. Initialization

If the project doesn't have `changie` set up, run the initialization script:

```bash
.cursor/skills/changie/scripts/init-changie.sh
```

This will create `.changie.yaml` with a standard configuration and set up the `.changes/` directory.

- **Note**: Use the script above to ensure the project uses the standard configuration from `assets/dot-changie.yaml`. Use `changie init` only if you need a fresh, interactive setup with default Changie settings.

### 2. Adding Changes

To add a new change fragment:

```bash
changie new --kind <kind> --body "<description>"
```

- **Important**: In CI or non-interactive mode (when `--interactive=false`), both `--kind` (`-k`) and `--body` (`-b`) are **required**. The command will fail if they are omitted.
- **Valid kinds** (from `.changie.yaml`): `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`.
- **Dry run**: Use `changie new --kind <kind> --body "<description>" --dry-run` to print the fragment to stdout without writing it to disk.

Alternatively, use the helper script to create a fragment from the last commit:

```bash
.cursor/skills/changie/scripts/add-from-last-commit.sh
```

### 3. Batching a Release

When you are ready to create a new version:

```bash
# Preview the next version (requires argument: major|minor|patch|auto)
changie next auto

# Batch unreleased changes into a version (requires argument: version|major|minor|patch|auto)
changie batch auto
```

- **Note**: Both `next` and `batch` require a version argument. Use `auto` to let Changie determine the next version based on the change fragments.
- **Dry run**: Use `changie batch auto --dry-run` to see what changes would be batched.

### 4. Merging into CHANGELOG.md

To update the main `CHANGELOG.md` file:

```bash
changie merge
```

- **Include Unreleased**: Use `changie merge --include-unreleased "Unreleased"` to include unreleased fragments in the merged output.

### 5. Utility Commands

- **Latest Version**: `changie latest` echoes the latest release version number.
- **Diff Versions**: `changie diff <version1>...<version2>` outputs release notes between two versions.

## Best Practices

- **Atomic Changes**: Add a change fragment immediately after completing a relevant task or commit.
- **Clear Descriptions**: Ensure the body of the change is descriptive enough for end-users.
- **Kind Selection**: Use `feat` for new features, `fix` for bug fixes, and `chore` for maintenance tasks.
- **Non-interactive Mode**: When calling `changie` from scripts or CI, always provide all required flags (like `--kind` and `--body` for `new`) to avoid failures.
- **CI/CD Integration**: `changie` is designed to be used in CI/CD pipelines for automated releases.

## Reference

For full flags and subcommand details, see [references/changie-cli-help.md](references/changie-cli-help.md).
