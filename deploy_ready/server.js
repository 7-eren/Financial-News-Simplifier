require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PROVIDER = (process.env.NEWS_PROVIDER || 'newsapi').toLowerCase();
const API_KEY = process.env.NEWS_API_KEY || '';
const CACHE_TTL_MS = (Number(process.env.CACHE_TTL_MINUTES) || 20) * 60 * 1000;

// ---------------------------------------------------------------------------
// Category classification
//
// The provider gives us one flat "business" feed. We tag each article with a
// finer category ourselves, using keyword matching against its title and
// description. This means one API call serves every filter in the UI, which
// matters on a free-tier request budget.
// ---------------------------------------------------------------------------
const CATEGORY_KEYWORDS = {
  markets: ['sensex', 'nifty', 'bse', 'nse', 'stock', 'shares', 'equity', 'ipo', 'listing', 'rally', 'sell-off', 'selloff', 'bull', 'bear', 'index'],
  banking: ['rbi', 'repo rate', 'bank', 'banking', 'npa', 'lender', 'credit growth', 'monetary policy', 'psu bank'],
  economy: ['gdp', 'inflation', 'cpi', 'wpi', 'fiscal deficit', 'economy', 'growth rate', 'trade deficit', 'exports', 'imports', 'union budget'],
  corporate: ['earnings', 'profit', 'quarterly results', 'merger', 'acquisition', 'ceo', 'q1 results', 'q2 results', 'q3 results', 'q4 results', 'revenue'],
  'personal-finance': ['mutual fund', 'sip', 'income tax', 'ppf', 'nps', 'insurance premium', 'demat', 'savings account', 'fixed deposit', 'gst'],
};

function classify(article) {
  const haystack = `${article.title || ''} ${article.description || ''}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw))) return category;
  }
  return 'general';
}

// ---------------------------------------------------------------------------
// Provider adapters
//
// Each adapter fetches India-focused business headlines and normalizes them
// to the same shape, so the rest of the app never has to know which
// provider is behind it.
// ---------------------------------------------------------------------------
async function fetchFromNewsApi(key) {
  const topUrl = `https://newsapi.org/v2/top-headlines?country=in&category=business&pageSize=50&apiKey=${key}`;
  let res = await fetch(topUrl);
  let data = await res.json();
  if (data.status !== 'ok') {
    throw new Error(data.message || 'NewsAPI request failed');
  }
  let articles = data.articles || [];

  if (articles.length === 0) {
    const queryUrl = `https://newsapi.org/v2/everything?q=(Sensex+OR+Nifty+OR+RBI+OR+market+OR+economy+OR+shares)+AND+(India+OR+Indian)&language=en&sortBy=publishedAt&pageSize=50&apiKey=${key}`;
    res = await fetch(queryUrl);
    data = await res.json();
    if (data.status === 'ok' && data.articles && data.articles.length > 0) {
      articles = data.articles;
    }
  }

  return articles.map((a) => ({
    title: a.title,
    description: a.description || '',
    url: a.url,
    sourceName: a.source && a.source.name ? a.source.name : 'Unknown source',
    imageUrl: a.urlToImage || null,
    publishedAt: a.publishedAt,
  }));
}

async function fetchFromGNews(key) {
  const url = `https://gnews.io/api/v4/top-headlines?category=business&lang=en&country=in&max=50&apikey=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.articles) {
    throw new Error(data.errors ? data.errors.join(', ') : 'GNews request failed');
  }
  return (data.articles || []).map((a) => ({
    title: a.title,
    description: a.description || '',
    url: a.url,
    sourceName: a.source && a.source.name ? a.source.name : 'Unknown source',
    imageUrl: a.image || null,
    publishedAt: a.publishedAt,
  }));
}

const PROVIDERS = {
  newsapi: fetchFromNewsApi,
  gnews: fetchFromGNews,
};

// ---------------------------------------------------------------------------
// In-memory cache
//
// A single cached snapshot, shared by every visitor, refreshed at most once
// per CACHE_TTL_MINUTES. This is what keeps a free-tier key (as low as
// 100 requests/day) usable with more than a handful of visits.
// ---------------------------------------------------------------------------
let cache = { articles: [], updatedAt: null };
let inFlight = null;

async function getArticles() {
  const isFresh = cache.updatedAt && Date.now() - cache.updatedAt < CACHE_TTL_MS;
  if (isFresh) return cache;
  if (inFlight) return inFlight;

  const fetcher = PROVIDERS[PROVIDER];
  if (!fetcher) throw new Error(`Unknown NEWS_PROVIDER "${PROVIDER}". Use "newsapi" or "gnews".`);

  inFlight = fetcher(API_KEY)
    .then((raw) => {
      const articles = raw
        .filter((a) => a.title && a.title !== '[Removed]')
        .map((a, i) => ({ id: `${Date.parse(a.publishedAt) || Date.now()}-${i}`, ...a, category: classify(a) }));
      cache = { articles, updatedAt: Date.now() };
      return cache;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

let sampleArticles = [];
try {
  sampleArticles = require('./public/js/sample-data.js');
} catch (e) {
  sampleArticles = [];
}

app.get('/api/news', async (req, res) => {
  if (!API_KEY) {
    return res.json({
      configured: false,
      isDemo: true,
      provider: PROVIDER,
      updatedAt: Date.now(),
      articles: sampleArticles,
    });
  }
  try {
    const { articles, updatedAt } = await getArticles();
    res.json({ configured: true, isDemo: false, provider: PROVIDER, updatedAt, articles });
  } catch (err) {
    res.status(502).json({
      configured: true,
      isDemo: true,
      provider: PROVIDER,
      error: err.message || 'Failed to reach the news provider. Falling back to sample data.',
      articles: sampleArticles,
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', provider: PROVIDER, configured: Boolean(API_KEY) });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Financial News Simplifier running at http://0.0.0.0:${PORT}`);
  if (!API_KEY) {
    console.log('No NEWS_API_KEY set — running with sample Indian business headlines. Copy .env.example to .env and add one anytime for live headlines.');
  }
});
