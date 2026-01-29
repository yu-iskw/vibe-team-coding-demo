# Task Description Template

This document defines the standardized structure for Vibe Kanban task descriptions to enable distributed agent memory and context inheritance.

## Purpose

Task descriptions serve as the primary context repository for agents. They enable:

- Context inheritance from parent to child tasks
- Independent agent understanding of work scope
- Parallel execution with shared context awareness
- Agent memory across sessions

## Standard Sections

All task descriptions should include these sections (as applicable):

### Required Sections

1. **`## Context`** - Architectural decisions, constraints, goals, rationale
   - **Parent Tasks**: Rich context with full architectural decisions
   - **Subtasks**: Brief summary or reference to parent context

2. **`## Plan`** - Detailed instructions, acceptance criteria, test plans
   - **Parent Tasks**: High-level breakdown into phases
   - **Subtasks**: Detailed instructions for specific work

3. **`## Execution Log`** - Progress tracking and completion summary
   - Updated by workers during execution
   - Maintains context for future agents

4. **`## Related Tasks`** - Links to related work
   - Parent/child relationships
   - Dependencies
   - Related features

## Parent Task Template

```markdown
## Context

### Goals

[What we're trying to achieve - the "why" behind this work]

### Architectural Decisions

[Key technical choices and rationale - what approach we're taking and why]

### Constraints

[Limitations, requirements, dependencies - what we must work within]

### Related Systems

[Components this work affects or depends on - integration points]

## Plan

[High-level breakdown into phases and milestones]

### Phase 1: [Phase Name]

- Objective: [What this phase accomplishes]
- Subtasks: [List of subtasks or reference to created subtasks]

### Phase 2: [Phase Name]

...

## Related Tasks

- Subtask #123: [Description of relationship]
- Related Feature #456: [Description of relationship]
- Depends on: Task #789

## Execution Log

[Updated as work progresses]
```

## Subtask Template

```markdown
Parent Task: #[parent_task_id]

## Context

[Brief summary of inherited context from parent, or reference to parent task]

Key Context Points:

- [Architectural decision relevant to this subtask]
- [Constraint that affects this work]
- [Related system this subtask interacts with]

## Plan

### Objective

[What this specific subtask accomplishes]

### Acceptance Criteria

- [ ] Criterion 1: [Specific, verifiable outcome]
- [ ] Criterion 2: [Specific, verifiable outcome]
- [ ] Criterion 3: [Specific, verifiable outcome]

### Test Plan

[How to verify completion]

- Command: `[test command]`
- Expected Output: [What success looks like]
- Test Cases: [Specific scenarios to test]

### Dependencies

- Blocks: [What this task blocks]
- Blocked by: [What blocks this task]
- Related: [Tasks that should be aware of this work]

## Related Tasks

- Parent: Task #[parent_id]
- Sibling: Task #[sibling_id] (parallel work)
- Depends on: Task #[dependency_id]

## Execution Log

### [Timestamp]

- [Progress update]
- [Test results]
- [Issues encountered]

### [Timestamp]

- [Next milestone]
- [Status update]
```

## Usage Guidelines

### For Parent Tasks

- **Focus on Context**: Provide rich architectural context that subtasks will inherit
- **High-Level Plan**: Outline phases and milestones, not implementation details
- **Link Subtasks**: Reference or list all subtasks created from this parent

### For Subtasks

- **Reference Parent**: Always include `Parent Task: #[id]` at the top
- **Inherit Context**: Summarize or reference parent context relevant to this subtask
- **Detailed Plan**: Provide specific, actionable instructions for the worker
- **Clear Criteria**: Define unambiguous acceptance criteria

### For Execution Logs

- **Regular Updates**: Log progress at meaningful milestones
- **Context Preservation**: Include decisions made during execution
- **Test Results**: Document test outcomes and verification status
- **Issues & Solutions**: Record problems encountered and how they were resolved

## Examples

### 1. Rich Parent Task Context

When creating parent tasks, focus on providing enough context for subagents to understand the architectural boundaries.

```markdown
## Context

### Goals

Enable end-to-end request tracing for debugging production issues.

### Architectural Decisions

- **OpenTelemetry**: Vendor-neutral, wide ecosystem support
- **OTLP Protocol**: Standard protocol, not vendor-specific
- **Sampling**: 10% in production (configurable)

### Constraints

- Must not impact latency (< 1ms overhead)
- Must integrate with existing logging service
- Must support gRPC and HTTP

### Related Systems

- **Logging Service**: Traces correlated with logs
- **Monitoring Dashboard**: Traces visualized with metrics
```

### 2. Standard Subtask

See `.cursor/skills/vibe-kanban-management/references/context-inheritance.md` for detailed examples of effective context inheritance patterns.
