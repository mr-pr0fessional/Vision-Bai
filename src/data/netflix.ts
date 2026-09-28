/**
 * Curated Netflix historical dataset.
 * Sources: Netflix annual reports (10-K), quarterly shareholder letters,
 * and the widely used public Netflix titles catalog.
 * Figures for the most recent years are approximate.
 */

export type YearRow = {
  year: number;
  /** Global paid memberships at year end, millions */
  subscribers: number;
  /** Annual revenue, USD billions */
  revenue: number;
  /** Operating income, USD billions */
  operatingIncome: number;
};

export const yearly: YearRow[] = [
  { year: 1999, subscribers: 0.1, revenue: 0.005, operatingIncome: -0.03 },
  { year: 2000, subscribers: 0.29, revenue: 0.036, operatingIncome: -0.06 },
  { year: 2001, subscribers: 0.46, revenue: 0.076, operatingIncome: -0.04 },
  { year: 2002, subscribers: 0.86, revenue: 0.153, operatingIncome: -0.01 },
  { year: 2003, subscribers: 1.49, revenue: 0.272, operatingIncome: 0.005 },
  { year: 2004, subscribers: 2.61, revenue: 0.506, operatingIncome: 0.02 },
  { year: 2005, subscribers: 4.18, revenue: 0.682, operatingIncome: 0.03 },
  { year: 2006, subscribers: 6.32, revenue: 0.997, operatingIncome: 0.065 },
  { year: 2007, subscribers: 7.48, revenue: 1.205, operatingIncome: 0.092 },
  { year: 2008, subscribers: 9.39, revenue: 1.365, operatingIncome: 0.122 },
  { year: 2009, subscribers: 12.27, revenue: 1.67, operatingIncome: 0.192 },
  { year: 2010, subscribers: 20.01, revenue: 2.163, operatingIncome: 0.284 },
  { year: 2011, subscribers: 26.55, revenue: 3.205, operatingIncome: 0.376 },
  { year: 2012, subscribers: 33.27, revenue: 3.609, operatingIncome: 0.05 },
  { year: 2013, subscribers: 44.35, revenue: 4.375, operatingIncome: 0.228 },
  { year: 2014, subscribers: 57.39, revenue: 5.505, operatingIncome: 0.403 },
  { year: 2015, subscribers: 74.76, revenue: 6.78, operatingIncome: 0.306 },
  { year: 2016, subscribers: 93.8, revenue: 8.831, operatingIncome: 0.38 },
  { year: 2017, subscribers: 110.64, revenue: 11.693, operatingIncome: 0.839 },
  { year: 2018, subscribers: 139.26, revenue: 15.794, operatingIncome: 1.605 },
  { year: 2019, subscribers: 167.09, revenue: 20.156, operatingIncome: 2.604 },
  { year: 2020, subscribers: 203.66, revenue: 24.996, operatingIncome: 4.585 },
  { year: 2021, subscribers: 221.84, revenue: 29.698, operatingIncome: 6.194 },
  { year: 2022, subscribers: 230.75, revenue: 31.616, operatingIncome: 5.633 },
  { year: 2023, subscribers: 260.28, revenue: 33.723, operatingIncome: 6.954 },
  { year: 2024, subscribers: 301.63, revenue: 39.001, operatingIncome: 10.418 },
  { year: 2025, subscribers: 325.0, revenue: 45.1, operatingIncome: 13.1 },
];

export type RegionRow = {
  year: number;
  /** United States & Canada */
  ucan: number;
  /** Europe, Middle East & Africa */
  emea: number;
  /** Latin America */
  latam: number;
  /** Asia-Pacific */
  apac: number;
};

/** Paid memberships by region, millions (regional reporting began in 2017) */
export const regional: RegionRow[] = [
  { year: 2017, ucan: 54.75, emea: 26.34, latam: 21.26, apac: 8.29 },
  { year: 2018, ucan: 64.76, emea: 37.82, latam: 26.08, apac: 10.61 },
  { year: 2019, ucan: 67.66, emea: 51.78, latam: 31.42, apac: 16.23 },
  { year: 2020, ucan: 73.94, emea: 66.7, latam: 37.54, apac: 25.49 },
  { year: 2021, ucan: 75.22, emea: 74.04, latam: 39.96, apac: 32.63 },
  { year: 2022, ucan: 74.3, emea: 76.73, latam: 41.7, apac: 38.02 },
  { year: 2023, ucan: 80.13, emea: 88.81, latam: 46.0, apac: 45.34 },
  { year: 2024, ucan: 89.6, emea: 101.13, latam: 53.34, apac: 57.55 },
  { year: 2025, ucan: 94.5, emea: 110.0, latam: 57.5, apac: 63.0 },
];

export const regionMeta = [
  { key: "ucan", label: "US & Canada", color: "var(--chart-1)" },
  { key: "emea", label: "EMEA", color: "var(--chart-2)" },
  { key: "latam", label: "Latin America", color: "var(--chart-3)" },
  { key: "apac", label: "Asia-Pacific", color: "var(--chart-4)" },
] as const;

export type Milestone = {
  year: number;
  title: string;
  detail: string;
};

export const milestones: Milestone[] = [
  {
    year: 1997,
    title: "Founded as a DVD-by-mail service",
    detail: "Reed Hastings and Marc Randolph launch Netflix in Scotts Valley, California.",
  },
  {
    year: 1999,
    title: "Flat-fee subscription launched",
    detail: "Unlimited rentals, no due dates, no late fees — the subscription model is born.",
  },
  {
    year: 2002,
    title: "IPO on NASDAQ",
    detail: "Netflix goes public at $15 a share with roughly 600,000 subscribers.",
  },
  {
    year: 2007,
    title: "Streaming launches",
    detail: "'Watch Now' streams 1,000 titles to subscribers' computers at no extra cost.",
  },
  {
    year: 2010,
    title: "First international market",
    detail: "Expansion into Canada begins the shift from a US company to a global one.",
  },
  {
    year: 2013,
    title: "First original series",
    detail: "House of Cards proves Netflix can commission prestige television.",
  },
  {
    year: 2016,
    title: "Global launch in 190 countries",
    detail: "Netflix switches on in 130 new markets in a single day.",
  },
  {
    year: 2020,
    title: "Pandemic surge",
    detail: "A record 36 million members join in one year as the world stays home.",
  },
  {
    year: 2022,
    title: "First subscriber loss",
    detail: "Netflix loses members for the first time in a decade; the stock falls sharply.",
  },
  {
    year: 2023,
    title: "Paid sharing crackdown",
    detail: "Account-sharing limits roll out worldwide and reignite membership growth.",
  },
  {
    year: 2024,
    title: "Ads tier scales up",
    detail: "The ad-supported plan becomes a major growth engine alongside live events.",
  },
];

/* ---------------------------------- Content library ---------------------------------- */

export const titlesAdded = [
  { year: 2008, movies: 1, shows: 1 },
  { year: 2009, movies: 2, shows: 0 },
  { year: 2010, movies: 1, shows: 0 },
  { year: 2011, movies: 13, shows: 0 },
  { year: 2012, movies: 3, shows: 0 },
  { year: 2013, movies: 6, shows: 5 },
  { year: 2014, movies: 19, shows: 5 },
  { year: 2015, movies: 56, shows: 26 },
  { year: 2016, movies: 253, shows: 176 },
  { year: 2017, movies: 839, shows: 349 },
  { year: 2018, movies: 1237, shows: 411 },
  { year: 2019, movies: 1424, shows: 656 },
  { year: 2020, movies: 1284, shows: 595 },
  { year: 2021, movies: 993, shows: 505 },
  { year: 2022, movies: 1050, shows: 610 },
  { year: 2023, movies: 1120, shows: 690 },
  { year: 2024, movies: 1180, shows: 760 },
];

export const genres = [
  { name: "International", count: 2752 },
  { name: "Dramas", count: 2427 },
  { name: "Comedies", count: 1674 },
  { name: "Action & Adventure", count: 859 },
  { name: "Documentaries", count: 829 },
  { name: "Children & Family", count: 641 },
  { name: "Romantic", count: 616 },
  { name: "Thrillers", count: 577 },
  { name: "Crime", count: 470 },
  { name: "Horror", count: 357 },
];

export const countries = [
  { name: "United States", count: 3690 },
  { name: "India", count: 1046 },
  { name: "United Kingdom", count: 806 },
  { name: "Canada", count: 445 },
  { name: "France", count: 393 },
  { name: "Japan", count: 318 },
  { name: "South Korea", count: 231 },
  { name: "Spain", count: 232 },
];

export const ratings = [
  { name: "TV-MA", count: 3207 },
  { name: "TV-14", count: 2160 },
  { name: "TV-PG", count: 863 },
  { name: "R", count: 799 },
  { name: "PG-13", count: 490 },
  { name: "TV-Y7", count: 334 },
  { name: "TV-Y", count: 307 },
  { name: "PG", count: 287 },
];

export const totalTitles = genres.reduce((_, g) => _, 0) || 0;
