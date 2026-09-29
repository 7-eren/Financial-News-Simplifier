// Netlify Function serving GET /api/news.
//
// This is the serverless counterpart of the /api/news route in server.js.
// Netlify runs functions on demand rather than as a long-lived server, so
// caching is handled by Netlify's CDN (see the Netlify-CDN-Cache-Control
// header below) instead of an in-memory variable.
//
// Environment variables (set in Netlify: Site configuration > Environment
// variables, NOT in netlify.toml):
//   NEWS_PROVIDER      "newsapi" or "gnews"
//   NEWS_API_KEY       your provider key
//   CACHE_TTL_MINUTES  optional, defaults to 20

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

async function fetchFromNewsApi(key) {
  const url = `https://newsapi.org/v2/top-headlines?country=in&category=business&pageSize=50&apiKey=${key}`;
  const data = await (await fetch(url)).json();
  if (data.status !== 'ok') throw new Error(data.message || 'NewsAPI request failed');
  return (data.articles || []).map((a) => ({
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
  const data = await (await fetch(url)).json();
  if (!data.articles) throw new Error(data.errors ? data.errors.join(', ') : 'GNews request failed');
  return data.articles.map((a) => ({
    title: a.title,
    description: a.description || '',
    url: a.url,
    sourceName: a.source && a.source.name ? a.source.name : 'Unknown source',
    imageUrl: a.image || null,
    publishedAt: a.publishedAt,
  }));
}

const PROVIDERS = { newsapi: fetchFromNewsApi, gnews: fetchFromGNews };

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

export default async () => {
  const provider = (Netlify.env.get('NEWS_PROVIDER') || 'newsapi').toLowerCase();
  const key = Netlify.env.get('NEWS_API_KEY') || '';
  const ttlSeconds = (Number(Netlify.env.get('CACHE_TTL_MINUTES')) || 20) * 60;

  if (!key) {
    return json({ configured: false, provider, updatedAt: null, articles: [] });
  }

  const fetcher = PROVIDERS[provider];
  if (!fetcher) {
    return json({ configured: true, provider, error: `Unknown NEWS_PROVIDER "${provider}". Use "newsapi" or "gnews".`, articles: [] }, 500);
  }

  try {
    const raw = await fetcher(key);
    const articles = raw
      .filter((a) => a.title && a.title !== '[Removed]')
      .map((a, i) => ({ id: `${Date.parse(a.publishedAt) || Date.now()}-${i}`, ...a, category: classify(a) }));

    // Only successful responses are cached, and only on Netlify's CDN,
    // so browsers still ask for fresh data on each visit.
    return json({ configured: true, provider, updatedAt: Date.now(), articles }, 200, {
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Netlify-CDN-Cache-Control': `public, max-age=${ttlSeconds}, durable`,
    });
  } catch (err) {
    return json({ configured: true, provider, error: err.message || 'Failed to reach the news provider.', articles: [] }, 502);
  }
};

export const config = { path: '/api/news' };
