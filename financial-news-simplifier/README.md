# Financial News Simplifier

Business headlines from India's markets, banking and economy, rewritten to a
short, plain-language read — with jargon like *repo rate* or *SIP* explained
inline instead of assumed.

![Concept preview of the app layout](docs/preview.svg)

*(The image above is a concept preview of the layout, not a live screenshot.)*

## Why this exists

Financial reporting is written for people who already speak the vocabulary.
This app sits between the reader and the headline: it pulls real business
news, trims each story to its essential sentence, tags the section it
belongs to, and surfaces a short definition the moment it spots a term like
*NPA*, *FPI*, or *fiscal deficit*. Nothing about the interface itself assumes
an Indian reader — only the news feed it pulls from does.

## Features

- **India-focused feed** — pulls business headlines for the Indian market
  (`country=in`) from a single API call, cached in memory to stay well
  inside a free-tier request limit.
- **Plain-language view** — each story defaults to a one- or two-sentence
  simplified read, with a one-click toggle back to the original description.
- **Inline glossary** — financial terms are underlined where they appear;
  clicking one jumps to its definition in the sidebar. A running list of
  "terms explained" builds up as you read.
- **Section filters** — Markets, Banking, Economy, Corporate, and Personal
  Finance, classified automatically by keyword matching, no extra API calls.
- **Reading-effort tag** — a quick "Quick read / Moderate / Dense" signal
  per story, based on sentence length.
- **Light and dark themes**, a search box, and a responsive layout that
  collapses the sidebar into a top bar on small screens.

## Tech stack

- **Backend:** Node.js, Express — a thin server that proxies the news
  provider (so your API key is never exposed to the browser) and caches
  results.
- **Frontend:** vanilla HTML, CSS and JavaScript — no build step, no
  framework.

## Getting started

```bash
git clone <your-repo-url>
cd financial-news-simplifier
npm install
cp .env.example .env
```

Open `.env` and add a free API key from one of:

- [NewsAPI.org](https://newsapi.org/register) — easiest to start with, but
  its free tier only works on `localhost`, not once deployed (see note
  below).
- [GNews.io](https://gnews.io/register) — free tier that also works from a
  deployed URL, at a lower request quota.

Set `NEWS_PROVIDER` in `.env` to match the key you added (`newsapi` or
`gnews`), then run:

```bash
npm start
```

Visit `http://localhost:3000`.

## Deploy to Netlify

The repo is set up for Netlify as-is. `netlify.toml` publishes the `public/`
folder, and `netlify/functions/news.mjs` serves `/api/news` as a serverless
function (Netlify does not run a long-lived Express server, so `server.js`
is only used for local development).

1. Push the repo to GitHub.
2. In Netlify, choose **Add new site > Import an existing project** and pick
   the repo. Leave the build command empty; the publish directory and
   functions folder are read from `netlify.toml`.
3. Under **Site configuration > Environment variables**, add `NEWS_PROVIDER`
   (`gnews` or `newsapi`) and `NEWS_API_KEY`. Set these in the Netlify UI,
   not in `netlify.toml`, because variables in `netlify.toml` are not
   available to functions at runtime.
4. Deploy. Headlines are cached on Netlify's CDN for `CACHE_TTL_MINUTES`
   (default 20) to stay inside your provider's request quota.

To test the function locally, run `npx netlify dev` instead of `npm start`.

## Project structure

```
financial-news-simplifier/
├── server.js              Express server for local use (provider adapters, caching, tagging)
├── netlify.toml            Netlify build settings
├── netlify/functions/
│   └── news.mjs            Netlify serverless version of /api/news
├── public/
│   ├── index.html          Page layout
│   ├── css/style.css       All styling (light + dark theme)
│   └── js/
│       ├── app.js          Data fetching, filtering, rendering
│       ├── simplify.js     Text simplification + jargon highlighting
│       └── glossary.js     Glossary term list and definitions
├── docs/preview.svg        Concept preview used in this README
├── .env.example            Configuration template
└── package.json
```

## How it works

1. The server calls the configured provider once for India business
   headlines, tags each article with a section (`markets`, `banking`,
   `economy`, `corporate`, `personal-finance`, or `general`) by matching
   keywords in its title and description, and caches the result for
   `CACHE_TTL_MINUTES` (default 20).
2. The browser fetches that cached list from `/api/news` — it never talks
   to the news provider directly.
3. For each story, the frontend trims the description to its first
   sentence or two, scans it against the glossary, and wraps any matches so
   they're underlined and clickable.

## A note on free-tier limits

NewsAPI's free "Developer" plan is intended for local development and
testing only — requests from a deployed domain are blocked (you'll see a
`426` error), and its terms restrict it to non-production use even behind a
proxy. If you plan to deploy this somewhere public, GNews's free tier or a
paid NewsAPI plan are the straightforward options. The server-side caching
here is there to make either choice go further, not to work around a
provider's terms.

## Possible extensions

- Swap the in-memory cache for Redis if you're running multiple server
  instances.
- Add a second language pass for regional-language readers.
- Let readers save "terms explained" across visits.

## License

MIT — see [LICENSE](LICENSE).
