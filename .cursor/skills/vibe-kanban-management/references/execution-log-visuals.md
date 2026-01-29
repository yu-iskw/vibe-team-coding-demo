# Execution Log Visuals

This document provides templates and examples for visualizing task execution logs using Mermaid diagrams and status lists.

## 1. Task Execution Log Template

Use this format in `task_logs.md` or as part of the `## Execution Log` section in parent tasks.

### Execution Flow Example

```mermaid
graph TD
    Plan[Plan Created] --> Sync[Synced to Board]
    Sync --> Task1[Task 1: Worker A]
    Sync --> Task2[Task 2: Worker B]
    Task1 --> Done1[Task 1 Done]
    Task2 --> Done2[Task 2 Done]
    Done1 --> Task3[Task 3: Worker A]
    Done2 --> Task3
    Task3 --> Done3[All Complete]
```

### Status List Example

- **Task 1**: ✅ Done
- **Task 2**: ✅ Done
- **Task 3**: 🔄 In Progress

## 2. Usage Guidelines

- **Baseline**: Use the **Dependency Graph** from the plan as the baseline for the log's execution flow.
- **Updates**: Update the status icons (`✅`, `🔄`, `❌`, `todo`) as workers report progress.
- **Parallelization**: Clearly visualize which tasks are running in parallel vs. which are sequential.
