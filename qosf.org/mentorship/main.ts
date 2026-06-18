// ---- Config ----
const CONFIG_PATH = "./data/config.json";
const UPDATES_JSON = "./data/updates.json";
const DEFAULT_GYM_DOCS_URL =
  "https://unitaryfoundation.github.io/metriq-gym/benchmarks/overview/#available-benchmarks";
const DEFAULT_BENCHMARKS_URL =
  "https://unitaryfoundation.github.io/metriq-data/benchmark.latest.json";
const DEFAULT_PLATFORMS_INDEX_URL =
  "https://unitaryfoundation.github.io/metriq-data/platforms/index.json";

// ---- Elements ---- (typed for TS)
const searchInput = document.getElementById("benchmark-search") as HTMLInputElement | null;
const searchTrigger = document.getElementById("search-trigger") as HTMLButtonElement | null;
const searchDatalist = document.getElementById("benchmark-options") as HTMLDataListElement | null;
const detailModal = document.getElementById("detail-modal") as HTMLElement | null;
const detailTitle = document.getElementById("detail-title") as HTMLElement | null;
const detailSubtitle = document.getElementById("detail-subtitle") as HTMLElement | null;
const detailBody = document.getElementById("detail-body") as HTMLElement | null;
const detailCloseBtn = (detailModal?.querySelector('.detail-modal__close') as HTMLButtonElement | null) || null;

// Top-level views
const viewResultsBtn = document.getElementById('view-results-btn') as HTMLButtonElement | null;
const viewPlatformsBtn = document.getElementById('view-platforms-btn') as HTMLButtonElement | null;
const viewBenchmarksBtn = document.getElementById('view-benchmarks-btn') as HTMLButtonElement | null;
const viewResults = document.getElementById('view-results') as HTMLElement | null;
const viewPlatforms = document.getElementById('view-platforms') as HTMLElement | null;
const viewBenchmarks = document.getElementById('view-benchmarks') as HTMLElement | null;
const heroResultsLead = document.getElementById('hero-results-lead') as HTMLElement | null;
const heroPlatformsLead = document.getElementById('hero-platforms-lead') as HTMLElement | null;
const heroBenchmarksLead = document.getElementById('hero-benchmarks-lead') as HTMLElement | null;
const benchmarksDocsIframe = document.getElementById('benchmarks-docs') as HTMLIFrameElement | null;

// No extra filters for Platforms

// Results sub-tabs
const tabGraph = document.getElementById("tab-graph") as HTMLButtonElement | null;
const tabTable = document.getElementById("tab-table") as HTMLButtonElement | null;
const panelGraph = document.getElementById("panel-graph") as HTMLElement | null;
const panelTable = document.getElementById("panel-table") as HTMLElement | null;
const chartTitleEl = (panelGraph?.querySelector('.panel__title') as HTMLElement | null) || null;
const downloadChartBtn = document.getElementById('btn-download-chart') as HTMLButtonElement | null;
const downloadChartMenu = document.getElementById('chart-download-menu') as HTMLElement | null;
const downloadChartRoot = document.getElementById('chart-download') as HTMLElement | null;

const metricSelect = document.getElementById("filter-metric") as HTMLSelectElement | null;

const filterState: { provider: string[]; benchmark: string[] } = {
  provider: [],
  benchmark: [],
};


let allMetricDefs = [];
let currentMetricId = null;

let appConfigPromise;
let appConfigCache = null;
let benchmarksPromise;
let rawBenchmarks = [];
let platformsPromise;
let platformsLoaded = false;
let docsLoaded = false;
let platformsIndexCache: any[] | null = null;
let platformsIndexByKeyCache: Map<string, any> | null = null;
let platformScoresCache: Map<string, number> | null = null;
let platformQubitsCache: Map<string, number> | null = null;
let platformCoverageCache: Map<string, { covered: number; total: number }> | null = null;
let platformDetailsCache: Map<string, any> | null = null;
let platformSortKey: 'score' | 'coverage' | 'num_qubits' | 'provider' | 'device' | 'last_seen' = 'score';
let platformSortDir: 'asc' | 'desc' = 'desc';
let platformProviderFilter = '';
let deviceSeriesCache: Map<string, number[]> | null = null;
let suppressHashHandler = false;
let chartView = null;
let resizeHandler = null;
let filtersInitialized = false;
let renderSequence = 0;
const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const dateOnlyFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
// Optional: baseline device name from config (highlighted in chart/table)
let baselineDevice: string | null = null;

function normalizePlatformLifecycle(value: any) {
  if (!value || typeof value !== 'object') return null;
  const status = typeof value.status === 'string' ? value.status.trim().toLowerCase() : '';
  const effectiveAt = typeof value.effective_at === 'string' ? value.effective_at.trim() : '';
  const sourceUrl = typeof value.source_url === 'string' ? value.source_url.trim() : '';
  const sourceLabel = typeof value.source_label === 'string' ? value.source_label.trim() : '';
  if (!status) return null;
  return {
    status,
    effective_at: effectiveAt || null,
    source_url: sourceUrl || null,
    source_label: sourceLabel || null,
  };
}

function setPlatformsIndexCache(platforms: any[]) {
  const items = Array.isArray(platforms) ? platforms.slice() : [];
  platformsIndexCache = items;
  platformsIndexByKeyCache = new Map();
  items.forEach((platform: any) => {
    const provider = String(platform?.provider || '');
    const device = String(platform?.device || '');
    if (!provider || !device) return;
    platformsIndexByKeyCache!.set(getDeviceKey(provider, device), platform);
  });
}

function getPlatformLifecycle(provider: string, device: string, source?: any) {
  const direct = normalizePlatformLifecycle(source?.lifecycle);
  if (direct) return direct;
  const match = platformsIndexByKeyCache?.get(getDeviceKey(provider, device));
  return normalizePlatformLifecycle(match?.lifecycle);
}

function formatLifecycleEffectiveAt(value: string | null | undefined) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(Number(date)) ? value : dateOnlyFormatter.format(date);
  }
  const date = new Date(value);
  return Number.isNaN(Number(date)) ? value : dateOnlyFormatter.format(date);
}

function titleCaseStatus(status: string) {
  return status
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function renderLifecycleBadgeHtml(lifecycle: any) {
  const normalized = normalizePlatformLifecycle(lifecycle);
  if (!normalized) return '';
  const label = titleCaseStatus(normalized.status);
  const extraClass = normalized.status === 'retired' ? ' status-badge--retired' : '';
  return `<span class="device-badge${extraClass}">${escapeHtml(label)}</span>`;
}

function renderDeviceBadgesHtml(provider: string, device: string, source?: any) {
  const badges: string[] = [];
  const lifecycle = getPlatformLifecycle(provider, device, source);
  if (lifecycle) {
    const lifecycleBadge = renderLifecycleBadgeHtml(lifecycle);
    if (lifecycleBadge) badges.push(lifecycleBadge);
  }
  if (baselineDevice && String(device || '') === baselineDevice) {
    badges.push('<span class="device-badge baseline-badge">Baseline</span>');
  }
  return badges.length ? ` ${badges.join(' ')}` : '';
}

function renderDeviceLabelHtml(provider: string, device: string, source?: any) {
  return `${escapeHtml(device || '')}${renderDeviceBadgesHtml(provider, device, source)}`;
}

function renderLifecycleNoteHtml(provider: string, device: string, source?: any) {
  const lifecycle = getPlatformLifecycle(provider, device, source);
  if (!lifecycle || lifecycle.status !== 'retired') return '';
  const effectiveAt = formatLifecycleEffectiveAt(lifecycle.effective_at);
  const when = effectiveAt ? ` as of ${escapeHtml(effectiveAt)}` : '';
  const sourceLink = lifecycle.source_url
    ? ` <a href="${escapeAttr(lifecycle.source_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(lifecycle.source_label || 'Source')}</a>.`
    : '';
  return `
    <div class="platform-status-note platform-status-note--retired" role="note">
      <strong>Retired:</strong> This device is retired${when}. Historic benchmark results remain visible.${sourceLink}
    </div>
  `.trim();
}

function setChartDownloadEnabled(enabled: boolean) {
  if (downloadChartBtn) downloadChartBtn.disabled = !enabled;
  if (!enabled) closeChartDownloadMenu();
}

function sanitizeFileStem(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildChartDownloadName(ext: 'png' | 'svg') {
  const metric = getActiveMetric();
  const metricId = sanitizeFileStem(String(metric?.id || 'metric')) || 'metric';
  return `metriq-score-over-time-${metricId}.${ext}`;
}

function closeChartDownloadMenu() {
  if (!downloadChartMenu || !downloadChartBtn) return;
  downloadChartMenu.hidden = true;
  downloadChartBtn.setAttribute('aria-expanded', 'false');
}

function toggleChartDownloadMenu() {
  if (!downloadChartMenu || !downloadChartBtn) return;
  const nextHidden = !downloadChartMenu.hidden ? true : false;
  downloadChartMenu.hidden = nextHidden;
  downloadChartBtn.setAttribute('aria-expanded', nextHidden ? 'false' : 'true');
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function downloadChartImage(ext: 'png' | 'svg') {
  if (!chartView) return;
  try {
    if (ext === 'svg') {
      try {
        const url = await chartView.toImageURL('svg');
        const a = document.createElement('a');
        a.href = url;
        a.download = buildChartDownloadName('svg');
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      } catch {}
      const svgText = await chartView.toSVG();
      downloadBlob(buildChartDownloadName('svg'), new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
      return;
    }

    const url = await chartView.toImageURL('png');
    const a = document.createElement('a');
    a.href = url;
    a.download = buildChartDownloadName('png');
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.warn(`[chart] download ${ext} failed:`, err);
  }
}

downloadChartBtn?.addEventListener('click', (event) => {
  if (!downloadChartBtn || downloadChartBtn.disabled) return;
  event.preventDefault();
  event.stopPropagation();
  toggleChartDownloadMenu();
});

downloadChartMenu?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;
  const btn = target && target.closest ? (target.closest('button[data-format]') as HTMLButtonElement | null) : null;
  const fmt = (btn && btn.getAttribute('data-format')) || '';
  if (fmt !== 'png' && fmt !== 'svg') return;
  closeChartDownloadMenu();
  downloadChartImage(fmt);
});

document.addEventListener('click', (event) => {
  if (!downloadChartRoot || !downloadChartMenu || downloadChartMenu.hidden) return;
  const target = event.target as Node | null;
  if (!target) return;
  if (!downloadChartRoot.contains(target)) closeChartDownloadMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeChartDownloadMenu();
});

// ---- Symbol scales shared between chart and UI ----
const PROVIDER_COLORS = [
  '#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f','#edc949',
  '#af7aa1','#ff9da7','#9c755f','#bab0ab',
  '#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'
];
const BENCHMARK_SHAPES: string[] = [
  'circle','square','triangle-up','diamond','cross','triangle-down','triangle-left','triangle-right','star'
];
let providerColorMap: Map<string,string> = new Map();
let benchmarkShapeMap: Map<string,string> = new Map();
let multiBootstrapped = false;

function buildColorMap(items: string[]): Map<string,string> {
  const m = new Map<string,string>();
  items.forEach((name, i) => { m.set(name, PROVIDER_COLORS[i % PROVIDER_COLORS.length]); });
  return m;
}
function buildShapeMap(items: string[]): Map<string,string> {
  const m = new Map<string,string>();
  items.forEach((name, i) => { m.set(name, BENCHMARK_SHAPES[i % BENCHMARK_SHAPES.length]); });
  return m;
}

function shapeSvg(shape: string, color = 'currentColor'): string {
  // Simple 14x14 glyphs approximating Vega symbols
  const s = 14, c = 7; // size, center
  switch (shape) {
    case 'circle': return `<svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="${color}"/></svg>`;
    case 'square': return `<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="3" width="8" height="8" fill="${color}"/></svg>`;
    case 'diamond': return `<svg viewBox="0 0 14 14" aria-hidden="true"><polygon points="7,2 12,7 7,12 2,7" fill="${color}"/></svg>`;
    case 'cross': return `<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M6 3h2v4h4v2H8v4H6V9H2V7h4z" fill="${color}"/></svg>`;
    case 'triangle-up': return `<svg viewBox="0 0 14 14" aria-hidden="true"><polygon points="7,2 12,12 2,12" fill="${color}"/></svg>`;
    case 'triangle-down': return `<svg viewBox="0 0 14 14" aria-hidden="true"><polygon points="2,2 12,2 7,12" fill="${color}"/></svg>`;
    case 'triangle-left': return `<svg viewBox="0 0 14 14" aria-hidden="true"><polygon points="12,2 12,12 2,7" fill="${color}"/></svg>`;
    case 'triangle-right': return `<svg viewBox="0 0 14 14" aria-hidden="true"><polygon points="2,2 12,7 2,12" fill="${color}"/></svg>`;
    case 'star': return `<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 2l1.6 3.3 3.6.5-2.6 2.5.6 3.5L7 10.5 3.8 11.8l.6-3.5L1.8 5.8l3.6-.5z" fill="${color}"/></svg>`;
    default: return `<svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="${color}"/></svg>`;
  }
}

function renderMultiList(listId: string, options: string[], selected: string[], kind: 'provider'|'benchmark', searchTerm?: string) {
  const el = document.getElementById(listId);
  if (!el) return;
  el.innerHTML = '';
  const frag = document.createDocumentFragment();
  const selSet = new Set(selected || []);
  const term = (searchTerm || '').trim().toLowerCase();
  options.forEach(opt => {
    if (term && !opt.toLowerCase().includes(term)) return;
    const isSelected = selSet.has(opt);
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'multi-item' + (isSelected ? ' is-selected' : '');
    const checkIcon = isSelected ? 'fa-square-check' : 'fa-square';
    let symbolHtml = '';
    if (kind === 'provider') {
      const col = providerColorMap.get(opt) || '#888';
      symbolHtml = `<span class="symbol-dot" style="background:${col}"></span>`;
    } else {
      const shape = benchmarkShapeMap.get(opt) || 'circle';
      symbolHtml = `<span class="symbol-shape">${shapeSvg(shape)}</span>`;
    }
    item.innerHTML = `<i class="fa-regular ${checkIcon} multi-item__check" aria-hidden="true"></i>${symbolHtml}<span>${escapeHtml(opt)}</span>`;
    item.addEventListener('click', (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (kind === 'provider') {
        toggleMultiSelection('provider', options, opt);
      } else {
        toggleMultiSelection('benchmark', options, opt);
      }
      renderMultiLists();
      drawChart();
    });
    frag.appendChild(item);
  });
  el.appendChild(frag);
}

function toggleMultiSelection(key: 'provider'|'benchmark', options: string[], value: string) {
  const sel = (filterState as any)[key] as string[];
  const set = new Set(sel || []);
  if (set.has(value)) set.delete(value); else set.add(value);
  (filterState as any)[key] = Array.from(set);
}

function renderMultiLists() {
  const allRuns = Array.isArray(rawBenchmarks) ? rawBenchmarks : [];
  const providers = uniqueValues(allRuns as any, 'provider');
  const benchmarks = uniqueValues(allRuns as any, 'benchmark');
  providerColorMap = buildColorMap(providers);
  benchmarkShapeMap = buildShapeMap(benchmarks);
  // On first render, bootstrap to ALL selected; preserve user choices afterwards
  if (!multiBootstrapped) {
    if (!filterState.provider || filterState.provider.length === 0) filterState.provider = providers.slice();
    if (!filterState.benchmark || filterState.benchmark.length === 0) filterState.benchmark = benchmarks.slice();
    multiBootstrapped = true;
  }

  const benchSearchEl = document.getElementById('filter-search-benchmark') as HTMLInputElement | null;
  const provSearchEl = document.getElementById('filter-search-provider') as HTMLInputElement | null;
  const benchSearchTerm = benchSearchEl ? benchSearchEl.value : '';
  const provSearchTerm = provSearchEl ? provSearchEl.value : '';

  // Compute visible (search-filtered) items for each group
  const visibleProviders = provSearchTerm
    ? providers.filter(p => p.toLowerCase().includes(provSearchTerm.trim().toLowerCase()))
    : providers;
  const visibleBenchmarks = benchSearchTerm
    ? benchmarks.filter(b => b.toLowerCase().includes(benchSearchTerm.trim().toLowerCase()))
    : benchmarks;

  renderMultiList('provider-list', providers, filterState.provider, 'provider', provSearchTerm);
  renderMultiList('benchmark-list', benchmarks, filterState.benchmark, 'benchmark', benchSearchTerm);

  const benchCount = document.getElementById('benchmark-count');
  const provCount = document.getElementById('provider-count');
  if (benchCount) benchCount.textContent = `${filterState.benchmark.length} of ${benchmarks.length}`;
  if (provCount) provCount.textContent = `${filterState.provider.length} of ${providers.length}`;

  // Wire actions — "Select all" / "Deselect all" only affect visible (filtered) items
  const pClear = document.getElementById('provider-clear') as HTMLButtonElement | null;
  const pAll = document.getElementById('provider-all') as HTMLButtonElement | null;
  const bClear = document.getElementById('benchmark-clear') as HTMLButtonElement | null;
  const bAll = document.getElementById('benchmark-all') as HTMLButtonElement | null;
  const visibleProvSet = new Set(visibleProviders);
  const visibleBenchSet = new Set(visibleBenchmarks);
  // Highlight the button matching current visible-subset state
  const allVisibleProvSelected = visibleProviders.every(p => filterState.provider.includes(p));
  const noVisibleProvSelected = visibleProviders.every(p => !filterState.provider.includes(p));
  const allVisibleBenchSelected = visibleBenchmarks.every(b => filterState.benchmark.includes(b));
  const noVisibleBenchSelected = visibleBenchmarks.every(b => !filterState.benchmark.includes(b));
  if (pClear) { pClear.classList.toggle('is-current', noVisibleProvSelected); pClear.onclick = (event: MouseEvent) => { event.preventDefault(); event.stopPropagation(); filterState.provider = filterState.provider.filter(p => !visibleProvSet.has(p)); renderMultiLists(); drawChart(); }; }
  if (pAll) { pAll.classList.toggle('is-current', allVisibleProvSelected); pAll.onclick = (event: MouseEvent) => { event.preventDefault(); event.stopPropagation(); filterState.provider = visibleProviders.slice(); renderMultiLists(); drawChart(); }; }
  if (bClear) { bClear.classList.toggle('is-current', noVisibleBenchSelected); bClear.onclick = (event: MouseEvent) => { event.preventDefault(); event.stopPropagation(); filterState.benchmark = filterState.benchmark.filter(b => !visibleBenchSet.has(b)); renderMultiLists(); drawChart(); }; }
  if (bAll) { bAll.classList.toggle('is-current', allVisibleBenchSelected); bAll.onclick = (event: MouseEvent) => { event.preventDefault(); event.stopPropagation(); filterState.benchmark = visibleBenchmarks.slice(); renderMultiLists(); drawChart(); }; }

}

function activateTab(which) {
  const isGraph = which === "graph";
  const isTable = which === "table";
  tabGraph?.classList.toggle("is-active", isGraph);
  tabGraph?.setAttribute("aria-selected", String(isGraph));
  tabTable?.classList.toggle("is-active", isTable);
  tabTable?.setAttribute("aria-selected", String(isTable));
  panelGraph?.classList.toggle("is-active", isGraph);
  panelTable?.classList.toggle("is-active", isTable);
  if (isTable) {
    void drawTable();
  }
  if (isGraph) {
    // Force a fresh draw to ensure visibility after being hidden
    void drawChart();
  }
}

tabGraph?.addEventListener("click", () => activateTab("graph"));
tabTable?.addEventListener("click", () => activateTab("table"));

async function initBenchmarksDocsView() {
  if (docsLoaded) return;
  docsLoaded = true;
  if (!benchmarksDocsIframe) return;

  try {
    const config = appConfigCache || await loadAppConfig();
    const url = (config && typeof (config as any).gymDocsUrl === 'string' && String((config as any).gymDocsUrl).trim())
      ? String((config as any).gymDocsUrl).trim()
      : DEFAULT_GYM_DOCS_URL;
    benchmarksDocsIframe.src = url;
  } catch (err) {
    benchmarksDocsIframe.src = DEFAULT_GYM_DOCS_URL;
  }
}

function activateView(which: 'results'|'platforms'|'benchmarks', skipHashUpdate = false) {
  const isResults = which === 'results';
  const isPlatforms = which === 'platforms';
  const isBenchmarks = which === 'benchmarks';
  viewResultsBtn?.classList.toggle('is-active', isResults);
  viewResultsBtn?.setAttribute('aria-selected', String(isResults));
  viewPlatformsBtn?.classList.toggle('is-active', isPlatforms);
  viewPlatformsBtn?.setAttribute('aria-selected', String(isPlatforms));
  viewBenchmarksBtn?.classList.toggle('is-active', isBenchmarks);
  viewBenchmarksBtn?.setAttribute('aria-selected', String(isBenchmarks));
  if (heroResultsLead) heroResultsLead.hidden = !isResults;
  if (heroPlatformsLead) heroPlatformsLead.hidden = !isPlatforms;
  if (heroBenchmarksLead) heroBenchmarksLead.hidden = !isBenchmarks;
  if (viewResults) viewResults.hidden = !isResults;
  if (viewPlatforms) viewPlatforms.hidden = !isPlatforms;
  if (viewBenchmarks) viewBenchmarks.hidden = !isBenchmarks;
  // When hash routing is driving view changes, it will load the relevant sub-view
  // (platform list vs platform detail vs help page). Avoid racing those renders here.
  if (!skipHashUpdate) {
    if (isPlatforms) initPlatformsView(true);
    if (isBenchmarks) void initBenchmarksDocsView();
  }
  if (!skipHashUpdate) updateHash({ view: which });
}

viewResultsBtn?.addEventListener('click', () => activateView('results'));
viewPlatformsBtn?.addEventListener('click', () => activateView('platforms'));
viewBenchmarksBtn?.addEventListener('click', () => activateView('benchmarks'));

let benchmarkPages = [];

type UpdateItem = {
  id?: string;
  date?: string;
  title?: string;
  body?: string;
  href?: string;
  linkText?: string;
};

function stableHash(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash * 31) + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function buildFallbackUpdateId(item: UpdateItem, index: number) {
  const date = String(item?.date || '').trim();
  const title = String(item?.title || '').trim();
  const href = String(item?.href || '').trim();
  const body = String(item?.body || '').trim();
  const signature = [date, title, href, body].filter(Boolean).join('|');
  const stem = sanitizeFileStem([date, title].filter(Boolean).join('-')).slice(0, 64);
  const hash = stableHash(signature || `update-${index + 1}`);
  return `${stem || 'update'}-${hash}`;
}

function focusUpdateFromHash(section: HTMLElement, track: HTMLElement) {
  const targetId = String(parseHash().update || '').trim();
  if (!targetId) return;
  const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-update-id]'));
  const match = cards.find((card) => String(card.getAttribute('data-update-id') || '') === targetId);
  if (!match) return;
  section.scrollIntoView({ block: 'start' });
  match.scrollIntoView({ block: 'nearest' });
  match.classList.add('update-card--highlight');
  setTimeout(() => match.classList.remove('update-card--highlight'), 2400);
  match.focus({ preventScroll: true });
}

async function initUpdatesCarousel(config: any) {
  const section = document.getElementById('updates-section') as HTMLElement | null;
  const viewport = document.getElementById('updates-viewport') as HTMLElement | null;
  const track = document.getElementById('updates-track') as HTMLElement | null;
  if (!section || !viewport || !track) return;

  const url = (config && typeof (config as any).updatesUrl === 'string' && String((config as any).updatesUrl).trim())
    ? String((config as any).updatesUrl).trim()
    : UPDATES_JSON;

  let items: UpdateItem[] = [];
  try {
    const resp = await fetch(appendCacheBust(url), { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    if (Array.isArray(json)) items = json as UpdateItem[];
  } catch (err) {
    // No updates is a valid state; keep section hidden.
    return;
  }

  const usedUpdateIds = new Set<string>();
  const normalized = items
    .map((u, index) => {
      const explicitId = u?.id ? String(u.id).trim() : '';
      const baseId = explicitId || buildFallbackUpdateId(u, index);
      let uniqueId = baseId;
      let duplicateCounter = 2;
      while (usedUpdateIds.has(uniqueId)) {
        uniqueId = `${baseId}-${duplicateCounter}`;
        duplicateCounter += 1;
      }
      usedUpdateIds.add(uniqueId);
      return {
        id: uniqueId,
        date: u?.date ? String(u.date) : '',
        title: u?.title ? String(u.title) : '',
        body: u?.body ? String(u.body) : '',
        href: u?.href ? String(u.href) : '',
        linkText: u?.linkText ? String(u.linkText) : '',
      };
    })
    .filter((u) => u.title || u.body);

  if (!normalized.length) return;

  const sorted = normalized
    .slice()
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  track.innerHTML = sorted.map((u) => {
    const dateLabel = u.date ? formatDateOnly(u.date) : '';
    const meta = dateLabel ? `<p class="update-card__meta">${escapeHtml(dateLabel)}</p>` : '';
    const title = u.title ? `<h4 class="update-card__title">${escapeHtml(u.title)}</h4>` : '';
    const body = u.body ? `<p class="update-card__body">${escapeHtml(u.body)}</p>` : '';
    const link = u.href
      ? `<a class="update-card__link" href="${escapeAttr(u.href)}" target="_blank" rel="noopener">${escapeHtml(u.linkText || 'Learn more')}</a>`
      : '';
    return `<article class="update-card" id="update-${escapeAttr(u.id)}" data-update-id="${escapeAttr(u.id)}" role="listitem" tabindex="-1">${meta}${title}${body}${link}</article>`;
  }).join('');

  section.hidden = false;
  focusUpdateFromHash(section, track);
}

(async () => {
  const config = await loadAppConfig();
  setupBenchmarkSearch(config);
  initUpdatesCarousel(config);
  // Wire data download links (force download via Blob when possible)
  const wireDownload = (selector: string, url: string, fallbackName: string, preferFallbackName: boolean = false) => {
    document.querySelectorAll<HTMLAnchorElement>(selector).forEach(a => {
      // Set href + download attribute as a fallback
      a.href = url;
      let name = fallbackName;
      if (!preferFallbackName) {
        try {
          const u = new URL(url, window.location.href);
          const base = (u.pathname.split('/').pop() || fallbackName).split('?')[0];
          if (base) name = base;
        } catch {}
      }
      a.setAttribute('download', name);
      a.removeAttribute('target');
      a.removeAttribute('rel');

      const handler = async (ev: Event) => {
        ev.preventDefault();
        try {
          const isCross = (() => {
            try {
              const u = new URL(url, window.location.href);
              return u.origin !== window.location.origin;
            } catch { return false; }
          })();
          // Try CORS fetch first; for same-origin this always works.
          const res = await fetch(url, { mode: isCross ? 'cors' : 'same-origin', credentials: 'omit' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          // If opaque due to CORS, this will throw when reading the body
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          const tmp = document.createElement('a');
          tmp.href = objectUrl;
          tmp.download = name;
          document.body.appendChild(tmp);
          tmp.click();
          setTimeout(() => {
            URL.revokeObjectURL(objectUrl);
            tmp.remove();
          }, 0);
        } catch (err) {
          // Fallback: rely on native download attribute (may be ignored cross-origin)
          try {
            a.click();
          } catch {
            // Last resort: open in a new tab so the user can save manually
            window.open(url, '_blank', 'noopener');
          }
        }
      };
      // Avoid duplicate listeners if re-wired
      a.addEventListener('click', handler);
    });
  };

  try {
    const bUrl = (config && (config as any).benchmarksUrl) || DEFAULT_BENCHMARKS_URL;
    wireDownload('.link-benchmarks-json', bUrl, 'benchmarks.json');
  } catch {}
  try {
    const pUrl = (config && (config as any).platformsIndexUrl) || DEFAULT_PLATFORMS_INDEX_URL;
    wireDownload('.link-platforms-json', pUrl, 'platform-index.json', true);
  } catch {}

  // ---- Guided Tour ----
  // Initializes the tour logic from tour.js (which attaches MetriqTour to window)
  const MetriqTourCtor = (window as any).MetriqTour;
  let tourInstance: any | null = null;
  if (typeof MetriqTourCtor === 'function') {
    try {
      tourInstance = new MetriqTourCtor();
    } catch {
      tourInstance = null;
    }
  }

  const startTourBtn = document.getElementById('start-tour-btn');
  if (startTourBtn && tourInstance && typeof tourInstance.start === 'function') {
    startTourBtn.addEventListener('click', (e) => {
      e.preventDefault();
      tourInstance.start();
    });
  }
  // Check if it's the first visit (only if the instance is usable)
  // if (tourInstance && typeof tourInstance.checkFirstVisit === 'function') {
  //   tourInstance.checkFirstVisit();
  // }
})();

// Set an initial view without mutating the URL; hash routing below will apply deep links.
activateView('platforms', true);

// ---- Hash routing for deep links ----
function parseHash(): Record<string, string> {
  const raw = location.hash.replace(/^#/, '').trim();
  const p = new URLSearchParams(raw);
  const o: Record<string, string> = {};
  p.forEach((v, k) => { o[k] = v; });
  return o;
}

function updateHash(next: Record<string, string>) {
  try {
    suppressHashHandler = true;
    const cur = parseHash();
    const merged = { ...cur, ...next };
    if ('view' in next) {
      if (next.view !== 'platforms') {
        delete merged.provider;
        delete merged.device;
        delete merged.help;
        delete merged.compare_provider_a;
        delete merged.compare_device_a;
        delete merged.compare_provider_b;
        delete merged.compare_device_b;
      } else if (!('provider' in next) && !('device' in next) && !('help' in next) && !('compare_provider_a' in next) && !('compare_device_a' in next) && !('compare_provider_b' in next) && !('compare_device_b' in next)) {
        delete merged.provider;
        delete merged.device;
        delete merged.help;
        delete merged.compare_provider_a;
        delete merged.compare_device_a;
        delete merged.compare_provider_b;
        delete merged.compare_device_b;
      }
      if (next.view !== 'results') {
        delete merged.results_provider;
        delete merged.results_device;
        delete merged.results_benchmark;
        delete merged.results_timestamp;
        delete merged.results_tab;
      } else {
        if (!('results_provider' in next)) delete merged.results_provider;
        if (!('results_device' in next)) delete merged.results_device;
        if (!('results_benchmark' in next)) delete merged.results_benchmark;
        if (!('results_timestamp' in next)) delete merged.results_timestamp;
        if (!('results_tab' in next)) delete merged.results_tab;
      }
    }
    const hasScopedRoute = Boolean(
      merged.provider
      || merged.device
      || merged.help
      || merged.compare_provider_a
      || merged.compare_device_a
      || merged.compare_provider_b
      || merged.compare_device_b
      || merged.results_provider
      || merged.results_device
      || merged.results_benchmark
      || merged.results_timestamp
      || merged.results_tab
    );
    if (hasScopedRoute || ('view' in next && next.view !== 'platforms')) {
      delete merged.update;
    }
    const p = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => { if (v != null && v !== '') p.set(k, v); });
    const nh = '#' + p.toString();
    if (location.hash !== nh) history.replaceState(null, '', nh);
  } finally {
    setTimeout(() => { suppressHashHandler = false; }, 0);
  }
}

function navigateToPlatform(provider: string, device: string) {
  // Let the hashchange event drive routing to avoid “first click” no-op.
  suppressHashHandler = false;
  const params = new URLSearchParams({ view: 'platforms', provider, device });
  const newHash = '#' + params.toString();
  if (location.hash !== newHash) {
    location.hash = newHash;
  } else {
    // If hash is unchanged, route immediately.
    applyHashRouting();
  }
  // Fallback: ensure routing runs even if the hashchange event is suppressed by the browser.
  setTimeout(() => {
    if (suppressHashHandler) suppressHashHandler = false;
    applyHashRouting();
  }, 0);
}

function buildResultsHash(
  provider: string,
  device: string,
  benchmark: string,
  timestamp = '',
  tab: 'graph' | 'table' = 'table'
) {
  const params = new URLSearchParams({
    view: 'results',
    results_provider: provider,
    results_device: device,
    results_benchmark: benchmark,
    results_tab: tab,
  });
  if (timestamp) params.set('results_timestamp', timestamp);
  if (tab === 'table') params.set('results_anchor', 'table');
  return '#' + params.toString();
}

let pendingResultsTableCenterScroll = false;

function applyResultsRoute(route: Record<string, string>) {
  const provider = String(route.results_provider || '').trim();
  const device = String(route.results_device || '').trim();
  const benchmark = String(route.results_benchmark || '').trim();
  const timestamp = String(route.results_timestamp || '').trim();
  const tab = route.results_tab === 'graph' ? 'graph' : 'table';

  if (provider || benchmark) {
    const providers = uniqueValues(rawBenchmarks as any, 'provider');
    const benchmarks = uniqueValues(rawBenchmarks as any, 'benchmark');
    filterState.provider = provider ? [provider] : providers.slice();
    filterState.benchmark = benchmark ? [benchmark] : benchmarks.slice();
    renderMultiLists();
  }

  if (provider || device || benchmark || timestamp) {
    tableState.filterProvider = provider || 'all';
    tableState.filterDevice = device || 'all';
    tableState.filterBenchmark = benchmark || 'all';
    tableState.filterText = timestamp || '';
    tableState.sortKey = 'timestamp';
    tableState.sortDir = 'desc';
  }

  pendingResultsTableCenterScroll = tab === 'table' && route.results_anchor === 'table';
  activateTab(tab);
}

function scrollHelpPanelIntoView(container: HTMLElement) {
  requestAnimationFrame(() => {
    const panel = container.querySelector<HTMLElement>('.detail-page');
    (panel || container).scrollIntoView({ block: 'center', behavior: 'auto' });
  });
}

function renderInlineMath(tex: string) {
  const renderer = (window as any).katex;
  if (renderer && typeof renderer.renderToString === 'function') {
    return renderer.renderToString(tex, { throwOnError: false, displayMode: false });
  }
  return `<code>${escapeHtml(tex)}</code>`;
}

function renderDisplayMath(tex: string) {
  const renderer = (window as any).katex;
  if (renderer && typeof renderer.renderToString === 'function') {
    return renderer.renderToString(tex, { throwOnError: false, displayMode: true });
  }
  return `<pre style="white-space:pre-wrap;margin:8px 0;background:#f8fafc;border:1px solid #eef2ff;border-radius:8px;padding:10px;overflow:auto;">$$\n${escapeHtml(tex)}\n$$</pre>`;
}

function renderMetriqScoreHelp() {
  const container = document.getElementById('platforms-container');
  if (!container) return;
  container.innerHTML = `
    <div class="detail-page" style="display:flex;flex-direction:column;gap:18px;padding-top:4px;">
      <div class="meta"><a href="#view=platforms" style="color:#2563eb;text-decoration:none;">← Back to Platforms</a></div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <h3 style="margin:0;">Metriq Score</h3>
        <div class="meta">What the “Metriq Score” column means</div>
      </div>
      <div style="background:#fff;border:1px solid #dbeafe;border-radius:14px;padding:16px;box-shadow:0 12px 28px rgba(15,23,42,.06);">
        <p style="margin:0 0 10px;line-height:1.55;">
          Metriq Score is an aggregate score computed from benchmark results. It is intended as a single number that summarizes device performance.
        </p>
        <p style="margin:0 0 8px;line-height:1.55;">
          In broad strokes, the composite score is calculated as:
        </p>
        <ol style="margin:0 0 10px;padding-left:18px;line-height:1.55;">
          <li>
            For each benchmark, individual run scores are normalized against the corresponding benchmark score of a baseline device.
          </li>
          <li>
            Those normalized values are then summed using benchmark weights defined in
            <a href="https://github.com/unitaryfoundation/metriq-data/blob/main/scripts/scoring.json" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:none;font-weight:600;">scoring.json</a>.
          </li>
        </ol>
        <p style="margin:0 0 10px;line-height:1.55;">
          Click any score cell in the Platforms table to view a breakdown (series, value, and component weights) for that device.
        </p>
      </div>
    </div>
  `.trim();
}

function renderOverlapMetriqScoreHelp() {
  const container = document.getElementById('platforms-container');
  if (!container) return;
  const backHash = buildCompareHashFromRoute(parseHash()) || '#view=platforms';
  const backLabel = backHash === '#view=platforms' ? 'Back to Platforms' : 'Back to comparison';
  const metriqScoreLink = `<a href="#view=platforms&help=metriq-score" style="color:#2563eb;text-decoration:none;font-weight:600;">Metriq Score</a>`;
  const metriqFormula = renderDisplayMath('\\mathrm{MS}(d,s) = \\sum_{b \\in B} w_b\\mathrm{BS}_b(d,s)');
  const overlapFormula = renderDisplayMath('\\mathrm{OMS}(d_1, d_2, s_1, s_2) = \\sum_{c \\in C} w_c\\mathrm{BS}_c(d_1, d_2, s_1, s_2)');
  const sharedSetFormula = renderInlineMath('C = B_1 \\cap B_2');
  const deviceOne = renderInlineMath('d_1');
  const deviceTwo = renderInlineMath('d_2');
  container.innerHTML = `
    <div class="detail-page" style="display:flex;flex-direction:column;gap:18px;padding-top:4px;">
      <div class="meta"><a href="${escapeAttr(backHash)}" style="color:#2563eb;text-decoration:none;">← ${escapeHtml(backLabel)}</a></div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <h3 style="margin:0;">Overlap Score</h3>
        <div class="meta">What the "Overlap Score" comparison value means</div>
      </div>
      <div style="background:#fff;border:1px solid #dbeafe;border-radius:14px;padding:16px;box-shadow:0 12px 28px rgba(15,23,42,.06);">
        <p style="margin:0 0 10px;line-height:1.55;">
          Overlap Score is an aggregate score computed from benchmark results that exist in both of the two devices. It is intended as a single number that compare two devices' performance.
        </p>
        <p style="margin:0 0 10px;line-height:1.55;">
          The standard ${metriqScoreLink} is a weighted composite over the full benchmark suite, where each benchmark subscore is normalized and weighted:
        </p>
        ${metriqFormula}
        <p style="margin:0 0 10px;line-height:1.55;">
          In a pairwise comparison, that full-suite score can include benchmark components that only one of the two devices has.
        </p>
        ${metriqFormula}
        <p style="margin:0 0 10px;line-height:1.55;">
          The Overlap Score restricts the calculation to the shared benchmark set, ${sharedSetFormula}. For compared devices ${deviceOne} and ${deviceTwo}, it sums only the weighted normalized subscores for components present on both devices:
        </p>
        ${overlapFormula}
        <p style="margin:0;line-height:1.55;">
          This makes the side-by-side result more apples-to-apples: the regular score remains useful as a full-suite reference, while the overlap score better answers which device looks stronger on the directly comparable subset.
        </p>
      </div>
    </div>
  `.trim();
  scrollHelpPanelIntoView(container);
}

async function applyHashRouting() {
  if (suppressHashHandler) return;
  const h = parseHash();
  const viewParam = String(h.view || 'platforms');
  const view = (viewParam === 'platforms')
    ? 'platforms'
    : (viewParam === 'benchmarks' ? 'benchmarks' : 'results');
  activateView(view, true);
  if (view === 'platforms') {
    const helpTopic = String((h as any).help || '');
    if (helpTopic === 'metriq-score') {
      renderMetriqScoreHelp();
      return;
    }
    if (helpTopic === 'overlap-metriq-score') {
      renderOverlapMetriqScoreHelp();
      return;
    }
    if (h.compare_provider_a && h.compare_device_a && h.compare_provider_b && h.compare_device_b) {
      await showPlatformComparePage(h.compare_provider_a, h.compare_device_a, h.compare_provider_b, h.compare_device_b);
      return;
    }
    if (h.provider && h.device) {
      await showPlatformDetailPage(h.provider, h.device);
      return;
    }
    await initPlatformsView(true);
    return;
  }
  if (view === 'results') {
    if (!Array.isArray(rawBenchmarks) || rawBenchmarks.length === 0) {
      await initBenchmarksView();
    }
    applyResultsRoute(h);
    return;
  }
  if (view === 'benchmarks') {
    await initBenchmarksDocsView();
  }
}

window.addEventListener('hashchange', () => { applyHashRouting(); });
applyHashRouting();

async function loadBenchmarks() {
  if (!benchmarksPromise) {
    benchmarksPromise = (async () => {
      const config = await loadAppConfig();
      const url = config.benchmarksUrl || DEFAULT_BENCHMARKS_URL;
      const requestUrl = appendCacheBust(url);
      const resp = await fetch(requestUrl, { cache: 'no-store' });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} loading ${url}`);
      }
      const json = await resp.json();
      if (!Array.isArray(json)) {
        throw new Error(`Benchmark data at ${url} is not a JSON array`);
      }
      const looksLikeEtl = json.length > 0 && typeof json[0] === 'object' && json[0] !== null && (
        'results' in json[0] || 'params' in json[0] || 'job_type' in json[0]
      );
      const rows = looksLikeEtl ? json.map(adaptMetriqEtlRow) : json;
      return rows.map(normalizeRun);
    })();
  }
  return benchmarksPromise;
}

async function loadPlatformsIndex() {
  if (!platformsPromise) {
    platformsPromise = (async () => {
      const config = await loadAppConfig();
      const url = (config && (config as any).platformsIndexUrl) || DEFAULT_PLATFORMS_INDEX_URL;
      try {
        const resp = await fetch(appendCacheBust(url), { cache: 'no-store' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status} loading ${url}`);
        const json = await resp.json();
        if (json && Array.isArray(json.platforms)) {
          setPlatformsIndexCache(json.platforms);
          return json;
        }
        setPlatformsIndexCache([]);
        return { generated_at: null, platforms: [] };
      } catch (err) {
        console.warn('[platforms] failed to load index:', err);
        setPlatformsIndexCache([]);
        return { generated_at: null, platforms: [] };
      }
    })();
  }
  return platformsPromise;
}

function extractPlatformNumQubits(detail: any): number | null {
  const md = detail?.current?.device_metadata ?? detail?.device_metadata ?? null;
  const candidates = [
    md?.num_qubits,
    md?.max_qubits,
    md?.qubits,
    md?.width,
    detail?.num_qubits,
    detail?.numQubits,
  ];
  for (const c of candidates) {
    const n = parseNumQubits(c);
    if (n !== null) return n;
  }
  const comps = detail?.metriq_score?.components;
  if (comps && typeof comps === 'object') {
    const vals = Object.values(comps as Record<string, any>);
    let max: number | null = null;
    for (const v of vals) {
      const n = parseNumQubits(v?.num_qubits ?? v?.max_qubits ?? v?.qubits ?? v?.width);
      if (n !== null) max = max === null ? n : Math.max(max, n);
    }
    return max;
  }
  return null;
}

function extractPlatformCoverage(detail: any): { covered: number; total: number } | null {
  const comps = detail?.metriq_score?.components;
  if (!comps || typeof comps !== 'object') return null;
  const values = Object.values(comps as Record<string, any>);
  if (!values.length) return null;
  const hasFinite = (value: any) => value !== null && value !== undefined && Number.isFinite(Number(value));
  let covered = 0;
  values.forEach((value: any) => {
    const hasResult = value?.normalized_available === true
      || value?.raw_available === true
      || hasFinite(value?.normalized)
      || hasFinite(value?.raw)
      || Boolean(value?.timestamp || value?.normalized_timestamp || value?.raw_timestamp);
    if (hasResult) covered += 1;
  });
  return { covered, total: values.length };
}

async function loadPlatformScores() {
  if (platformScoresCache && platformQubitsCache && platformCoverageCache) return platformScoresCache;
  if (!platformScoresCache) platformScoresCache = new Map();
  if (!platformQubitsCache) platformQubitsCache = new Map();
  if (!platformCoverageCache) platformCoverageCache = new Map();

  const data = await loadPlatformsIndex();
  const platforms = Array.isArray((data as any).platforms) ? (data as any).platforms : [];

  const config = await loadAppConfig();
  const indexUrl = (config && (config as any).platformsIndexUrl) || DEFAULT_PLATFORMS_INDEX_URL;
  const base = getPlatformsBaseUrl(indexUrl) || 'https://unitaryfoundation.github.io/metriq-data/platforms';

  await Promise.all(platforms.map(async (p: any) => {
    const provider = String(p.provider || '');
    const device = String(p.device || '');
    if (!provider || !device) return;
    const key = getDeviceKey(provider, device);
    const detailUrl = `${base}/${encodeURIComponent(provider)}/${encodeURIComponent(device)}.json`;
    try {
      const resp = await fetch(appendCacheBust(detailUrl), { cache: 'no-store' });
      if (!resp.ok) return;
      const json = await resp.json();
      if (!platformDetailsCache) platformDetailsCache = new Map();
      platformDetailsCache.set(key, json);
      const ms = json && json.metriq_score;
      const val = ms && typeof ms.value === 'number' ? Number(ms.value) : null;
      if (val !== null && Number.isFinite(val)) {
        platformScoresCache!.set(key, val);
      }
      const nq = extractPlatformNumQubits(json);
      if (nq !== null && Number.isFinite(nq)) {
        platformQubitsCache!.set(key, nq);
      }
      const coverage = extractPlatformCoverage(json);
      if (coverage) {
        platformCoverageCache!.set(key, coverage);
      }
    } catch {
      // ignore errors
    }
  }));

  return platformScoresCache;
}

function getPlatformsBaseUrl(indexUrl: string) {
  try {
    if (!indexUrl) return null;
    if (indexUrl.endsWith('/index.json')) {
      return indexUrl.slice(0, -('/index.json'.length));
    }
    return indexUrl.replace(/index\.json$/i, '');
  } catch { return null; }
}

function formatPlatformComponentRawValue(value: any) {
  if (value === null || value === undefined) return '–';
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  const abs = Math.abs(num);
  if ((abs !== 0 && abs < 1e-4) || abs >= 1e6) return num.toExponential(3);
  if (abs >= 1000) {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (abs >= 1) {
    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }
  return num.toLocaleString(undefined, { maximumSignificantDigits: 6 });
}


function buildPlatformDetailUrl(provider: string, device: string, indexUrl: string) {
  const base = getPlatformsBaseUrl(indexUrl) || 'https://unitaryfoundation.github.io/metriq-data/platforms';
  return `${base}/${encodeURIComponent(provider)}/${encodeURIComponent(device)}.json`;
}

async function loadPlatformDetail(provider: string, device: string) {
  if (!platformDetailsCache) platformDetailsCache = new Map();
  const key = getDeviceKey(provider, device);
  const cached = platformDetailsCache.get(key);
  if (cached) return cached;
  const config = await loadAppConfig();
  const indexUrl = (config && (config as any).platformsIndexUrl) || DEFAULT_PLATFORMS_INDEX_URL;
  const detailUrl = buildPlatformDetailUrl(provider, device, indexUrl);
  const resp = await fetch(appendCacheBust(detailUrl), { cache: 'no-store' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const json = await resp.json();
  platformDetailsCache.set(key, json);
  return json;
}

function buildPlatformDetailHash(provider: string, device: string) {
  const params = new URLSearchParams({ view: 'platforms', provider, device });
  return '#' + params.toString();
}

function buildCompareHash(providerA: string, deviceA: string, providerB: string, deviceB: string) {
  const params = new URLSearchParams({
    view: 'platforms',
    compare_provider_a: providerA,
    compare_device_a: deviceA,
    compare_provider_b: providerB,
    compare_device_b: deviceB,
  });
  return '#' + params.toString();
}

function buildCompareHashFromRoute(route: Record<string, string>) {
  const providerA = String(route.compare_provider_a || '');
  const deviceA = String(route.compare_device_a || '');
  const providerB = String(route.compare_provider_b || '');
  const deviceB = String(route.compare_device_b || '');
  if (!providerA || !deviceA || !providerB || !deviceB) return '';
  return buildCompareHash(providerA, deviceA, providerB, deviceB);
}

function buildOverlapScoreHelpHashFromRoute(route: Record<string, string>) {
  const params = new URLSearchParams({
    view: 'platforms',
    help: 'overlap-metriq-score',
  });
  ['compare_provider_a', 'compare_device_a', 'compare_provider_b', 'compare_device_b'].forEach((key) => {
    const value = String(route[key] || '');
    if (value) params.set(key, value);
  });
  return '#' + params.toString();
}

function scrollToPlatformsLead() {
  heroPlatformsLead?.scrollIntoView({ block: 'start', behavior: 'auto' });
}

function renderPlatformOptionLabel(platform: any) {
  const provider = String(platform?.provider || '');
  const device = String(platform?.device || '');
  return `${device} · ${provider}`;
}

function sortPlatformsForComparison(platforms: any[]) {
  return platforms
    .map((p: any) => {
      const provider = String(p.provider || '');
      const device = String(p.device || '');
      const score = platformScoresCache?.get(getDeviceKey(provider, device));
      return { ...p, provider, device, score: Number(score) };
    })
    .filter((p: any) => p.provider && p.device)
    .sort((a: any, b: any) => {
      const as = Number.isFinite(a.score) ? a.score : Number.NEGATIVE_INFINITY;
      const bs = Number.isFinite(b.score) ? b.score : Number.NEGATIVE_INFINITY;
      if (bs !== as) return bs - as;
      return `${a.provider} ${a.device}`.localeCompare(`${b.provider} ${b.device}`);
    });
}

function findDefaultComparePair(platforms: any[], _preferredProvider = '') {
  const sorted = sortPlatformsForComparison(platforms);
  return [sorted[0] || null, sorted[1] || null];
}

function findDefaultComparePeer(provider: string, device: string) {
  const currentProvider = String(provider || '');
  const currentDevice = String(device || '');
  return sortPlatformsForComparison(platformsIndexCache || [])
    .find((p: any) => p.provider !== currentProvider || p.device !== currentDevice) || null;
}

function normalizeCompareSelection(provider: string, device: string, fallback: any) {
  const exact = (platformsIndexCache || []).find((p: any) => String(p.provider || '') === provider && String(p.device || '') === device);
  return exact || fallback || null;
}

function extractDeviceMetadataRows(details: any[]) {
  const fields = [
    ['num_qubits', 'Qubits'],
    ['quantum_volume', 'Quantum volume'],
    ['processor_type', 'Processor type'],
    ['basis_gates', 'Basis gates'],
    ['coupling_map', 'Coupling map'],
  ];
  return fields.map(([key, label]) => {
    const values = details.map((detail: any) => {
      const md = detail?.current?.device_metadata ?? detail?.device_metadata ?? {};
      const value = md?.[key];
      if (Array.isArray(value)) return value.length > 8 ? `${value.length} entries` : value.join(', ');
      if (value && typeof value === 'object') return `${Object.keys(value).length} entries`;
      return value === null || value === undefined || value === '' ? '–' : String(value);
    });
    return { key, label, values };
  }).filter((row: any) => row.values.some((v: string) => v !== '–'));
}


function getProviderLogoSrc(provider: string) {
  const p = String(provider || '').toLowerCase();
  if (!p || p.includes('local')) return null;
  if (p.includes('ibm')) return 'public/ibm.png';
  if (p.includes('aws') || p.includes('amazon') || p.includes('braket')) return 'public/aws.png';
  if (p.includes('origin')) return 'public/origin.png';
  if (p.includes('quantinuum')) return 'public/quantinuum.png';
  return null;
}

function getProviderCompareTheme(provider: string) {
  const p = String(provider || '').toLowerCase();
  if (p.includes('ibm')) return 'ibm';
  if (p.includes('quantinuum') || p.includes('quantinum')) return 'quantinuum';
  if (p.includes('aws') || p.includes('amazon') || p.includes('braket')) return 'aws';
  if (p.includes('origin')) return 'origin';
  return 'default';
}

function getProviderCompareOptionStyle(provider: string) {
  const theme = getProviderCompareTheme(provider);
  if (theme === 'ibm') return 'background-color:#87ceeb;color:#0f172a;';
  if (theme === 'quantinuum') return 'background-color:#000;color:#fff;';
  if (theme === 'aws') return 'background-color:#ff9900;color:#111827;';
  if (theme === 'origin') return 'background-color:#fff;color:#111827;';
  return '';
}

function getProviderInitials(provider: string) {
  const words = String(provider || '')
    .replace(/quantum|cloud|computing|services|technologies|technology/ig, ' ')
    .split(/[^a-z0-9]+/i)
    .map((w) => w.trim())
    .filter(Boolean);
  const initials = words.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('');
  return initials || 'QC';
}

function renderProviderLogoHtml(provider: string, accent = false) {
  const src = getProviderLogoSrc(provider);
  if (!src && String(provider || '').toLowerCase().includes('local')) return '';

  const label = provider ? `${provider} logo` : 'Provider logo';
  const classes = `provider-logo${accent ? ' provider-logo--accent' : ''}`;
  if (src) {
    return `<span class="${classes}" aria-label="${escapeAttr(label)}" title="${escapeAttr(label)}"><img src="${escapeAttr(src)}" alt="" class="provider-logo__img" /></span>`;
  }
  return `<span class="${classes} provider-logo--initials" aria-label="${escapeAttr(label)}" title="${escapeAttr(label)}">${escapeHtml(getProviderInitials(provider))}</span>`;
}

function renderCompareMetricRow(label: string, aHtml: string, bHtml: string) {
  return renderCompareMetricRowHtml(escapeHtml(label), aHtml, bHtml);
}

function renderCompareMetricRowHtml(labelHtml: string, aHtml: string, bHtml: string) {
  return `<tr><th scope="row">${labelHtml}</th><td>${aHtml}</td><td>${bHtml}</td></tr>`;
}

function renderCompareMaybeBetterNumber(value: number | null, otherValue: number | null, digits: number) {
  const valueHtml = value !== null && Number.isFinite(value) ? value.toFixed(digits) : '–';
  const isBetter = value !== null && otherValue !== null && Number.isFinite(value) && Number.isFinite(otherValue) && value > otherValue;
  return isBetter ? `<strong class="compare-better-value">${escapeHtml(valueHtml)}</strong>` : escapeHtml(valueHtml);
}

function renderCompareOverlapScoreLabelHtml() {
  return `<span class="compare-score-help" tabindex="0" data-tip="compare-overlap-score">Overlap Score</span>`;
}

function renderCompareDeviceTitleHtml(provider: string, device: string, source?: any) {
  return `<h4>${renderDeviceLabelHtml(provider, device, source)}</h4>`;
}

function renderCompareDeviceHeaderLink(provider: string, device: string) {
  const label = `View ${device} device details`;
  return `<a class="compare-table__device-link" href="${escapeAttr(buildPlatformDetailHash(provider, device))}" title="${escapeAttr(label)}" aria-label="${escapeAttr(label)}">${escapeHtml(device)}</a>`;
}

function renderCompareThreeColumnColgroup() {
  return '<colgroup><col style="width:34%" /><col style="width:33%" /><col style="width:33%" /></colgroup>';
}

function renderCompareComponentColgroup() {
  return '<colgroup><col style="width:28.5%" /><col style="width:5.5%" /><col style="width:31%" /><col style="width:31%" /></colgroup>';
}

function hasCompareComponent(components: Record<string, any>, name: string) {
  return Object.prototype.hasOwnProperty.call(components, name);
}

function isFiniteCompareComponentNumber(value: any) {
  if (value === null || value === undefined || value === '') return false;
  return Number.isFinite(Number(value));
}

function hasCompareComponentNormalizedValue(components: Record<string, any>, name: string) {
  if (!hasCompareComponent(components, name)) return false;
  return isFiniteCompareComponentNumber(components[name]?.normalized);
}

function getCompareComponentNormalizedAvailability(name: string, leftComponents: Record<string, any>, rightComponents: Record<string, any>) {
  return (hasCompareComponentNormalizedValue(leftComponents, name) ? 1 : 0) + (hasCompareComponentNormalizedValue(rightComponents, name) ? 1 : 0);
}

function getCompareComponentDisplayWeight(name: string, leftComponents: Record<string, any>, rightComponents: Record<string, any>) {
  const weights = [leftComponents[name], rightComponents[name]]
    .map((component) => Number(component?.weight))
    .filter((weight) => Number.isFinite(weight));
  return weights.length ? Math.max(...weights) : null;
}

function getCompareComponentSortWeight(name: string, leftComponents: Record<string, any>, rightComponents: Record<string, any>) {
  return getCompareComponentDisplayWeight(name, leftComponents, rightComponents) ?? 0;
}

function getCompareComponentNormalized(component: any) {
  const normalized = Number(component?.normalized);
  return Number.isFinite(normalized) ? normalized : null;
}

function calculateOverlapMetriqScore(components: Record<string, any>, overlapNames: string[], leftComponents: Record<string, any>, rightComponents: Record<string, any>) {
  const score = overlapNames.reduce((total, name) => {
    const normalized = getCompareComponentNormalized(components[name]);
    if (normalized === null) return total;
    return total + getCompareComponentSortWeight(name, leftComponents, rightComponents) * normalized;
  }, 0);
  return Number.isFinite(score) ? score : null;
}

function renderCompareComponentValueCellHtml(valueHtml: string, resultsHref: string) {
  const classes = `compare-component-value-cell${resultsHref ? ' compare-component-result-cell' : ''}`;
  const attrs = resultsHref
    ? ` class="${classes}" data-results-href="${escapeAttr(resultsHref)}" tabindex="0" role="link" title="Open matching results"`
    : ` class="${classes}"`;
  return `<td${attrs}>${valueHtml}</td>`;
}

function renderCompareComponentRow(label: string, weightHtml: string, aHtml: string, bHtml: string, aHref = '', bHref = '') {
  return `<tr><th scope="row">${escapeHtml(label)}</th><td class="num">${weightHtml}</td>${renderCompareComponentValueCellHtml(aHtml, aHref)}${renderCompareComponentValueCellHtml(bHtml, bHref)}</tr>`;
}

function renderCompareComponentRatioHtml(leftValue: number | null, rightValue: number | null, includeRatioLabel = false) {
  if (leftValue === null || rightValue === null || !Number.isFinite(leftValue) || !Number.isFinite(rightValue) || rightValue === 0) return '–';
  const ratio = (leftValue / rightValue) * 100;
  if (!Number.isFinite(ratio)) return '–';
  const roundedRatio = Number(ratio.toFixed(1));
  const ratioLabel = roundedRatio.toFixed(1);
  let symbol = '=';
  let tone = 'equal';
  if (roundedRatio < 50) { symbol = '&lt;&lt;&lt;'; tone = 'low'; }
  else if (roundedRatio < 75) { symbol = '&lt;&lt;'; tone = 'low'; }
  else if (roundedRatio < 100) { symbol = '&lt;'; tone = 'low'; }
  else if (roundedRatio === 100) { symbol = '='; tone = 'equal'; }
  else if (roundedRatio < 150) { symbol = '&gt;'; tone = 'high'; }
  else if (roundedRatio < 200) { symbol = '&gt;&gt;'; tone = 'high'; }
  else { symbol = '&gt;&gt;&gt;'; tone = 'high'; }
  const labelHtml = includeRatioLabel ? `<span class="compare-ratio-value">${escapeHtml(ratioLabel)}%</span>` : '';
  return `<span class="compare-ratio-wrap"><span class="compare-ratio compare-ratio--${tone}" title="Normalized ratio: ${escapeAttr(ratioLabel)}%" aria-label="Normalized ratio ${escapeAttr(ratioLabel)} percent">${symbol}</span>${labelHtml}</span>`;
}

function getCompareComponentRawNumber(component: any) {
  if (component?.raw === null || component?.raw === undefined || component?.raw === '') return null;
  const raw = Number(component.raw);
  return Number.isFinite(raw) ? raw : null;
}

function isLowerRawBetterCompareComponent(name: string) {
  return new Set(['EPLG-10', 'EPLG-20', 'EPLG-50', 'EPLG-100']).has(String(name || '').trim().toUpperCase());
}

function buildCompareComponentResultsHash(provider: string, device: string, componentName: string, component: any) {
  const benchmark = typeof component?.group === 'string' && component.group.trim()
    ? String(component.group).trim()
    : String(componentName || '').trim();
  if (!provider || !device || !benchmark) return '';
  return buildResultsHash(provider, device, benchmark, String(component?.timestamp || ''), 'table');
}

function renderCompareComponentValueHtml(value: number | null, component: any, isBetter: boolean, rawIsBetter = false) {
  const hasValue = value !== null && Number.isFinite(value);
  const valueHtml = hasValue ? escapeHtml(value.toFixed(3)) : '–';
  const emphasizedValueHtml = isBetter ? `<strong class="compare-better-value">${valueHtml}</strong>` : valueHtml;
  const rawValueHtml = component?.raw !== undefined && component?.raw !== null
    ? escapeHtml(formatPlatformComponentRawValue(component.raw))
    : '';
  const emphasizedRawValueHtml = rawIsBetter ? `<strong class="compare-better-value">${rawValueHtml}</strong>` : rawValueHtml;
  const rawHtml = rawValueHtml ? `<div class="compare-subvalue">raw ${emphasizedRawValueHtml}</div>` : '';
  return `${emphasizedValueHtml}${rawHtml}`;
}

function sortCompareComponentNames(leftComponents: Record<string, any>, rightComponents: Record<string, any>) {
  return Array.from(new Set([...Object.keys(leftComponents), ...Object.keys(rightComponents)])).sort((a, b) => {
    const availabilityDiff = getCompareComponentNormalizedAvailability(b, leftComponents, rightComponents) - getCompareComponentNormalizedAvailability(a, leftComponents, rightComponents);
    if (availabilityDiff !== 0) return availabilityDiff;

    const weightDiff = getCompareComponentSortWeight(b, leftComponents, rightComponents) - getCompareComponentSortWeight(a, leftComponents, rightComponents);
    if (weightDiff !== 0) return weightDiff;

    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
}

async function showPlatformComparePage(providerA: string, deviceA: string, providerB: string, deviceB: string) {
  const container = document.getElementById('platforms-container');
  if (!container) return;
  container.innerHTML = '<div class="meta">Loading comparison…</div>';
  try {
    const data = await loadPlatformsIndex();
    const platforms = Array.isArray((data as any).platforms) ? (data as any).platforms : [];
    setPlatformsIndexCache(platforms);
    try { await loadPlatformScores(); } catch {}

    const defaults = findDefaultComparePair(platforms, providerA);
    const left = normalizeCompareSelection(providerA, deviceA, defaults[0]);
    if (!left) {
      container.innerHTML = '<div class="meta">At least two platforms are needed for comparison.</div>';
      return;
    }

    const leftProvider = String(left.provider || '');
    const leftDevice = String(left.device || '');
    const requestedRight = normalizeCompareSelection(providerB, deviceB, defaults[1]);
    const right = requestedRight && (String(requestedRight.provider || '') !== leftProvider || String(requestedRight.device || '') !== leftDevice)
      ? requestedRight
      : findDefaultComparePeer(leftProvider, leftDevice);
    if (!right) {
      container.innerHTML = '<div class="meta">At least two platforms are needed for comparison.</div>';
      return;
    }

    const rightProvider = String(right.provider || '');
    const rightDevice = String(right.device || '');
    const [leftDetail, rightDetail] = await Promise.all([
      loadPlatformDetail(leftProvider, leftDevice).catch((err) => ({ provider: leftProvider, device: leftDevice, error: String(err) })),
      loadPlatformDetail(rightProvider, rightDevice).catch((err) => ({ provider: rightProvider, device: rightDevice, error: String(err) })),
    ]);
    renderPlatformComparePage(leftDetail, rightDetail);
  } catch (err) {
    console.error('[platforms] compare load failed:', err);
    container.innerHTML = '<div style="padding:12px;color:#f88">Failed to load comparison.</div>';
  }
}

function renderComparePickerHtml(leftProvider: string, leftDevice: string, rightProvider: string, rightDevice: string) {
  const platforms = (platformsIndexCache || []).slice().sort((a: any, b: any) => renderPlatformOptionLabel(a).localeCompare(renderPlatformOptionLabel(b)));
  const optionHtml = (options: any[], selectedProvider: string, selectedDevice: string) => options.map((p: any) => {
    const provider = String(p.provider || '');
    const device = String(p.device || '');
    const selected = provider === selectedProvider && device === selectedDevice ? ' selected' : '';
    const theme = getProviderCompareTheme(provider);
    const style = getProviderCompareOptionStyle(provider);
    return `<option class="compare-picker__option compare-picker__option--${theme}" style="${escapeAttr(style)}" value="${escapeAttr(`${provider}||${device}`)}"${selected}>${escapeHtml(renderPlatformOptionLabel(p))}</option>`;
  }).join('');
  return `
    <form class="compare-picker" id="compare-picker">
      <label><span>Device A</span><select id="compare-a" class="compare-picker__select">${optionHtml(platforms, leftProvider, leftDevice)}</select></label>
      <label><span>Compare with</span><select id="compare-b" class="compare-picker__select">${optionHtml(platforms, rightProvider, rightDevice)}</select></label>
    </form>
  `.trim();
}

function bindComparePicker() {
  const form = document.getElementById('compare-picker') as HTMLFormElement | null;
  const a = document.getElementById('compare-a') as HTMLSelectElement | null;
  const b = document.getElementById('compare-b') as HTMLSelectElement | null;
  if (!form || !a || !b) return;
  const navigate = () => {
    const [pa, da] = String(a.value || '').split('||');
    let [pb, db] = String(b.value || '').split('||');
    if (!pa || !da) return;
    if (!pb || !db || (pb === pa && db === da)) {
      const peer = findDefaultComparePeer(pa, da);
      if (!peer) return;
      pb = String(peer.provider || '');
      db = String(peer.device || '');
    }
    const hash = buildCompareHash(pa, da, pb, db);
    if (location.hash !== hash) location.hash = hash;
    else applyHashRouting();
  };
  a.addEventListener('change', navigate);
  b.addEventListener('change', navigate);
  form.addEventListener('submit', (ev) => { ev.preventDefault(); });
}



function formatCompareGraphNumber(value: number | null, digits = 3) {
  return value !== null && Number.isFinite(value) ? value.toFixed(digits) : '–';
}

const COMPARE_GRAPH_LOG_SCALE = 100;
const COMPARE_GRAPH_FULL_SCALE = 8000;
const COMPARE_GRAPH_BASELINE = 100;
const COMPARE_GRAPH_BASELINE_WIDTH = 50;
const COMPARE_GRAPH_MIN_WIDTH = 4;
const COMPARE_GRAPH_MAX_WIDTH = 95;
const COMPARE_GRAPH_MIN_ROW_MAX_WIDTH = 62;

function getCompareGraphRowMaxWidth(scaleValue: number) {
  const scaleRatio = Math.max(1, scaleValue / COMPARE_GRAPH_BASELINE);
  const maxRatio = Math.max(1, COMPARE_GRAPH_FULL_SCALE / COMPARE_GRAPH_BASELINE);
  const progress = maxRatio > 1 ? Math.log(scaleRatio) / Math.log(maxRatio) : 1;
  const width = COMPARE_GRAPH_MIN_ROW_MAX_WIDTH + (COMPARE_GRAPH_MAX_WIDTH - COMPARE_GRAPH_MIN_ROW_MAX_WIDTH) * progress;
  return Math.max(COMPARE_GRAPH_MIN_ROW_MAX_WIDTH, Math.min(COMPARE_GRAPH_MAX_WIDTH, width));
}

function getCompareGraphLogWidth(value: number | null, scaleValue = COMPARE_GRAPH_LOG_SCALE) {
  if (value === null || !Number.isFinite(value) || value <= 0) return 0;
  const scale = Number.isFinite(scaleValue) && scaleValue > 0
    ? Math.max(scaleValue, value, COMPARE_GRAPH_BASELINE)
    : Math.max(value, COMPARE_GRAPH_BASELINE);
  if (value === COMPARE_GRAPH_BASELINE) return COMPARE_GRAPH_BASELINE_WIDTH;

  let width = COMPARE_GRAPH_BASELINE_WIDTH;
  if (value > COMPARE_GRAPH_BASELINE) {
    const rowMaxWidth = getCompareGraphRowMaxWidth(scale);
    const valueRatio = value / COMPARE_GRAPH_BASELINE;
    const scaleRatio = scale / COMPARE_GRAPH_BASELINE;
    const progress = scaleRatio > 1 ? Math.log(valueRatio) / Math.log(scaleRatio) : 1;
    width = COMPARE_GRAPH_BASELINE_WIDTH + (rowMaxWidth - COMPARE_GRAPH_BASELINE_WIDTH) * progress;
  } else {
    const progress = Math.log1p(value) / Math.log1p(COMPARE_GRAPH_BASELINE);
    width = COMPARE_GRAPH_BASELINE_WIDTH * progress;
  }
  return Math.max(COMPARE_GRAPH_MIN_WIDTH, Math.min(100, width));
}

function renderCompareGraphBars(leftLabel: string, rightLabel: string, leftValue: number | null, rightValue: number | null, scaleValue?: number) {
  const finiteValues = [leftValue, rightValue].filter((value): value is number => value !== null && Number.isFinite(value) && value > 0);
  const rowScale = scaleValue !== undefined && Number.isFinite(scaleValue) && scaleValue > 0
    ? scaleValue
    : Math.max(COMPARE_GRAPH_LOG_SCALE, ...finiteValues);
  const leftWidth = getCompareGraphLogWidth(leftValue, rowScale);
  const rightWidth = getCompareGraphLogWidth(rightValue, rowScale);
  return `
    <div class="compare-graph-bars" aria-hidden="true">
      <div class="compare-graph-bar-row"><span>${escapeHtml(leftLabel)}</span><i class="compare-graph-bar compare-graph-bar--left" style="width:${leftWidth.toFixed(1)}%"></i></div>
      <div class="compare-graph-bar-row"><span>${escapeHtml(rightLabel)}</span><i class="compare-graph-bar compare-graph-bar--right" style="width:${rightWidth.toFixed(1)}%"></i></div>
    </div>
  `.trim();
}

function renderCompareGraphValueCell(valueHtml: string, resultsHref = '', isBetter = false) {
  const classes = `compare-graph-value${isBetter ? ' compare-graph-value--better' : ''}${resultsHref ? ' compare-component-result-cell' : ''}`;
  const attrs = resultsHref
    ? ` class="${classes}" data-results-href="${escapeAttr(resultsHref)}" tabindex="0" role="link" title="Open matching results"`
    : ` class="${classes}"`;
  return `<td${attrs}>${valueHtml}</td>`;
}

function renderCompareGraphRow(label: string, leftValue: number | null, rightValue: number | null, leftLabel: string, rightLabel: string, differenceHtml: string, digits = 3, leftHref = '', rightHref = '', scaleValue?: number) {
  const leftFinite = leftValue !== null && Number.isFinite(leftValue);
  const rightFinite = rightValue !== null && Number.isFinite(rightValue);
  const leftIsBetter = leftFinite && rightFinite && leftValue > rightValue;
  const rightIsBetter = leftFinite && rightFinite && rightValue > leftValue;
  return `<tr><th scope="row"><strong>${escapeHtml(label)}</strong>${renderCompareGraphBars(leftLabel, rightLabel, leftValue, rightValue, scaleValue)}</th>${renderCompareGraphValueCell(escapeHtml(formatCompareGraphNumber(leftValue, digits)), leftHref, leftIsBetter)}${renderCompareGraphValueCell(escapeHtml(formatCompareGraphNumber(rightValue, digits)), rightHref, rightIsBetter)}<td class="compare-graph-difference">${differenceHtml}</td></tr>`;
}

function bindCompareComponentResultCells(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.compare-component-result-cell[data-results-href]').forEach((cell) => {
    const href = cell.getAttribute('data-results-href') || '';
    if (!href) return;
    const open = () => {
      const graphTable = cell.closest<HTMLElement>('.compare-graph-wrap');
      const componentSection = cell.closest<HTMLElement>('#compare-benchmark-components');
      (graphTable || componentSection)?.scrollIntoView({ block: 'start', behavior: 'auto' });
      const current = parseHash();
      if (current.view === 'platforms' && current.compare_provider_a && current.compare_device_a && current.compare_provider_b && current.compare_device_b) {
        current.compare_anchor = graphTable ? 'graph' : 'components';
        history.replaceState(null, '', '#' + new URLSearchParams(current).toString());
      }
      if (location.hash !== href) location.hash = href;
      else applyHashRouting();
    };
    cell.addEventListener('click', open);
    cell.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open();
    });
  });
}


function bindCompareGraphNavigationAnchors(root: HTMLElement) {
  root.querySelectorAll<HTMLAnchorElement>('.compare-graph-wrap a[href]').forEach((link) => {
    link.addEventListener('click', () => {
      const current = parseHash();
      if (current.view === 'platforms' && current.compare_provider_a && current.compare_device_a && current.compare_provider_b && current.compare_device_b) {
        current.compare_anchor = 'graph';
        history.replaceState(null, '', '#' + new URLSearchParams(current).toString());
      }
    });
  });
}

function bindCompareHelpTooltips(root: HTMLElement) {
  const tipHtmlFor = (which: string) => {
    if (which === 'compare-overlap-score') {
      return `A comparison score calculated only from benchmark components both devices share. <a href="${escapeAttr(buildOverlapScoreHelpHashFromRoute(parseHash()))}">Learn more</a>`;
    }
    return '';
  };

  root.querySelectorAll<HTMLElement>('.compare-help[data-tip], .compare-score-help[data-tip]').forEach((el) => {
    if ((el as any).dataset.tipBound === '1') return;
    const html = tipHtmlFor(el.getAttribute('data-tip') || '');
    if (!html) return;
    const show = () => showGlobalTooltip(el, html);
    const hide = () => hideGlobalTooltipSoon();
    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
    el.addEventListener('mousemove', cancelHideGlobalTooltip);
    el.addEventListener('focus', show);
    el.addEventListener('blur', hide);
    (el as any).dataset.tipBound = '1';
  });
}

function renderPlatformComparePage(left: any, right: any) {
  const container = document.getElementById('platforms-container');
  if (!container) return;
  const leftProvider = String(left?.provider || 'Unknown');
  const leftDevice = String(left?.device || 'Unknown');
  const rightProvider = String(right?.provider || 'Unknown');
  const rightDevice = String(right?.device || 'Unknown');
  const leftScoreRaw = left?.metriq_score?.value;
  const rightScoreRaw = right?.metriq_score?.value;
  const leftScore = leftScoreRaw === null || leftScoreRaw === undefined ? null : Number(leftScoreRaw);
  const rightScore = rightScoreRaw === null || rightScoreRaw === undefined ? null : Number(rightScoreRaw);
  const leftCoverage = extractPlatformCoverage(left);
  const rightCoverage = extractPlatformCoverage(right);
  const leftComponents = left?.metriq_score?.components && typeof left?.metriq_score?.components === 'object' ? left.metriq_score.components : {};
  const rightComponents = right?.metriq_score?.components && typeof right?.metriq_score?.components === 'object' ? right.metriq_score.components : {};
  const componentNames = sortCompareComponentNames(leftComponents, rightComponents);
  const overlapComponentNames = componentNames.filter((name) => getCompareComponentNormalizedAvailability(name, leftComponents, rightComponents) === 2);
  const leftOverlapScore = overlapComponentNames.length ? calculateOverlapMetriqScore(leftComponents, overlapComponentNames, leftComponents, rightComponents) : null;
  const rightOverlapScore = overlapComponentNames.length ? calculateOverlapMetriqScore(rightComponents, overlapComponentNames, leftComponents, rightComponents) : null;
  const metadataRows = extractDeviceMetadataRows([left, right]);
  const leftHeaderHtml = renderCompareDeviceHeaderLink(leftProvider, leftDevice);
  const rightHeaderHtml = renderCompareDeviceHeaderLink(rightProvider, rightDevice);
  const summaryRows = [
    renderCompareMetricRow('Metriq Score', leftScore !== null && Number.isFinite(leftScore) ? leftScore.toFixed(2) : '–', rightScore !== null && Number.isFinite(rightScore) ? rightScore.toFixed(2) : '–'),
    renderCompareMetricRowHtml(renderCompareOverlapScoreLabelHtml(), renderCompareMaybeBetterNumber(leftOverlapScore, rightOverlapScore, 2), renderCompareMaybeBetterNumber(rightOverlapScore, leftOverlapScore, 2)),
  ].join('');
  const dataRows = [
    renderCompareMetricRow('Benchmark coverage', leftCoverage ? `${leftCoverage.covered}/${leftCoverage.total}` : '–', rightCoverage ? `${rightCoverage.covered}/${rightCoverage.total}` : '–'),
    renderCompareMetricRow('Runs in suite data', escapeHtml(String(left?.runs ?? '–')), escapeHtml(String(right?.runs ?? '–'))),
    renderCompareMetricRow('First seen in data', left?.first_seen ? escapeHtml(formatDateOnly(left.first_seen)) : '–', right?.first_seen ? escapeHtml(formatDateOnly(right.first_seen)) : '–'),
    renderCompareMetricRow('Last seen in data', left?.last_seen ? escapeHtml(formatDateOnly(left.last_seen)) : '–', right?.last_seen ? escapeHtml(formatDateOnly(right.last_seen)) : '–'),
  ].join('');

  const metadataHtml = metadataRows.length ? metadataRows.map((row: any) => renderCompareMetricRow(row.label, escapeHtml(row.values[0]), escapeHtml(row.values[1]))).join('') : renderCompareMetricRow('Metadata', '–', '–');
  const componentHtml = componentNames.length ? componentNames.map((name) => {
    const lc = leftComponents[name] || {};
    const rc = rightComponents[name] || {};
    const ln = lc?.normalized === null || lc?.normalized === undefined ? null : Number(lc.normalized);
    const rn = rc?.normalized === null || rc?.normalized === undefined ? null : Number(rc.normalized);
    const weight = getCompareComponentDisplayWeight(name, leftComponents, rightComponents);
    const weightCell = weight !== null ? weight.toFixed(2) : '–';
    const leftHasNumericValue = ln !== null && Number.isFinite(ln);
    const rightHasNumericValue = rn !== null && Number.isFinite(rn);
    const leftRaw = getCompareComponentRawNumber(lc);
    const rightRaw = getCompareComponentRawNumber(rc);
    const hasComparableRawValues = leftHasNumericValue && rightHasNumericValue && leftRaw !== null && rightRaw !== null && leftRaw !== rightRaw;
    const lowerRawIsBetter = isLowerRawBetterCompareComponent(name);
    const leftRawIsBetter = hasComparableRawValues && (lowerRawIsBetter ? leftRaw < rightRaw : leftRaw > rightRaw);
    const rightRawIsBetter = hasComparableRawValues && (lowerRawIsBetter ? rightRaw < leftRaw : rightRaw > leftRaw);
    const leftResultsHref = buildCompareComponentResultsHash(leftProvider, leftDevice, name, lc);
    const rightResultsHref = buildCompareComponentResultsHash(rightProvider, rightDevice, name, rc);
    const leftCell = renderCompareComponentValueHtml(ln, lc, leftHasNumericValue && rightHasNumericValue && ln > rn, leftRawIsBetter);
    const rightCell = renderCompareComponentValueHtml(rn, rc, leftHasNumericValue && rightHasNumericValue && rn > ln, rightRawIsBetter);
    return renderCompareComponentRow(name, weightCell, leftCell, rightCell, leftHasNumericValue ? leftResultsHref : '', rightHasNumericValue ? rightResultsHref : '');
  }).join('') : renderCompareComponentRow('Components', '–', '–', '–');


  const compareGraphRows = [
    renderCompareGraphRow('Overlap Score', leftOverlapScore, rightOverlapScore, leftDevice, rightDevice, renderCompareComponentRatioHtml(leftOverlapScore, rightOverlapScore, true), 2),
    ...componentNames.map((name) => {
      const lc = leftComponents[name] || {};
      const rc = rightComponents[name] || {};
      const ln = lc?.normalized === null || lc?.normalized === undefined ? null : Number(lc.normalized);
      const rn = rc?.normalized === null || rc?.normalized === undefined ? null : Number(rc.normalized);
      const leftHasNumericValue = ln !== null && Number.isFinite(ln);
      const rightHasNumericValue = rn !== null && Number.isFinite(rn);
      const leftHref = buildCompareComponentResultsHash(leftProvider, leftDevice, name, lc);
      const rightHref = buildCompareComponentResultsHash(rightProvider, rightDevice, name, rc);
      return renderCompareGraphRow(name, ln, rn, leftDevice, rightDevice, renderCompareComponentRatioHtml(ln, rn, true), 3, leftHasNumericValue ? leftHref : '', rightHasNumericValue ? rightHref : '');
    }),
  ].join('');

  container.innerHTML = `
    <div class="compare-view">
      <div class="meta"><a id="compare-back" href="#view=platforms">← Back to Platforms</a></div>
      <div class="compare-head">
        <div>
          <h3>Compare devices</h3>
          <p class="meta">Explore side-by-side differences in metadata and available suite results without ranking devices.</p>
        </div>
      </div>
      ${renderComparePickerHtml(leftProvider, leftDevice, rightProvider, rightDevice)}
      <div class="compare-cards" aria-label="Selected devices">
        <article class="compare-card">
          <div class="compare-card__top">
            <div class="compare-card__eyebrow">Device A</div>
          </div>
          ${renderCompareDeviceTitleHtml(leftProvider, leftDevice, left)}
          <p>${escapeHtml(leftProvider)}</p>
        </article>
        <article class="compare-card compare-card--accent">
          <div class="compare-card__top">
            <div class="compare-card__eyebrow">Device B</div>
          </div>
          ${renderCompareDeviceTitleHtml(rightProvider, rightDevice, right)}
          <p>${escapeHtml(rightProvider)}</p>
        </article>
      </div>
      <section class="compare-section">
        <h4>Data availability</h4>
        <p class="meta">Coverage, run counts, and dates describe the available Metriq dataset for each device, not intrinsic device capabilities.</p>
        <div class="compare-table-wrap"><table class="compare-table">${renderCompareThreeColumnColgroup()}<thead><tr><th>Dataset field</th><th>${leftHeaderHtml}</th><th>${rightHeaderHtml}</th></tr></thead><tbody>${dataRows}</tbody></table></div>
      </section>
      <section class="compare-section">
        <h4>At a glance</h4>
        <p class="meta">Score values summarize the currently published benchmark suite.</p>
        <div class="compare-table-wrap"><table class="compare-table">${renderCompareThreeColumnColgroup()}<thead><tr><th>Metric</th><th>${leftHeaderHtml}</th><th>${rightHeaderHtml}</th></tr></thead><tbody>${summaryRows}</tbody></table></div>
      </section>
      <section class="compare-section">
        <h4>Device details</h4>
        <div class="compare-table-wrap"><table class="compare-table">${renderCompareThreeColumnColgroup()}<thead><tr><th>Spec</th><th>${leftHeaderHtml}</th><th>${rightHeaderHtml}</th></tr></thead><tbody>${metadataHtml}</tbody></table></div>
      </section>
      <section class="compare-section" id="compare-benchmark-components">
        <h4>Benchmark components</h4>
        <p class="meta">Component values are included for exploration only; interpretation depends on each benchmark definition, timestamp, and suite coverage.</p>
        <div class="compare-table-wrap"><table class="compare-table">${renderCompareComponentColgroup()}<thead><tr><th>Component</th><th>Weight</th><th>${leftHeaderHtml}</th><th>${rightHeaderHtml}</th></tr></thead><tbody>${componentHtml}</tbody></table></div>
        <div class="compare-table-wrap compare-graph-wrap"><table class="compare-table compare-graph-table"><colgroup><col style="width:34%" /><col style="width:22%" /><col style="width:22%" /><col style="width:22%" /></colgroup><thead><tr><th aria-label="Comparison graph"></th><th>${leftHeaderHtml}</th><th>${rightHeaderHtml}</th><th>Difference</th></tr></thead><tbody>${compareGraphRows}</tbody></table></div>
      </section>
    </div>
  `;
  bindCompareHelpTooltips(container);
  bindCompareComponentResultCells(container);
  bindCompareGraphNavigationAnchors(container);
  const compareAnchor = parseHash().compare_anchor;
  if (compareAnchor === 'components' || compareAnchor === 'graph') {
    requestAnimationFrame(() => {
      const target = compareAnchor === 'graph'
        ? container.querySelector<HTMLElement>('.compare-graph-wrap')
        : document.getElementById('compare-benchmark-components');
      target?.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  }
  const back = document.getElementById('compare-back');
  back?.addEventListener('click', (ev) => {
    ev.preventDefault();
    location.hash = '#view=platforms';
    applyHashRouting();
  });
  bindComparePicker();
}

async function showPlatformDetailPage(provider: string, device: string) {
  const container = document.getElementById('platforms-container');
  if (!container) return;
  container.innerHTML = '<div class="meta">Loading platform…</div>';
  try {
    if (!Array.isArray(platformsIndexCache) || platformsIndexCache.length === 0) {
      const data = await loadPlatformsIndex();
      const platforms = Array.isArray((data as any).platforms) ? (data as any).platforms : [];
      setPlatformsIndexCache(platforms);
    }
    try { await loadPlatformScores(); } catch {}
    const json = await loadPlatformDetail(provider, device);
    renderPlatformDetailPage(json);
    scrollToPlatformsLead();
  } catch (err) {
    console.error('[platforms] detail load failed:', err);
    renderPlatformDetailPage({ provider, device, error: String(err) });
    scrollToPlatformsLead();
  }
}

function renderPlatformDetailPage(detail: any) {
  const container = document.getElementById('platforms-container');
  if (!container) return;
  const provider = detail?.provider || 'Unknown';
  const device = detail?.device || 'Unknown';
  const runs = detail?.runs ?? 0;
  const lastSeen = detail?.last_seen || '';
  const firstSeen = detail?.first_seen || '';
  const currentMeta = detail?.current?.device_metadata || null;
  const history = Array.isArray(detail?.history) ? detail.history : [];
  const metriqScore = detail?.metriq_score || null;
  const lifecycleNote = renderLifecycleNoteHtml(String(provider), String(device), detail);
  const comparePeer = findDefaultComparePeer(String(provider), String(device));
  const compareActionHtml = comparePeer
    ? `<a class="compare-with-link" href="${buildCompareHash(String(provider), String(device), String(comparePeer.provider || ''), String(comparePeer.device || ''))}"><i class="fa-solid fa-code-compare" aria-hidden="true"></i> Compare with another device</a>`
    : '<span class="compare-with-link compare-with-link--disabled">No comparison device available</span>';
  const error = detail?.error ? `<div class="meta" style="color:#f43f5e;">${escapeHtml(String(detail.error))}</div>` : '';

  const metaHtml = currentMeta ? `<pre style="white-space:pre-wrap;word-break:break-word;background:#f8fafc;border:1px solid rgba(0,0,0,.08);padding:10px;border-radius:8px">${escapeHtml(JSON.stringify(currentMeta, null, 2))}</pre>` : '<div class="meta">No current device metadata.</div>';
  const historyHtml = history.length ? history.map((h: any) => {
    const f = h?.first_seen || '';
    const l = h?.last_seen || '';
    const r = h?.runs ?? 0;
    return `<li>${escapeHtml(f)} → ${escapeHtml(l)} · <strong>${r}</strong> run${r===1?'':'s'}</li>`;
  }).join('') : '<li>No metadata history</li>';

  let scoreHtml = '<div class="meta">No Metriq score available.</div>';
  if (metriqScore && typeof metriqScore === 'object') {
    const valRaw = (metriqScore as any).value;
    const val = (valRaw === null || valRaw === undefined) ? null : Number(valRaw);
    const series = (metriqScore as any).series || '';
    const components = (metriqScore as any).components && typeof (metriqScore as any).components === 'object'
      ? Object.entries((metriqScore as any).components as Record<string, any>)
      : [];
    components.sort((a, b) => {
      const wa = Number(a[1]?.weight) || 0;
      const wb = Number(b[1]?.weight) || 0;
      return wb - wa;
    });
    const rows = components.map(([name, c]) => {
      const benchmark = typeof c?.group === 'string' ? String(c.group).trim() : '';
      const wRaw = c?.weight;
      const rawRaw = c?.raw;
      const nRaw = c?.normalized;
      const w = (wRaw === null || wRaw === undefined) ? null : Number(wRaw);
      const raw = rawRaw === null || rawRaw === undefined ? null : formatPlatformComponentRawValue(rawRaw);
      const n = (nRaw === null || nRaw === undefined) ? null : Number(nRaw);
      const ts = c?.timestamp ? dateOnlyFormatter.format(new Date(c.timestamp)) : '';
      const href = benchmark
        ? buildResultsHash(String(provider), String(device), benchmark, String(c?.timestamp || ''), 'table')
        : '';
      const rowAttrs = href
        ? ` class="platform-component-row" data-results-href="${escapeAttr(href)}" tabindex="0" title="Open matching results"`
        : '';
      return `<tr${rowAttrs}>
        <td>${escapeHtml(name)}</td>
        <td class="num">${w !== null && Number.isFinite(w) ? w.toFixed(2) : '–'}</td>
        <td class="num">${raw !== null ? escapeHtml(raw) : '–'}</td>
        <td class="num">${n !== null && Number.isFinite(n) ? n.toFixed(3) : '–'}</td>
        <td class="num">${escapeHtml(ts)}</td>
      </tr>`;
    }).join('');
    scoreHtml = `
      <div class="meta" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
        <span style="display:inline-flex;align-items:center;gap:6px;background:#eef2ff;color:#312e81;padding:4px 10px;border-radius:999px;font-weight:600;">Series: ${escapeHtml(series || '')}</span>
        <span style="display:inline-flex;align-items:center;gap:6px;background:#ecfeff;color:#164e63;padding:4px 10px;border-radius:999px;font-weight:600;">Value: ${val !== null && Number.isFinite(val) ? val.toFixed(2) : '–'}</span>
      </div>
      ${components.length ? `
        <div class="meta" style="margin-top:12px;">Click a component row to open the matching run in Results.</div>
        <div id="platform-detail-table" style="overflow:auto; margin-top:12px;">
          <table class="smart-table" style="width:100%;min-width:660px;">
            <thead>
              <tr>
                <th>Component</th>
                <th class="num">Weight</th>
                <th class="num">Raw</th>
                <th class="num">Normalized</th>
                <th class="num">Timestamp</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      ` : '<div class="meta">No components</div>'}
    `.trim();
  }

  container.innerHTML = `
    <div class="detail-page" style="display:flex;flex-direction:column;gap:20px;padding-top:4px;">
      <div class="detail-header" style="display:flex;flex-direction:column;gap:6px;">
        <div class="meta"><a id="platform-back" href="#view=platforms" style="color:#2563eb;text-decoration:none;">← Back to Platforms</a></div>
        <h3 style="margin:0;">${escapeHtml(provider)} · ${renderDeviceLabelHtml(String(provider), String(device), detail)}</h3>
        <div class="meta" style="margin-top:2px;">${runs} runs · ${firstSeen || '–'} → ${lastSeen || '–'}</div>
        <div class="detail-actions">${compareActionHtml}</div>
      </div>
      ${lifecycleNote}
      ${error}
      <div class="detail-grid" style="display:flex;flex-direction:column;gap:24px;">
        <section class="detail-section" style="padding:8px 0;">
          <h5 style="margin:0 0 12px;">Metriq score</h5>
          ${scoreHtml}
        </section>
        <section class="detail-section" style="padding:8px 0;">
          <h5 style="margin:0 0 12px;">Current device metadata</h5>
          ${metaHtml}
        </section>
        <section class="detail-section" style="padding:8px 0;">
          <h5 style="margin:0 0 12px;">Metadata history</h5>
          <ul style="margin-top:4px;">${historyHtml}</ul>
        </section>
      </div>
    </div>
  `;
  const backLink = document.getElementById('platform-back');
  if (backLink) {
    backLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      location.hash = '#view=platforms';
      // Route immediately so the list is shown even if hashchange is coalesced.
      applyHashRouting();
    });
  }
  container.querySelectorAll<HTMLTableRowElement>('#platform-detail-table tbody tr[data-results-href]').forEach((row) => {
    const href = row.getAttribute('data-results-href') || '';
    if (!href) return;
    const open = () => {
      if (location.hash !== href) {
        location.hash = href;
      } else {
        applyHashRouting();
      }
    };
    row.addEventListener('click', () => open());
    row.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open();
    });
  });
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"]|'/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'} as any)[c] || c);
}

async function initPlatformsView(forceRender = false) {
  if (platformsLoaded && !forceRender) return;
  const container = document.getElementById('platforms-container');
  if (!container) return;
  if (!platformsLoaded || !container.querySelector('#platforms-table-wrap')) {
    container.innerHTML = '<div class="meta">Loading platforms…</div>';
  }
  try {
    const data = await loadPlatformsIndex();
    const platforms = Array.isArray((data as any).platforms) ? (data as any).platforms : [];
    setPlatformsIndexCache(platforms);
    try {
      await loadPlatformScores();
    } catch {}
    try {
      const runs = await loadBenchmarks();
      deviceSeriesCache = computeDeviceSeries(Array.isArray(runs) ? runs : []);
    } catch {}
    renderPlatformsTable();
  } catch (err) {
    console.error('[platforms] init failed:', err);
    container.innerHTML = '<div style="padding:12px;color:#f88">Failed to load platforms.</div>';
  } finally {
    platformsLoaded = true;
  }
}

function escapeAttr(s: any) {
  return String(s).replace(/\"/g, '&quot;');
}

function getDeviceKey(provider: string, device: string) { return `${provider}::${device}`; }

function computeDeviceSeries(runs: any[]): Map<string, number[]> {
  const weeks = 12;
  const now = Date.now();
  const weekMs = 7*24*3600*1000;
  const edges: number[] = Array.from({length: weeks+1}, (_, i) => now - (weeks-i)*weekMs);
  const series = new Map<string, number[]>();
  runs.forEach((r: any) => {
    const provider = String(r.provider||'');
    const device = String(r.device||'');
    const ts = Number(new Date(r.timestamp||0));
    if (!Number.isFinite(ts)) return;
    let idx = -1;
    for (let i=0;i<weeks;i++){ if (ts>=edges[i] && ts<edges[i+1]) { idx = i; break; } }
    if (idx === -1) return;
    const key = getDeviceKey(provider, device);
    let arr = series.get(key);
    if (!arr) { arr = Array.from({length: weeks}, () => 0); series.set(key, arr); }
    arr[idx] += 1;
  });
  return series;
}

function renderSparkline(values: number[], width=100, height=24, stroke='#2563eb') {
  if (!Array.isArray(values) || !values.length) return '';
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1 || 1);
  const pts: string[] = [];
  values.forEach((v, i) => {
    const x = i*step;
    const y = height - (v/max)*height;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  });
  const polyline = `<polyline fill="none" stroke="${stroke}" stroke-width="1.5" points="${pts.join(' ')}"/>`;
  const base = `<line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="rgba(0,0,0,.12)" stroke-width="1"/>`;
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${base}${polyline}</svg>`;
}

let globalTooltipHideTimer: any = null;

function hideGlobalTooltipSoon(ms = 180) {
  const tip = document.getElementById('global-tooltip') as HTMLDivElement | null;
  if (!tip) return;
  clearTimeout(globalTooltipHideTimer);
  globalTooltipHideTimer = setTimeout(() => { tip.hidden = true; }, ms);
}

function cancelHideGlobalTooltip() {
  clearTimeout(globalTooltipHideTimer);
}

function ensureGlobalTooltip() {
  let tip = document.getElementById('global-tooltip') as HTMLDivElement | null;
  if (tip) return tip;
  tip = document.createElement('div');
  tip.id = 'global-tooltip';
  tip.className = 'global-tooltip';
  tip.hidden = true;
  tip.setAttribute('role', 'tooltip');
  tip.addEventListener('mouseenter', cancelHideGlobalTooltip);
  tip.addEventListener('mouseleave', () => hideGlobalTooltipSoon());
  tip.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement | null;
    const link = target && target.closest ? (target.closest('a') as HTMLAnchorElement | null) : null;
    if (link) {
      // Allow navigation, but hide tooltip immediately.
      tip!.hidden = true;
    }
  });
  document.body.appendChild(tip);

  const hide = () => { tip!.hidden = true; };
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('resize', hide);
  document.addEventListener('keydown', (ev) => { if (!tip!.hidden && ev.key === 'Escape') hide(); });

  return tip;
}

function showGlobalTooltip(anchorEl: HTMLElement, html: string) {
  const tip = ensureGlobalTooltip();
  cancelHideGlobalTooltip();
  tip.innerHTML = html;
  tip.hidden = false;

  // Position after content is set.
  const anchor = anchorEl.getBoundingClientRect();
  const tipRect = tip.getBoundingClientRect();
  const pad = 8;

  let left = anchor.left;
  let top = anchor.bottom + 8;

  // Clamp within viewport.
  left = Math.max(pad, Math.min(left, window.innerWidth - tipRect.width - pad));

  // If it would go below viewport, show above.
  if (top + tipRect.height + pad > window.innerHeight) {
    top = Math.max(pad, anchor.top - tipRect.height - 8);
  }

  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
}

let globalPopoverOutsideHandlerBound = false;
let globalPopoverCloseFn: (() => void) | null = null;

function ensureGlobalPopover() {
  let pop = document.getElementById('global-popover') as HTMLDivElement | null;
  if (pop) return pop;
  pop = document.createElement('div');
  pop.id = 'global-popover';
  pop.className = 'global-popover';
  pop.hidden = true;
  pop.addEventListener('click', (ev) => ev.stopPropagation());
  pop.addEventListener('mousedown', (ev) => ev.stopPropagation());
  document.body.appendChild(pop);

  if (!globalPopoverOutsideHandlerBound) {
    globalPopoverOutsideHandlerBound = true;
    document.addEventListener('mousedown', () => { globalPopoverCloseFn?.(); });
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') globalPopoverCloseFn?.(); });
  }
  return pop;
}

function showGlobalPopover(anchorEl: HTMLElement, html: string) {
  const pop = ensureGlobalPopover();
  pop.innerHTML = html;
  pop.hidden = false;

  const anchor = anchorEl.getBoundingClientRect();
  const popRect = pop.getBoundingClientRect();
  const pad = 10;

  let left = anchor.left;
  let top = anchor.bottom + 8;

  left = Math.max(pad, Math.min(left, window.innerWidth - popRect.width - pad));
  if (top + popRect.height + pad > window.innerHeight) {
    top = Math.max(pad, anchor.top - popRect.height - 8);
  }

  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
}

function closeGlobalPopover() {
  const pop = document.getElementById('global-popover') as HTMLDivElement | null;
  if (pop) pop.hidden = true;
  globalPopoverCloseFn = null;
}

function ensurePlatformsHeaderTooltipsBound(table: HTMLTableElement) {
  const tipHtmlFor = (which: string) => {
    if (which === 'platforms-activity') {
      return `Runs per week over the last 12 weeks (newest week on the right).`;
    }
    if (which === 'platforms-coverage') {
      return `Benchmark components with a recorded result for this device, shown as covered/total.`;
    }
    if (which === 'platforms-score') {
      return `Aggregate score for the device. Click a score cell to see the breakdown. <a href="#view=platforms&help=metriq-score">Learn more</a>`;
    }
    return '';
  };

  const bindHeaderTip = (el: HTMLElement) => {
    if ((el as any).dataset.tipBound === '1') return;
    const which = el.getAttribute('data-tip') || '';
    const html = tipHtmlFor(which);
    if (!html) return;
    const show = () => showGlobalTooltip(el, html);
    const hide = () => hideGlobalTooltipSoon();
    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
    el.addEventListener('mousemove', cancelHideGlobalTooltip);
    el.addEventListener('focus', show);
    el.addEventListener('blur', hide);
    (el as any).dataset.tipBound = '1';
  };

  const tipEls = table.querySelectorAll<HTMLElement>('.th-help[data-tip]');
  tipEls.forEach(bindHeaderTip);
}

function renderPlatformsProviderHeaderHtml() {
  const has = !!(platformProviderFilter || '').trim();
  return `
    <button type="button" class="th-filter-btn${has ? ' is-active' : ''}" id="platform-provider-filter-btn" title="Filter by cloud provider">
      <span class="th-filter-btn__inner">
        <i class="fa-solid fa-filter" aria-hidden="true"></i>
        <span class="th-filter-label">Provider</span>
      </span>
    </button>
  `.trim();
}

function removeLegacyCompareColumn(table: HTMLTableElement) {
  let removed = false;
  while (true) {
    const headers = Array.from(table.querySelectorAll<HTMLTableCellElement>('thead th'));
    const compareIndex = headers.findIndex((th) => {
      const label = (th.getAttribute('data-label') || th.textContent || '').trim();
      return th.classList.contains('compare-col') || label === 'Compare';
    });
    if (compareIndex < 0) break;
    table.querySelector(`colgroup col:nth-child(${compareIndex + 1})`)?.remove();
    table.querySelectorAll<HTMLTableRowElement>('tr').forEach((row) => {
      row.children.item(compareIndex)?.remove();
    });
    removed = true;
  }
  return removed;
}

function ensurePlatformsProviderFilterBound(table: HTMLTableElement) {
  const btn = table.querySelector('#platform-provider-filter-btn') as HTMLButtonElement | null;
  if (btn && !(btn as any).dataset.bound) {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const existing = document.getElementById('global-popover') as HTMLDivElement | null;
      if (existing && !existing.hidden && existing.dataset.anchorId === btn.id) {
        closeGlobalPopover();
        return;
      }

      const providers = Array.from(new Set(
        (Array.isArray(platformsIndexCache) ? platformsIndexCache : [])
          .map((p: any) => String(p?.provider || '').trim())
          .filter((s: string) => !!s),
      )).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

      const current = platformProviderFilter || '';
      const currentLower = current.trim().toLowerCase();
      const currentExact = providers.find((p) => p.toLowerCase() === currentLower) || '';
      const optionsHtml = [
        `<button type="button" class="popover-option${currentExact ? '' : ' is-active'}" data-provider="">All providers</button>`,
        ...providers.map((p) => (
          `<button type="button" class="popover-option${p === currentExact ? ' is-active' : ''}" data-provider="${escapeAttr(p)}">${escapeHtml(p)}</button>`
        )),
      ].join('');

      showGlobalPopover(btn, `
        <div class="popover-title">Provider</div>
        <div class="popover-options"${providers.length ? '' : ' aria-disabled="true"'}>
          ${optionsHtml}
        </div>
        <div class="popover-hint">Tip: click again to close.</div>
      `.trim());

      const pop = document.getElementById('global-popover') as HTMLDivElement | null;
      if (pop) pop.dataset.anchorId = btn.id;

      globalPopoverCloseFn = () => { closeGlobalPopover(); };

      const optionBtns = pop?.querySelectorAll<HTMLButtonElement>('button.popover-option[data-provider]');
      optionBtns?.forEach((b) => {
        b.addEventListener('click', (e) => {
          e.preventDefault();
          platformProviderFilter = b.getAttribute('data-provider') || '';
          renderPlatformsTable();
          closeGlobalPopover();
        });
      });
    });
    (btn as any).dataset.bound = '1';
  }
}

function renderPlatformsTable() {
  const container = document.getElementById('platforms-container');
  if (!container) return;
  // Legacy controls header (search/select) is no longer used.
  const legacyControls = document.getElementById('platform-controls');
  if (legacyControls) legacyControls.remove();
  const platforms = Array.isArray(platformsIndexCache) ? platformsIndexCache.slice() : [];

  let wrap = document.getElementById('platforms-table-wrap') as HTMLDivElement | null;
  if (wrap) {
    wrap.remove();
    wrap = null;
  }
  let table: HTMLTableElement | null = null;
  let tbody: HTMLTableSectionElement | null = null;

		  if (!wrap || !table || !tbody) {
		    container.innerHTML = '';
		    wrap = document.createElement('div');
		    wrap.id = 'platforms-table-wrap';
		    table = document.createElement('table');
		    table.className = 'smart-table';
		    table.innerHTML = `
		      <colgroup>
		        <col style="width: 205px;" />
		        <col style="width: 70px;" />
		        <col style="width: 140px;" />
		        <col style="width: 210px;" />
		        <col style="width: 92px;" />
		        <col style="width: 118px;" />
		        <col style="width: 116px;" />
		        <col />
		      </colgroup>
		      <thead>
		        <tr>
		          <th data-col="device" data-label="Device" class="sortable">Device</th>
		          <th data-col="num_qubits" data-label="Qubits" class="sortable">Qubits</th>
		          <th data-col="provider" data-label="Provider" class="sortable">${renderPlatformsProviderHeaderHtml()}</th>
		          <th data-col="score" data-label="Metriq Score" class="sortable num">
		            <span class="th-help" tabindex="0" data-tip="platforms-score">Metriq Score</span>
		          </th>
		          <th data-col="coverage" data-label="Coverage" class="sortable num">
		            <span class="th-help" tabindex="0" data-tip="platforms-coverage">Coverage</span>
		          </th>
		          <th data-col="last_seen" data-label="Last Updated" class="sortable num">Last Updated</th>
		          <th data-label="Recent Activity" class="activity-col">
		            <span class="th-help" tabindex="0" data-tip="platforms-activity">Recent Activity</span>
		          </th>
		        </tr>
		      </thead>
	      <tbody></tbody>`;
	    tbody = table.querySelector('tbody') as HTMLTableSectionElement;
	    wrap.appendChild(table);
	    container.appendChild(wrap);

		    ensurePlatformsHeaderTooltipsBound(table);
		    ensurePlatformsProviderFilterBound(table);

			    const headCellsInit = table.querySelectorAll<HTMLTableCellElement>('thead th[data-col]');
			    headCellsInit.forEach((th) => {
			      th.style.cursor = 'pointer';
			      th.addEventListener('click', (ev) => {
		        const clickCol = String(th.getAttribute('data-col')) as typeof platformSortKey;
		        if (platformSortKey === clickCol) {
		          platformSortDir = platformSortDir === 'asc' ? 'desc' : 'asc';
			        } else {
			          platformSortKey = clickCol;
		          platformSortDir = (clickCol === 'device') ? 'asc' : 'desc';
		        }
	        renderPlatformsTable();
	      });
	    });
	  }

	  // Provider filter header (created once above) is overwritten by sort indicators; restore and bind each render.
	  const providerTh = table!.querySelector('thead th[data-col="provider"]') as HTMLTableCellElement | null;
	  if (providerTh) providerTh.innerHTML = renderPlatformsProviderHeaderHtml();
	  ensurePlatformsProviderFilterBound(table!);

	  const providerTerm = (platformProviderFilter || '').toLowerCase().trim();
	  const filtered = platforms.filter((p: any) => {
	    if (providerTerm) {
	      const prov = String(p.provider || '').toLowerCase();
	      if (prov !== providerTerm) return false;
	    }
	    return true;
	  });

	  filtered.sort((a: any, b: any) => {
	    const keyA = getDeviceKey(String(a.provider||''), String(a.device||''));
	    const keyB = getDeviceKey(String(b.provider||''), String(b.device||''));
	    const sa = platformScoresCache && platformScoresCache.get(keyA);
	    const sb = platformScoresCache && platformScoresCache.get(keyB);
	    const ca = platformCoverageCache && platformCoverageCache.get(keyA);
	    const cb = platformCoverageCache && platformCoverageCache.get(keyB);
	    const qa = platformQubitsCache && platformQubitsCache.get(keyA);
	    const qb = platformQubitsCache && platformQubitsCache.get(keyB);
	    const dir = platformSortDir === 'asc' ? 1 : -1;

	    if (platformSortKey === 'score') {
	      const va = sa ?? Number.NEGATIVE_INFINITY;
	      const vb = sb ?? Number.NEGATIVE_INFINITY;
	      if (va !== vb) return (va < vb ? -1 : 1) * dir;
	    } else if (platformSortKey === 'coverage') {
	      const ra = ca && ca.total > 0 ? ca.covered / ca.total : Number.NEGATIVE_INFINITY;
	      const rb = cb && cb.total > 0 ? cb.covered / cb.total : Number.NEGATIVE_INFINITY;
	      if (ra !== rb) return (ra < rb ? -1 : 1) * dir;
	      const va = ca?.covered ?? Number.NEGATIVE_INFINITY;
	      const vb = cb?.covered ?? Number.NEGATIVE_INFINITY;
	      if (va !== vb) return (va < vb ? -1 : 1) * dir;
	    } else if (platformSortKey === 'num_qubits') {
	      const va = qa ?? Number.NEGATIVE_INFINITY;
	      const vb = qb ?? Number.NEGATIVE_INFINITY;
	      if (va !== vb) return (va < vb ? -1 : 1) * dir;
	    } else if (platformSortKey === 'last_seen') {
	      const ta = Number(new Date(a.last_seen || 0));
	      const tb = Number(new Date(b.last_seen || 0));
	      if (ta !== tb) return (ta < tb ? -1 : 1) * dir;
	    } else if (platformSortKey === 'provider') {
	      const pa = String(a.provider||'');
	      const pb = String(b.provider||'');
	      if (pa !== pb) return pa.localeCompare(pb) * dir;
	    } else if (platformSortKey === 'device') {
	      const da = String(a.device||'');
	      const db = String(b.device||'');
	      if (da !== db) return da.localeCompare(db) * dir;
	    }

	    const p = String(a.provider||'').localeCompare(String(b.provider||''));
	    if (p !== 0) return p;
	    return String(a.device||'').localeCompare(String(b.device||''));
	  });

  if (!tbody) return;
  const maxScore = filtered.reduce((max: number, p: any) => {
    const key = getDeviceKey(String(p.provider || ''), String(p.device || ''));
    const scoreVal = platformScoresCache && platformScoresCache.get(key);
    const v = (scoreVal !== undefined && Number.isFinite(scoreVal)) ? Number(scoreVal) : Number.NEGATIVE_INFINITY;
    return v > max ? v : max;
  }, Number.NEGATIVE_INFINITY);

  const rows: string[] = [];
  filtered.forEach((p: any) => {
    const provider = String(p.provider || '');
    const device = String(p.device || '');
    const key = getDeviceKey(provider, device);
    const numQubits = platformQubitsCache && platformQubitsCache.get(key);
    const coverage = platformCoverageCache && platformCoverageCache.get(key);
    const series = (deviceSeriesCache && deviceSeriesCache.get(key)) || [];
    const spark = series.length ? renderSparkline(series) : '';
    const href = buildPlatformDetailHash(provider, device);
    const lifecycle = getPlatformLifecycle(provider, device, p);
    const isRetired = lifecycle?.status === 'retired';
    const deviceLabel = renderDeviceLabelHtml(provider, device, p);
    const scoreVal = platformScoresCache && platformScoresCache.get(key);
    const scoreText = (scoreVal !== undefined && Number.isFinite(scoreVal)) ? scoreVal.toFixed(2) : '–';
    const coverageText = coverage && coverage.total > 0 ? `${coverage.covered}/${coverage.total}` : '–';
    const scorePct = (scoreVal !== undefined && Number.isFinite(scoreVal) && Number.isFinite(maxScore) && maxScore > 0)
      ? Math.max(0, Math.min(100, (Number(scoreVal) / maxScore) * 100))
      : 0;
    const lastTs = p.last_seen ? dateOnlyFormatter.format(new Date(p.last_seen)) : '';
    const comparePeer = findDefaultComparePeer(provider, device);
    const compareHtml = comparePeer
      ? `<a class="compare-link" href="${buildCompareHash(provider, device, String(comparePeer.provider || ''), String(comparePeer.device || ''))}">Compare with…</a>`
      : '<span class="compare-link compare-link--disabled" title="No same-provider comparison device available">Not available</span>';
    rows.push(`
      <tr${isRetired ? ' class="platform-row--retired"' : ''}>
        <td><a href="${href}">${deviceLabel}</a></td>
        <td>${numQubits !== undefined && numQubits !== null ? escapeHtml(String(numQubits)) : '—'}</td>
        <td title="${escapeAttr(provider)}">${escapeHtml(provider)}</td>
        <td class="num metriq-score" data-provider="${escapeAttr(provider)}" data-device="${escapeAttr(device)}" title="View Metriq score breakdown"><div class="scorecell"><span class="scorecell__value">${scoreText}</span><span class="scorebar" aria-hidden="true"><span class="scorebar__fill" style="width:${scorePct.toFixed(1)}%"></span></span></div></td>
        <td class="num">${escapeHtml(coverageText)}</td>
        <td class="num">${escapeHtml(lastTs || '')}</td>
        <td class="compare-col">${compareHtml}</td>
        <td class="activity-col">${spark}</td>
      </tr>`);
  });
  tbody.innerHTML = rows.join('');
  tbody.querySelectorAll<HTMLTableCellElement>('td.compare-col').forEach((cell) => {
    cell.textContent = '';
  });
  if (table && (table as any).dataset) {
    const dataTable = table as any;
    if (!dataTable.dataset.scoreClickBound) {
      table.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const cell = target && target.closest ? target.closest('td.metriq-score') as HTMLElement | null : null;
        if (cell) {
          const prov = cell.getAttribute('data-provider') || '';
          const dev = cell.getAttribute('data-device') || '';
          navigateToPlatform(prov, dev);
        }
      });
      dataTable.dataset.scoreClickBound = '1';
    }
  }

		  const headCells = table!.querySelectorAll<HTMLTableCellElement>('thead th[data-col]');
			  headCells.forEach((th) => {
			    const col = String(th.getAttribute('data-col')) as typeof platformSortKey;
			    const baseLabel = th.getAttribute('data-label') || th.textContent || '';
			    const isActive = platformSortKey === col;
			    const icon = isActive ? `<span class="sort-icon" aria-hidden="true">${platformSortDir === 'asc' ? '▲' : '▼'}</span>` : '';
			    if (col === 'score') {
			      th.innerHTML = `
			        <span class="th-help" tabindex="0" data-tip="platforms-score">${escapeHtml(baseLabel)}</span>${icon}
			      `.trim();
			    } else if (col === 'coverage') {
			      th.innerHTML = `
			        <span class="th-help" tabindex="0" data-tip="platforms-coverage">${escapeHtml(baseLabel)}</span>${icon}
			      `.trim();
			    } else if (col === 'provider') {
			      th.innerHTML = `${renderPlatformsProviderHeaderHtml()}${icon}`;
			    } else {
			      th.innerHTML = `${escapeHtml(baseLabel)}${icon}`;
			    }
			  });

		  // Sorting indicator updates overwrite header markup; re-bind tooltip triggers after update.
		  ensurePlatformsHeaderTooltipsBound(table!);
		  ensurePlatformsProviderFilterBound(table!);
		}

function adaptMetriqEtlRow(row: any) {
  const provider = row?.provider ?? 'Unknown';
  const device = row?.device ?? 'Unknown';
  const timestamp = row?.timestamp ?? null;
  const params = (row && typeof row.params === 'object') ? row.params : {};
  const jobType = row?.job_type ?? null;
  const benchmark = params?.benchmark_name ?? jobType ?? 'Unknown';
  const numQubitsRaw = params?.num_qubits ?? params?.max_qubits ?? params?.width;
  const num_qubits = parseNumQubits(numQubitsRaw);
  // Prefer ETL 'metriq_score' but expose it as 'score' (single-benchmark score).
  // Keep raw results/errors for detail view, but do not surface them as chart/table metrics.
  const rawResults = (row && typeof row.results === 'object' && row.results != null) ? row.results : {};
  const rawErrors = (row && typeof row.errors === 'object' && row.errors != null) ? row.errors : {};
  const rawDirections = (row && typeof row.directions === 'object' && row.directions != null) ? row.directions : {};
  const rawParams = params;
  const normalizedScores = (row && typeof row.normalized_scores === 'object' && row.normalized_scores != null)
    ? (row.normalized_scores as Record<string, unknown>)
    : {};
  const parseFinite = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };
  let score: number | null = null;
  const rawScore = row?.metriq_score;
  if (rawScore && typeof rawScore === 'object' && 'value' in rawScore) {
    score = parseFinite((rawScore as Record<string, unknown>).value);
  } else {
    score = parseFinite(rawScore);
  }
  if (score === null) {
    const fallbackVals = Object.values(normalizedScores)
      .map(parseFinite)
      .filter((v): v is number => v !== null);
    if (fallbackVals.length === 1) {
      score = fallbackVals[0];
    } else if (fallbackVals.length > 1) {
      // Fallback for older multi-metric rows where scalar metriq_score is absent.
      score = fallbackVals.reduce((acc, v) => acc + v, 0) / fallbackVals.length;
    }
  }
  let metrics: Record<string, number> = {};
  if (score !== null) {
    // Normalize the exposed metric id from 'metriq_score' → 'score'
    metrics = { score: score };
  } else {
    // Fallback: no metriq_score — keep metrics empty so the main view centers on metriq-score only.
    metrics = {};
  }
  const errors: Record<string, number> = {};
  return { provider, device, benchmark, timestamp, metrics, errors, rawResults, rawErrors, rawDirections, rawParams, num_qubits };
}

function normalizeRun(run: any) {
  const clone = { ...run };
  clone.provider = clone.provider ?? 'Unknown';
  clone.device = clone.device ?? 'Unknown';
  clone.benchmark = clone.benchmark ?? 'Unknown';
  const metrics: Record<string, number> = (clone && typeof clone.metrics === 'object' && clone.metrics != null)
    ? { ...(clone.metrics as Record<string, unknown>) as Record<string, number> }
    : {};
  const errors: Record<string, number> = (clone && typeof clone.errors === 'object' && clone.errors != null)
    ? { ...(clone.errors as Record<string, unknown>) as Record<string, number> }
    : {};
  if (clone.accuracy !== undefined && metrics.accuracy === undefined) {
    const val = Number(clone.accuracy);
    if (Number.isFinite(val)) metrics.accuracy = val;
  }
  Object.keys(metrics).forEach(key => {
    const num = Number(metrics[key]);
    if (!Number.isFinite(num)) {
      delete metrics[key];
    } else {
      metrics[key] = num;
    }
  });
  clone.metrics = metrics;
  Object.keys(errors).forEach(key => {
    const num = Number(errors[key]);
    if (!Number.isFinite(num) || num < 0) {
      delete errors[key];
    } else {
      errors[key] = num;
    }
  });
  clone.errors = errors;
  const nq = parseNumQubits((clone as any).num_qubits);
  const maxQubitsFallback = parseNumQubits((clone as any).max_qubits);
  const qubitsFallback = parseNumQubits((clone as any).qubits);
  const widthFallback = parseNumQubits((clone as any).width);
  if (nq !== null) {
    (clone as any).num_qubits = nq;
  } else if (maxQubitsFallback !== null) {
    (clone as any).num_qubits = maxQubitsFallback;
  } else if (qubitsFallback !== null) {
    (clone as any).num_qubits = qubitsFallback;
  } else if (widthFallback !== null) {
    (clone as any).num_qubits = widthFallback;
  } else {
    delete (clone as any).num_qubits;
  }
  return clone;
}

function parseNumQubits(value: any): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    if (Number.isFinite(num)) return num;
  }
  return null;
}

function loadAppConfig() {
  if (!appConfigPromise) {
    appConfigPromise = (async () => {
      try {
        const resp = await fetch(CONFIG_PATH, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const cfg = await resp.json();
        appConfigCache = cfg && typeof cfg === 'object' ? cfg : {};
        return appConfigCache;
      } catch (err) {
        console.warn('[config] failed to load config.json, using defaults:', err);
        appConfigCache = {};
        return appConfigCache;
      }
    })();
  }
  return appConfigPromise;
}

function appendCacheBust(url) {
  const bust = `_=${Date.now()}`;
  if (url.includes('?')) {
    return `${url}&${bust}`;
  }
  return `${url}?${bust}`;
}

function setupBenchmarkSearch(config) {
  benchmarkPages = Array.isArray(config.benchmarkPages)
    ? config.benchmarkPages
        .map(page => {
          if (!page) return null;
          const label = String(page.label ?? '').trim();
          const url = String(page.url ?? '').trim();
          if (!label || !url) return null;
          return { label, url, lower: label.toLowerCase() };
        })
        .filter(Boolean)
    : [];

  if (searchDatalist) {
    searchDatalist.innerHTML = '';
    benchmarkPages.forEach(page => {
      const option = document.createElement('option');
      option.value = page.label;
      searchDatalist.appendChild(option);
    });
  }

  const hasPages = benchmarkPages.length > 0;
  if (searchInput) {
    searchInput.disabled = !hasPages;
    if (!hasPages) searchInput.value = '';
  }
  if (searchTrigger) {
    searchTrigger.disabled = !hasPages;
  }
}

function resolveBenchmarkUrl(query) {
  if (!benchmarkPages.length) return null;
  if (!query) return benchmarkPages[0].url;
  const lower = query.toLowerCase();
  const exact = benchmarkPages.find(page => page.lower === lower);
  if (exact) return exact.url;
  const partial = benchmarkPages.find(page => page.lower.includes(lower));
  if (partial) return partial.url;
  return null;
}

function openBenchmark(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener');
}

if (searchTrigger) {
  searchTrigger.addEventListener('click', () => {
    console.info('[search] search triggered (link handling disabled)');
  });
}

if (searchInput) {
  searchInput.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      console.info('[search] enter pressed (link handling disabled)');
    }
  });
}

if (metricSelect) {
  metricSelect.addEventListener('change', () => {
    currentMetricId = (metricSelect as HTMLSelectElement).value;
    void drawChart();
    // Refresh static table metric column as well
    void drawTable();
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeDetail();
  }
});

if (detailModal) {
  detailModal.addEventListener('click', (event: MouseEvent) => {
    const t = event.target as HTMLElement | null;
    if (t === detailModal || (t && typeof (t as any).hasAttribute === 'function' && t.hasAttribute('data-detail-close'))) {
      closeDetail();
    }
  });
}

if (detailCloseBtn) {
  detailCloseBtn.addEventListener('click', () => closeDetail());
}

function uniqueValues(values: Array<Record<string, unknown>>, key: string) {
  const seen = new Set<string>();
  values.forEach(item => {
    const value = item?.[key];
    if (value !== undefined && value !== null && value !== "") {
      seen.add(String(value));
    }
  });
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

// Removed native <select> multi-select population; using custom lists instead

function populateFilterOptions(values) {
  // Render custom lists with symbols based on current data
  renderMultiLists();
}

function setupMetrics(values, config) {
  allMetricDefs = buildMetricDefs(values, config);
  if (!allMetricDefs.length) {
    allMetricDefs = [{ id: 'accuracy', label: 'Accuracy', unit: '', scale: 'linear', format: null, description: '' }];
  }
  if (!currentMetricId || !allMetricDefs.find(def => def.id === currentMetricId)) {
    currentMetricId = allMetricDefs[0].id;
  }
}

function buildMetricDefs(values, config) {
  const defs = new Map();
  const fromConfig = Array.isArray(config?.metrics) ? config.metrics : [];
  fromConfig.forEach(def => {
    if (!def || !def.id) return;
    // Normalize config id 'metriq_score' → 'score'
    const rawId = String(def.id);
    const id = rawId === 'metriq_score' ? 'score' : rawId;
    defs.set(id, {
      id,
      label: def.label || (id === 'score' ? 'Score' : id),
      unit: def.unit ? String(def.unit) : '',
      scale: def.scale === 'log' ? 'log' : 'linear',
      format: def.format || null,
      description: def.description || ''
    });
  });
  values.forEach(run => {
    const metrics = run.metrics || {};
    Object.keys(metrics).forEach(key => {
      if (!defs.has(key)) {
        const label = key === 'score' ? 'Score' : key;
        defs.set(key, { id: key, label, unit: '', scale: 'linear', format: null, description: '' });
      }
    });
  });
  return Array.from(defs.values()).sort((a, b) => a.label.localeCompare(b.label));
}

function collectMetricIdsWithValues(runs) {
  const ids = new Set();
  runs.forEach(run => {
    const metrics = run.metrics || {};
    Object.entries(metrics).forEach(([key, value]) => {
      if (Number.isFinite(Number(value))) {
        ids.add(key);
      }
    });
  });
  return ids;
}

function refreshMetricOptions(runs) {
  let visibleDefs = allMetricDefs;
  const restrictToBenchmark = Array.isArray(filterState.benchmark) && filterState.benchmark.length > 0 && runs.length;
  if (restrictToBenchmark) {
    const availableIds = collectMetricIdsWithValues(runs);
    visibleDefs = allMetricDefs.filter(def => availableIds.has(def.id));
    if (!visibleDefs.length) {
      visibleDefs = allMetricDefs;
    }
  }

  if (!visibleDefs.length) {
    return [];
  }

  if (!visibleDefs.find(def => def.id === currentMetricId)) {
    currentMetricId = visibleDefs[0].id;
  }

  if (metricSelect) {
    const fragment = document.createDocumentFragment();
    visibleDefs.forEach(def => {
      const option = document.createElement('option');
      option.value = def.id;
      option.textContent = def.unit ? `${def.label} (${def.unit})` : def.label;
      fragment.appendChild(option);
    });
    metricSelect.innerHTML = '';
    metricSelect.appendChild(fragment);
    metricSelect.value = currentMetricId;
    metricSelect.disabled = visibleDefs.length <= 1;
  }

  return visibleDefs;
}

function getActiveMetric() {
  return allMetricDefs.find(def => def.id === currentMetricId) || allMetricDefs[0];
}

function buildMetricLabel(metric) {
  if (!metric) return 'Metric';
  return metric.unit ? `${metric.label} (${metric.unit})` : metric.label;
}

function updateChartHeading(metric) {
  if (chartTitleEl) {
    chartTitleEl.textContent = `${buildMetricLabel(metric)} over time`;
  }
}

function getMetricValue(run, metricId) {
  const metrics = run.metrics || {};
  const value = Number(metrics[metricId]);
  return Number.isFinite(value) ? value : null;
}

function getMetricError(run, metricId) {
  const errors = run.errors || {};
  const value = Number(errors[metricId]);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function initFilterGroupToggles() {
  document.querySelectorAll<HTMLButtonElement>('.filter-group__toggle').forEach(btn => {
    // Auto-collapse on mobile
    if (window.matchMedia('(max-width: 720px)').matches) {
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
    });
  });
}

function setupFilterSearchInputs() {
  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  const handler = () => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      renderMultiLists();
    }, 150);
  };
  const benchSearch = document.getElementById('filter-search-benchmark') as HTMLInputElement | null;
  const provSearch = document.getElementById('filter-search-provider') as HTMLInputElement | null;
  if (benchSearch) benchSearch.addEventListener('input', handler);
  if (provSearch) provSearch.addEventListener('input', handler);
}

function setupFilters(values) {
  populateFilterOptions(values);
  if (filtersInitialized) return;
  initFilterGroupToggles();
  setupFilterSearchInputs();
  filtersInitialized = true;
}

// Device filter was removed; no-op retained previously has been deleted.

function getFilteredData() {
  const selProv = Array.isArray(filterState.provider) ? filterState.provider : [];
  const selBench = Array.isArray(filterState.benchmark) ? filterState.benchmark : [];
  if (selProv.length === 0 || selBench.length === 0) return [];
  return rawBenchmarks.filter(item => selProv.includes(String(item.provider||'')) && selBench.includes(String(item.benchmark||'')));
}
function openRunDetail(run) {
  if (!detailModal || !detailTitle || !detailBody || !detailSubtitle) return;
  if (!run) return;
  const metric = getActiveMetric();
  const metricFormat = metric.format || '.3f';
  const runMetricValue = getMetricValue(run, metric.id);
  const runMetric = formatMetricValue(runMetricValue, metricFormat, metric.unit);
  const runError = getMetricError(run, metric.id);
  const runMetricWithError = runError !== null
    ? `${runMetric} ± ${formatMetricValue(runError, metricFormat, metric.unit)}`
    : runMetric;
  const lifecycleNote = renderLifecycleNoteHtml(String(run.provider || ''), String(run.device || ''));

  detailTitle.textContent = `${run.provider} · ${run.device}`;
  detailSubtitle.textContent = `${run.benchmark} · ${runMetricWithError} · ${formatTimestamp(run.timestamp)}`;
  detailBody.innerHTML = `
    ${lifecycleNote}
    <section class="detail-section">
      <h5>Job parameters</h5>
      ${renderJobParams(run)}
    </section>
    <section class="detail-section">
      <h5>Raw results</h5>
      <div class="detail-raw">
        ${renderRawResults(run)}
      </div>
    </section>
  `;
  detailModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  if (!detailModal || detailModal.hidden) return;
  detailModal.hidden = true;
  document.body.style.overflow = '';
}

function summarizeMetric(runs, metricId) {
  const values = runs.map(run => getMetricValue(run, metricId)).filter(value => value !== null);
  if (!values.length) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    average: sum / values.length,
    max: Math.max(...values),
    min: Math.min(...values),
  };
}

function formatMetricValue(value, format, unit) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  let formatted;
  if (typeof format === 'string') {
    const match = format.match(/^\.([0-9]+)f$/);
    if (match) {
      const digits = Number(match[1]);
      formatted = Number(value).toFixed(digits);
    } else {
      formatted = Number(value).toLocaleString();
    }
  } else {
    formatted = Number(value).toLocaleString();
  }
  return unit ? `${formatted} ${unit}`.trim() : formatted;
}

function renderRawResults(run: any) {
  try {
    const res = (run && typeof run.rawResults === 'object' && run.rawResults != null) ? run.rawResults : {};
    const errs = (run && typeof run.rawErrors === 'object' && run.rawErrors != null) ? run.rawErrors : {};
    const dirs = (run && typeof run.rawDirections === 'object' && run.rawDirections != null) ? run.rawDirections : {};
    const keys = Object.keys(res);
    if (!keys.length) return '<div class="meta">No raw results available.</div>';
    keys.sort((a,b)=>a.localeCompare(b));
    const rows = keys.map(k => {
      const vRaw = res[k];
      const v = Number(vRaw);
      const vFmt = Number.isFinite(v) ? v.toLocaleString() : escapeHtml(String(vRaw));
      const e = Number(errs[k]);
      const eFmt = Number.isFinite(e) ? e.toLocaleString() : '';
      const d = (dirs && typeof dirs[k] === 'string') ? String(dirs[k]) : '';
      const disp = eFmt ? `${vFmt} ± ${eFmt}` : vFmt;
      const dirDisp = d ? escapeHtml(d) : '—';
      return `<tr><td>${escapeHtml(k)}</td><td class="num">${disp}</td><td>${dirDisp}</td></tr>`;
    }).join('');
    return `
      <div id="benchmarks-table-wrap">
        <table class="smart-table">
          <thead>
            <tr><th>Metric</th><th class="num">Value</th><th>Direction</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  } catch {
    return '<div class="meta">Raw results unavailable.</div>';
  }
}

function renderJobParams(run: any) {
  try {
    const params = (run && typeof run.rawParams === 'object' && run.rawParams != null) ? run.rawParams : {};
    const keys = Object.keys(params);
    if (!keys.length) return '<div class="meta">No job parameters available.</div>';
    keys.sort((a,b)=>a.localeCompare(b));
    const rows = keys.map(k => {
      const v = params[k];
      const disp = (v == null) ? '—' : escapeHtml(String(v));
      return `<tr><td>${escapeHtml(k)}</td><td>${disp}</td></tr>`;
    }).join('');
    return `
      <div id="job-params-wrap">
        <table class="smart-table">
          <thead>
            <tr><th>Parameter</th><th>Value</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  } catch {
    return '<div class="meta">Parameters unavailable.</div>';
  }
}

function buildRunList(runs, metric, limit, includeBenchmark) {
  const format = metric.format || '.3f';
  return runs
    .slice()
    .sort((a, b) => Number(new Date(b.timestamp)) - Number(new Date(a.timestamp)))
    .slice(0, limit)
    .map(entry => {
      const value = formatMetricValue(getMetricValue(entry, metric.id), format, metric.unit);
      const err = getMetricError(entry, metric.id);
      const display = err !== null
        ? `${value} ± ${formatMetricValue(err, format, metric.unit)}`
        : value;
      const label = includeBenchmark ? entry.benchmark : entry.device;
      return `<li>${formatTimestamp(entry.timestamp)} · ${label} · ${display}</li>`;
    })
    .join('');
}

function formatTimestamp(value) {
  if (!value) return '—';
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function formatDateOnly(value) {
  if (!value) return '—';
  try {
    return dateOnlyFormatter.format(new Date(value));
  } catch {
    // Fallback to YYYY-MM-DD if value is a string timestamp
    try {
      const d = new Date(value);
      if (!isNaN(Number(d))) {
        const y = d.getFullYear();
        const m = String(d.getMonth()+1).padStart(2,'0');
        const day = String(d.getDate()).padStart(2,'0');
        return `${y}-${m}-${day}`;
      }
    } catch {}
    return String(value);
  }
}

async function renderChart(values, token, metric) {
  const el = document.getElementById("chart");
  const skeletonGraph = document.getElementById("skeleton-graph");
  if (!el) {
    console.error('[chart] #chart element not found');
    setChartDownloadEnabled(false);
    return;
  }

  if (skeletonGraph) skeletonGraph.style.display = "block";

  const embed: any = (globalThis as any).vegaEmbed;
  if (typeof embed !== "function") {
    console.error('[chart] vegaEmbed is undefined — are the Vega scripts loaded?');
    setChartDownloadEnabled(false);
    if (skeletonGraph) skeletonGraph.style.display = "none";
    return;
  }

  if (token !== renderSequence) {
    return;
  }

  if (!values.length) {
    if (token !== renderSequence) return;
    setChartDownloadEnabled(false);
    if (chartView) {
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
      }
      chartView.finalize();
      chartView = null;
    }
    el.innerHTML = '<div class="chart-empty">No benchmarks match the current filters.</div>';
    if (skeletonGraph) skeletonGraph.style.display = "none";
    return;
  }

  if (chartView) {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    chartView.finalize();
    chartView = null;
  }
  el.innerHTML = "";

  const metricLabel = buildMetricLabel(metric);
  const scaleType = metric?.scale === 'log' ? 'log' : 'linear';
  const tooltipFormat = typeof metric?.format === 'string' ? metric.format : undefined;
  const metricVals = values.map((d: any) => d.metricValue).filter((v: number) => v != null && isFinite(v));
  const yMin = Math.min(...metricVals);
  const yMax = Math.max(...metricVals);
  const yPad = (yMax - yMin) * 0.1 || 1;
  const yScale: any = { type: scaleType, nice: true, domain: [Math.max(0, yMin - yPad), yMax + yPad] };
  const timestamps = values.map((d: any) => new Date(d.timestamp).getTime()).filter((t: number) => isFinite(t));
  const tMin = Math.min(...timestamps);
  const tMax = Math.max(...timestamps);
  const tPad = (tMax - tMin) * 0.05 || 86400000;
  const xScale: any = { domain: [new Date(tMin - tPad).toISOString(), new Date(tMax + tPad).toISOString()] };
  const transform = metric?.scale === 'log'
    ? [{ filter: 'datum.metricValue > 0' }]
    : [];

  // Prepare fixed scales so UI colors/shapes match chart
  const allRuns = Array.isArray(rawBenchmarks) ? rawBenchmarks : [];
  const providers = uniqueValues(allRuns as any, 'provider');
  const benchmarks = uniqueValues(allRuns as any, 'benchmark');
  providerColorMap = buildColorMap(providers);
  benchmarkShapeMap = buildShapeMap(benchmarks);
  const colorDomain = providers;
  const colorRange = providers.map(p => providerColorMap.get(p) as string);
  const shapeDomain = benchmarks;
  const shapeRange = benchmarks.map(b => benchmarkShapeMap.get(b) as string);

  const chartHeight = Math.min(420, window.innerHeight * 0.45);

  // Shared layers for both main chart and overview
  const baseLayers: any[] = [
    // Horizontal baseline at Score = 100
    {
      transform: [{
        aggregate: [
          { op: 'min', field: 'timestamp', as: 'x_min' },
          { op: 'max', field: 'timestamp', as: 'x_max' }
        ]
      },
      { calculate: "timeOffset('day', datum.x_min, -1)", as: 'x_pad_min' },
      { calculate: "timeOffset('day', datum.x_max, 1)", as: 'x_pad_max' }
      ],
      mark: { type: 'rule', strokeDash: [6,4], opacity: 0.85 },
      encoding: {
        color: { value: '#9ca3af' },
        x: { field: 'x_pad_min', type: 'temporal' },
        x2: { field: 'x_pad_max', type: 'temporal' },
        y: { datum: 100 }
      }
    }
  ];

  const dataLayers: any[] = [
    // Error bars layer
    {
      transform: [{ filter: 'datum.metricLower !== null && datum.metricUpper !== null' }],
      mark: { type: 'rule', strokeWidth: 1.5, opacity: 0.5 },
      encoding: {
        y: { field: 'metricLower', type: 'quantitative', scale: yScale },
        y2: { field: 'metricUpper' },
        color: { field: 'provider', type: 'nominal', legend: null, scale: { domain: colorDomain, range: colorRange } }
      }
    },
    // Points layer
    {
      mark: { type: 'point', filled: true, size: 80, opacity: 0.95, stroke: '#fff', strokeWidth: 0.8 },
      encoding: {
        y: { field: 'metricValue', type: 'quantitative', title: metricLabel, scale: yScale },
        color: { field: 'provider', type: 'nominal', legend: null, scale: { domain: colorDomain, range: colorRange } },
        shape: { field: 'benchmark', type: 'nominal', legend: null, scale: { domain: shapeDomain, range: shapeRange } },
        tooltip: [
          { field: 'device', title: 'Device' },
          { field: 'provider', title: 'Provider' },
          { field: 'benchmark', title: 'Benchmark' },
          { field: 'metricValue', title: metricLabel, type: 'quantitative', format: tooltipFormat },
          { field: 'metricError', title: 'Error', type: 'quantitative', format: tooltipFormat },
          { field: 'timestamp', title: 'Timestamp', type: 'temporal', format: '%Y-%m-%d %H:%M' }
        ]
      }
    }
  ];

  // Top-performer annotation: text labels on global frontier-setting data points.
  const annotationMark = { type: 'text' as const, align: 'left' as const, dx: 10, dy: -6, fontSize: 11, fontWeight: 600, font: 'Inter, system-ui, sans-serif', clip: true };
  const annotationEncoding = {
    y: { field: 'metricValue', type: 'quantitative', scale: yScale },
    text: { field: 'device', type: 'nominal' },
    color: { field: 'provider', type: 'nominal', legend: null, scale: { domain: colorDomain, range: colorRange } }
  };
  const topPerformerLayer: any[] = [
    // Global: label points that set a new all-time high across all providers
    {
      transform: [
        { sort: [{ field: 'timestamp' }], window: [{ op: 'max', field: 'metricValue', as: '_globalMax' }], frame: [null, 0] },
        { filter: 'datum.metricValue >= datum._globalMax' },
        { sort: [{ field: 'timestamp' }], window: [{ op: 'row_number', as: '_tieBreak' }], groupby: ['_globalMax'] },
        { filter: 'datum._tieBreak === 1' }
      ],
      mark: annotationMark,
      encoding: annotationEncoding
    }
  ];

  const spec: any = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: `${metricLabel} over time`,
    width: 'container',
    height: chartHeight,
    autosize: { type: 'fit', contains: 'padding' },
    padding: { left: 8, top: 8, right: 8, bottom: 8 },
    config: {
      axis: {
        gridColor: '#e8ecf2',
        gridDash: [3, 3],
        gridOpacity: 0.6,
        domain: false,
        tickSize: 4,
        tickColor: '#d0d7e2',
        labelColor: '#6c778a',
        labelFont: 'Inter, system-ui, sans-serif',
        labelFontSize: 11,
        labelPadding: 6,
        titleColor: '#4a5568',
        titleFont: 'Inter, system-ui, sans-serif',
        titleFontSize: 12,
        titleFontWeight: 500,
        titlePadding: 12
      },
      view: { stroke: null }
    },
    data: { values },
    transform,
    encoding: {
      x: { field: 'timestamp', type: 'temporal', title: 'Run date', axis: { format: '%Y-%m-%d' }, scale: xScale },
      y: { field: 'metricValue', type: 'quantitative', title: metricLabel, scale: yScale }
    },
    layer: [
      {
        params: [{
          name: 'zoom',
          select: { type: 'interval' },
          bind: 'scales'
        }],
        mark: { type: 'point', opacity: 0 }
      },
      ...baseLayers,
      ...dataLayers,
      ...topPerformerLayer
    ]
  };
      
  // Baseline device no longer emphasized in the graph; use reference line instead.

  try {
    const { view } = await embed(el, spec, { actions: false, renderer: 'canvas' });
    if (token !== renderSequence) {
      view.finalize();
      return;
    }
    chartView = view;
    setChartDownloadEnabled(true);
    console.info('[chart] rendering Vega view with', values.length, 'rows');

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    resizeHandler = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (chartView) {
          chartView.resize().run();
        }
      }, 150);
    };
    // Initial resize without debounce
    if (chartView) chartView.resize().run();
    window.addEventListener('resize', resizeHandler, { passive: true });
    // Only open modal when a point (symbol) in the plot area is clicked
    view.addEventListener('click', (event: any, item: any) => {
      try {
        if (item && item.mark && item.mark.marktype === 'symbol' && item.datum && typeof item.datum.metricValue !== 'undefined') {
          openRunDetail(item.datum);
        }
      } catch {}
    });
  } catch (err) {
    if (token !== renderSequence) return;
    console.error('[chart] render failed:', err);
    setChartDownloadEnabled(false);
    el.innerHTML = '<div style="padding:12px;color:#f88">Failed to load chart data. Check the console for details.</div>';
  } finally {
    if (token === renderSequence && skeletonGraph) {
      skeletonGraph.style.display = 'none';
    }
  }
}

// ---- Static Smart Table (sorting + filters independent of chart) ----
// Broaden SortKey to plain string for wider TS compatibility (older TS lacks template literal types)
type SortKey = 'timestamp' | 'provider' | 'device' | 'benchmark' | string;
type TableState = {
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  filterText: string;
  filterProvider: string; // 'all' or provider
  filterDevice: string;   // 'all' or device
  filterBenchmark: string; // 'all' or benchmark
};

let tableState: TableState = {
  sortKey: 'timestamp',
  sortDir: 'desc',
  filterText: '',
  filterProvider: 'all',
  filterDevice: 'all',
  filterBenchmark: 'all',
};

function ensureTableUI() {
  const container = document.getElementById('table-static');
  if (!container) return null as HTMLDivElement | null;
  if (container.getAttribute('data-smart') === '1') return container as HTMLDivElement;
  container.setAttribute('data-smart', '1');
  const controls = document.createElement('div');
	  controls.className = 'smart-controls';
	  controls.innerHTML = `
	    <label class="smart-field">
	      <span>Search</span>
	      <input id="smart-q" type="search" placeholder="Search all columns" autocomplete="off" />
	    </label>
	    <label class="smart-field">
	      <span>Provider</span>
	      <select id="smart-provider"><option value="all">All</option></select>
	    </label>
	    <label class="smart-field">
	      <span>Device</span>
      <select id="smart-device"><option value="all">All</option></select>
    </label>
    <label class="smart-field">
      <span>Benchmark</span>
      <select id="smart-benchmark"><option value="all">All</option></select>
    </label>
    <button type="button" class="btn" id="smart-reset">Reset</button>
  `;
  const tableWrap = document.createElement('div');
  tableWrap.id = 'smart-table-wrap';
  container.innerHTML = '';
  container.appendChild(controls);
  container.appendChild(tableWrap);
  return container as HTMLDivElement;
}

function getMetricSortValue(run: any, metricId: string) {
  const v = getMetricValue(run, metricId);
  return Number.isFinite(v) ? v : Number.NEGATIVE_INFINITY;
}

function populateSmartFilters(values: any[]) {
  const provSel = document.getElementById('smart-provider') as HTMLSelectElement | null;
  const devSel = document.getElementById('smart-device') as HTMLSelectElement | null;
  const benchSel = document.getElementById('smart-benchmark') as HTMLSelectElement | null;
  const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort((a,b)=>a.localeCompare(b));
  if (provSel) {
    const opts = unique(values.map(v => String(v.provider||'')));
    provSel.innerHTML = '<option value="all">All</option>' + opts.map(o=>`<option value="${escapeAttr(o)}">${escapeHtml(o)}</option>`).join('');
    provSel.value = tableState.filterProvider || 'all';
  }
  if (devSel) {
    const opts = unique(values.map(v => String(v.device||'')));
    devSel.innerHTML = '<option value="all">All</option>' + opts.map(o=>`<option value="${escapeAttr(o)}">${escapeHtml(o)}</option>`).join('');
    devSel.value = tableState.filterDevice || 'all';
  }
  if (benchSel) {
    const opts = unique(values.map(v => String(v.benchmark||'')));
    benchSel.innerHTML = '<option value="all">All</option>' + opts.map(o=>`<option value="${escapeAttr(o)}">${escapeHtml(o)}</option>`).join('');
    benchSel.value = tableState.filterBenchmark || 'all';
  }
}

function applyTableFilters(values: any[]) {
  const q = (tableState.filterText || '').toLowerCase();
  return values.filter(v => {
    if (tableState.filterProvider !== 'all' && String(v.provider||'') !== tableState.filterProvider) return false;
    if (tableState.filterDevice !== 'all' && String(v.device||'') !== tableState.filterDevice) return false;
    if (tableState.filterBenchmark !== 'all' && String(v.benchmark||'') !== tableState.filterBenchmark) return false;
    if (q) {
      const blob = `${v.timestamp||''} ${v.provider||''} ${v.device||''} ${v.benchmark||''} ${v.num_qubits ?? ''}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  });
}

function sortTableRows(values: any[]) {
  const { sortKey, sortDir } = tableState;
  const mul = sortDir === 'asc' ? 1 : -1;
  const cmp = (a: any, b: any) => {
    let av:any, bv:any;
    if (sortKey === 'timestamp') { av = Number(new Date(a.timestamp)); bv = Number(new Date(b.timestamp)); }
    else if (sortKey === 'num_qubits') { av = Number(a.num_qubits ?? Number.NEGATIVE_INFINITY); bv = Number(b.num_qubits ?? Number.NEGATIVE_INFINITY); }
    else if (sortKey === 'provider') { av = String(a.provider||''); bv = String(b.provider||''); }
    else if (sortKey === 'device') { av = String(a.device||''); bv = String(b.device||''); }
    else if (sortKey === 'benchmark') { av = String(a.benchmark||''); bv = String(b.benchmark||''); }
    else if (typeof sortKey === 'string' && sortKey.startsWith('metric:')) {
      const id = sortKey.slice('metric:'.length);
      av = getMetricSortValue(a, id);
      bv = getMetricSortValue(b, id);
    } else { av = 0; bv = 0; }
    if (av < bv) return -1*mul;
    if (av > bv) return 1*mul;
    return 0;
  };
  values.sort(cmp);
}

function renderStaticTable(values: any[]) {
  const container = ensureTableUI();
  const wrap = document.getElementById('smart-table-wrap');
  const skeletonTable = document.getElementById('skeleton');
  if (!container || !wrap) return;
  if (skeletonTable) skeletonTable.style.display = 'block';
  const metric = getActiveMetric();

  // Init filters if first time
  populateSmartFilters(values);

  // Apply filters and sorting
  const working = applyTableFilters(values.slice());
	  sortTableRows(working);
	
	  const table = document.createElement('table');
	  table.className = 'smart-table';
	  const sortIcon = (key: SortKey) => (
	    tableState.sortKey === key
	      ? `<span class="sort-icon" aria-hidden="true">${tableState.sortDir === 'asc' ? '▲' : '▼'}</span>`
	      : ''
	  );
	  // Build metric columns dynamically
	  let metricDefs = Array.isArray(allMetricDefs) && allMetricDefs.length ? allMetricDefs : [];
	  if (!metricDefs.length) {
	    const ids = Array.from(collectMetricIdsWithValues(working) as any) as string[];
	    metricDefs = ids.map(id => ({ id, label: id, unit: '', scale: 'linear', format: null } as any));
	  }
	  const metricHeaders = metricDefs.map((def: any) => `<th data-sort="metric:${escapeAttr(def.id)}" class="sortable num">${escapeHtml(buildMetricLabel(def))}${sortIcon(`metric:${def.id}` as SortKey)}</th>`).join('');
	  table.innerHTML = `
	    <thead>
	      <tr>
	        <th data-sort="provider" class="sortable">Provider${sortIcon('provider')}</th>
	        <th data-sort="device" class="sortable">Device${sortIcon('device')}</th>
	        <th data-sort="benchmark" class="sortable">Benchmark${sortIcon('benchmark')}</th>
	        <th data-sort="num_qubits" class="sortable num">Qubits${sortIcon('num_qubits')}</th>
	        ${metricHeaders}
	        <th data-sort="timestamp" class="sortable num">Date${sortIcon('timestamp')}</th>
	      </tr>
	    </thead>
	    <tbody></tbody>
	  `;
  const tbody = table.querySelector('tbody') as HTMLTableSectionElement;
  working.forEach(run => {
    const metricValue = getMetricValue(run, metric.id);
    const err = getMetricError(run, metric.id);
    const formatted = formatMetricValue(metricValue, metric.format || '.3f', metric.unit);
    const display = err !== null
      ? `${formatted} ± ${formatMetricValue(err, metric.format || '.3f', metric.unit)}`
      : formatted;
    const tr = document.createElement('tr');
    const lifecycle = getPlatformLifecycle(String(run.provider || ''), String(run.device || ''));
    if (lifecycle?.status === 'retired') {
      tr.className = 'results-row--retired';
    }
    const deviceHref = `#`;
    const benchHref = `#`;
    const deviceLabel = renderDeviceLabelHtml(String(run.provider || ''), String(run.device || ''));
    const metricCells = metricDefs.map((def: any) => {
      const mv = getMetricValue(run, def.id);
      const me = getMetricError(run, def.id);
      const disp = me !== null && me !== undefined && Number.isFinite(Number(me))
        ? `${formatMetricValue(mv, def.format || '.3f', def.unit)} ± ${formatMetricValue(me, def.format || '.3f', def.unit)}`
        : formatMetricValue(mv, def.format || '.3f', def.unit);
      const isScore = def.id === 'score';
      const content = isScore ? `<a href="#" class="metric-link" data-role="score">${disp}</a>` : disp;
      return `<td class="num">${content}</td>`;
    }).join('');
    tr.innerHTML = `
      <td>${escapeHtml(run.provider || '')}</td>
      <td><a href="${deviceHref}" class="metric-link" data-role="device">${deviceLabel}</a></td>
      <td><a href="${benchHref}" class="metric-link" data-role="benchmark">${escapeHtml(run.benchmark || '')}</a></td>
      <td class="num">${run.num_qubits !== undefined && run.num_qubits !== null ? escapeHtml(String(run.num_qubits)) : '—'}</td>
      ${metricCells}
      <td class="num">${escapeHtml(formatDateOnly(run.timestamp))}</td>`;
    tbody.appendChild(tr);
    // Make entire row clickable to open details
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', (ev) => {
      ev.preventDefault();
      openRunDetail(run);
    });
    // Make score cell clickable to open details
    const scoreLink = tr.querySelector('a.metric-link[data-role="score"]') as HTMLAnchorElement | null;
    if (scoreLink) {
      scoreLink.addEventListener('click', (ev) => { ev.preventDefault(); openRunDetail(run); });
    }
    // Make device cell open detail (instead of jumping to platforms)
    const deviceLink = tr.querySelector('a.metric-link[data-role="device"]') as HTMLAnchorElement | null;
    if (deviceLink) {
      deviceLink.addEventListener('click', (ev) => { ev.preventDefault(); openRunDetail(run); });
    }
    // Make benchmark cell open detail (to view parameters)
    const benchLink = tr.querySelector('a.metric-link[data-role="benchmark"]') as HTMLAnchorElement | null;
    if (benchLink) {
      benchLink.addEventListener('click', (ev) => { ev.preventDefault(); openRunDetail(run); });
    }
  });

  // Attach sort handlers
  table.querySelectorAll('th[data-sort]')
    .forEach((th: any) => {
      th.addEventListener('click', () => {
        const key = String(th.getAttribute('data-sort')) as SortKey;
        if (tableState.sortKey === key) {
          tableState.sortDir = tableState.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          tableState.sortKey = key;
          const isNumeric = key === 'timestamp' || key === 'num_qubits' || (typeof key === 'string' && key.startsWith('metric:'));
          tableState.sortDir = isNumeric ? 'desc' : 'asc';
        }
        renderStaticTable(values);
      });
    });

  // Wire filter controls (debounced text)
  const qInput = document.getElementById('smart-q') as HTMLInputElement | null;
  const provSel = document.getElementById('smart-provider') as HTMLSelectElement | null;
  const devSel = document.getElementById('smart-device') as HTMLSelectElement | null;
  const benchSel = document.getElementById('smart-benchmark') as HTMLSelectElement | null;
  const resetBtn = document.getElementById('smart-reset') as HTMLButtonElement | null;
  let qTimer:any;
  if (qInput) {
    qInput.value = tableState.filterText || '';
    qInput.oninput = () => {
      clearTimeout(qTimer);
      qTimer = setTimeout(()=>{ tableState.filterText = qInput.value || ''; renderStaticTable(values); }, 150);
    };
  }
  provSel && (provSel.onchange = () => { tableState.filterProvider = provSel.value; renderStaticTable(values); });
  devSel && (devSel.onchange = () => { tableState.filterDevice = devSel.value; renderStaticTable(values); });
  benchSel && (benchSel.onchange = () => { tableState.filterBenchmark = benchSel.value; renderStaticTable(values); });
  resetBtn && (resetBtn.onclick = () => {
    tableState = { sortKey: 'timestamp', sortDir: 'desc', filterText: '', filterProvider: 'all', filterDevice: 'all', filterBenchmark: 'all' };
    renderStaticTable(values);
  });

  wrap.innerHTML = '';
  wrap.appendChild(table);
  if (skeletonTable) skeletonTable.style.display = 'none';
}

async function drawTable() {
  try {
    const data = await loadBenchmarks();
    // Always include all runs, independent from chart filters
    renderStaticTable(Array.isArray(data) ? data : []);
    if (pendingResultsTableCenterScroll) {
      pendingResultsTableCenterScroll = false;
      requestAnimationFrame(() => {
        const table = document.getElementById('benchmarks-table-wrap') || document.getElementById('panel-table');
        table?.scrollIntoView({ block: 'center', behavior: 'auto' });
      });
    }
  } catch (err) {
    const container = document.getElementById('table-static');
    if (container) {
      container.innerHTML = '<div style="padding:12px;color:#f88">Failed to render table.</div>';
    }
    const skeletonTable = document.getElementById('skeleton');
    if (skeletonTable) skeletonTable.style.display = 'none';
  }
}

async function drawChart() {
  const token = ++renderSequence;
  setChartDownloadEnabled(false);
  const filtered = getFilteredData();
  const availableMetricDefs = refreshMetricOptions(filtered);
  if (!availableMetricDefs.length) {
    return;
  }
  const metric = getActiveMetric();
  updateChartHeading(metric);
  const chartValues = filtered
    .map(run => {
      const metricValue = getMetricValue(run, metric.id);
      if (metricValue === null) return null;
      if (metric.scale === 'log' && metricValue <= 0) return null;
      const metricError = getMetricError(run, metric.id);
      let metricLower = null;
      let metricUpper = null;
      if (metricError !== null) {
        metricLower = metricValue - metricError;
        metricUpper = metricValue + metricError;
        if (metric.scale === 'log' && (metricLower <= 0 || metricUpper <= 0)) {
          metricLower = null;
          metricUpper = null;
        }
      }
      return { ...run, metricValue, metricError, metricLower, metricUpper };
    })
    .filter(Boolean);
  await renderChart(chartValues, token, metric);
}

async function initBenchmarksView() {
  const el = document.getElementById('chart');
  const skeletonGraph = document.getElementById('skeleton-graph');
  setChartDownloadEnabled(false);
  try {
    const [config, data, platformData] = await Promise.all([
      loadAppConfig(),
      loadBenchmarks(),
      loadPlatformsIndex(),
    ]);
    rawBenchmarks = Array.isArray(data) ? data : [];
    const platforms = Array.isArray((platformData as any)?.platforms) ? (platformData as any).platforms : [];
    setPlatformsIndexCache(platforms);
    if (!rawBenchmarks.length) {
      if (el) {
        el.innerHTML = '<div class="chart-empty">No benchmark data available.</div>';
      }
      if (skeletonGraph) skeletonGraph.style.display = 'none';
      return;
    }
    // Read baseline device from config if available
    try {
      const bd = (config && typeof (config as any).baselineDevice === 'string') ? String((config as any).baselineDevice).trim() : '';
      baselineDevice = bd || null;
    } catch { baselineDevice = null; }
    setupMetrics(rawBenchmarks, config);
    setupFilters(rawBenchmarks);
    refreshMetricOptions(rawBenchmarks);
    await drawChart();
    await drawTable();
  } catch (err) {
    console.error('[chart] initialization failed:', err);
    if (el) {
      el.innerHTML = '<div style="padding:12px;color:#f88">Unable to load chart data.</div>';
    }
    if (skeletonGraph) skeletonGraph.style.display = 'none';
  }
}

initBenchmarksView();

async function injectFooter() {
  const slot = document.getElementById('footer-slot');
  if (!slot) return;
  try {
    const resp = await fetch('./footer.html', { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status} loading footer.html`);
    const markup = await resp.text();
    slot.innerHTML = markup;
    const yearEl = slot.querySelector('#footer-year') as HTMLElement | null;
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  } catch (err) {
    console.warn('[footer] load failed:', err);
    slot.innerHTML = '<footer class="site-footer"><div class="footer-inner"><small>Metriq — footer unavailable.</small></div></footer>';
  }
}

injectFooter();
