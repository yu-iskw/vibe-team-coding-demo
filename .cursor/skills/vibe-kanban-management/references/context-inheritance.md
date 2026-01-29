# Context Inheritance Guide

This guide explains how to structure parent and child tasks to enable effective context inheritance in the Vibe Kanban distributed agent memory system.

## Overview

Context inheritance allows subtasks to understand the "why" (architectural decisions, constraints, goals) from parent tasks while having specific "what" (detailed instructions) in their own descriptions. This enables independent agent execution with shared understanding.

## Principles

1. **Parent Tasks Store Context**: High-level architectural decisions, constraints, goals, and rationale
2. **Subtasks Inherit Context**: Reference or summarize parent context relevant to their work
3. **Subtasks Add Specificity**: Provide detailed instructions, acceptance criteria, and test plans
4. **Context Aggregation**: Workers combine parent context + subtask plan + related tasks = full understanding

## Parent Task Structure

Parent tasks should focus on **Context** rather than implementation details.

### Required Context Sections

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
```

### Example: Parent Task

```markdown
# Implement Distributed Tracing with OpenTelemetry

## Context

### Goals

- Enable end-to-end request tracing across microservices
- Provide observability for debugging production issues
- Support performance optimization through trace analysis

### Architectural Decisions

- **OpenTelemetry**: Chosen for vendor-neutral instrumentation and wide ecosystem support
- **OTLP Protocol**: Using OpenTelemetry Protocol for trace export (not vendor-specific formats)
- **Sampling Strategy**: 100% sampling in dev/staging, 10% in production (configurable)
- **Trace Context Propagation**: Using W3C Trace Context headers for inter-service communication

### Constraints

- Must not impact request latency (tracing overhead < 1ms per request)
- Must integrate with existing logging infrastructure
- Must support both gRPC and HTTP services
- Must be compatible with current deployment pipeline

### Related Systems

- **Logging Service**: Traces will be correlated with existing logs
- **Monitoring Dashboard**: Traces will be visualized alongside metrics
- **API Gateway**: Must propagate trace context headers
- **Service Mesh**: May integrate with Istio for automatic trace context propagation

## Plan

### Phase 1: Research & Design

- Research OpenTelemetry best practices
- Design trace context propagation strategy
- Document architecture decisions

### Phase 2: Core Implementation

- Implement OTLP exporter
- Add instrumentation to core services
- Configure sampling

### Phase 3: Integration

- Integrate with logging service
- Connect to monitoring dashboard
- Update API gateway

### Phase 4: Testing & Documentation

- End-to-end trace verification
- Performance testing
- Documentation updates

## Related Tasks

- [Will be populated with subtasks]
```

## Subtask Structure

Subtasks should reference parent and provide detailed, actionable instructions.

### Required Sections

```markdown
Parent Task: #[parent_id]

## Context

[Brief summary of inherited context relevant to this subtask]

## Plan

[Detailed instructions, acceptance criteria, test plan]
```

### Example: Subtask

```markdown
# [Research] OpenTelemetry Best Practices

Parent Task: #123

## Context

Inherited from parent:

- **Goal**: Enable distributed tracing for microservices
- **Architectural Decision**: Using OpenTelemetry with OTLP protocol
- **Constraint**: Must not impact latency (< 1ms overhead)
- **Related System**: Must integrate with existing logging service

## Plan

### Objective

Research and document OpenTelemetry best practices for Go microservices, focusing on:

- Instrumentation patterns
- Trace context propagation
- Performance optimization
- Integration with existing observability stack

### Acceptance Criteria

- [ ] Document with 5+ OpenTelemetry best practices for Go
- [ ] Identify recommended instrumentation libraries
- [ ] Document trace context propagation patterns
- [ ] Provide performance benchmarks/guidelines
- [ ] Create integration guide for logging service

### Test Plan

- Review documentation for completeness
- Verify all best practices are actionable
- Check that performance guidelines are specific

### Dependencies

- None (can run in parallel with other research tasks)

## Related Tasks

- Parent: Task #123
- Sibling: Task #125 (Design trace context propagation strategy)

## Execution Log

[Updated during work]
```

## Context Inheritance Patterns

### Pattern 1: Full Context Inheritance

**When**: Subtask needs full architectural context

**Approach**: Reference parent and summarize key points

```markdown
Parent Task: #123

## Context

Inherited from parent task #123:

- **Architectural Decision**: [Key decision relevant to this subtask]
- **Constraint**: [Constraint that affects this work]
- **Related System**: [System this subtask interacts with]

[Additional context specific to this subtask]
```

### Pattern 2: Selective Context Inheritance

**When**: Subtask only needs specific aspects of parent context

**Approach**: Extract only relevant context points

```markdown
Parent Task: #123

## Context

Key context points from parent:

- **Performance Constraint**: Must maintain < 1ms overhead (affects implementation approach)
- **Integration Point**: Must work with logging service (affects API design)

[Subtask-specific context]
```

### Pattern 3: Context Extension

**When**: Subtask discovers new context during execution

**Approach**: Document new context in execution log, update parent if significant

```markdown
## Execution Log

### 2026-01-29 14:30

- Discovered that OpenTelemetry SDK requires Go 1.21+
- **New Constraint**: Must upgrade Go version before implementation
- Updated parent task #123 with this constraint
```

## Best Practices

### For Parent Tasks

1. **Rich Context**: Provide comprehensive architectural context that subtasks will need
2. **Clear Rationale**: Explain "why" decisions were made, not just "what"
3. **Explicit Constraints**: List all limitations and requirements clearly
4. **Related Systems**: Document all integration points and dependencies
5. **High-Level Plan**: Outline phases, not implementation details

### For Subtasks

1. **Always Reference Parent**: Include `Parent Task: #[id]` at the top
2. **Inherit Relevant Context**: Summarize or reference parent context that affects this work
3. **Detailed Instructions**: Provide specific, actionable steps
4. **Clear Criteria**: Define unambiguous acceptance criteria
5. **Test Plans**: Include specific verification steps

### For Workers

1. **Read Parent First**: Always fetch and read parent task before starting work
2. **Aggregate Context**: Combine parent context + subtask plan + related tasks
3. **Maintain Context**: Update execution logs with decisions and discoveries
4. **Propagate Changes**: If you discover new constraints, update parent task

## Examples

### Example 1: Simple Inheritance

**Parent**: "Implement user authentication"

- Context: OAuth2 flow, JWT tokens, session management

**Subtask**: "Implement OAuth2 provider integration"

- Inherits: OAuth2 flow decision, JWT token format
- Adds: Specific provider (Google), API endpoints, error handling

### Example 2: Complex Inheritance

**Parent**: "Migrate to microservices architecture"

- Context: Domain boundaries, communication patterns, data consistency strategy

**Subtask**: "Extract User Service"

- Inherits: Domain boundaries, communication patterns (gRPC), consistency strategy (eventual)
- Adds: Specific service boundaries, API contracts, migration plan

## Common Pitfalls

1. **Missing Parent Reference**: Subtasks without parent reference lose architectural context
2. **Too Much Context in Subtask**: Don't duplicate parent context verbatim, summarize
3. **Too Little Context in Parent**: Parent tasks need rich context for inheritance to work
4. **Ignoring Related Tasks**: Workers should check related tasks for dependencies
5. **Not Updating Context**: If constraints change, update parent task

## References

- See [task-description-template.md](task-description-template.md) for template structures
- See `docs/spec/agent_design.md` for agent reading patterns
