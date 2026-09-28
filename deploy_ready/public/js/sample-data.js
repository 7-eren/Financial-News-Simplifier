// Sample Indian business news articles used for local testing, demo preview,
// and as an offline fallback when no API key is provided.
const SAMPLE_ARTICLES = [
  {
    id: 'sample-1',
    title: 'Sensex surges 650 points to record high led by banking and IT shares; Nifty tops 25,000',
    description: 'Indian benchmark indices rallied strongly today as the Sensex leaped past fresh records and Nifty climbed over 25,000. Institutional buyers noted that strong corporate balance sheets and resilient domestic growth are fueling sustained bull market momentum across the BSE and NSE.',
    url: 'https://www.bseindia.com/',
    sourceName: 'The Economic Times',
    imageUrl: null,
    publishedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    category: 'markets'
  },
  {
    id: 'sample-2',
    title: 'RBI keeps repo rate unchanged at 6.50% in monetary policy review',
    description: 'The Reserve Bank of India decided unanimously to keep the benchmark repo rate steady at 6.50%. RBI Governor highlighted that while economic momentum is sturdy, caution is warranted on headline CPI inflation before easing monetary policy.',
    url: 'https://www.rbi.org.in/',
    sourceName: 'Mint',
    imageUrl: null,
    publishedAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    category: 'banking'
  },
  {
    id: 'sample-3',
    title: 'Monthly SIP contributions breach ₹23,000 crore mark as mutual fund accounts surge',
    description: 'Systematic Investment Plan inflows reached a record peak this month, with retail investors contributing over ₹23,500 crore into equity mutual fund schemes. Over 1.5 million new demat account holders entered the market this quarter alone.',
    url: 'https://www.amfiindia.com/',
    sourceName: 'Financial Express',
    imageUrl: null,
    publishedAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    category: 'personal-finance'
  },
  {
    id: 'sample-4',
    title: 'India GDP growth projected at 7.2% for FY25 on robust capital expenditure',
    description: 'Leading credit agencies revised India\'s annual GDP growth projection upward to 7.2%, pointing to government infrastructure spending and rising private investment. The fiscal deficit remained on track with targets set in the Union Budget.',
    url: 'https://pib.gov.in/',
    sourceName: 'Business Standard',
    imageUrl: null,
    publishedAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    category: 'economy'
  },
  {
    id: 'sample-5',
    title: 'Tata Consultancy Services posts 8% rise in Q2 profit, announces dividend yield payout',
    description: 'TCS reported a resilient quarterly performance driven by mega cloud deals and artificial intelligence adoption in North America and Europe. The board declared an interim dividend, providing an attractive dividend yield for long-term shareholders.',
    url: 'https://www.tcs.com/',
    sourceName: 'Reuters India',
    imageUrl: null,
    publishedAt: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
    category: 'corporate'
  },
  {
    id: 'sample-6',
    title: 'FPI investments in Indian equities rebound with ₹28,000 crore net inflows',
    description: 'Foreign Portfolio Investment showed strong revival this month as global funds turned net buyers after weeks of cautious selling. Domestic institutional investors (DII) also supported liquidity, keeping market valuations resilient.',
    url: 'https://www.moneycontrol.com/',
    sourceName: 'Moneycontrol',
    imageUrl: null,
    publishedAt: new Date(Date.now() - 420 * 60 * 1000).toISOString(),
    category: 'markets'
  },
  {
    id: 'sample-7',
    title: 'Public sector banks report sharp drop in gross NPA levels to 10-year low',
    description: 'Commercial lenders registered dramatic improvements in asset quality, with average gross NPA ratios sliding below 2.5%. Robust recovery mechanisms and strict provisioning mandated by the RBI have revitalized banking balance sheets.',
    url: 'https://www.business-standard.com/',
    sourceName: 'The Hindu BusinessLine',
    imageUrl: null,
    publishedAt: new Date(Date.now() - 540 * 60 * 1000).toISOString(),
    category: 'banking'
  },
  {
    id: 'sample-8',
    title: 'GST revenue collections rise 10% year-on-year to ₹1.74 lakh crore',
    description: 'Goods and Services Tax mop-up stayed above the ₹1.7 lakh crore threshold for the sixth consecutive month. The steady uptick reflects broad-based consumption and higher compliance across manufacturing and consumer services.',
    url: 'https://pib.gov.in/',
    sourceName: 'NDTV Profit',
    imageUrl: null,
    publishedAt: new Date(Date.now() - 720 * 60 * 1000).toISOString(),
    category: 'economy'
  },
  {
    id: 'sample-9',
    title: 'Reliance Industries market capitalization crosses milestone ₹20 lakh crore',
    description: 'Shares of the energy-to-telecom conglomerate rallied to fresh highs, making it the first Indian company to surpass ₹20 lakh crore in market capitalization. Analysts cited steady subscriber additions in telecom and retail store expansion.',
    url: 'https://www.ril.com/',
    sourceName: 'Economic Times',
    imageUrl: null,
    publishedAt: new Date(Date.now() - 840 * 60 * 1000).toISOString(),
    category: 'corporate'
  },
  {
    id: 'sample-10',
    title: 'Tech IPO subscriptions gain traction as SEBI tightens SME listing scrutiny',
    description: 'Multiple technology and consumer startups are queuing up for their IPO on the NSE and BSE before the fiscal year concludes. SEBI announced tighter disclosure norms to ensure transparent valuations and protect retail investor funds.',
    url: 'https://www.sebi.gov.in/',
    sourceName: 'LiveMint',
    imageUrl: null,
    publishedAt: new Date(Date.now() - 960 * 60 * 1000).toISOString(),
    category: 'markets'
  },
  {
    id: 'sample-11',
    title: 'Smart tax-saving moves for year-end: Maximizing PPF, NPS, and equity mutual fund gains',
    description: 'Financial planners advise retail taxpayers to align investments early in the financial year. Allocating funds across NPS, PPF, and tax-saving equity mutual funds allows disciplined compounding while lowering aggregate tax liability.',
    url: 'https://www.cleartax.in/',
    sourceName: 'ET Wealth',
    imageUrl: null,
    publishedAt: new Date(Date.now() - 1100 * 60 * 1000).toISOString(),
    category: 'personal-finance'
  },
  {
    id: 'sample-12',
    title: 'Wholesale inflation (WPI) moderates to 1.3% while retail CPI hovers near target',
    description: 'Wholesale price index data showed easing primary food articles and manufactured product costs. Economists noted that subdued WPI trends will eventually filter into lower retail prices, providing breathing room for household budgets.',
    url: 'https://pib.gov.in/',
    sourceName: 'Press Information Bureau',
    imageUrl: null,
    publishedAt: new Date(Date.now() - 1250 * 60 * 1000).toISOString(),
    category: 'economy'
  }
];

if (typeof module !== 'undefined') {
  module.exports = SAMPLE_ARTICLES;
}
