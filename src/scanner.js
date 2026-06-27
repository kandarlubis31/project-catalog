const fs = require('fs');
const path = require('path');

// Files that indicate a project root
const PROJECT_MARKERS = [
    'package.json', 'requirements.txt', 'composer.json', 'pubspec.yaml',
    'build.gradle', 'build.gradle.kts', 'Cargo.toml', 'go.mod',
    'Gemfile', 'mix.exs', 'pom.xml', 'CMakeLists.txt',
    'Makefile', 'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
    'astro.config.mjs', 'astro.config.mjs',
    'next.config.js', 'next.config.ts', 'next.config.mjs',
    'nuxt.config.js', 'nuxt.config.ts',
    'vite.config.js', 'vite.config.ts', 'vite.config.mjs',
    'angular.json', 'svelte.config.js',
    'pyproject.toml', 'setup.py', 'setup.cfg',
    'app.py', 'main.py', 'manage.py', 'server.js', 'index.js',
    'artisan', 'spark',
    'index.html', // single page sites
];

// Files to skip when walking
const SKIP_DIRS = new Set([
    'node_modules', '.git', '__pycache__', '.venv', 'venv', 'env',
    'dist', 'build', '.next', '.nuxt', '.output', 'coverage',
    '.cache', '.parcel-cache', '.turbo', '.yarn',
    'vendor', 'composer', '.composer',
    'target', 'bin', 'obj',
    'Pods', '.gradle', '.idea', '.vscode',
    '.angular', '.svelte-kit',
    'android', 'ios', // skip native builds
    '.wwebjs_auth', '.wwebjs_cache', // WhatsApp sessions
]);

// Tech stack detection patterns
const STACK_PATTERNS = {
    'Node.js': ['package.json'],
    'TypeScript': ['tsconfig.json'],
    'React': ['package.json'], // checked further in content
    'Next.js': ['next.config.js', 'next.config.ts', 'next.config.mjs'],
    'Vue.js': ['vue.config.js', 'nuxt.config.js', 'nuxt.config.ts'],
    'Nuxt.js': ['nuxt.config.js', 'nuxt.config.ts'],
    'Svelte': ['svelte.config.js', 'svelte.config.ts'],
    'Astro': ['astro.config.mjs', 'astro.config.js', 'astro.config.ts'],
    'Vite': ['vite.config.js', 'vite.config.ts', 'vite.config.mjs'],
    'Python': ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'],
    'Django': ['manage.py'],
    'Flask': ['app.py', 'main.py'],
    'FastAPI': ['main.py'],
    'PHP': ['composer.json', 'artisan', 'index.php'],
    'Laravel': ['artisan'],
    'CodeIgniter': ['spark'],
    'Java': ['build.gradle', 'build.gradle.kts', 'pom.xml'],
    'Kotlin': ['build.gradle.kts'],
    'Flutter': ['pubspec.yaml'],
    'Dart': ['pubspec.yaml'],
    'Go': ['go.mod'],
    'Rust': ['Cargo.toml'],
    'Ruby': ['Gemfile'],
    'Docker': ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'],
    'SQLite': [], // detected from file presence
    'Prisma': [], // detected from file presence
    'Tailwind CSS': [], // detected from config
    'Vitest': ['vitest.config.js', 'vitest.config.ts'],
    'Jest': ['jest.config.js', 'jest.config.ts', 'jest.config.mjs'],
    'Playwright': ['playwright.config.js', 'playwright.config.ts'],
};

function detectStack(dirPath) {
    const stack = [];
    const files = getFiles(dirPath);

    // Basic detection from config files
    for (const [tech, markers] of Object.entries(STACK_PATTERNS)) {
        if (markers.some(m => files.includes(m))) {
            stack.push(tech);
        }
    }

    // package.json deep inspection
    const pkgPath = path.join(dirPath, 'package.json');
    if (files.includes('package.json')) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            if (deps.react) stack.push('React');
            if (deps.vue) stack.push('Vue.js');
            if (deps.svelte) stack.push('Svelte');
            if (deps.angular || deps['@angular/core']) stack.push('Angular');
            if (deps.express) stack.push('Express');
            if (deps.nestjs || deps['@nestjs/core']) stack.push('NestJS');
            if (deps.next) stack.push('Next.js');
            if (deps.nuxt) stack.push('Nuxt.js');
            if (deps.astro) stack.push('Astro');
            if (deps.tailwindcss) stack.push('Tailwind CSS');
            if (deps.prisma || deps['@prisma/client']) stack.push('Prisma');
            if (deps.vitest) stack.push('Vitest');
            if (deps.jest || deps['@jest/core']) stack.push('Jest');
            if (deps.typescript || deps['ts-node']) {
                if (!stack.includes('TypeScript')) stack.push('TypeScript');
            }
            if (deps.sqlite3 || deps.betterSqlite3 || deps.sql.js) stack.push('SQLite');
            if (deps.pg) stack.push('PostgreSQL');
            if (deps.mysql2 || deps.mysql) stack.push('MySQL');
            if (deps.mongoose) stack.push('MongoDB');
            if (deps.redis) stack.push('Redis');
            if (deps.socket.io || deps.ws) stack.push('WebSocket');
            if (deps.puppeteer) stack.push('Puppeteer');
            if (deps.cypress) stack.push('Cypress');
            if (deps.playwright) stack.push('Playwright');
            if (deps.ink) stack.push('Ink');
            if (deps.reactNative || deps['react-native']) stack.push('React Native');
            if (deps.expo) stack.push('Expo');
            if (deps['whatsapp-web.js'] || deps['@whiskeysockets/baileys']) stack.push('WhatsApp.js');

            // Remove duplicates
            const seen = new Set();
            for (let i = stack.length - 1; i >= 0; i--) {
                if (seen.has(stack[i])) stack.splice(i, 1);
                else seen.add(stack[i]);
            }
        } catch (e) { /* skip invalid json */ }
    }

    // requirements.txt inspection
    const reqPath = path.join(dirPath, 'requirements.txt');
    if (files.includes('requirements.txt')) {
        try {
            const reqs = fs.readFileSync(reqPath, 'utf8').toLowerCase();
            if (reqs.includes('django')) stack.push('Django');
            if (reqs.includes('flask')) stack.push('Flask');
            if (reqs.includes('fastapi')) stack.push('FastAPI');
            if (reqs.includes('sqlalchemy')) stack.push('SQLAlchemy');
            if (reqs.includes('selenium')) stack.push('Selenium');
            if (reqs.includes('puppeteer')) stack.push('Puppeteer');
            if (reqs.includes('pyinstaller')) stack.push('PyInstaller');
            if (reqs.includes('kivy')) stack.push('Kivy');
            if (reqs.includes('dlib')) stack.push('dlib');
        } catch (e) { /* skip */ }
    }

    // composer.json inspection
    const compPath = path.join(dirPath, 'composer.json');
    if (files.includes('composer.json')) {
        try {
            const comp = JSON.parse(fs.readFileSync(compPath, 'utf8'));
            const allDeps = { ...comp.require, ...comp['require-dev'] };
            if (allDeps['laravel/framework']) stack.push('Laravel');
            if (allDeps['codeigniter4/framework']) stack.push('CodeIgniter 4');
            if (allDeps['livewire/livewire']) stack.push('Livewire');
            if (allDeps['laravel/jetstream']) stack.push('Jetstream');
            if (allDeps['laravel/sanctum']) stack.push('Sanctum');
            if (allDeps['laravel/fortify']) stack.push('Fortify');
        } catch (e) { /* skip */ }
    }

    // pubspec.yaml inspection
    if (files.includes('pubspec.yaml')) {
        try {
            const pub = fs.readFileSync(path.join(dirPath, 'pubspec.yaml'), 'utf8');
            if (pub.includes('flutter')) stack.push('Flutter');
            if (pub.includes('capacitor')) stack.push('Capacitor');
        } catch (e) { /* skip */ }
    }

    // Detect SQLite from file presence
    if (files.some(f => f.endsWith('.db') || f.endsWith('.sqlite') || f.endsWith('.sqlite3'))) {
        if (!stack.includes('SQLite')) stack.push('SQLite');
    }

    // Deduplicate
    return [...new Set(stack)];
}

function getFiles(dirPath) {
    try {
        return fs.readdirSync(dirPath);
    } catch (e) {
        if (e.code === 'EACCES') return []; // skip permission errors
        return [];
    }
}

function getSubDirs(dirPath) {
    try {
        return fs.readdirSync(dirPath).filter(f => {
            try {
                const stat = fs.statSync(path.join(dirPath, f));
                return stat.isDirectory() && !SKIP_DIRS.has(f) && !f.startsWith('.');
            } catch (e) {
                return false;
            }
        });
    } catch (e) {
        return [];
    }
}

function getProjectName(dirPath) {
    const name = path.basename(dirPath);

    // Try to get name from package.json
    const pkgPath = path.join(dirPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (pkg.name && pkg.name !== name.toLowerCase().replace(/\s+/g, '-')) {
                return pkg.name;
            }
        } catch (e) { /* skip */ }
    }

    // Try composer.json
    const compPath = path.join(dirPath, 'composer.json');
    if (fs.existsSync(compPath)) {
        try {
            const comp = JSON.parse(fs.readFileSync(compPath, 'utf8'));
            if (comp.name) return comp.name;
        } catch (e) { /* skip */ }
    }

    return name;
}

function getProjectDescription(dirPath) {
    // Try package.json description
    const pkgPath = path.join(dirPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (pkg.description) return pkg.description;
        } catch (e) { /* skip */ }
    }

    // Try README
    const readmePath = path.join(dirPath, 'README.md');
    if (fs.existsSync(readmePath)) {
        try {
            const content = fs.readFileSync(readmePath, 'utf8');
            // Get first non-empty, non-heading line
            const lines = content.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!') && !trimmed.startsWith('<')) {
                    return trimmed.substring(0, 200);
                }
            }
        } catch (e) { /* skip */ }
    }

    return '';
}

function classifyProject(dirPath, stack) {
    const hasMobile = stack.includes('Flutter') || stack.includes('React Native') || stack.includes('Kivy') || stack.includes('Capacitor') || stack.includes('Expo');
    const hasDesktop = stack.includes('PyInstaller') || stack.includes('PyQt') || stack.includes('Kivy');
    const hasCLI = stack.includes('Ink');
    const hasAPI = stack.includes('NestJS') || stack.includes('FastAPI');
    const hasFrontend = stack.includes('React') || stack.includes('Next.js') || stack.includes('Vue.js') || stack.includes('Astro') || stack.includes('Svelte');
    const hasBackend = stack.includes('Express') || stack.includes('Django') || stack.includes('Laravel') || stack.includes('Flask') || stack.includes('CodeIgniter 4');

    if (hasMobile) return 'mobile';
    if (hasDesktop) return 'desktop';
    if (hasCLI) return 'cli';
    if (hasAPI && !hasFrontend) return 'api';
    return 'web';
}

function extractFeatures(dirPath, stack) {
    const features = [];

    // Check for common feature indicators
    const files = getFiles(dirPath);

    if (files.includes('docker-compose.yml') || files.includes('docker-compose.yaml')) features.push('Docker');
    if (files.some(f => f.includes('.test.') || f.includes('.spec.'))) features.push('Tests');
    if (files.includes('vitest.config.js') || files.includes('vitest.config.ts')) features.push('Vitest');
    if (files.includes('playwright.config.js') || files.includes('playwright.config.ts')) features.push('E2E Tests');
    if (files.includes('eslint.config.js') || files.includes('.eslintrc.json') || files.includes('.eslintrc.js')) features.push('ESLint');
    if (files.includes('postcss.config.js') || files.includes('postcss.config.mjs')) features.push('PostCSS');
    if (files.some(f => f.includes('sw.js') || f.includes('service-worker'))) features.push('PWA');
    if (files.some(f => f.includes('manifest.json'))) features.push('PWA');
    if (files.some(f => f === 'prisma' || f === 'schema.prisma')) features.push('Prisma');
    if (files.some(f => f.includes('.env'))) features.push('Env config');

    // Check for common directories
    const dirs = getSubDirs(dirPath);
    if (dirs.includes('tests') || dirs.includes('test') || dirs.includes('__tests__')) features.push('Tests');
    if (dirs.includes('docs')) features.push('Documentation');
    if (dirs.includes('.github')) features.push('CI/CD');
    if (dirs.includes('src')) features.push('Source code');
    if (dirs.includes('app')) features.push('App structure');
    if (dirs.includes('pages')) features.push('Pages');
    if (dirs.includes('components')) features.push('Components');

    return [...new Set(features)].slice(0, 6);
}

function isProjectRoot(dirPath) {
    const files = getFiles(dirPath);
    return PROJECT_MARKERS.some(marker => files.includes(marker));
}

function scanDirectory(rootDir, maxDepth = 3, currentDepth = 0) {
    const projects = [];

    if (currentDepth > maxDepth) return projects;

    const entries = getFiles(rootDir);
    const subDirs = getSubDirs(rootDir);

    // Check if current directory is a project
    if (isProjectRoot(rootDir)) {
        const stack = detectStack(rootDir);
        const name = getProjectName(rootDir);
        const description = getProjectDescription(rootDir);
        const features = extractFeatures(rootDir, stack);
        const type = classifyProject(rootDir, stack);
        const relativePath = path.relative(path.resolve('.'), rootDir);

        projects.push({
            name,
            category: path.basename(rootDir),
            path: relativePath + '/',
            stack,
            description,
            features,
            type,
            notable: false,
        });

        // Don't recurse into project roots (they are leaf nodes)
        return projects;
    }

    // Otherwise, recurse into subdirectories
    for (const subDir of subDirs) {
        const subPath = path.join(rootDir, subDir);
        const subProjects = scanDirectory(subPath, maxDepth, currentDepth + 1);
        projects.push(...subProjects);
    }

    return projects;
}

module.exports = { scanDirectory };
