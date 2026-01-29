# Vibe Kanban MCP Tools Reference

This document provides a comprehensive overview of the MCP tools available in the `vibe_kanban` server. These tools facilitate project management, task tracking, and repository configuration.

---

## 1. Project Management

### `list_projects`

Lists all available projects.

- **Arguments**: None (Empty object).
- **Purpose**: Retrieve the list of project IDs and metadata to use with other tools.

---

## 2. Task Management

### `create_task`

Creates a new task/ticket in a specific project.

- **Required Arguments**:
  - `project_id` (UUID): The ID of the project to create the task in.
  - `title` (string): The title of the task.
- **Optional Arguments**:
  - `description` (string, nullable): Optional description of the task.

### `get_task`

Retrieves detailed information about a specific task.

- **Required Arguments**:
  - `task_id` (UUID): The ID of the task to retrieve.
- **Purpose**: Fetch details like the task description, status, and associated metadata.

### `list_tasks`

Lists tasks in a project with optional filtering.

- **Required Arguments**:
  - `project_id` (UUID): The ID of the project to list tasks from.
- **Optional Arguments**:
  - `status` (string, nullable): Filter by 'todo', 'inprogress', 'inreview', 'done', or 'cancelled'.
  - `limit` (integer, default 50): Maximum number of tasks to return.

### `update_task`

Updates an existing task's title, description, or status.

- **Required Arguments**:
  - `task_id` (UUID): The ID of the task to update.
- **Optional Arguments**:
  - `title` (string, nullable): New title for the task.
  - `description` (string, nullable): New description for the task.
  - `status` (string, nullable): New status ('todo', 'inprogress', 'inreview', 'done', 'cancelled').

### `delete_task`

Deletes a specific task.

- **Required Arguments**:
  - `task_id` (UUID): The ID of the task to delete.

---

## 3. Repository Management

### `list_repos`

Lists all repositories associated with a project.

- **Required Arguments**:
  - `project_id` (UUID): The ID of the project.

### `get_repo`

Retrieves detailed information about a repository, including its scripts.

- **Required Arguments**:
  - `repo_id` (UUID): The ID of the repository.

### `update_setup_script`

Updates the setup script for a repository.

- **Required Arguments**:
  - `repo_id` (UUID): The ID of the repository.
  - `script` (string): The new setup script content (empty string to clear).

### `update_dev_server_script`

Updates the development server script for a repository.

- **Required Arguments**:
  - `repo_id` (UUID): The ID of the repository.
  - `script` (string): The new dev server script content (empty string to clear).

### `update_cleanup_script`

Updates the cleanup script for a repository.

- **Required Arguments**:
  - `repo_id` (UUID): The ID of the repository.
  - `script` (string): The new cleanup script content (empty string to clear).
