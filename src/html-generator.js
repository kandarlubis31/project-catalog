const path = require('path');

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// JS-safe escaping for data injected into <script> tags
function jsEsc(s) {
    return String(s)
        .replace(/\\/g, '\\\\')   // backslash first
        .replace(/"/g, '\\"')      // double quote
        .replace(/\n/g, '\\n')       // newline
        .replace(/\r/g, '\\r')       // carriage return
        .replace(/</g, '\x3c')        // prevent </script>
        .replace(/>/g, '\x3e');        // angle brackets
}

function getTagClass(stack) {
    const first = (stack[0] || '').toLowerCase();
    if (first.includes('type') || first.includes('node') || first.includes('astro') || first.includes('next')) return 'tag-ts';
    if (first.includes('python') || first.includes('django') || first.includes('flask')) return 'tag-py';
    if (first.includes('php') || first.includes('laravel') || first.includes('code')) return 'tag-php';
    if (first.includes('react') || first.includes('vue') || first.includes('svelte')) return 'tag-frontend';
    return 'tag-default';
}

function generateHTML(projects, rootDir) {
    const categories = [...new Set(projects.map(p => p.category))];
    const techSet = new Set();
    projects.forEach(p => p.stack.forEach(t => techSet.add(t)));

    const projectData = projects.map(p => {
        const features = p.features.join(', ') || 'N/A';
        return `    {n:"${jsEsc(p.name)}",c:"${jsEsc(p.category)}",p:"${jsEsc(p.path)}",s:${JSON.stringify(p.stack).replace(/</g, '\x3c')},t:"${getTagClass(p.stack)}",d:"${jsEsc(p.description || 'No description')}",f:"${jsEsc(features)}",type:"${p.type}"${p.notable ? ',notable:true' : ''}}`;
    }).join(',\n');

    const rootName = path.basename(rootDir);
    const rootPath = path.resolve(rootDir);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Catalog</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #05050a;
            --bg-elevated: #0a0a12;
            --surface: #0f0f1a;
            --surface-raised: #15152a;
            --surface-hover: #1a1a35;
            --border: rgba(255,255,255,0.06);
            --border-bright: rgba(255,255,255,0.1);
            --text: #f0f0f5;
            --text-secondary: #9090a8;
            --text-muted: #5a5a72;
            --accent: #8b5cf6;
            --accent-glow: rgba(139,92,246,0.15);
            --accent-border: rgba(139,92,246,0.3);
            --green: #10b981;
            --green-bg: rgba(16,185,129,0.1);
            --blue: #3b82f6;
            --blue-bg: rgba(59,130,246,0.1);
            --rose: #f43f5e;
            --rose-bg: rgba(244,63,94,0.1);
            --cyan: #06b6d4;
            --cyan-bg: rgba(6,182,212,0.1);
            --amber: #f59e0b;
            --amber-bg: rgba(245,158,11,0.1);
            --radius: 10px;
            --radius-sm: 6px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            -webkit-font-smoothing: antialiased;
        }

        /* ── Hero Header ── */
        .hero {
            position: relative;
            padding: 3rem 2.5rem 2rem;
            background: linear-gradient(135deg, #0a0a18 0%, #0f0f2a 40%, #141432 100%);
            border-bottom: 1px solid var(--border);
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
            pointer-events: none;
        }

        .hero::after {
            content: '';
            position: absolute;
            bottom: -30%;
            left: 10%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%);
            pointer-events: none;
        }

        .hero-content {
            position: relative;
            z-index: 1;
            max-width: 1400px;
            margin: 0 auto;
        }

        .hero-row {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .hero-title {
            font-size: 2rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, #f0f0f5 0%, #a0a0c0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero-sub {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 0.3rem;
        }

        .hero-sub code {
            font-family: 'JetBrains Mono', monospace;
            background: rgba(255,255,255,0.05);
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
            font-size: 0.78rem;
        }

        .stats-row {
            display: flex;
            gap: 2.5rem;
        }

        .stat-item { text-align: right; }

        .stat-num {
            font-size: 2rem;
            font-weight: 800;
            letter-spacing: -0.04em;
            line-height: 1;
            background: linear-gradient(135deg, var(--accent) 0%, var(--cyan) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .stat-label {
            font-size: 0.65rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 0.3rem;
        }

        /* ── Controls ── */
        .controls {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-wrap: wrap;
            position: relative;
            z-index: 1;
        }

        .search-wrap {
            flex: 1;
            min-width: 260px;
            position: relative;
        }

        .search-input {
            width: 100%;
            padding: 0.7rem 2.5rem 0.7rem 1rem;
            background: rgba(255,255,255,0.04);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            color: var(--text);
            font-size: 0.85rem;
            font-family: inherit;
            outline: none;
            transition: all 0.2s;
        }

        .search-input::placeholder { color: var(--text-muted); }
        .search-input:focus {
            border-color: var(--accent-border);
            background: rgba(139,92,246,0.04);
            box-shadow: 0 0 0 3px rgba(139,92,246,0.08);
        }

        .search-icon {
            position: absolute;
            left: 0.85rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            pointer-events: none;
        }

        .search-clear {
            position: absolute;
            right: 0.6rem;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            border: none;
            background: rgba(255,255,255,0.08);
            color: var(--text-muted);
            border-radius: 5px;
            font-size: 0.65rem;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            transition: all 0.15s;
        }

        .search-clear:hover { background: rgba(255,255,255,0.12); color: var(--text); }
        .search-clear.visible { display: flex; }

        .pill {
            padding: 0.5rem 0.9rem;
            background: rgba(255,255,255,0.04);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            color: var(--text-secondary);
            font-size: 0.78rem;
            font-family: inherit;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
            user-select: none;
        }

        .pill:hover {
            border-color: var(--border-bright);
            color: var(--text);
            background: rgba(255,255,255,0.06);
        }

        .pill.active {
            background: var(--accent);
            border-color: var(--accent);
            color: white;
            box-shadow: 0 2px 8px rgba(139,92,246,0.3);
        }

        .sort-select {
            padding: 0.5rem 0.8rem;
            background: rgba(255,255,255,0.04);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            color: var(--text-secondary);
            font-size: 0.78rem;
            font-family: inherit;
            font-weight: 500;
            cursor: pointer;
            outline: none;
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%235a5a72' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.7rem center;
            padding-right: 2rem;
            transition: all 0.2s;
        }

        .sort-select:hover { border-color: var(--border-bright); color: var(--text); }
        .sort-select option { background: var(--surface); color: var(--text); }

        /* ── Category bar ── */
        .cat-bar {
            display: flex;
            gap: 0.4rem;
            padding: 0.8rem 2.5rem;
            overflow-x: auto;
            border-bottom: 1px solid var(--border);
            background: var(--bg-elevated);
            position: sticky;
            top: 0;
            z-index: 50;
            scrollbar-width: none;
        }

        .cat-bar::-webkit-scrollbar { display: none; }

        .cat-pill {
            padding: 0.35rem 0.75rem;
            background: transparent;
            border: 1px solid var(--border);
            border-radius: 20px;
            color: var(--text-muted);
            font-size: 0.72rem;
            font-family: inherit;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }

        .cat-pill:hover {
            border-color: var(--border-bright);
            color: var(--text-secondary);
        }

        .cat-pill.active {
            background: rgba(139,92,246,0.12);
            border-color: var(--accent-border);
            color: var(--accent);
        }

        .cat-pill .cnt {
            display: inline-block;
            margin-left: 0.3rem;
            font-size: 0.6rem;
            opacity: 0.5;
        }

        /* ── Result bar ── */
        .result-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.7rem 2.5rem;
            border-bottom: 1px solid var(--border);
            background: var(--bg);
        }

        .result-count {
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        .result-count strong {
            color: var(--text-secondary);
            font-weight: 600;
        }

        .shortcut-hint {
            font-size: 0.65rem;
            color: var(--text-muted);
            opacity: 0.5;
        }

        .shortcut-hint kbd {
            display: inline-block;
            padding: 0.1rem 0.4rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--border);
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.6rem;
            margin: 0 0.1rem;
        }

        /* ── Grid ── */
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 1px;
            background: var(--border);
            max-width: 1400px;
            margin: 0 auto;
        }

        .card {
            background: var(--bg);
            padding: 1.4rem 1.6rem;
            position: relative;
            transition: all 0.25s ease;
            animation: fadeIn 0.3s ease both;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .card:hover {
            background: var(--surface);
            z-index: 1;
        }

        .card-type-bar {
            position: absolute;
            top: 0;
            left: 0;
            width: 3px;
            height: 100%;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .card:hover .card-type-bar { opacity: 1; }

        .card-type-bar.type-web { background: var(--blue); }
        .card-type-bar.type-api { background: var(--cyan); }
        .card-type-bar.type-mobile { background: var(--green); }
        .card-type-bar.type-desktop { background: var(--amber); }
        .card-type-bar.type-cli { background: var(--accent); }

        .card-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.6rem;
        }

        .card-name {
            font-size: 0.95rem;
            font-weight: 650;
            letter-spacing: -0.01em;
            line-height: 1.3;
        }

        .card-category {
            font-size: 0.68rem;
            color: var(--text-muted);
            margin-top: 0.2rem;
        }

        .card-badge {
            font-size: 0.58rem;
            font-weight: 600;
            padding: 0.2rem 0.5rem;
            border-radius: var(--radius-sm);
            background: rgba(139,92,246,0.12);
            color: var(--accent);
            border: 1px solid rgba(139,92,246,0.2);
            white-space: nowrap;
            flex-shrink: 0;
            margin-left: 0.75rem;
            letter-spacing: 0.02em;
        }

        .card-desc {
            font-size: 0.8rem;
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 0.75rem;
        }

        .card-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3rem;
            margin-bottom: 0.65rem;
        }

        .tag {
            padding: 0.18rem 0.5rem;
            border-radius: var(--radius-sm);
            font-size: 0.62rem;
            font-weight: 500;
            font-family: 'JetBrains Mono', monospace;
            letter-spacing: 0.01em;
        }

        .tag-ts { background: var(--blue-bg); color: var(--blue); }
        .tag-py { background: var(--green-bg); color: var(--green); }
        .tag-php { background: var(--rose-bg); color: var(--rose); }
        .tag-frontend { background: var(--cyan-bg); color: var(--cyan); }
        .tag-default { background: rgba(255,255,255,0.04); color: var(--text-secondary); }

        .card-features {
            font-size: 0.72rem;
            color: var(--text-muted);
            line-height: 1.6;
        }

        .card-path {
            margin-top: 0.75rem;
            padding: 0.35rem 0.6rem;
            background: rgba(255,255,255,0.02);
            border-radius: var(--radius-sm);
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.62rem;
            color: var(--text-muted);
            word-break: break-all;
            border: 1px solid var(--border);
            transition: border-color 0.2s;
        }

        .card:hover .card-path {
            border-color: var(--border-bright);
        }

        /* ── Empty state ── */
        .empty {
            text-align: center;
            padding: 6rem 2rem;
            grid-column: 1 / -1;
            background: var(--bg);
        }

        .empty-icon {
            width: 56px;
            height: 56px;
            margin: 0 auto 1.25rem;
            border-radius: 14px;
            background: var(--surface);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
        }

        .empty-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 0.3rem;
        }

        .empty-desc {
            font-size: 0.82rem;
            color: var(--text-muted);
        }

        /* ── Footer ── */
        .footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-muted);
            font-size: 0.7rem;
            border-top: 1px solid var(--border);
        }

        .footer code {
            font-family: 'JetBrains Mono', monospace;
            background: rgba(255,255,255,0.04);
            padding: 0.15rem 0.45rem;
            border-radius: 4px;
            font-size: 0.68rem;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
            .hero { padding: 2rem 1.25rem 1.5rem; }
            .hero-title { font-size: 1.5rem; }
            .grid { grid-template-columns: 1fr; }
            .cat-bar { padding: 0.6rem 1.25rem; top: 0; }
            .result-bar { padding: 0.5rem 1.25rem; }
            .stats-row { gap: 1.5rem; }
            .stat-num { font-size: 1.5rem; }
            .shortcut-hint { display: none; }
        }
    </style>
</head>
<body>

<div class="hero">
    <div class="hero-content">
        <div class="hero-row">
            <div>
                <div class="hero-title">Project Catalog</div>
                <div class="hero-sub">Scanned from <code>${esc(rootName)}</code></div>
            </div>
            <div class="stats-row">
                <div class="stat-item"><div class="stat-num" id="total">0</div><div class="stat-label">Projects</div></div>
                <div class="stat-item"><div class="stat-num" id="cats">0</div><div class="stat-label">Categories</div></div>
                <div class="stat-item"><div class="stat-num" id="techs">0</div><div class="stat-label">Technologies</div></div>
            </div>
        </div>
        <div class="controls">
            <div class="search-wrap">
                <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input type="text" class="search-input" id="search" placeholder="Search projects, stacks, features..." />
                <button class="search-clear" id="clearSearch" title="Clear (Esc)">&#x2715;</button>
            </div>
            <button class="pill active" data-filter="all">All</button>
            <button class="pill" data-filter="notable">Notable</button>
            <button class="pill" data-filter="web">Web</button>
            <button class="pill" data-filter="mobile">Mobile</button>
            <button class="pill" data-filter="cli">CLI</button>
            <button class="pill" data-filter="desktop">Desktop</button>
            <button class="pill" data-filter="api">API</button>
            <select class="sort-select" id="sortSelect">
                <option value="default">Sort: Default</option>
                <option value="name-asc">Name A&#8594;Z</option>
                <option value="name-desc">Name Z&#8592;A</option>
                <option value="category">Category</option>
            </select>
        </div>
    </div>
</div>

<div class="cat-bar" id="catBar"></div>
<div class="result-bar">
    <div class="result-count" id="resultCount"></div>
    <div class="shortcut-hint"><kbd>/</kbd> search &middot; <kbd>Esc</kbd> clear</div>
</div>
<div class="grid" id="grid"></div>
<div class="footer">Generated by <strong>project-catalog</strong> &middot; <code>${esc(rootPath)}</code></div>

<script>
const P = [
${projectData}
];

const cats=[...new Set(P.map(p=>p.c))];
const techSet=new Set();
P.forEach(p=>p.s.forEach(t=>techSet.add(t)));

document.getElementById('total').textContent=P.length;
document.getElementById('cats').textContent=cats.length;
document.getElementById('techs').textContent=techSet.size;

const catBar=document.getElementById('catBar');
catBar.innerHTML='<button class="cat-pill active" data-cat="all">All<span class="cnt">'+P.length+'</span></button>'+cats.map(c=>'<button class="cat-pill" data-cat="'+c+'">'+c+'<span class="cnt">'+P.filter(p=>p.c===c).length+'</span></button>').join('');

function tagClass(t){return{ts:'tag-ts',py:'tag-py',php:'tag-php',frontend:'tag-frontend'}[t]||'tag-default'}

function render(list){
    const g=document.getElementById('grid');
    if(!list.length){
        g.innerHTML='<div class="empty"><div class="empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div><div class="empty-title">No results found</div><div class="empty-desc">Try a different search term or filter.</div></div>';
        return;
    }
    g.innerHTML=list.map((p,i)=>'<div class="card" style="animation-delay:'+Math.min(i*0.025,0.4)+'s"><div class="card-type-bar type-'+p.type+'"></div><div class="card-top"><div><div class="card-name">'+p.n+'</div><div class="card-category">'+p.c+'</div></div>'+(p.notable?'<div class="card-badge">Notable</div>':'')+'</div><div class="card-desc">'+p.d+'</div><div class="card-tags">'+p.s.map((s,j)=>'<span class="tag '+(j===0?tagClass(p.t):'tag-default')+'">'+s+'</span>').join('')+'</div><div class="card-features">'+p.f+'</div><div class="card-path">'+p.p+'</div></div>').join('');
}

let ac='all',af='all',q='',so='default';

function apply(){
    let l=[...P];
    if(ac!=='all')l=l.filter(p=>p.c===ac);
    if(af==='notable')l=l.filter(p=>p.notable);
    else if(af!=='all')l=l.filter(p=>p.type===af);
    if(q){
        const lo=q.toLowerCase();
        l=l.filter(p=>p.n.toLowerCase().includes(lo)||p.d.toLowerCase().includes(lo)||p.f.toLowerCase().includes(lo)||p.s.some(s=>s.toLowerCase().includes(lo))||p.c.toLowerCase().includes(lo));
    }
    if(so==='name-asc')l.sort((a,b)=>a.n.localeCompare(b.n));
    else if(so==='name-desc')l.sort((a,b)=>b.n.localeCompare(a.n));
    else if(so==='category')l.sort((a,b)=>a.c.localeCompare(b.c)||a.n.localeCompare(b.n));
    render(l);
    const c=document.getElementById('resultCount');
    if(q||ac!=='all'||af!=='all')c.innerHTML='Showing <strong>'+l.length+'</strong> of '+P.length+' projects';
    else c.innerHTML='<strong>'+P.length+'</strong> projects';
}

catBar.addEventListener('click',e=>{
    const b=e.target.closest('.cat-pill');
    if(!b)return;
    catBar.querySelectorAll('.cat-pill').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    ac=b.dataset.cat;
    apply();
});

document.querySelectorAll('.pill').forEach(b=>{
    b.addEventListener('click',()=>{
        document.querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        af=b.dataset.filter;
        apply();
    });
});

const se=document.getElementById('search'),ce=document.getElementById('clearSearch');
se.addEventListener('input',e=>{q=e.target.value;ce.classList.toggle('visible',q.length>0);apply()});
ce.addEventListener('click',()=>{se.value='';q='';ce.classList.remove('visible');se.focus();apply()});
document.getElementById('sortSelect').addEventListener('change',e=>{so=e.target.value;apply()});

document.addEventListener('keydown',e=>{
    if(e.key==='/'&&document.activeElement!==se){e.preventDefault();se.focus()}
    if(e.key==='Escape'){if(se.value){se.value='';q='';ce.classList.remove('visible');apply()}se.blur()}
});

apply();
</script>
</body>
</html>`;
}

module.exports = { generateHTML };
