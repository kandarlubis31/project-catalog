# project-catalog

Scan any directory, detect tech stacks automatically, and generate a beautiful interactive HTML dashboard + Markdown catalog of all your projects.

## Quick Start

```bash
npx project-catalog scan .
```

This will scan the current directory, detect all projects and their tech stacks, and generate:
- `PROJECTS-CATALOG.md` — Markdown catalog of all projects
- `projects-dashboard.html` — Interactive HTML dashboard with search, filter, and sort

## Install Globally

```bash
npm install -g project-catalog
project-catalog scan ./my-projects
```

## Commands

| Command | Description |
|---------|-------------|
| `project-catalog scan <dir>` | Scan directory and generate catalog + dashboard |
| `project-catalog scan <dir> --md-only` | Generate only the Markdown catalog |
| `project-catalog scan <dir> --html-only` | Generate only the HTML dashboard |
| `project-catalog scan <dir> --output <path>` | Custom output directory |

## How It Works

1. Walks the target directory recursively
2. Detects tech stacks by reading `package.json`, `requirements.txt`, `composer.json`, `pubspec.yaml`, `build.gradle`, etc.
3. Extracts project names, descriptions, and directory structure
4. Generates a polished HTML dashboard with search, filter, sort, and keyboard shortcuts
5. Generates a comprehensive Markdown catalog

## Features

- Automatic tech stack detection (Node.js, Python, PHP, Java, Flutter, Go, Rust, etc.)
- Interactive HTML dashboard with search, category filters, type filters, and sorting
- Markdown catalog for documentation
- Keyboard shortcuts (`/` to search, `Esc` to clear)
- Notable project highlighting
- Zero dependencies — runs with just Node.js

## Example

```bash
# Scan a folder
npx project-catalog scan ~/Desktop/projects

# Output:
# ✓ Scanned 42 projects across 8 categories
# → PROJECTS-CATALOG.md
# → projects-dashboard.html
```

## License

MIT
