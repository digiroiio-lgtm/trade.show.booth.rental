export const SITE_NAME = "BoothQuotes";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.boothquotes.com";

export const HERO_HEADLINE = "Compare Trade Show Booth Builders.";
export const HERO_SUBHEADLINE = "Get 3 Quotes.";
export const HERO_TAGLINE =
  "Get up to 3 quotes from trade show booth companies for your next US exhibition.";
export const CORE_TAGLINE = "One brief. Up to 3 quotes. No obligation.";

export const PRIMARY_CTA = "GET 3 QUOTES";

export interface City {
  slug: string;
  name: string;
  state: string;
  intro: string;
  venues: string[];
  tradeShowSlugs: string[];
}

// Only well-known, verifiable major convention venues are listed. No
// attendance figures, dates, or unverified statistics are included.
export const CITIES: City[] = [
  {
    slug: "las-vegas",
    name: "Las Vegas",
    state: "Nevada",
    intro:
      "Las Vegas hosts some of the largest trade shows in the United States, drawing exhibitors from every industry to its major convention venues.",
    venues: ["Las Vegas Convention Center", "Mandalay Bay Convention Center"],
    tradeShowSlugs: ["ces-booth-rental"],
  },
  {
    slug: "orlando",
    name: "Orlando",
    state: "Florida",
    intro:
      "Orlando is a leading East Coast destination for trade shows and conventions, anchored by one of the largest convention centers in the country.",
    venues: ["Orange County Convention Center"],
    tradeShowSlugs: ["iaapa-booth-rental"],
  },
  {
    slug: "chicago",
    name: "Chicago",
    state: "Illinois",
    intro:
      "Chicago is home to major national and international trade shows, hosted at some of the largest exhibition facilities in North America.",
    venues: ["McCormick Place"],
    tradeShowSlugs: ["nab-show-booth-rental"],
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    state: "California",
    intro:
      "Los Angeles offers exhibitors access to major West Coast trade shows and a large network of trade show booth builders.",
    venues: ["Los Angeles Convention Center"],
    tradeShowSlugs: [],
  },
  {
    slug: "anaheim",
    name: "Anaheim",
    state: "California",
    intro:
      "Anaheim is a popular Southern California trade show destination, hosting a wide range of industry conventions each year.",
    venues: ["Anaheim Convention Center"],
    tradeShowSlugs: [],
  },
  {
    slug: "miami",
    name: "Miami",
    state: "Florida",
    intro:
      "Miami serves as a gateway for trade shows connecting US exhibitors with Latin American and international markets.",
    venues: ["Miami Beach Convention Center"],
    tradeShowSlugs: [],
  },
  {
    slug: "new-york",
    name: "New York",
    state: "New York",
    intro:
      "New York is home to a wide range of trade shows across fashion, technology, food and professional industries.",
    venues: ["Javits Center"],
    tradeShowSlugs: [],
  },
];

export interface TradeShow {
  slug: string;
  name: string;
  citySlug?: string;
  overview: string;
}

// Overview copy intentionally avoids dates, attendee counts, or venue
// rules that have not been verified.
export const TRADE_SHOWS: TradeShow[] = [
  {
    slug: "ces-booth-rental",
    name: "CES",
    citySlug: "las-vegas",
    overview:
      "CES is a major technology trade show held in Las Vegas. Exhibitors compare trade show booth builders for rental, custom design, fabrication and installation of their CES exhibit space.",
  },
  {
    slug: "sema-booth-rental",
    name: "SEMA Show",
    citySlug: "las-vegas",
    overview:
      "The SEMA Show is a major automotive specialty products trade show held in Las Vegas. Exhibitors work with trade show booth builders to design and build their exhibit space.",
  },
  {
    slug: "nab-show-booth-rental",
    name: "NAB Show",
    citySlug: "las-vegas",
    overview:
      "NAB Show is a media and entertainment technology trade show. Exhibitors compare trade show booth builders for rental, custom design and installation of their exhibit space.",
  },
  {
    slug: "world-of-concrete-booth-rental",
    name: "World of Concrete",
    citySlug: "las-vegas",
    overview:
      "World of Concrete is a trade show for the commercial construction industry. Exhibitors work with booth builders to plan and build their exhibit presence.",
  },
  {
    slug: "iaapa-booth-rental",
    name: "IAAPA Expo",
    citySlug: "orlando",
    overview:
      "IAAPA Expo is a trade show for the attractions and entertainment industry, held in Orlando. Exhibitors compare booth builders for rental, design and installation services.",
  },
  {
    slug: "infocomm-booth-rental",
    name: "InfoComm",
    overview:
      "InfoComm is a trade show for the professional audiovisual and integrated experience industry. Exhibitors compare trade show booth builders for their exhibit space.",
  },
  {
    slug: "pga-show-booth-rental",
    name: "PGA Show",
    overview:
      "The PGA Show is a trade show for the golf industry. Exhibitors work with trade show booth builders to design, build and install their exhibit space.",
  },
];

export interface Service {
  slug: string;
  name: string;
  description: string;
}

export const SERVICES: Service[] = [
  {
    slug: "trade-show-booth-rental",
    name: "Trade Show Booth Rental",
    description:
      "Rental exhibit solutions for short-term trade show and event needs.",
  },
  {
    slug: "custom-booth-design",
    name: "Custom Booth Design",
    description: "Custom-designed exhibits built around your brand.",
  },
  {
    slug: "booth-fabrication",
    name: "Booth Fabrication",
    description: "Fabrication of custom exhibit structures and components.",
  },
  {
    slug: "trade-show-displays",
    name: "Trade Show Displays",
    description: "Portable and modular displays for trade shows and events.",
  },
  {
    slug: "island-booths",
    name: "Island Booths",
    description: "Large-format island exhibit builds for major trade shows.",
  },
  {
    slug: "installation-dismantling",
    name: "Installation & Dismantling",
    description: "Professional installation and dismantling (I&D) services.",
  },
  {
    slug: "graphics-signage",
    name: "Graphics & Signage",
    description: "Exhibit graphics, signage and branded print production.",
  },
  {
    slug: "av-led",
    name: "AV & LED",
    description: "Audio-visual equipment and LED display integration.",
  },
  {
    slug: "furniture",
    name: "Furniture",
    description: "Exhibit furniture rental for booths and meeting spaces.",
  },
  {
    slug: "turnkey-exhibit-services",
    name: "Turnkey Exhibit Services",
    description: "End-to-end exhibit management from design to dismantle.",
  },
];

export const BOOTH_SIZES = [
  "10x10",
  "10x20",
  "20x20",
  "20x30",
  "20x40",
  "30x30",
  "40x40+",
  "Not sure",
] as const;

export const SERVICES_NEEDED = [
  "Booth Rental",
  "Custom Design",
  "Fabrication",
  "Graphics",
  "Furniture",
  "AV / LED",
  "Shipping",
  "Installation",
  "Dismantling",
  "Turnkey Service",
] as const;

export const BUDGET_RANGES = [
  "Under $10K",
  "$10K–$20K",
  "$20K–$40K",
  "$40K–$75K",
  "$75K–$150K",
  "$150K+",
  "Not sure",
] as const;

export const EXHIBIT_CITY_OPTIONS = [
  "Las Vegas",
  "Orlando",
  "Chicago",
  "Los Angeles",
  "Anaheim",
  "Miami",
  "New York",
  "Other",
] as const;

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "QUOTED",
  "WON",
  "LOST",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
