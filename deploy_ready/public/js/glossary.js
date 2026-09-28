// Plain-language definitions for terms that show up constantly in Indian
// financial reporting. Matching is case-insensitive and whole-word, and
// longer terms are matched before their substrings (e.g. "repo rate" before
// "repo").
const GLOSSARY = [
  ['Sensex', 'The BSE\u2019s benchmark index, tracking 30 large, established companies.'],
  ['Nifty', 'The NSE\u2019s benchmark index, tracking 50 large companies across sectors.'],
  ['BSE', 'Bombay Stock Exchange, one of India\u2019s two main stock exchanges.'],
  ['NSE', 'National Stock Exchange, India\u2019s largest stock exchange by trading volume.'],
  ['SEBI', 'Securities and Exchange Board of India, the market regulator.'],
  ['RBI', 'Reserve Bank of India, the central bank that sets interest rates and oversees banks.'],
  ['repo rate', 'The rate at which the RBI lends money to commercial banks. It influences loan and deposit rates across the economy.'],
  ['IPO', 'Initial Public Offering: the first time a company sells shares to the public on a stock exchange.'],
  ['FPI', 'Foreign Portfolio Investment: money foreign investors put into Indian stocks and bonds.'],
  ['FII', 'Foreign Institutional Investor: an overseas fund or institution investing in Indian markets.'],
  ['DII', 'Domestic Institutional Investor: an Indian institution, like a mutual fund or insurer, investing in local markets.'],
  ['NPA', 'Non-Performing Asset: a loan a bank is no longer collecting interest or repayments on.'],
  ['GDP', 'Gross Domestic Product: the total value of everything a country produces in a given period.'],
  ['CPI', 'Consumer Price Index: a measure of how prices for everyday goods and services are changing.'],
  ['WPI', 'Wholesale Price Index: a measure of price changes at the wholesale, rather than retail, level.'],
  ['fiscal deficit', 'The gap between what the government spends and what it earns, usually covered by borrowing.'],
  ['mutual fund', 'A pooled investment that buys stocks or bonds on behalf of many investors at once.'],
  ['SIP', 'Systematic Investment Plan: investing a fixed amount into a mutual fund at regular intervals.'],
  ['GST', 'Goods and Services Tax: India\u2019s unified tax on the sale of goods and services.'],
  ['demat account', 'An account that holds shares and securities in electronic form, instead of paper certificates.'],
  ['P/E ratio', 'Price-to-Earnings ratio: a stock\u2019s price divided by its earnings per share, used to judge if it looks expensive or cheap.'],
  ['market capitalization', 'The total value of a company\u2019s shares: share price multiplied by number of shares outstanding.'],
  ['dividend yield', 'A company\u2019s annual dividend payment shown as a percentage of its share price.'],
  ['bull market', 'A sustained period of rising prices and investor optimism.'],
  ['bear market', 'A sustained period of falling prices and investor pessimism.'],
].sort((a, b) => b[0].length - a[0].length); // longest terms first, so "repo rate" wins over "repo"

if (typeof module !== 'undefined') module.exports = GLOSSARY;
