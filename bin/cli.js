#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { scanDirectory } = require('../src/scanner');
const { generateHTML } = require('../src/html-generator');
const { generateMD } = require('../src/md-generator');

const VERSION = '1.0.0';

function printHelp() {
    console.log(`
  project-catalog v${VERSION}

  Usage:
    project-catalog scan <directory>       Scan and generate catalog + dashboard
    project-catalog scan <dir> --md-only   Generate only Markdown catalog
    project-catalog scan <dir> --html-only Generate only HTML dashboard
    project-catalog scan <dir> --output <path>  Custom output directory
    project-catalog --help                 Show this help
    project-catalog --version              Show version

  Examples:
    project-catalog scan .
    project-catalog scan ~/projects
    project-catalog scan ./src --output ./docs
`);
}

function parseArgs(args) {
    const result = { dir: null, mdOnly: false, htmlOnly: false, output: null };

    for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--help' || arg === '-h') { printHelp(); process.exit(0); }
        if (arg === '--version' || arg === '-v') { console.log(VERSION); process.exit(0); }
        if (arg === '--md-only') { result.mdOnly = true; continue; }
        if (arg === '--html-only') { result.htmlOnly = true; continue; }
        if (arg === '--output' || arg === '-o') { result.output = args[++i]; continue; }
        if (!arg.startsWith('-')) { result.dir = arg; }
    }

    if (!result.dir) {
        console.error('Error: No directory specified.\n');
        printHelp();
        process.exit(1);
    }

    return result;
}

function main() {
    const opts = parseArgs(process.argv);
    const targetDir = path.resolve(opts.dir);
    const outDir = opts.output ? path.resolve(opts.output) : targetDir;

    if (!fs.existsSync(targetDir)) {
        console.error(`Error: Directory not found: ${targetDir}`);
        process.exit(1);
    }

    console.log(`\n  Scanning: ${targetDir}\n`);

    const projects = scanDirectory(targetDir);

    if (projects.length === 0) {
        console.log('  No projects found in this directory.');
        process.exit(0);
    }

    // Count categories and tech stacks
    const categories = [...new Set(projects.map(p => p.category))];
    const techSet = new Set();
    projects.forEach(p => p.stack.forEach(t => techSet.add(t)));

    console.log(`  Found ${projects.length} projects across ${categories.length} categories`);
    console.log(`  Detected ${techSet.size} technologies\n`);

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    if (!opts.htmlOnly) {
        const mdPath = path.join(outDir, 'PROJECTS-CATALOG.md');
        fs.writeFileSync(mdPath, generateMD(projects, targetDir));
        console.log(`  -> ${mdPath}`);
    }

    if (!opts.mdOnly) {
        const htmlPath = path.join(outDir, 'projects-dashboard.html');
        fs.writeFileSync(htmlPath, generateHTML(projects, targetDir));
        console.log(`  -> ${htmlPath}`);
    }

    console.log(`\n  Done! ${projects.length} projects cataloged.\n`);
}

main();
