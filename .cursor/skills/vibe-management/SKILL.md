---
name: vibe-management
description: Sync verified plans to Vibe Kanban, manage board state, and coordinate task assignment for parallel execution.
---

# Vibe Management Skill

This skill bridges the gap between verified planning documents and the Vibe Kanban board. It translates plans into actionable tickets and manages the board state to enable parallel agent execution.

## When to Use

- After a plan has been verified by the user (from `agent-planning` skill).
- To convert a markdown plan file into Vibe Kanban tickets.
- To manage task dependencies and assign work to specialized agents.
- To groom the backlog, prioritize tasks, or check board status.

## Instructions

### 1. Context Discovery

Before creating or managing tasks, identify the correct project and repository context.

1. Call `list_projects` to find the relevant `project_id`.
2. Call `list_repos` with the `project_id` to identify the `repo_id`s involved in the project.
3. Use `get_repo` to inspect repository automation scripts if needed.

### 2. Plan Synchronization (Board Setup)

Translate a verified markdown plan (`.cursor/plans/*.md`) into a hierarchical structure on the Vibe board. This pattern ensures distributed agent memory via context inheritance.

1. **Locate Plan**: Identify the target plan file created by the `agent-planning` skill.
2. **Create Parent Task**: Use `create_task` for the high-level feature.
   - **Title**: Use the feature name (e.g., `Implement BigQuery Sink`).
   - **Description**: Follow the **Parent Task Template** in [`references/task-description-template.md`](references/task-description-template.md).
   - **Critical**: Include the full `## Context` section from the plan.
3. **Create Subtasks**: For each atomic task in the plan, create a linked ticket.
   - **Title**: Format as `[Phase] <Task Name>` (e.g., `[Discovery] Research API limits`).
   - **Description**: Follow the **Subtask Template** in [`references/task-description-template.md`](references/task-description-template.md).
   - **Linking**: Always include the `Parent Task: #[id]` reference at the top.
   - **Inheritance**: Summarize key context points from the parent relevant to this specific task.
4. **Link Relationships**: After all tasks are created, update the Parent Task's "Related Tasks" section with the IDs of all subtasks.

#### Workflow Rule: Plan-First

Never create tickets manually without a verified plan unless the work is trivial (single, simple task). The plan is the source of truth for the board structure.

### 3. Dependency Management

When creating tickets, explicitly document dependencies in task descriptions:

- **Parent/Child Relationships**: Always include `Parent Task: #[id]` in subtask descriptions.
- **Sequential Dependencies**: Use explicit references in "Related Tasks" section (e.g., "Depends on: Task #123").
- **Parallel Opportunities**: Tag tasks that can run in parallel (e.g., `[parallel]`, `[frontend]`, `[backend]`).
- **Context Inheritance**: Ensure subtasks reference or summarize parent context relevant to their work.

**Note**: If Vibe Kanban supports native subtasks via MCP tools, use those relationships. Otherwise, use description-based linking with the `Parent Task: #[id]` convention.

### 4. Task Assignment & Tagging

Prepare tasks for parallel execution by assigning them to specialized agents or tagging them:

- **Tagging**: Use task descriptions to tag work (e.g., `[frontend]`, `[backend]`, `[testing]`, `[documentation]`).
- **Status Management**: Use `update_task` to move tasks through states as they're picked up:
  - `todo`: Ready for work
  - `inprogress`: Assigned and active
  - `inreview`: Awaiting review
  - `done`: Completed
  - `cancelled`: No longer needed

### 5. Board Grooming

Maintain board health by:

- **Listing Tasks**: Use `list_tasks` with `project_id` and optional `status` filters to see current workload.
- **Refinement**: Use `get_task` to read full details and `update_task` to refine descriptions or priorities.
- **Cleanup**: Use `delete_task` for tasks that are no longer relevant (with user confirmation).

### 6. Infrastructure & Script Management

If a task or plan requires specific environment setup (e.g., custom dependencies, dev servers), manage repository scripts:

1. **Inspect Scripts**: Use `get_repo` to see existing setup, cleanup, or dev server scripts.
2. **Update Scripts**: Use `update_setup_script`, `update_cleanup_script`, or `update_dev_server_script` to adjust the infrastructure for the project.
   - This is particularly useful for ensuring the codebase is "QA-ready" (e.g., adding seed data or test environment setup).

## Workflow Integration

This skill works in sequence with other skills:

1. **Input**: Verified plan from `agent-planning` skill (`.cursor/plans/*.md`).
2. **Output**: Populated Vibe Kanban board with tickets ready for execution.
3. **Handoff**: Tasks are then picked up by `vibe-execution` skill for implementation.

## References

- See [references/hierarchy.md](references/hierarchy.md) for an explanation of how Projects, Repos, and Tasks relate.
- See [references/task-description-template.md](references/task-description-template.md) for standardized task description structure.
- See [references/context-inheritance.md](references/context-inheritance.md) for context inheritance patterns.
- See [references/mcp-tools.md](references/mcp-tools.md) for complete MCP tool documentation.
- See `.cursor/agents/vibe-orchestrator.md` for orchestration patterns.
