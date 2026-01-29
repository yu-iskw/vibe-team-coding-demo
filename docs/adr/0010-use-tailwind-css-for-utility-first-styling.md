# 10. Use Tailwind CSS for Utility-First Styling

Date: 2026-01-29

## Status

Accepted

## Context

VibeCanvas requires a modern, responsive, and highly customizable UI for its toolbars, panels, and canvas overlays. Traditional CSS or CSS-in-JS often leads to large stylesheets, naming conflicts, and maintenance difficulties in complex frontend applications. We need a styling solution that promotes consistency, speed of development, and high performance.

## Decision

We have chosen **Tailwind CSS** (specifically version ^4.1.18) as our primary styling framework.

Key reasons for this decision:

- **Utility-First Workflow**: Allows for rapid UI prototyping and development directly in the template files without switching between CSS and HTML/Vue files.
- **Design System Consistency**: By using a predefined set of utility classes, we ensure that colors, spacing, and typography remain consistent across the entire application.
- **Performance**: Tailwind's JIT (Just-In-Time) engine ensures that only the CSS actually used in the project is generated, keeping the final bundle size minimal.
- **Customizability**: Easily extensible via the `tailwind.config.js` or via CSS variables in newer versions (v4), allowing us to define project-specific tokens.

## Consequences

- **Faster Development**: Building complex UI components becomes significantly faster once the utility-first mindset is adopted.
- **Maintenance**: No more searching for "where this class is defined" or worrying about global scope pollution.
- **Learning Curve**: Developers unfamiliar with Tailwind need to learn its class naming conventions, though these are largely intuitive based on CSS properties.
- **HTML Verbosity**: Vue templates may become verbose with many utility classes, which can be mitigated by extracting reusable components.
