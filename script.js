/* =========================================================
   CineVault – application logic
   Pages: home | movies | details | favorites  (body[data-page])
   ========================================================= */
'use strict';

/* ---------- Utilities ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const year = m => new Date(m.date).getFullYear();
const fmtRuntime = min => min ? `${Math.floor(min / 60)}h ${min % 60}m` : '—';
const fmtMoney = n => !n ? 'N/A' : n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : `$${Math.round(n / 1e6).toLocaleString()}M`;
const fmtDate = d => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const debounce = (fn, ms = 200) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const ytId = url => (String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/) || [])[1] || null;
const initials = n => n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

/* ---------- Safe localStorage ---------- */
const Store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('cinevault:' + key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem('cinevault:' + key, JSON.stringify(val)); } catch { /* storage full/blocked */ }
  }
};

/* ---------- Favorites ---------- */
const Favorites = {
  ids: new Set(Store.get('favorites', [])),
  data: Store.get('favdata', {}), // snapshots so favorites survive even if the movie list changes
  has(id) { return this.ids.has(id); },
  toggle(id, movie) {
    const added = !this.ids.has(id);
    added ? this.ids.add(id) : this.ids.delete(id);
    if (added && movie) this.data[id] = movie; else delete this.data[id];
    Store.set('favorites', [...this.ids]);
    Store.set('favdata', this.data);
    $$(`[data-fav="${id}"]`).forEach(b => {
      b.classList.toggle('active', added);
      b.setAttribute('aria-pressed', added);
      b.setAttribute('aria-label', added ? 'Remove from favorites' : 'Add to favorites');
    });
    updateFavCount();
    return added;
  }
};

/* ---------- Toast ---------- */
function toast(msg) {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.append(box); }
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  box.append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2200);
}

/* ---------- Images with graceful fallback ---------- */
function placeholder(title = '') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2d3a"/><stop offset="1" stop-color="#101116"/></linearGradient></defs><rect width="400" height="600" fill="url(#g)"/><text x="200" y="290" fill="#e5b84b" font-family="Georgia,serif" font-size="26" text-anchor="middle">🎬</text><text x="200" y="340" fill="#aab" font-family="sans-serif" font-size="20" text-anchor="middle">${esc(title).slice(0, 26)}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
document.addEventListener('error', e => {
  const img = e.target;
  if (!(img instanceof HTMLImageElement) || !img.classList.contains('art')) return;
  if (img.dataset.fallback && !img.dataset.tried) { img.dataset.tried = '1'; img.src = img.dataset.fallback; img.classList.add('is-fallback'); return; }
  img.onerror = null; img.src = placeholder(img.alt);
}, true);

const posterImg = (m, size = 'w500', lazy = true) =>
  `<img class="art" src="${MovieAPI.image(m.poster, size)}" alt="${esc(m.title)}" ${lazy ? 'loading="lazy"' : ''} decoding="async">`;
const backdropSrc = m => MovieAPI.image(m.backdrop || m.poster, m.backdrop ? 'w1280' : 'w780');

/* ---------- Components ---------- */
const heartBtn = m => `<button class="heart ${Favorites.has(m.id) ? 'active' : ''}" data-fav="${m.id}" aria-pressed="${Favorites.has(m.id)}" aria-label="${Favorites.has(m.id) ? 'Remove from favorites' : 'Add to favorites'}" title="Favorite">
  <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.5 6.4 4.5c2 0 3.7 1.1 5.6 3 1.9-1.9 3.6-3 5.6-3 3.7 0 5.5 3.9 4 7.3C19.500 16.400 12 21 12 21z"/></svg></button>`;

function movieCard(m, i = 0) {
  return `<article class="card fade-in" style="--d:${Math.min(i, 12) * 45}ms" data-id="${m.id}">
    <a class="card-poster" href="movie-details.html?id=${m.id}" aria-label="${esc(m.title)} details">
      ${posterImg(m)}
      <span class="rating-badge">★ ${m.rating.toFixed(1)}</span>
      <div class="card-hover">
        ${m.director ? `<p class="hover-dir"><b>Director:</b> ${esc(m.director)}</p>` : ''}
        ${m.cast.length ? `<p class="hover-cast">${esc(m.cast.slice(0, 3).join(', '))}</p>` : ''}
        <p class="hover-ov">${esc(m.overview)}</p>
      </div>
    </a>
    ${heartBtn(m)}
    <div class="card-body">
      <h3 class="card-title" title="${esc(m.title)}">${esc(m.title)}</h3>
      <p class="card-meta">${year(m)} • ${esc(m.genres.slice(0, 2).join(' / '))}</p>
      <p class="card-meta dim">${fmtRuntime(m.runtime)} • ${m.language}</p>
      <a class="btn btn-sm" href="movie-details.html?id=${m.id}">View Details</a>
    </div>
  </article>`;
}

const skeletons = (n = 6) => Array.from({ length: n }, () => `<div class="card skeleton-card"><div class="sk sk-poster"></div><div class="sk sk-line"></div><div class="sk sk-line short"></div></div>`).join('');
const errorBox = (msg, retry = true) => `<div class="state error"><div class="state-icon">⚠️</div><h3>Something went wrong</h3><p>${esc(msg)}</p>${retry ? '<button class="btn" onclick="location.reload()">Try again</button>' : ''}</div>`;
const emptyBox = (title, msg, cta = '') => `<div class="state"><div class="state-icon">🎞️</div><h3>${title}</h3><p>${msg}</p>${cta}</div>`;

/* ---------- Search logic ---------- */
function searchMovies(movies, query) {
  const q = norm(query.trim());
  if (!q) return movies;
  const terms = q.split(/\s+/);
  return movies.filter(m => {
    const hay = norm([m.title, m.director, ...m.writers, ...m.cast, ...m.genres, year(m), m.language].join(' | '));
    return terms.every(t => hay.includes(t));
  });
}

/* ---------- Layout (shared header/footer) ---------- */
const NAV = [
  ['index.html', 'Home', 'home'],
  ['movies.html', 'Movies', 'movies'],
  ['movies.html#genres', 'Genres', 'genres'],
  ['movies.html?sort=rating&minRating=8', 'Top Rated', 'top'],
  ['favorites.html', 'Favorites', 'favorites']
];

function renderLayout() {
  const page = document.body.dataset.page;
  const active = page === 'movies' && /sort=rating/.test(location.search) ? 'top' : page;
  $('#site-header').innerHTML = `
  <nav class="nav" aria-label="Main">
    <a class="logo" href="index.html" aria-label="CineVault home"><span class="logo-mark">▶</span>Cine<b>Vault</b></a>
    <button class="burger" id="burger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-panel"><span></span><span></span><span></span></button>
    <div class="nav-panel" id="nav-panel">
      <ul class="nav-links">
        ${NAV.map(([href, label, key]) => `<li><a href="${href}" class="${key === active ? 'active' : ''}">${label}${key === 'favorites' ? '<span class="count" id="fav-count" hidden></span>' : ''}</a></li>`).join('')}
      </ul>
      <form class="search" id="search-form" role="search" autocomplete="off">
        <svg viewBox="0 0 24 24" width="18" height="18"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.500-3.500"/></svg>
        <input id="search-input" type="search" placeholder="Search title, actor, director, genre, year…" aria-label="Search movies">
        <div class="search-results" id="search-results" hidden></div>
      </form>
    </div>
  </nav>`;
  $('#site-footer').innerHTML = `<div class="footer-inner"><a class="logo" href="index.html"><span class="logo-mark">▶</span>Cine<b>Vault</b></a>
    <p>A portfolio project · Movie data &amp; images courtesy of TMDB-style public sources. Not affiliated with any studio.</p></div>`;

  const header = $('#site-header');
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 30), { passive: true });
  $('#burger').addEventListener('click', e => {
    const open = $('#nav-panel').classList.toggle('open');
    e.currentTarget.classList.toggle('open', open);
    e.currentTarget.setAttribute('aria-expanded', open);
  });
  updateFavCount();
}

function updateFavCount() {
  const c = $('#fav-count'); if (!c) return;
  c.textContent = Favorites.ids.size; c.hidden = !Favorites.ids.size;
}

let ALL = [];
function initSearch() {
  const input = $('#search-input'), box = $('#search-results'), form = $('#search-form');
  let seq = 0;
  const render = async () => {
    const q = input.value.trim();
    if (!q) { box.hidden = true; return; }
    let res, total;
    if (MovieAPI.live) {
      const token = ++seq;
      try { const r = await MovieAPI.search(q); if (token !== seq) return; res = r.results; total = r.total; }
      catch (e) { console.error(e); box.hidden = false; box.innerHTML = '<div class="sr-empty">Search is unavailable right now.<br><small>Please try again.</small></div>'; return; }
    } else { res = searchMovies(ALL, q); total = res.length; }
    box.hidden = false;
    box.innerHTML = res.length
      ? res.slice(0, 6).map(m => `<a class="sr-item" href="movie-details.html?id=${m.id}">
          <img class="art" src="${MovieAPI.image(m.poster, 'w342')}" alt="${esc(m.title)}" loading="lazy">
          <span><b>${esc(m.title)}</b><small>${year(m)} • ${esc(m.genres.slice(0, 2).join(', ') || 'Movie')}${m.director ? ' • ' + esc(m.director) : ''}</small></span></a>`).join('')
        + `<a class="sr-all" href="movies.html?q=${encodeURIComponent(q)}">See all results →</a>`
      : `<div class="sr-empty">No movies found for “${esc(q)}”.<br><small>Try a title, actor, director, genre or year.</small></div>`;
  };
  input.addEventListener('input', debounce(render, MovieAPI.live ? 300 : 120));
  input.addEventListener('focus', render);
  form.addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); if (q) location.href = `movies.html?q=${encodeURIComponent(q)}`; });
  document.addEventListener('click', e => { if (!form.contains(e.target)) box.hidden = true; });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') box.hidden = true;
    if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
  });
  const q = new URLSearchParams(location.search).get('q'); if (q) input.value = q;
}

/* ---------- Global delegation: favorites ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-fav]'); if (!b) return;
  e.preventDefault();
  const id = Number(b.dataset.fav);
  const m = ALL.find(x => x.id === id) || Favorites.data[id];
  const added = Favorites.toggle(id, m);
  toast(added ? `Added “${m?.title}” to favorites` : `Removed “${m?.title}” from favorites`);
  if (document.body.dataset.page === 'favorites') renderFavorites();
});

/* ---------- HOME ---------- */
function seededShuffle(arr, seed) {
  const a = [...arr]; let s = seed;
  for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function recommended(movies) {
  const favs = movies.filter(m => Favorites.has(m.id));
  if (!favs.length) return seededShuffle(movies, new Date().getDate() + 7);
  const g = {}; favs.forEach(m => m.genres.forEach(x => g[x] = (g[x] || 0) + 1));
  return movies.filter(m => !Favorites.has(m.id))
    .map(m => ({ m, s: m.genres.reduce((a, x) => a + (g[x] || 0), 0) + m.rating / 10 }))
    .sort((a, b) => b.s - a.s).map(x => x.m);
}

function heroHTML(m) {
  return `<img class="hero-bg art" src="${backdropSrc(m)}" data-fallback="${MovieAPI.image(m.poster, 'w780')}" alt="" fetchpriority="high">
  <div class="hero-shade"></div>
  <div class="hero-inner">
    <div class="hero-poster glass">${posterImg(m, 'w500', false)}</div>
    <div class="hero-text">
      <span class="pill">Featured</span>
      <h1>${esc(m.title)}</h1>
      <div class="meta-row"><span class="imdb">★ ${m.rating.toFixed(1)}</span><span>${year(m)}</span><span>${fmtRuntime(m.runtime)}</span><span>${esc(m.genres.join(' • '))}</span></div>
      <p class="hero-desc">${esc(m.overview)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="movie-details.html?id=${m.id}">View Details</a>
        <a class="btn btn-ghost" href="movie-details.html?id=${m.id}&trailer=1#trailer">▶ Watch Trailer</a>
        ${heartBtn(m)}
      </div>
    </div>
  </div>`;
}

function row(id, title, movies, link) {
  return `<section class="section" id="${id}"><div class="section-head"><h2>${title}</h2>${link ? `<a href="${link}">See all →</a>` : ''}</div>
    <div class="row-wrap"><button class="row-btn left" aria-label="Scroll left">‹</button>
    <div class="row">${movies.map(movieCard).join('')}</div>
    <button class="row-btn right" aria-label="Scroll right">›</button></div></section>`;
}

async function initHome() {
  const hero = $('#hero'), rows = $('#rows');
  rows.innerHTML = `<section class="section"><div class="row">${skeletons(8)}</div></section>`;
  try {
    ALL = await MovieAPI.getAll();
  } catch (err) { console.error(err); hero.innerHTML = ''; rows.innerHTML = errorBox('We couldn’t load the movie library.'); return; }
  const byPop = [...ALL].sort((a, b) => b.popularity - a.popularity);
  const featured = byPop.slice(0, 5);
  let idx = 0;
  const dots = $('#hero-dots');
  const show = i => {
    idx = i;
    hero.classList.remove('in'); void hero.offsetWidth;
    hero.innerHTML = heroHTML(featured[i]);
    hero.classList.add('in');
    $$('.dot', dots).forEach((d, k) => d.classList.toggle('active', k === i));
  };
  dots.innerHTML = featured.map((_, i) => `<button class="dot" aria-label="Show featured movie ${i + 1}"></button>`).join('');
  $$('.dot', dots).forEach((d, i) => d.addEventListener('click', () => { show(i); restart(); }));
  let timer; const restart = () => { clearInterval(timer); timer = setInterval(() => show((idx + 1) % featured.length), 8000); };
  show(0); restart();
  hero.addEventListener('mouseenter', () => clearInterval(timer)); hero.addEventListener('mouseleave', restart);

  const recent = [...ALL].sort((a, b) => new Date(b.date) - new Date(a.date));
  rows.innerHTML =
    row('trending', '🔥 Trending Movies', byPop.slice(0, 12), 'movies.html?sort=popularity') +
    row('popular', 'Popular Movies', byPop.slice(5, 17).concat(byPop.slice(0, 0)), 'movies.html?sort=popularity') +
    row('top-rated', 'Top Rated', [...ALL].sort((a, b) => b.rating - a.rating).slice(0, 12), 'movies.html?sort=rating&minRating=8') +
    row('recent', 'Recently Released', recent.slice(0, 12), 'movies.html?sort=newest') +
    row('recommended', Favorites.ids.size ? 'Recommended For You' : 'Recommended Movies', recommended(ALL).slice(0, 12), 'movies.html');
  initRows();
}

function initRows() {
  $$('.row-wrap').forEach(w => {
    const r = $('.row', w);
    $('.row-btn.left', w).onclick = () => r.scrollBy({ left: -r.clientWidth * .8, behavior: 'smooth' });
    $('.row-btn.right', w).onclick = () => r.scrollBy({ left: r.clientWidth * .8, behavior: 'smooth' });
  });
}

/* ---------- MOVIES (discovery) ---------- */
const DEFAULTS = { genre: '', year: '', minRating: '0', language: '', sort: 'popularity' };

/** Live mode: filters/search run server-side over the entire TMDB catalogue, with "Load more". */
async function initMoviesLive() {
  const grid = $('#grid'), count = $('#count');
  const params = new URLSearchParams(location.search);
  const saved = Store.get('prefs-live', {});
  const hasParams = ['genre', 'year', 'minRating', 'language', 'sort', 'q'].some(k => params.has(k));
  const state = { ...DEFAULTS, ...(hasParams ? {} : saved) };
  ['genre', 'year', 'minRating', 'language', 'sort'].forEach(k => params.has(k) && (state[k] = params.get(k)));
  state.q = params.get('q') || '';

  const genres = Object.values(TMDB.genres).sort();
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 1899 }, (_, i) => thisYear - i);
  $('#f-genre').innerHTML = `<option value="">All genres</option>` + genres.map(g => `<option>${g}</option>`).join('');
  $('#f-year').innerHTML = `<option value="">Any year</option>` + years.map(y => `<option>${y}</option>`).join('');
  $('#f-lang').innerHTML = `<option value="">Any language</option>` + TMDB.languages.map(([c, n]) => `<option value="${c}">${n}</option>`).join('');
  $('#genre-chips').innerHTML = `<button class="chip" data-g="">All</button>` + genres.map(g => `<button class="chip" data-g="${g}">${g}</button>`).join('');

  let page = 1, totalPages = 1, token = 0, loaded = [];
  let more = $('#load-more');
  if (!more) { more = document.createElement('div'); more.id = 'load-more'; more.className = 'load-more'; grid.after(more); }

  const sync = () => {
    $('#f-genre').value = state.genre; $('#f-year').value = state.year; $('#f-lang').value = state.language;
    $('#f-rating').value = state.minRating; $('#f-sort').value = state.sort;
    $('#rating-out').textContent = Number(state.minRating) > 0 ? `${state.minRating}+` : 'Any';
    $$('.chip').forEach(c => c.classList.toggle('active', c.dataset.g === state.genre));
    $('#q-banner').hidden = !state.q; $('#q-text').textContent = state.q;
  };
  const clientFilter = list => list.filter(m =>
    (!state.genre || m.genres.includes(state.genre)) && (!state.year || year(m) === Number(state.year)) &&
    m.rating >= Number(state.minRating) && (!state.language || m.language === (TMDB.languages.find(l => l[0] === state.language) || [])[1]));
  const sortList = list => {
    const s = { popularity: (a, b) => b.popularity - a.popularity, rating: (a, b) => b.rating - a.rating, newest: (a, b) => new Date(b.date) - new Date(a.date) };
    return [...list].sort(s[state.sort]);
  };

  async function load(reset) {
    const my = ++token;
    if (reset) { page = 1; loaded = []; grid.innerHTML = skeletons(12); more.innerHTML = ''; count.textContent = 'Loading…'; Store.set('prefs-live', { genre: state.genre, year: state.year, minRating: state.minRating, language: state.language, sort: state.sort }); sync(); }
    else { more.innerHTML = '<div class="spinner" style="margin:auto"></div>'; }
    try {
      const r = state.q ? await MovieAPI.search(state.q, page) : await MovieAPI.discover(state, page);
      if (my !== token) return;
      totalPages = r.totalPages;
      const fresh = r.results.filter(m => !loaded.some(x => x.id === m.id));
      loaded = loaded.concat(fresh);
      fresh.forEach(m => { if (!ALL.some(x => x.id === m.id)) ALL.push(m); });
      // with a text query, filters/sort are applied client-side on the results found
      const shown = state.q ? sortList(clientFilter(loaded)) : loaded;
      count.textContent = state.q ? `${shown.length} result${shown.length === 1 ? '' : 's'} for “${state.q}”` : `${r.total.toLocaleString()} movies`;
      grid.innerHTML = shown.length ? shown.map((m, i) => movieCard(m, state.q ? i : i % 20)).join('')
        : emptyBox('No movies found', 'Try adjusting your search or filters.', '<button class="btn" id="reset-empty">Reset filters</button>');
      const re = $('#reset-empty'); if (re) re.onclick = reset;
      more.innerHTML = page < totalPages ? '<button class="btn" id="more-btn">Load more movies</button>' : (shown.length > 20 ? '<p class="dim">You’ve reached the end.</p>' : '');
      const mb = $('#more-btn'); if (mb) mb.onclick = () => { page++; load(false); };
    } catch (err) {
      if (my !== token) return;
      console.error(err);
      if (page > 1) { page--; more.innerHTML = '<p class="dim">Couldn’t load more.</p><button class="btn" id="more-btn">Retry</button>'; $('#more-btn').onclick = () => { page++; load(false); }; }
      else { count.textContent = ''; grid.innerHTML = errorBox('We couldn’t reach the movie database.'); more.innerHTML = ''; }
    }
  }
  const reset = () => { Object.assign(state, DEFAULTS, { q: '' }); history.replaceState(null, '', 'movies.html'); const si = $('#search-input'); if (si) si.value = ''; load(true); };
  const set = (k, v) => { state[k] = v; load(true); };
  const loadSoon = debounce(() => load(true), 250);

  $('#f-genre').onchange = e => set('genre', e.target.value);
  $('#f-year').onchange = e => set('year', e.target.value);
  $('#f-lang').onchange = e => set('language', e.target.value);
  $('#f-rating').oninput = e => { state.minRating = e.target.value; sync(); loadSoon(); };
  $('#f-sort').onchange = e => set('sort', e.target.value);
  $('#genre-chips').onclick = e => { const c = e.target.closest('.chip'); if (c) set('genre', c.dataset.g); };
  $('#reset').onclick = reset; $('#q-clear').onclick = reset;
  $('#filter-toggle').onclick = e => { const o = $('#filters').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
  sync(); await load(true);
  if (location.hash === '#genres') setTimeout(() => $('#genres').scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
}

async function initMovies() {
  if (MovieAPI.live) {
    try { return await initMoviesLive(); }
    catch (e) { console.warn('Live mode failed, using local data', e); MovieAPI.live = false; }
  }
  const grid = $('#grid'), count = $('#count');
  grid.innerHTML = skeletons(12);
  try { ALL = await MovieAPI.getAll(); }
  catch (err) { console.error(err); grid.innerHTML = errorBox('We couldn’t load the movie library.'); return; }

  const params = new URLSearchParams(location.search);
  const saved = Store.get('prefs', {});
  const hasParams = ['genre', 'year', 'minRating', 'language', 'sort', 'q'].some(k => params.has(k));
  const state = { ...DEFAULTS, ...(hasParams ? {} : saved) };
  ['genre', 'year', 'minRating', 'language', 'sort'].forEach(k => params.has(k) && (state[k] = params.get(k)));
  state.q = params.get('q') || '';

  const genres = [...new Set(ALL.flatMap(m => m.genres))].sort();
  const years = [...new Set(ALL.map(year))].sort((a, b) => b - a);
  const langs = [...new Set(ALL.map(m => m.language))].sort();
  const opt = (arr, label) => `<option value="">${label}</option>` + arr.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  $('#f-genre').innerHTML = opt(genres, 'All genres');
  $('#f-year').innerHTML = opt(years, 'Any year');
  $('#f-lang').innerHTML = opt(langs, 'Any language');
  $('#genre-chips').innerHTML = `<button class="chip" data-g="">All</button>` + genres.map(g => `<button class="chip" data-g="${g}">${g}</button>`).join('');

  const sync = () => {
    $('#f-genre').value = state.genre; $('#f-year').value = state.year; $('#f-lang').value = state.language;
    $('#f-rating').value = state.minRating; $('#f-sort').value = state.sort;
    $('#rating-out').textContent = Number(state.minRating) > 0 ? `${state.minRating}+` : 'Any';
    $$('.chip').forEach(c => c.classList.toggle('active', c.dataset.g === state.genre));
  };

  const apply = () => {
    Store.set('prefs', { genre: state.genre, year: state.year, minRating: state.minRating, language: state.language, sort: state.sort });
    let list = searchMovies(ALL, state.q);
    list = list.filter(m =>
      (!state.genre || m.genres.includes(state.genre)) &&
      (!state.year || year(m) === Number(state.year)) &&
      (!state.language || m.language === state.language) &&
      m.rating >= Number(state.minRating));
    const sorters = {
      popularity: (a, b) => b.popularity - a.popularity,
      rating: (a, b) => b.rating - a.rating,
      newest: (a, b) => new Date(b.date) - new Date(a.date)
    };
    list.sort(sorters[state.sort] || sorters.popularity);
    count.textContent = `${list.length} movie${list.length === 1 ? '' : 's'}${state.q ? ` for “${state.q}”` : ''}`;
    $('#q-banner').hidden = !state.q;
    $('#q-text').textContent = state.q;
    grid.innerHTML = list.length ? list.map(movieCard).join('')
      : emptyBox('No movies found', 'Try adjusting your search or filters.', '<button class="btn" id="reset-empty">Reset filters</button>');
    const r = $('#reset-empty'); if (r) r.onclick = reset;
    sync();
  };
  const reset = () => { Object.assign(state, DEFAULTS, { q: '' }); history.replaceState(null, '', 'movies.html'); const si = $('#search-input'); if (si) si.value = ''; apply(); };

  $('#f-genre').onchange = e => { state.genre = e.target.value; apply(); };
  $('#f-year').onchange = e => { state.year = e.target.value; apply(); };
  $('#f-lang').onchange = e => { state.language = e.target.value; apply(); };
  $('#f-rating').oninput = e => { state.minRating = e.target.value; apply(); };
  $('#f-sort').onchange = e => { state.sort = e.target.value; apply(); };
  $('#genre-chips').onclick = e => { const c = e.target.closest('.chip'); if (c) { state.genre = c.dataset.g; apply(); } };
  $('#reset').onclick = reset;
  $('#q-clear').onclick = reset;
  $('#filter-toggle').onclick = e => { const o = $('#filters').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
  apply();
  if (location.hash === '#genres') setTimeout(() => $('#genres').scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
}

/* ---------- DETAILS ---------- */
async function initDetails() {
  const root = $('#details');
  const id = new URLSearchParams(location.search).get('id');
  root.innerHTML = `<div class="detail-skel"><div class="sk" style="height:45vh"></div><div class="wrap"><div class="sk" style="height:24px;width:50%;margin:24px 0"></div><div class="sk" style="height:120px"></div></div></div>`;
  let m;
  try { [ALL, m] = await Promise.all([MovieAPI.getAll(), MovieAPI.getById(id)]); }
  catch (err) { console.error(err); root.innerHTML = `<div class="wrap">${errorBox('We couldn’t load this movie.')}</div>`; return; }
  initSearch();
  if (!m) { root.innerHTML = `<div class="wrap">${emptyBox('Movie not found', 'That title isn’t in the vault.', '<a class="btn btn-primary" href="movies.html">Browse movies</a>')}</div>`; return; }

  document.title = `${m.title} (${year(m)}) – CineVault`;
  if (!ALL.some(x => x.id === m.id)) ALL.push(m);
  const vid = ytId(m.trailer);
  const similar = ALL.filter(x => x.id !== m.id)
    .map(x => ({ x, s: x.genres.filter(g => m.genres.includes(g)).length * 10 + (x.director === m.director ? 15 : 0) + x.rating }))
    .sort((a, b) => b.s - a.s).slice(0, 10).map(o => o.x);
  const fact = (k, v) => `<div class="fact"><span>${k}</span><b>${v}</b></div>`;

  root.innerHTML = `
  <header class="d-hero">
    <img class="d-bg art" src="${backdropSrc(m)}" data-fallback="${MovieAPI.image(m.poster, 'w780')}" alt="">
    <div class="hero-shade"></div>
    <div class="wrap d-hero-inner fade-in">
      <div class="d-poster glass">${posterImg(m, 'w500', false)}</div>
      <div class="d-head">
        <h1>${esc(m.title)} <span class="yr">(${year(m)})</span></h1>
        ${m.tagline ? `<p class="tagline">“${esc(m.tagline)}”</p>` : ''}
        <div class="meta-row"><span class="imdb">★ ${m.rating.toFixed(1)}<small>/10</small></span><span>${fmtDate(m.date)}</span><span>${fmtRuntime(m.runtime)}</span></div>
        <div class="genres">${m.genres.map(g => `<a class="pill" href="movies.html?genre=${encodeURIComponent(g)}">${g}</a>`).join('')}</div>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#trailer" id="go-trailer">▶ Watch Trailer</a>
          <button class="btn btn-ghost fav-text ${Favorites.has(m.id) ? 'active' : ''}" id="fav-text" data-fav="${m.id}">${Favorites.has(m.id) ? '♥ In Favorites' : '♡ Add to Favorites'}</button>
        </div>
      </div>
    </div>
  </header>
  <div class="wrap d-body">
    <section class="d-main fade-in">
      <h2>Overview</h2><p class="overview">${esc(m.overview)}</p>
      <div class="people">
        <div><span class="lbl">Director</span><p>${esc(m.director)}</p></div>
        <div><span class="lbl">Writers</span><p>${esc(m.writers.join(', ') || 'N/A')}</p></div>
      </div>
    </section>
    <aside class="facts glass fade-in">
      ${fact('Release date', fmtDate(m.date))}${fact('Runtime', fmtRuntime(m.runtime))}${fact('Language', esc(m.language))}${fact('Country', esc(m.country))}
      ${fact('Budget', fmtMoney(m.budget))}${fact('Box office', fmtMoney(m.boxOffice))}${fact('Production', esc(m.companies.join(', ') || 'N/A'))}
    </aside>
  </div>
  <div class="wrap">
    <section class="section" id="trailer"><div class="section-head"><h2>Trailer</h2></div>
      <div class="trailer">${vid
        ? `<button class="trailer-thumb" id="trailer-play" aria-label="Play trailer">
            <img class="art" src="https://img.youtube.com/vi/${vid}/hqdefault.jpg" data-fallback="${backdropSrc(m)}" alt="${esc(m.title)} trailer thumbnail">
            <span class="play">▶</span></button>`
        : `<div class="state"><div class="state-icon">🎬</div><h3>No trailer available</h3><p>We don’t have a trailer for this title yet.</p></div>`}
      </div></section>
    <section class="section"><div class="section-head"><h2>Main Cast</h2></div>
      <div class="cast">${m.cast.map(n => `<a class="cast-card" href="movies.html?q=${encodeURIComponent(n)}" title="See movies with ${esc(n)}"><div class="avatar">${initials(n)}</div><b>${esc(n)}</b><small>Actor</small></a>`).join('')}</div></section>
    <section class="section"><div class="section-head"><h2>Similar Movies</h2></div>
      <div class="row-wrap"><button class="row-btn left" aria-label="Scroll left">‹</button><div class="row">${similar.map(movieCard).join('')}</div><button class="row-btn right" aria-label="Scroll right">›</button></div></section>
  </div>`;
  initRows();

  const play = () => {
    const box = $('.trailer');
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0" title="${esc(m.title)} trailer" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
      <p class="trailer-note">Video not loading? <a target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${vid}">Watch on YouTube</a></p>`;
  };
  const pb = $('#trailer-play'); if (pb) pb.onclick = play;
  if (new URLSearchParams(location.search).get('trailer') && vid) setTimeout(() => { $('#trailer').scrollIntoView({ behavior: 'smooth' }); play(); }, 300);

  // sync the text fav button label
  $('#fav-text').addEventListener('click', () => setTimeout(() => {
    const b = $('#fav-text'), on = Favorites.has(m.id);
    b.textContent = on ? '♥ In Favorites' : '♡ Add to Favorites'; b.classList.toggle('active', on);
  }));
}

/* ---------- FAVORITES ---------- */
function renderFavorites() {
  const grid = $('#grid');
  const list = [...Favorites.ids].map(id => ALL.find(m => m.id === id) || Favorites.data[id]).filter(Boolean);
  $('#count').textContent = `${list.length} saved movie${list.length === 1 ? '' : 's'}`;
  $('#clear-favs').hidden = !list.length;
  grid.innerHTML = list.length ? list.map(movieCard).join('')
    : emptyBox('No favorites yet', 'Tap the ♥ on any movie to save it here. Your list stays after you refresh.', '<a class="btn btn-primary" href="movies.html">Discover movies</a>');
}
async function initFavorites() {
  $('#grid').innerHTML = skeletons(6);
  try { ALL = await MovieAPI.getAll(); } catch (err) { console.error(err); $('#grid').innerHTML = errorBox('We couldn’t load your favorites.'); return; }
  renderFavorites();
  $('#clear-favs').onclick = () => {
    if (!confirm('Remove all favorites?')) return;
    [...Favorites.ids].forEach(id => Favorites.toggle(id)); renderFavorites();
  };
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  renderLayout();
  const page = document.body.dataset.page;
  const boot = { home: initHome, movies: initMovies, details: initDetails, favorites: initFavorites }[page];
  // Search needs the dataset; pages load it themselves, so init search after.
  if (boot) await boot();
  if (page !== 'details') initSearch();
});
