---
name: vibe-kanban-task-execution
description: Execute a specific Vibe Kanban task. Handles session start, coding, testing, and completion for single-task focused work.
---

# Vibe Execution Skill

This skill provides a streamlined workflow for executing a single Vibe Kanban task from start to finish. It focuses on the "Worker" role: head-down implementation of a fine-grained, atomic task.

## When to Use

- When you are assigned a specific `task_id` or asked to "start working on task X".
- When you need to execute a single, well-defined task from the board.
- During the "Implementation Loop" phase of the development workflow.

## Instructions

### 1. Task Discovery & Session Awareness

Before starting work, retrieve the task details and workspace context:

1. **Session Awareness**: If you are already running within a Vibe Kanban workspace session (e.g., as a coding agent started via `start_workspace_session`), call `get_context` first.
   - Use the returned metadata to instantly identify your `project_id`, `task_id`, and `repo_id`s.
   - This reduces token waste and redundant searches.
2. **Task Details**:
   - Use `get_task` with your `task_id` to retrieve full details.
   - Read the task description to understand:
     - Acceptance criteria
     - Test plan
     - Dependencies (if any)
     - Parent task reference (if subtask)
3. **Fallback Discovery**: If `get_context` is not available or more info is needed, use `list_projects` and `list_tasks` to find available work.

### 2. Context Aggregation

**CRITICAL**: Before starting execution, aggregate full context from parent tasks and related work.

1. **Read Current Task Description**: Parse structured sections (Context, Plan, Related Tasks).

2. **Read Parent Context** (if subtask):
   - Check task description for `Parent Task: #[id]` reference
   - Use `get_task` to fetch parent task details
   - Extract `## Context` section from parent task
   - Note: Parent context contains architectural decisions, constraints, goals, and rationale

3. **Check Related Tasks** for surrounding context:
   - Use `list_tasks` with same `project_id` to see all tasks in the project
   - Filter by status to understand project state:
     - `done`: Completed work that may affect your task
     - `inprogress`: Work happening in parallel
     - `todo`: Upcoming work that may depend on your task
   - Read descriptions of related tasks (from "Related Tasks" section) if needed
   - Understand dependencies and relationships

4. **Aggregate Context**:
   - **Full Context** = Parent Context (if exists) + Current Task Plan + Related Task Status
   - Use this aggregated context to understand:
     - Architectural decisions that guide your work
     - Constraints you must work within
     - Related systems you'll interact with
     - Dependencies and relationships
     - Overall project state

5. **Document Context Understanding**: Before starting, briefly note key context points that will guide your work.

### 3. Infrastructure Discovery

Identify the repository context and automation scripts:

1. **Repo Metadata**: If `get_context` was used, you already have the `repo_id`s. Otherwise, call `list_repos` with the `project_id` to identify the repositories involved.
2. **Environment Scripts**: Use `get_repo` to inspect setup, cleanup, and dev server scripts if environment configuration is required.

### 4. Start Execution

Begin working on the task:

1. **Update Status**: Use `update_task` to set status to `inprogress`.
2. **Start Session**: Call `start_workspace_session` with:
   - `task_id`: The task you're working on.
   - `executor`: The coding agent executor (e.g., `CURSOR_AGENT`, `CLAUDE_CODE`, `AMP`, `GEMINI`, `CODEX`, `OPENCODE`, `QWEN_CODE`, `COPILOT`, `DROID`). See [Supported Executors](https://vibekanban.com/docs/integrations/vibe-kanban-mcp-server#supported-executors) for the full list.
   - `repos`: An array of objects with `repo_id` and `base_branch` (usually `main` or `master`).

### 5. Implementation & Logging

During implementation, maintain traceability:

- **Progress Updates**: Use `update_task` to append execution logs to the task description. Format as `## Execution Log` with timestamps and milestones.
- **Status Transitions**: Update status as work progresses:
  - `inprogress`: Actively working
  - `inreview`: Ready for review (if applicable)

#### Example: Appending Execution Logs

```markdown
## Execution Log

### 2026-01-29 14:30

- Started implementation of validation logic.
- Ran `make test`: 2 tests failing (expected).

### 2026-01-29 15:00

- Fixed edge case in type validation.
- Ran `make test`: All tests passing.
- Linter checks: No violations.
```

### 6. Verification & Testing

Before marking complete, ensure quality:

1. **Run Tests**: Execute relevant test commands (e.g., `make test`).
2. **Lint Check**: Use `read_lints` or project-specific lint commands.
3. **Append Results**: Update the task description with test results and verification status.

### 7. Completion

Close the task loop:

1. **Record Change**: Use the `manage-changelog` skill to record the change fragment (feat, fix, etc.).
2. **Final Update**: Use `update_task` to:
   - Set status to `done` (or `inreview` if review is required).
   - Append final execution summary.
   - Include a link to the changelog fragment if created.

**IMPORTANT**: You **MUST** record the change fragment before moving the task to `done` or `inreview`.

## Single-Task Focus

This skill is designed for **atomic, single-task execution**. If a task reveals additional work:

- **Small Additions**: Update the current task description to include the new scope.
- **Large Additions**: Create a new task using `vibe-kanban-management` skill and link it in the current task description.
- **Dependencies**: Document dependencies in task descriptions and coordinate with `vibe-kanban-management` skill.

## Workflow Integration

This skill is part of the execution phase:

1. **Input**: A `task_id` from the Vibe Kanban board (created by `vibe-kanban-management` skill).
2. **Process**: Execute the task following the workflow above.
3. **Output**: Completed task with change fragment recorded.

## Context Reading Pattern

When executing a subtask, follow this pattern to aggregate full context:

1. **Read Subtask Description**: Parse structured sections
2. **Extract Parent Reference**: Look for `Parent Task: #[id]` in description
3. **Fetch Parent Task**: Use `get_task` with parent task ID
4. **Extract Parent Context**: Read `## Context` section from parent
5. **Merge Context**: Combine Parent Context + Subtask Plan = Full Understanding
6. **Check Related Tasks**: Use `list_tasks` to see surrounding state
7. **Begin Execution**: Start work with full context awareness

This pattern ensures you understand the "why" (from parent context) and the "what" (from subtask plan) before implementing.

## References

- See [references/hierarchy.md](references/hierarchy.md) for an explanation of how Projects, Repos, and Tasks relate.
- See `docs/spec/agent_design.md` for detailed context aggregation patterns.
- See [references/mcp-tools.md](references/mcp-tools.md) for complete MCP tool documentation.
- See `.cursor/rules/development_workflow.mdc` for the full lifecycle policy.
- See `.cursor/agents/vibe-worker.md` for subagent usage patterns.
