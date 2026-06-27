<p align="center">
  <img src="https://img.shields.io/npm/v/kandar-project-catalog?color=blue&logo=npm&label=kandar-project-catalog" alt="npm version">
  <img src="https://img.shields.io/npm/dm/kandar-project-catalog?color=blue&logo=npm" alt="npm downloads">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg" alt="Node.js">
</p>

<h1 align="center">project-catalog</h1>
<p align="center">
  Scan any directory, detect tech stacks automatically, and generate a beautiful interactive HTML dashboard + Markdown catalog of all your projects.
</p>

---

## Quick Start

```bash
npx kandar-project-catalog scan .
```

This will scan the current directory, detect all projects and their tech stacks, and generate:
- `PROJECTS-CATALOG.md` — Markdown catalog of all projects
- `projects-dashboard.html` — Interactive HTML dashboard with search, filter, and sort

## Install Globally

```bash
npm install -g kandar-project-catalog
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
npx kandar-project-catalog scan ~/Desktop/projects

# Output:
#   Scanning: /Users/you/Desktop/projects
#   Found 42 projects across 8 categories
#   Detected 15 technologies
#   -> /Users/you/Desktop/projects/PROJECTS-CATALOG.md
#   -> /Users/you/Desktop/projects/projects-dashboard.html
```

## Tech Stack Detection

| Config File | Detected Stack |
|-------------|----------------|
| `package.json` | Node.js, React, Next.js, Vue, Express, NestJS, etc. |
| `requirements.txt` | Python, Django, Flask, FastAPI, etc. |
| `composer.json` | PHP, Laravel, CodeIgniter, Livewire, etc. |
| `pubspec.yaml` | Flutter, Dart |
| `build.gradle` | Java, Kotlin |
| `Dockerfile` | Docker |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `Gemfile` | Ruby |
| `tsconfig.json` | TypeScript |
| `vite.config.*` | Vite |
| `tailwind.config.*` | Tailwind CSS |
| `prisma/schema.prisma` | Prisma |

## License

MIT

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/kandarlubis31">Kandar Lubis</a>
</p>
