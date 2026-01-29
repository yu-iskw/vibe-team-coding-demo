# Task Delegation Guide

This guide defines the mechanics of delegating tasks from the **Orchestrator** to **Workers** within the Vibe Kanban system.

## 1. Task Identification

Before delegating, the Orchestrator must:

- Use `list_tasks` with `status='todo'` to find ready tasks.
- **Filter Dependencies**: Check for explicit dependencies (e.g., "Depends on: Task #123"). Only select tasks whose dependencies are marked as `done`.
- **Maximize Parallelism**: Prioritize tasks that can run simultaneously.

## 2. Delegation Handoff Format

When launching a `@vibe-worker`, use this explicit format:

```text
Execute task {task_id} using the vibe-kanban-task-execution skill with the {variant} variant.
Task context: {brief summary of acceptance criteria and constraints}
```

### 3. Delegation Examples

**Standard Feature**:

> "Execute task #42 using the vibe-kanban-task-execution skill with the YOLO variant. Task context: Implement user authentication endpoint with JWT validation."

**Bug Fix**:

> "Execute task #105 using the vibe-kanban-task-execution skill. Task context: Fix memory leak in the canvas rendering loop detected during stress tests."

## 4. Execution Variants

- **Default**: Worker requests permissions for all tool calls.
- **YOLO / DANGEROUSLY_SKIP_PERMISSIONS**: Worker executes tool calls without prompting. Use for trusted or straightforward implementation tasks to increase throughput.
