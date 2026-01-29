# 5. Testing Stack for Collaborative Canvas Application

Date: 2026-01-29

## Status

Accepted

## Context

VibeCanvas is a collaborative spatial graph editor using CRDT-based state management (Yjs) and high-performance canvas rendering (Konva.js). The application requires a multi-layered testing approach to verify:

1. **Collaborative State Synchronization**: Yjs document convergence and awareness protocol correctness
2. **Canvas Rendering**: Visual output matches the underlying state
3. **Vue Component Behavior**: UI controls and state mutations work correctly
4. **End-to-End Collaboration**: Real browser synchronization and multi-user interaction

The tech stack specification ([docs/spec/tech_stack.md](../spec/tech_stack.md)) mandates Vitest, @vue/test-utils, Playwright, and y-protocols for testing. The system design ([docs/spec/system_design.md](../spec/system_design.md)) shows complex data flows between Yjs state and Konva rendering that must be verified.

Current testing infrastructure is minimal: root Vitest config exists but frontend package lacks testing dependencies.

## Decision

We will implement a multi-layered testing stack:

- **Unit/CRDT Layer**: Vitest for logic testing and CRDT convergence verification using in-memory Y.Doc instances
- **Component Layer**: @vue/test-utils with JSDOM for Vue component testing (mount, props, emits)
- **E2E Layer**: Playwright for browser-based collaborative flow validation
- **Integration**: Single Vitest runner at workspace root supporting both common and frontend packages

Testing philosophy follows [.cursor/rules/unit-test-manners.mdc](../../.cursor/rules/unit-test-manners.mdc): pure functions, decoupled logic, no mocks for external I/O where possible.

## Consequences

### Positive

- **Fast Feedback**: Vitest provides sub-second unit test execution
- **Confidence in Collaboration**: CRDT convergence tests catch race conditions before they affect users
- **Visual Verification**: Playwright validates canvas rendering matches state
- **Maintainable**: Pure functions and decoupled design make tests reliable and easy to maintain

### Negative

- **Setup Complexity**: Multiple testing frameworks require careful configuration
- **CI Overhead**: Playwright browser installation increases CI build time
- **Skill Requirements**: Team needs knowledge of Vitest, Vue testing, and Playwright

### Risks

- **False Confidence**: Unit tests may pass while E2E reveals integration issues
- **Flaky Tests**: Canvas rendering tests may be sensitive to timing or visual differences
- **Maintenance Burden**: Three testing layers increase ongoing maintenance effort

### Mitigation

- **Layered Confidence**: Unit tests catch logic errors, E2E validates integration
- **Visual Regression**: Playwright snapshots with appropriate thresholds
- **CI Optimization**: Parallel test execution and selective browser testing
