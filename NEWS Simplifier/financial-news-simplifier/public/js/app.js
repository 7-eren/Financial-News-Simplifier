(function () {
  const CATEGORY_LABELS = {
    all: 'All stories',
    markets: 'Markets',
    banking: 'Banking',
    economy: 'Economy',
    corporate: 'Corporate',
    'personal-finance': 'Personal finance',
    general: 'General',
  };

  const state = {
    articles: [],
    category: 'all',
    query: '',
    showOriginal: new Set(),
    status: 'loading', // loading | ready | empty | not-configured | error
    errorMessage: '',
  };

  const els = {
    feed: document.getElementById('feed'),
    filters: document.getElementById('filters'),
    search: document.getElementById('search'),
    glossaryList: document.getElementById('glossary-list'),
    glossaryCount: document.getElementById('glossary-count'),
    updatedAt: document.getElementById('updated-at'),
    themeToggle: document.getElementById('theme-toggle'),
    refresh: document.getElementById('refresh'),
  };

  async function loadNews() {
    state.status = 'loading';
    render();
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (!data.configured) {
        state.status = 'not-configured';
        render();
        return;
      }
      if (data.error) {
        state.status = 'error';
        state.errorMessage = data.error;
        render();
        return;
      }
      state.articles = data.articles || [];
      state.status = state.articles.length ? 'ready' : 'empty';
      els.updatedAt.textContent = data.updatedAt
        ? `Updated ${timeAgo(new Date(data.updatedAt).toISOString())}`
        : '';
      render();
    } catch (err) {
      state.status = 'error';
      state.errorMessage = 'Could not reach the server. Is it running?';
      render();
    }
  }

  function visibleArticles() {
    return state.articles.filter((a) => {
      const inCategory = state.category === 'all' || a.category === state.category;
      const q = state.query.trim().toLowerCase();
      const inQuery = !q || `${a.title} ${a.description}`.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }

  function articleNode(article) {
    const li = document.createElement('li');
    li.className = 'story';

    const isOriginal = state.showOriginal.has(article.id);
    const rawText = isOriginal ? cleanText(article.description) : toSimplified(article.description);
    const escaped = escapeHtml(rawText);
    const { html, found } = highlightTerms(escaped, GLOSSARY);

    const meta = document.createElement('div');
    meta.className = 'story-meta';
    meta.innerHTML = `<span class="source">${escapeHtml(article.sourceName)}</span><span class="dot">\u00b7</span><span>${timeAgo(
      article.publishedAt
    )}</span><span class="dot">\u00b7</span><span class="tag">${escapeHtml(
      CATEGORY_LABELS[article.category] || 'General'
    )}</span>`;

    const title = document.createElement('h2');
    title.className = 'story-title';
    const link = document.createElement('a');
    link.href = article.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = article.title;
    title.appendChild(link);

    const body = document.createElement('p');
    body.className = 'story-body';
    body.innerHTML = html || '<em>No description available.</em>';

    const footer = document.createElement('div');
    footer.className = 'story-footer';

    const effort = document.createElement('span');
    effort.className = 'effort';
    effort.textContent = readingEffort(article.description);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'link-btn';
    toggle.textContent = isOriginal ? 'Show simplified' : 'Show original';
    toggle.addEventListener('click', () => {
      if (state.showOriginal.has(article.id)) state.showOriginal.delete(article.id);
      else state.showOriginal.add(article.id);
      render();
    });

    footer.appendChild(effort);
    footer.appendChild(toggle);

    li.appendChild(meta);
    li.appendChild(title);
    li.appendChild(body);
    li.appendChild(footer);

    body.querySelectorAll('.term').forEach((span) => {
      span.addEventListener('click', () => openGlossaryTerm(span.dataset.term));
      span.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openGlossaryTerm(span.dataset.term);
        }
      });
    });

    return li;
  }

  function openGlossaryTerm(term) {
    const target = els.glossaryList.querySelector(`[data-glossary-term="${CSS.escape(term)}"]`);
    if (!target) return;
    target.classList.add('flash');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => target.classList.remove('flash'), 900);
  }

  function renderGlossary(articles) {
    const termsOnPage = new Map();
    articles.forEach((a) => {
      const text = escapeHtml(cleanText(a.description));
      const { found } = highlightTerms(text, GLOSSARY);
      found.forEach(({ term, def }) => termsOnPage.set(term, def));
    });

    els.glossaryCount.textContent = termsOnPage.size;
    els.glossaryList.innerHTML = '';
    if (termsOnPage.size === 0) {
      const empty = document.createElement('p');
      empty.className = 'glossary-empty';
      empty.textContent = 'Terms explained in today\u2019s stories will appear here.';
      els.glossaryList.appendChild(empty);
      return;
    }
    [...termsOnPage.entries()].forEach(([term, def]) => {
      const dt = document.createElement('div');
      dt.className = 'glossary-entry';
      dt.dataset.glossaryTerm = term;
      dt.innerHTML = `<strong>${escapeHtml(term)}</strong><span>${escapeHtml(def)}</span>`;
      els.glossaryList.appendChild(dt);
    });
  }

  function renderStatusMessage() {
    const messages = {
      loading: { title: 'Loading today\u2019s headlines\u2026', body: '' },
      empty: { title: 'No stories match', body: 'Try a different section or clear your search.' },
      'not-configured': {
        title: 'No API key configured yet',
        body: 'Copy .env.example to .env, add a free NewsAPI or GNews key, and restart the server. See the README for details.',
      },
      error: { title: 'Couldn\u2019t load headlines', body: state.errorMessage },
    };
    const msg = messages[state.status];
    if (!msg) return null;
    const wrap = document.createElement('div');
    wrap.className = 'status-message';
    wrap.innerHTML = `<h2>${escapeHtml(msg.title)}</h2>${msg.body ? `<p>${escapeHtml(msg.body)}</p>` : ''}`;
    return wrap;
  }

  function render() {
    els.feed.innerHTML = '';

    if (state.status !== 'ready') {
      const status = renderStatusMessage();
      if (status) els.feed.appendChild(status);
      if (state.status !== 'loading') renderGlossary([]);
      return;
    }

    const visible = visibleArticles();
    if (visible.length === 0) {
      const wrap = document.createElement('div');
      wrap.className = 'status-message';
      wrap.innerHTML = `<h2>No stories match</h2><p>Try a different section or clear your search.</p>`;
      els.feed.appendChild(wrap);
    } else {
      visible.forEach((a) => els.feed.appendChild(articleNode(a)));
    }
    renderGlossary(visible);
  }

  function setupFilters() {
    els.filters.querySelectorAll('[data-category]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.category = btn.dataset.category;
        els.filters.querySelectorAll('[data-category]').forEach((b) => b.classList.toggle('active', b === btn));
        render();
      });
    });
  }

  function setupSearch() {
    let t;
    els.search.addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(() => {
        state.query = e.target.value;
        render();
      }, 150);
    });
  }

  function setupTheme() {
    const stored = localStorage.getItem('fns-theme');
    if (stored) document.documentElement.setAttribute('data-theme', stored);
    els.themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', current);
      localStorage.setItem('fns-theme', current);
    });
  }

  els.refresh.addEventListener('click', loadNews);

  setupFilters();
  setupSearch();
  setupTheme();
  loadNews();
})();
