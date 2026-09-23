import fs from "node:fs/promises";
import path from "node:path";

const TOP100_CSV_URL = "https://companiesmarketcap.com/?download=csv";
const USER_AGENT = "SupplyChainMap/1.0 (https://example.local)";

const OUTPUT_RAW_CSV_PATH = path.join("data", "top100-marketcap.csv");
const OUTPUT_JSON_PATH = path.join("data", "top100-map.json");
const OUTPUT_JS_PATH = path.join("data", "top100-map.js");

const LAYERS = {
  "-3": "Energy & Raw Inputs",
  "-2": "Materials & Chemicals",
  "-1": "Industrials & Mobility",
  "0": "Semiconductors & Components",
  "1": "Hardware & Equipment",
  "2": "Software & Platforms",
  "3": "Cloud / Network / Media",
  "4": "Finance & Payments",
  "5": "Healthcare & Life Sciences",
  "6": "Consumer Demand & Services",
};

const PROFILE_LAYERS = {
  "-2": "Upstream Inputs",
  "-1": "Services & Risk",
  "0": "Company",
  "1": "Channels",
  "2": "Demand",
};

const COUNTRY_CODE = {
  "United States": "US",
  Taiwan: "TW",
  "Saudi Arabia": "SA",
  "South Korea": "KR",
  China: "CN",
  Netherlands: "NL",
  Switzerland: "CH",
  "United Kingdom": "UK",
  France: "FR",
  Japan: "JP",
  Canada: "CA",
  "United Arab Emirates": "AE",
  Qatar: "QA",
  Germany: "DE",
  Denmark: "DK",
  Singapore: "SG",
  Finland: "FI",
  Australia: "AU",
  "New Zealand": "NZ",
  Mexico: "MX",
  Spain: "ES",
  India: "IN",
  Brazil: "BR",
  Italy: "IT",
  Ireland: "IE",
  Sweden: "SE",
  Norway: "NO",
  Belgium: "BE",
  Uruguay: "UY",
  Chile: "CL",
  EU: "EU",
  Global: "XX",
};

const COUNTRY_COLORS = {
  US: "#4488cc",
  CN: "#e74c3c",
  TW: "#00b894",
  KR: "#9b59b6",
  UK: "#f39c12",
  JP: "#2ecc71",
  CH: "#a29bfe",
  FR: "#3498db",
  DE: "#d4a017",
  NL: "#e67e22",
  SA: "#16a085",
  CA: "#1abc9c",
  AE: "#27ae60",
  QA: "#2b6cb0",
  DK: "#8e44ad",
  SG: "#16a2b8",
  FI: "#4a90e2",
  AU: "#f1c40f",
  NZ: "#00a8a8",
  MX: "#00a86b",
  ES: "#ff7675",
  IN: "#6c5ce7",
  BR: "#2ecc71",
  IT: "#27ae60",
  SE: "#3498db",
  NO: "#c0392b",
  BE: "#f39c12",
  UY: "#5dade2",
  CL: "#e74c3c",
  EU: "#95a5a6",
  XX: "#777777",
};

const ENTITY_COUNTRY_BY_KEYWORD = {
  "hon hai": "TW",
  foxconn: "TW",
  tsmc: "TW",
  "taiwan semiconductor": "TW",
  nvidia: "US",
  "microsoft azure": "US",
  microsoft: "US",
  amazon: "US",
  "aws ": "US",
  "aws)": "US",
  google: "US",
  alphabet: "US",
  apple: "US",
  corning: "US",
  murata: "JP",
  luxshare: "CN",
  panasonic: "JP",
  catl: "CN",
  "contemporary amperex": "CN",
  "sk hynix": "KR",
  micron: "US",
  amd: "US",
  asml: "NL",
  "applied materials": "US",
  "asm international": "NL",
  "linde engineering": "DE",
  "linde gas north america": "US",
  "linde u.s. gas applications": "US",
  linde: "UK",
  praxair: "US",
  tencent: "CN",
  olx: "NL",
  ifood: "BR",
  payu: "NL",
  "stack overflow": "US",
  "delivery hero": "DE",
  swiggy: "IN",
  synopsys: "US",
  cadence: "US",
  "siemens eda": "DE",
  umc: "TW",
  mediatek: "TW",
  "china tower corporation limited": "CN",
  "china mobile international limited": "CN",
  "migu co., ltd.": "CN",
  "migu co., ltd": "CN",
  "mufg bank": "JP",
  "mitsubishi ufj trust and banking": "JP",
  "mitsubishi ufj morgan stanley securities": "JP",
  "morgan stanley mufg securities": "JP",
  "mitsubishi ufj securities holdings": "JP",
  commsec: "AU",
  bankwest: "AU",
  "asb bank": "NZ",
  netbank: "AU",
  commbiz: "AU",
  "commbank yello": "AU",
  "pull&bear": "ES",
  "massimo dutti": "ES",
  bershka: "ES",
  stradivarius: "ES",
  oysho: "ES",
  "zara home": "ES",
  lefties: "ES",
  zara: "ES",
  "digital industries": "DE",
  "smart infrastructure": "DE",
  "siemens financial services": "DE",
  "siemens healthineers": "DE",
  "pepsico beverages north america": "US",
  "pepsico foods north america": "US",
  "latin america foods": "US",
  "qatarenergy lng nfe": "QA",
  "qatarenergy lng nfs": "QA",
  "lng canada": "CA",
  globalwafers: "TW",
  "delta air lines": "US",
  "marriott international": "US",
  "hilton worldwide holdings": "US",
  "british airways": "UK",
  "uber eats": "US",
  doordash: "US",
  "arcos dorados": "UY",
  havi: "US",
  "alpha dhabi": "AE",
  purehealth: "AE",
  "nmdc group": "AE",
  "multiply group": "AE",
  "2pointzero": "AE",
  "aldar properties": "AE",
  "international resources holding": "AE",
  "sap signavio": "DE",
  "sap leanix": "DE",
  "sap ariba": "US",
  "sap concur": "US",
  "sap fieldglass": "US",
  "sap successfactors": "US",
  clorox: "US",
  "kraft heinz": "US",
  "kimberly-clark": "US",
  "church & dwight": "US",
  target: "US",
  symbotic: "US",
  databricks: "US",
  mckesson: "US",
  cencora: "US",
  "cardinal health": "US",
  qualcomm: "US",
  coinbase: "US",
  paypal: "US",
  alipay: "CN",
  "shop pay": "US",
  citi: "US",
  "the clearing house": "US",
  openai: "US",
  intel: "US",
  imec: "BE",
  "carl zeiss": "DE",
  "sk telecom": "KR",
  "visa direct": "US",
  fiserv: "US",
  "j.p. morgan": "US",
  jpmorgan: "US",
  qatarenergy: "QA",
  "cf industries": "US",
  bnsf: "US",
  geico: "US",
  mercedes: "DE",
  "mercedes-benz": "DE",
  "electronic arts": "US",
  "esports world cup foundation": "SA",
  alexion: "US",
  astrazeneca: "UK",
  eisai: "JP",
  moderna: "US",
  "daiichi sankyo": "JP",
  "msd (merck)": "US",
  morphosys: "DE",
  regulus: "US",
  avidity: "US",
  splunk: "US",
  "spectrum-x": "US",
  "prime planet energy": "JP",
  "primearth ev energy": "JP",
  genentech: "US",
  "foundation medicine": "US",
  chugai: "JP",
  "louis vuitton": "FR",
  "christian dior": "FR",
  sephora: "FR",
  "legend biotech": "US",
  "shockwave medical": "US",
  "v-wave": "US",
  genmab: "DK",
  immunogen: "US",
  cerevel: "US",
  instacart: "US",
  citibank: "US",
  citi: "US",
  "visa network": "US",
  zelle: "US",
  "the clearing house": "US",
  "srs distribution": "US",
  "hd supply": "US",
  gms: "US",
  "home depot pro": "US",
  cainiao: "CN",
  lazada: "CN",
  "ant group": "CN",
  tengizchevroil: "US",
  cpchem: "US",
  "chevron phillips": "US",
  "china unionpay": "CN",
  "swift network": "US",
  cips: "CN",
  "constellation energy": "US",
  reliance: "IN",
  halliburton: "US",
  "baker hughes": "US",
  schlumberger: "US",
  safran: "FR",
  boeing: "US",
  airbus: "FR",
  ceva: "CH",
  randstad: "NL",
  denso: "JP",
  femsa: "MX",
  europacific: "UK",
  "coca-cola hbc": "CH",
  tf1: "FR",
  "tko group": "US",
  wwe: "US",
  oracle: "US",
  "osi group": "US",
  "lamb weston": "US",
  "kairos power": "US",
  "fervo energy": "US",
  "baseload capital": "SE",
  vmware: "US",
  telia: "SE",
  celestica: "CA",
  "cea-leti": "FR",
  "reliance retail": "IN",
  "jio-bp": "IN",
  "jiomart": "IN",
  "reliance jio infocomm": "IN",
  "catalent group": "US",
  "catalent": "US",
  "novonesis": "DK",
  "novonesis a/s": "DK",
  "wegovy": "DK",
  "american tower": "US",
  "american tower corporation": "US",
  "verizon consumer group": "US",
  "verizon business group": "US",
  "treasury and trade solutions": "US",
  "tts": "US",
  "securities services": "US",
  "horizon therapeutics": "IE",
  "horizon therapeutics plc": "IE",
  "chemocentryx": "US",
  "chemocentryx, inc.": "US",
  "tesla": "US",
  "bosch": "DE",
  "continental ag": "DE",
  "at&t communications": "US",
  "warnermedia": "US",
  "directv": "US",
  "bhp iron ore": "AU",
  "bhp copper": "AU",
  "bhp petroleum": "AU",
  "samsung electronics": "KR",
  "abbott laboratories": "US",
  "abbott diabetes care": "US",
  "freestyle libre": "US",
  "industrial market": "XX",
  "automotive market": "XX",
  "personal electronics market": "XX",
  "mobility": "US",
  "business wireline": "US",
  "consumer wireline": "US",
  "olympic dam": "AU",
  "escondida": "CL",
  "western australia iron ore": "AU",
  "medical devices": "US",
  "diagnostic products": "US",
  "hang seng bank": "CN",
  "bank of communications": "CN",
  "hsbc uk bank": "UK",
  kunlun: "CN",
  pipechina: "CN",
  petrochina: "CN",
  besi: "NL",
  "be semiconductor": "NL",
  "toto ltd": "JP",
  "swedish match": "SE",
  vectura: "UK",
  "altria group": "US",
  "goldman sachs bank": "US",
  "goldman sachs international": "UK",
  "general motors": "US",
  "e*trade": "US",
  "morgan stanley bank": "US",
  "morgan stanley smith barney": "US",
  "wells fargo bank": "US",
  "wells fargo securities": "US",
  "wells fargo clearing services": "US",
  "collins aerospace": "US",
  raytheon: "US",
  "pratt & whitney": "US",
  "blue bottle coffee": "US",
  "gerber products": "US",
  "nestlé purina": "US",
  "nestle purina": "US",
  nespresso: "CH",
  sanpellegrino: "IT",
  unitedhealthcare: "US",
  "optum health": "US",
  "optum rx": "US",
  "optum insight": "US",
  "change healthcare": "US",
  "john lobb": "UK",
  puiforcat: "FR",
  "saint-louis": "FR",
  "l'oréal paris": "FR",
  "l'oreal paris": "FR",
  "maybelline new york": "US",
  "la roche-posay": "FR",
  cerave: "US",
  "lancôme": "FR",
  lancome: "FR",
  vichy: "FR",
  "kiehl's": "US",
  "aēsop": "AU",
  aesop: "AU",
  "bank of china (hong kong)": "CN",
  "bank of china (macau)": "CN",
  "boc india": "IN",
  "boc aviation": "SG",
  "boc international holdings": "CN",
  "boc group life assurance": "CN",
  "li auto": "CN",
  "tesla, inc.": "US",
  stellantis: "NL",
  leapmotor: "CN",
  "city national bank": "US",
  "rbc capital markets": "CA",
  "rbc wealth management": "CA",
  "rbc investor services": "CA",
  "rbc insurance": "CA",
  "deutsche telekom": "DE",
  "crown castle": "US",
  "metro by t-mobile": "US",
  nokia: "FI",
  "red hat": "US",
  hashicorp: "US",
  "ibm partner plus": "US",
};

const LAYER_OVERRIDES = {
  NVDA: 0,
  AAPL: 6,
  GOOG: 2,
  MSFT: 3,
  AMZN: 3,
  TSM: 0,
  "2222.SR": -3,
  META: 2,
  AVGO: 0,
  TSLA: -1,
  "BRK-B": 4,
  WMT: 6,
  LLY: 5,
  "005930.KS": 1,
  JPM: 4,
  XOM: -3,
  V: 4,
  TCEHY: 2,
  JNJ: 5,
  ASML: 0,
  MU: 0,
  MA: 4,
  "000660.KS": 0,
  ORCL: 3,
  COST: 6,
  ABBV: 5,
  BAC: 4,
  HD: 6,
  "ROG.SW": 5,
  PG: 6,
  CVX: -3,
  BABA: 2,
  "1398.HK": 4,
  CAT: -1,
  GE: -1,
  KO: 6,
  AMD: 0,
  NFLX: 3,
  AZN: 5,
  PLTR: 2,
  TM: -1,
  CSCO: 1,
  MRK: 5,
  LRCX: 0,
  HSBC: 4,
  AMAT: 0,
  GS: 4,
  MS: 4,
  RTX: -1,
  WFC: 4,
  UNH: 5,
  TMUS: 3,
  RY: 4,
  IBM: 2,
  AXP: 4,
  SAP: 2,
  MCD: 6,
  LIN: -2,
  SHEL: -3,
  GEV: -3,
  INTC: 0,
  MUFG: 4,
  NVO: 5,
  C: 4,
  VZ: 3,
  AMGN: 5,
  TXN: 0,
  T: 3,
  ABT: 5,
  TMO: 5,
  KLAC: 0,
  BHP: -2,
  RIO: -2,
  NEE: -3,
  DIS: 6,
  GILD: 5,
  APH: 1,
  BA: -1,
};

const TEMPLATE_BY_LAYER = {
  "-3": {
    category: "Energy",
    upstream: ["Fuel & feedstock suppliers", "Extraction partners", "Field equipment vendors"],
    services: ["Pipeline & shipping logistics", "Commercial insurance carriers", "Project financing banks"],
    channels: ["Industrial offtake contracts", "Utility / grid buyers"],
    demand: ["Global energy demand", "Enterprise contracts"],
  },
  "-2": {
    category: "Materials",
    upstream: ["Ore and commodity sources", "Process chemical suppliers", "Energy and utilities inputs"],
    services: ["Bulk freight logistics", "Commodity hedging desks", "Property & casualty insurers"],
    channels: ["Industrial buyers", "Technology manufacturing demand"],
    demand: ["Construction and infrastructure demand", "Battery and electronics demand"],
  },
  "-1": {
    category: "Industrials",
    upstream: ["Component suppliers", "Steel/alloy inputs", "Precision manufacturing partners"],
    services: ["Fleet and transport logistics", "Warranty and liability insurers", "Treasury & trade finance"],
    channels: ["OEM and system integrators", "Channel and distribution partners"],
    demand: ["Capital project demand", "Government / enterprise contracts"],
  },
  "0": {
    category: "Semiconductors",
    upstream: ["Foundry and wafer capacity", "Memory and substrate suppliers", "Lithography/process equipment"],
    services: ["Cross-border logistics", "Supply risk insurance", "Financing and capex support"],
    channels: ["Cloud and AI platform demand", "OEM hardware integration"],
    demand: ["Enterprise compute demand", "Consumer electronics demand"],
  },
  "1": {
    category: "Hardware",
    upstream: ["Chip and board suppliers", "Contract manufacturers", "Mechanical component suppliers"],
    services: ["Global distribution logistics", "Product liability insurance", "Payment and invoicing services"],
    channels: ["Retail and enterprise channels", "System integrator partners"],
    demand: ["Consumer demand", "Commercial replacement cycles"],
  },
  "2": {
    category: "Software",
    upstream: ["Cloud hosting providers", "Identity/security vendors", "Data infrastructure vendors"],
    services: ["Cyber insurance and legal coverage", "Treasury and payment ops", "Compliance tooling providers"],
    channels: ["Partner ecosystem", "API and platform integrators"],
    demand: ["Enterprise subscription demand", "Developer and user adoption"],
  },
  "3": {
    category: "Cloud/Network",
    upstream: ["Data center hardware suppliers", "Power and cooling providers", "Fiber and transit carriers"],
    services: ["Infra insurance coverage", "Global colocation partners", "Finance and procurement support"],
    channels: ["Platform and partner channels", "B2B contracts"],
    demand: ["Compute/storage demand", "Consumer traffic demand"],
  },
  "4": {
    category: "Finance",
    upstream: ["Core banking technology vendors", "Data and risk model providers", "Compliance platforms"],
    services: ["Cybersecurity providers", "Insurance and reinsurance", "Settlement/payment rails"],
    channels: ["Corporate treasury customers", "Retail and merchant channels"],
    demand: ["Credit and payments demand", "Asset and liquidity demand"],
  },
  "5": {
    category: "Healthcare",
    upstream: ["Lab and process inputs", "Contract manufacturing organizations", "Clinical/research partners"],
    services: ["Cold-chain logistics", "Product liability insurance", "Treasury and financing partners"],
    channels: ["Hospital and payer channels", "Pharmacy / provider channels"],
    demand: ["Patient demand", "Healthcare system demand"],
  },
  "6": {
    category: "Consumer",
    upstream: ["Food/material suppliers", "Packaging and ingredient suppliers", "Product manufacturers"],
    services: ["Third-party logistics", "Commercial insurance carriers", "Payment networks"],
    channels: ["Franchise / retail channel", "Digital and delivery channels"],
    demand: ["Consumer demand", "Travel and local demand"],
  },
};

const PROFILE_OVERRIDES = {
  MCD: {
    category: "Quick Service Restaurant",
    nodes: [
      { id: "osi", name: "OSI Group", sub: "Beef supplier relationship", tier: -2, kind: "supplier", country: "US", note: "OSI timeline states it was selected as McDonald's first fresh ground beef supplier.", sourceId: "osi-timeline", confidence: "high (company-specific)" },
      { id: "lamb", name: "Lamb Weston", sub: "French fries processor", tier: -2, kind: "supplier", country: "US", note: "Lamb Weston filings identify McDonald's as its largest customer.", sourceId: "lamb-10k-concentration", confidence: "high (company-specific)" },
      { id: "upstream", name: "Independent Ingredient Suppliers", sub: "Food, paper, and related inputs", tier: -2, kind: "supplier", country: "XX", note: "McDonald's reports reliance on numerous independent suppliers and service providers.", sourceId: "mcd-10k-suppliers", confidence: "high (filing disclosure)" },
      { id: "havi", name: "HAVI Supply Chain", sub: "Integrated foodservice logistics and planning", tier: -1, kind: "service", country: "US", note: "HAVI reports a long-standing supply-chain relationship with McDonald's, including logistics and planning programs.", sourceId: "havi-mcd-supply-chain", confidence: "high (named partner disclosure)" },
      { id: "ins", name: "Commercial Insurance Carriers", sub: "Property, liability, and operational risk", tier: -1, kind: "risk", country: "US", note: "Annual report discusses insurance coverage and insurance-related risk exposure.", sourceId: "mcd-10k-insurance", confidence: "medium (filing, no carrier names)" },
      { id: "fran", name: "Franchise Operators", sub: "Majority of restaurant estate", tier: 1, kind: "channel", country: "XX", note: "Most McDonald's restaurants are franchised to independent operators.", sourceId: "mcd-10k-franchise", confidence: "high (filing disclosure)" },
      { id: "arcos", name: "Arcos Dorados", sub: "Largest Latin America franchisee", tier: 1, kind: "channel", country: "UY", note: "Arcos Dorados renewed a 20-year Master Franchise Agreement with McDonald's effective January 1, 2025.", sourceId: "arcos-mfa-6k", confidence: "high (SEC filing)" },
      { id: "ubereats", name: "Uber Eats", sub: "Global delivery marketplace channel", tier: 1, kind: "channel", country: "US", note: "McDonald's and Uber announced a multi-year global strategic partnership for McDelivery orders.", sourceId: "mcd-uber-strategic", confidence: "high (company announcement)" },
      { id: "doordash", name: "DoorDash", sub: "US McDelivery channel", tier: 1, kind: "channel", country: "US", note: "McDonald's announced a U.S. delivery expansion through a new DoorDash partnership.", sourceId: "mcd-doordash-2025", confidence: "high (company announcement)" },
      { id: "demand", name: "Consumer Meal Demand", sub: "In-store, drive-thru, app, delivery", tier: 2, kind: "demand", country: "XX", note: "End-demand drives throughput across suppliers and franchise channels.", confidence: "high (business model)" },
    ],
    links: [
      ["osi", "company", 3],
      ["lamb", "company", 3],
      ["upstream", "company", 2],
      ["havi", "company", 3],
      ["ins", "company", 2],
      ["company", "fran", 3],
      ["company", "arcos", 2],
      ["company", "ubereats", 2],
      ["company", "doordash", 2],
      ["company", "demand", 3],
      ["fran", "demand", 2],
      ["ubereats", "demand", 1],
      ["doordash", "demand", 1],
    ],
    sources: [
      {
        id: "osi-timeline",
        title: "OSI Group company timeline",
        url: "https://www.osigroup.com/about-us/company-timeline/",
        note: "Lists 1955 selection as McDonald's first supplier of fresh ground beef.",
      },
      {
        id: "mcd-10k-suppliers",
        title: "McDonald's 2023 10-K suppliers disclosure",
        url: "https://www.sec.gov/Archives/edgar/data/63908/000006390824000072/mcd-20231231.htm",
        note: "States reliance on numerous independent suppliers and service providers.",
      },
      {
        id: "lamb-10k-concentration",
        title: "Lamb Weston 2025 filing customer concentration",
        url: "https://www.sec.gov/Archives/edgar/data/1679273/000167927325000063/lambwestonholdingsinc_xf.htm",
        note: "Identifies McDonald's as Lamb Weston's largest customer.",
      },
      {
        id: "mcd-10k-insurance",
        title: "McDonald's 2023 10-K insurance risk disclosure",
        url: "https://www.sec.gov/Archives/edgar/data/63908/000006390824000072/mcd-20231231.htm",
        note: "Discusses insurance coverage and potential insurance-related losses.",
      },
      {
        id: "mcd-10k-franchise",
        title: "McDonald's 2023 10-K franchised restaurant mix",
        url: "https://www.sec.gov/Archives/edgar/data/63908/000006390824000072/mcd-20231231.htm",
        note: "Documents that the majority of restaurants are franchised.",
      },
      {
        id: "havi-mcd-supply-chain",
        title: "HAVI perspective on McDonald's supply-chain agility",
        url: "https://www.havi.com/news-perspectives/mcdonalds-embraces-agility-for-future-ready-supply-chain/",
        note: "Describes HAVI and McDonald's supply-chain collaboration and integrated planning/logistics focus.",
      },
      {
        id: "mcd-uber-strategic",
        title: "McDonald's and Uber announce global strategic partnership",
        url: "https://corporate.mcdonalds.com/corpmcd/our-stories/article/Global-Strategic-Partnership-Uber.html",
        note: "Confirms Uber Eats as a named global delivery channel partner for McDelivery.",
      },
      {
        id: "mcd-doordash-2025",
        title: "McDonald's announces DoorDash U.S. delivery partnership",
        url: "https://corporate.mcdonalds.com/corpmcd/our-stories/article/new-doorDash-partnership.html",
        note: "Confirms DoorDash as a named U.S. delivery channel partner.",
      },
      {
        id: "arcos-mfa-6k",
        title: "Arcos Dorados SEC 6-K on McDonald's Master Franchise Agreement renewal",
        url: "https://www.sec.gov/Archives/edgar/data/1508478/000095010325000116/dp223066_6k.htm",
        note: "Primary filing confirming renewed long-term franchise agreement with McDonald's.",
      },
    ],
  },
};

const SOURCE_BACKED_PROFILE_OVERRIDES = {
  NVDA: {
    theme: "chip_ai",
    category: "AI Compute Platform (Source-backed)",
    sourceByTier: { company: "nvda-10k", "-2": "nvda-10k", "-1": "nvda-10k", "1": "nvda-cloud-channels", "2": "nvda-cloud-channels" },
    sourceByName: {
      "TSMC": "nvda-10k",
      "SK hynix": "nvda-skhynix",
      "Micron Technology": "nvda-10k",
      "Samsung": "techpowerup-jan2026",
      "Super Micro Computer": "supermicro-jan2026",
      "Amkor Technology": "accio-supplier",
      "Flex Ltd": "accio-supplier",
      "Fabrinet": "accio-supplier",
    },
    upstream: [
      "Data Center Revenue",
      "Cloud Service Providers",
      "TSMC Foundry Capacity",
      "SK hynix HBM Memory",
      "Micron HBM Memory",
      "Samsung HBM4 Memory",
      "Super Micro Computer",
      "Amkor Technology",
      "Flex Ltd",
      "Fabrinet",
    ],
    services: ["Global Semiconductor Logistics", "Supply Risk and Insurance Programs", "Treasury and Working Capital Banking", "Semiconductor Design and Verification Stack"],
    channels: ["Microsoft Azure AI", "AWS AI Infrastructure", "Oracle Cloud Infrastructure AI", "Sovereign and National AI Programs"],
    demand: ["Enterprise AI Training Demand", "Inference Workload Demand", "AI Factory Buildout Demand"],
    sources: [
      { id: "nvda-10k", title: "NVIDIA FY2025 Form 10-K", url: "https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1045810/000104581025000023/nvda-20250126.htm", note: "Supplier concentration and manufacturing dependency disclosures. Data Center represents majority of revenue." },
      { id: "nvda-tsmc-synopsys", title: "NVIDIA, TSMC and Synopsys computational lithography production", url: "https://investor.nvidia.com/news/press-release-details/2024/TSMC-and-Synopsys-Bring-Breakthrough-NVIDIA-Computational-Lithography-Platform-to-Production/default.aspx", note: "Named upstream manufacturing ecosystem relationship." },
      { id: "nvda-skhynix", title: "SK hynix supply of HBM to NVIDIA", url: "https://news.skhynix.com/sk-hynix-to-supply-industrys-first-hbm3-dram-to-nvidia/", note: "Named memory supplier relationship to NVIDIA systems." },
      { id: "nvda-cloud-channels", title: "NVIDIA cloud channel announcements (Oracle collaboration)", url: "https://nvidianews.nvidia.com/news/oracle-and-nvidia-collaborate-to-help-enterprises-accelerate-agentic-ai-inference", note: "Named downstream cloud and enterprise deployment channels." },
      { id: "techpowerup-jan2026", title: "NVIDIA to Use SK hynix and Samsung HBM4 for Vera Rubin", url: "https://www.techpowerup.com/344871/supermicro-announces-support-for-upcoming-nvidia-vera-rubin-nvl72-and-hgx-rubin-nvl8-platforms", note: "Samsung HBM4 memory supplier for next-gen NVIDIA GPUs, Jan 2026." },
      { id: "supermicro-jan2026", title: "Supermicro Announces Support for NVIDIA Vera Rubin", url: "https://www.techpowerup.com/344871/supermicro-announces-support-for-upcoming-nvidia-vera-rubin-nvl72-and-hgx-rubin-nvl8-platforms", note: "Super Micro Computer AI server partnership, Jan 2026." },
      { id: "accio-supplier", title: "NVIDIA Supplier List 2025", url: "https://www.accio.com/supplier/nvidia-supplier-list", note: "Amkor Technology, Flex Ltd, Fabrinet listed as NVIDIA suppliers." },
    ],
  },
  AAPL: {
    theme: "consumer_hardware",
    category: "Consumer Electronics Ecosystem (Source-backed)",
    sourceByTier: { company: "aapl-10k", "-2": "apple-supplier-list", "-1": "aapl-10k", "1": "aapl-10k", "2": "aapl-10k" },
    sourceByName: {
      "Hon Hai Precision Industry (Foxconn)": "apple-supplier-list",
      "Taiwan Semiconductor Manufacturing Company (TSMC)": "apple-supplier-list",
      "Luxshare Precision Industry": "apple-supplier-list",
      "Corning": "apple-supplier-list",
      "Murata Manufacturing": "apple-supplier-list",
      "Samsung Display": "apple-supplier-list",
      "LG Electronics": "apple-supplier-list",
      "Sony": "apple-supplier-list",
      "SK Hynix": "apple-supplier-list",
      "Wistron": "apple-supplier-list",
      "Tata Electronics": "apple-india-briefing",
      "Applied Materials (US manufacturing ecosystem)": "apple-amp",
      "GlobalWafers (US silicon wafer ecosystem)": "apple-amp",
      "Apple Supplier Clean Energy Program": "apple-supplier-responsibility",
      "Apple Supplier Clean Water Program": "apple-supplier-responsibility",
    },
    upstream: [
      "Hon Hai Precision Industry (Foxconn)",
      "Taiwan Semiconductor Manufacturing Company (TSMC)",
      "Luxshare Precision Industry",
      "Corning",
      "Murata Manufacturing",
      "Samsung Display",
      "LG Electronics",
      "Sony",
      "SK Hynix",
      "Wistron",
      "Tata Electronics",
    ],
    services: [
      "Applied Materials (US manufacturing ecosystem)",
      "GlobalWafers (US silicon wafer ecosystem)",
      "Apple Supplier Clean Energy Program",
      "Apple Supplier Clean Water Program",
    ],
    channels: ["Apple Retail and Online Stores", "Carrier Distribution Partners", "Authorized Reseller Network", "Enterprise and Education Procurement"],
    demand: ["iPhone Upgrade Cycle Demand", "Services Subscription Demand", "Mac and iPad Refresh Demand"],
    sources: [
      { id: "aapl-10k", title: "Apple FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/0000320193/000032019325000079/aapl-20250927.htm", note: "Business segment, channel, and demand disclosures." },
      { id: "apple-supplier-list", title: "Apple 2025 Supplier List", url: "https://www.apple.com/supplier-responsibility/pdf/Apple-Supplier-List.pdf", note: "Named companies in Apple's global supplier footprint including Samsung Display, LG, Sony, SK Hynix, Wistron." },
      { id: "apple-india-briefing", title: "Apple manufacturing in India - India Briefing", url: "https://www.india-briefing.com/news/apple-contract-manufacturing-india-new-suppliers-getting-clearance-26947.html/", note: "Tata Electronics and Wistron manufacturing operations in India, July 2025." },
      { id: "apple-supplier-responsibility", title: "Apple supply chain and supplier responsibility", url: "https://www.apple.com/supplier-responsibility", note: "Supplier governance, compliance, and global supply-chain operating model context." },
      { id: "apple-amp", title: "Apple commits $100B to American manufacturing and supply-chain ecosystem", url: "https://www.apple.com/newsroom/2025/08/apple-commits-100-billion-dollars-to-american-manufacturing/", note: "Names strategic US supply-chain ecosystem partners including Applied Materials and GlobalWafers." },
    ],
  },
  GOOG: {
    theme: "platform_ads",
    category: "Search + Cloud Platform (Source-backed)",
    sourceByTier: { company: "goog-10k", "-2": "goog-10k", "-1": "goog-10k", "1": "goog-marketplace", "2": "goog-10k" },
    sourceByName: {
      "NVIDIA (Google Cloud AI Infrastructure)": "goog-nvidia",
      "AMD (Google Cloud Compute Infrastructure)": "goog-amd",
      "Kairos Power (Advanced Nuclear Deployment)": "goog-datacenters-energy",
      "Fervo Energy (Enhanced Geothermal Power)": "goog-datacenters-energy",
      "Baseload Capital (Geothermal Infrastructure)": "goog-datacenters-energy",
      "Google Supplier Code of Conduct Program": "goog-supplier-code",
      "Google Cloud Marketplace": "goog-marketplace",
      "Google Cloud Partner Ecosystem": "goog-marketplace",
    },
    upstream: [
      "NVIDIA (Google Cloud AI Infrastructure)",
      "AMD (Google Cloud Compute Infrastructure)",
      "Kairos Power (Advanced Nuclear Deployment)",
      "Fervo Energy (Enhanced Geothermal Power)",
      "Baseload Capital (Geothermal Infrastructure)",
    ],
    services: ["Google Supplier Code of Conduct Program", "Data Center Energy Procurement and PPAs", "Cybersecurity and Compliance Tooling", "Treasury, Billing, and Payment Operations"],
    channels: ["Google Cloud Marketplace", "Google Cloud Partner Ecosystem", "Google Workspace and API Ecosystem", "Global Advertiser and Enterprise Channels"],
    demand: ["Search and Advertising Demand", "Google Cloud Infrastructure Demand", "Generative AI Platform Demand"],
    sources: [
      { id: "goog-10k", title: "Alphabet FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm", note: "Supplier model, technical infrastructure, and demand disclosures." },
      { id: "goog-supplier-code", title: "Google Supplier Code of Conduct", url: "https://about.google/intl/zh-Hant-TW/supplier-code-of-conduct/", note: "Supplier and sub-tier governance structure." },
      { id: "goog-marketplace", title: "Google Cloud Marketplace", url: "https://cloud.google.com/marketplace", note: "Downstream partner channel and enterprise go-to-market route." },
      { id: "goog-nvidia", title: "NVIDIA and Google Cloud partnership", url: "https://cloud.google.com/nvidia", note: "Named compute ecosystem relationship in Google Cloud channels." },
      { id: "goog-amd", title: "Google Cloud AMD GPU infrastructure documentation", url: "https://cloud.google.com/compute/docs/gpus/amd-gpus", note: "Google Cloud infrastructure support for AMD GPU compute capacity." },
      { id: "goog-datacenters-energy", title: "Google data centers and energy", url: "https://cloud.google.com/transform/google-data-centers-energy", note: "Names power and infrastructure partners, including Kairos Power, Fervo Energy, and Baseload Capital." },
    ],
  },
  MSFT: {
    theme: "platform_cloud",
    category: "Cloud + Enterprise Software Platform (Source-backed)",
    sourceByTier: { company: "msft-10k", "-2": "msft-10k", "-1": "msft-10k", "1": "msft-10k", "2": "msft-10k" },
    sourceByName: {
      "NVIDIA AI Accelerators for Azure": "msft-nvidia",
      "AMD Instinct MI300X Accelerators for Azure": "msft-amd",
      "Anthropic AI Model Partnership on Azure": "msft-anthropic",
      "OpenAI": "reuters-dec2025",
      "Jacobs": "barrons-sep2025",
      "Schneider Electric": "barrons-sep2025",
      "Vertiv": "barrons-sep2025",
      "GE Vernova": "barrons-sep2025",
      "Siemens Energy": "barrons-sep2025",
      "Azure AI Customers": "msft-10k",
      "Enterprise Cloud": "msft-10k",
    },
    upstream: [
      "Azure AI Customers",
      "Enterprise Cloud",
      "NVIDIA AI Accelerators for Azure",
      "AMD Instinct MI300X Accelerators for Azure",
      "OpenAI",
      "Jacobs",
      "Schneider Electric",
      "Vertiv",
      "GE Vernova",
      "Siemens Energy",
      "Third-Party Contract Manufacturers",
    ],
    services: ["Global Data Center Operations", "Cybersecurity and Compliance Providers", "Treasury and Procurement Operations", "Cloud Infrastructure Services Partners"],
    channels: ["Anthropic AI Model Partnership on Azure", "OpenAI Partnership", "Azure Enterprise Contracts", "ISV and Developer Ecosystem", "Public Sector and Regulated Industry Sales"],
    demand: ["Microsoft Cloud Demand", "AI Capacity Demand", "Productivity and Collaboration Demand"],
    sources: [
      { id: "msft-10k", title: "Microsoft FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/0000789019/000095017025100235/msft-20250630.htm", note: "Explicit disclosures on datacenter, GPU, and supplier constraints. 60,000+ Azure AI customers." },
      { id: "msft-nvidia", title: "Microsoft and NVIDIA collaboration announcement", url: "https://news.microsoft.com/2024/03/18/microsoft-announces-collaboration-with-nvidia-to-accelerate-healthcare-and-life-sciences-innovation-with-advanced-cloud-ai-and-accelerated-computing-capabilities/", note: "Named downstream cloud AI channel with NVIDIA platform integration." },
      { id: "msft-amd", title: "Microsoft Azure ND MI300X v5 announcement", url: "https://azure.microsoft.com/en-us/blog/azure-nd-mi300x-v5-now-available-for-azure-ai-workloads-and-fine-tuning/", note: "Named AMD accelerator supply for Azure AI infrastructure." },
      { id: "msft-anthropic", title: "Microsoft, NVIDIA and Anthropic engineering partnership", url: "https://news.microsoft.com/source/features/ai/microsoft-nvidia-anthropic-ai/", note: "Named downstream AI model and deployment partnership on Microsoft cloud." },
      { id: "reuters-dec2025", title: "From OpenAI to Nvidia, firms channel billions into AI infrastructure", url: "https://www.reuters.com/business/autos-transportation/companies-pouring-billions-advance-ai-infrastructure-2025-10-06/", note: "NVIDIA investing up to $100B in OpenAI data center buildout, Microsoft partnership." },
      { id: "barrons-sep2025", title: "Nvidia Is in the Data Center Business - 5 Companies That Will Benefit", url: "https://www.barrons.com/articles/nvidia-data-center-five-companies-735d95bd", note: "Jacobs, Schneider Electric, Vertiv, GE Vernova, Siemens Energy are NVIDIA data center design partners for Microsoft Azure." },
      { id: "msft-sec-index", title: "Microsoft SEC filing index for FY2025 10-K", url: "https://www.sec.gov/Archives/edgar/data/789019/0000950170-25-100235/0000950170-25-100235-index.html", note: "Primary filing index source for report context and period." },
    ],
  },
  AMZN: {
    theme: "commerce_cloud",
    category: "Commerce + Cloud Infrastructure Platform (Source-backed)",
    sourceByTier: { company: "amzn-10k", "-2": "amzn-10k", "-1": "amzn-10k", "1": "amzn-10k", "2": "amzn-10k" },
    sourceByName: {
      "NVIDIA-Accelerated Compute Infrastructure (AWS)": "aws-nvidia-about",
      "Air Transport Services Group (ATSG) Amazon Air Lift": "atsg-amazon-air",
      "Third-Party Sellers and Vendors": "amzn-10k",
      "Amazon Marketplace": "amzn-10k",
      "AWS Cloud Services": "amzn-10k",
    },
    upstream: [
      "Third-Party Sellers",
      "AWS Cloud Services",
      "NVIDIA-Accelerated Compute Infrastructure (AWS)",
      "Air Transport Services Group (ATSG) Amazon Air Lift",
      "Contract Manufacturers for Devices",
    ],
    services: ["Amazon Logistics Network", "Payment and Fraud Infrastructure", "Cloud Security and Compliance Services", "Global Procurement and Treasury Operations"],
    channels: ["Amazon Marketplace", "Prime Ecosystem", "AWS Enterprise Contracts", "Physical Retail and Omnichannel Delivery"],
    demand: ["E-commerce Demand", "AWS Compute Demand", "Advertising and Subscription Demand"],
    sources: [
      { id: "amzn-10k", title: "Amazon FY2024 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/1018724/000101872425000004/amzn-20241231.htm", note: "Segment structure, vendor ecosystem, and demand disclosures. Third-party sellers 61% of units." },
      { id: "aws-nvidia-about", title: "AWS and NVIDIA strategic collaboration for generative AI", url: "https://www.aboutamazon.com/news/aws/aws-nvidia-strategic-collaboration-generative-ai", note: "Named AWS compute infrastructure relationship with NVIDIA." },
      { id: "atsg-amazon-air", title: "ATSG extends Amazon Air network support", url: "https://www.atsginc.com/news/air-transport-services-group-provides-update-on-amazon-air-network-support-extension/", note: "Named air-cargo logistics supplier relationship supporting Amazon Air operations." },
    ],
  },
  TSM: {
    theme: "foundry",
    category: "Advanced Foundry Manufacturing (Source-backed)",
    sourceByTier: { company: "tsm-annual", "-2": "tsm-supply-forum", "-1": "tsm-supply-forum", "1": "tsm-annual", "2": "tsm-annual" },
    sourceByName: {
      ASML: "tsm-asml",
      "Applied Materials": "tsm-amat",
      "ASM International": "tsm-supply-forum",
      Linde: "tsm-supply-forum",
      GlobalWafers: "tsm-supply-forum",
      "TSMC Supply Chain Management Forum": "tsm-supply-forum",
    },
    upstream: ["ASML", "Applied Materials", "ASM International", "Linde", "GlobalWafers"],
    services: ["TSMC Supply Chain Management Forum", "Fab Construction and Safety Partners", "Advanced Manufacturing Logistics", "Risk and Compliance Management"],
    channels: ["NVIDIA Programs", "Apple Silicon Programs", "AMD Programs", "Broadcom ASIC Programs"],
    demand: ["Advanced Node Demand", "AI Accelerator Demand", "Smartphone SoC Demand"],
    sources: [
      { id: "tsm-annual", title: "TSMC 2024 Annual Report", url: "https://investor.tsmc.com/static/annualReports/2024/english/index.html", note: "Customer, capacity, and demand disclosures." },
      { id: "tsm-supply-forum", title: "TSMC 2025 Supply Chain Management Forum", url: "https://pr.tsmc.com/system/files/newspdf/attachment/083b1ab2191856b8e0f31b46a40dcadafc595e8e/2025%20Supply%20Chain%20Management%20Forum%20Press%20Release%20%28E%29_final_wmn.pdf", note: "Named supplier ecosystem and supply-chain excellence awards." },
      { id: "tsm-amat", title: "Applied Materials wins TSMC Excellent Performance Award", url: "https://ir.appliedmaterials.com/news-releases/news-details/2024/Applied-Materials-Selected-as-a-TSMC-Excellent-Performance-Award-Winner-for-the-14th-Consecutive-Year/default.aspx", note: "Named upstream equipment supplier relationship with TSMC." },
      { id: "tsm-asml", title: "NVIDIA, TSMC, ASML and Synopsys computational lithography production", url: "https://investor.nvidia.com/news/press-release-details/2024/TSMC-and-Synopsys-Bring-Breakthrough-NVIDIA-Computational-Lithography-Platform-to-Production/default.aspx", note: "Named advanced manufacturing collaboration including TSMC and ASML." },
      { id: "tsm-tcia", title: "TSMC Taiwan Continuous Improvement Awards", url: "https://www.tsmc.com/english/event/CSD_37", note: "Supplier quality and local supply-chain participation context." },
    ],
  },
  META: {
    theme: "platform_ads",
    category: "Digital Platform + AI Infrastructure (Source-backed)",
    sourceByTier: { company: "meta-10k", "-2": "meta-10k", "-1": "meta-10k", "1": "meta-reliance", "2": "meta-10k" },
    sourceByName: {
      "Corning Incorporated": "meta-corning",
      "Constellation Energy (Nuclear Power Partner)": "meta-constellation",
      "Enterprise Llama Partnerships": "meta-reliance",
    },
    upstream: ["Corning Incorporated", "NVIDIA AI Compute Infrastructure", "Server and Networking Hardware Suppliers", "Data Center Construction and Connectivity Inputs"],
    services: ["Constellation Energy (Nuclear Power Partner)", "Long-term Clean Energy Partners", "Cybersecurity and Compliance Programs", "Infrastructure Operations and Facilities Management"],
    channels: ["Facebook and Instagram Advertiser Ecosystem", "WhatsApp Business Channels", "Enterprise Llama Partnerships", "Creator and Commerce Platform Channels"],
    demand: ["Digital Advertising Demand", "AI Infrastructure Demand", "Messaging and Creator Economy Demand"],
    sources: [
      { id: "meta-10k", title: "Meta FY2025 Form 10-K filing index", url: "https://www.sec.gov/Archives/edgar/data/1326801/000162828026003942/0001628280-26-003942-index.htm", note: "Primary annual filing for risk, infrastructure, and demand disclosures." },
      { id: "meta-corning", title: "Meta multi-year Corning agreement", url: "https://about.fb.com/news/2026/01/meta-6-billion-agreement-corning-support-us-manufacturing/", note: "Named upstream fiber supplier agreement for data center infrastructure." },
      { id: "meta-energy", title: "Meta nuclear energy projects announcement", url: "https://about.fb.com/news/2026/01/meta-nuclear-energy-projects-power-american-ai-leadership/", note: "Energy infrastructure services underpinning data center operations." },
      { id: "meta-constellation", title: "Constellation and Meta sign 20-year power purchase agreement", url: "https://www.prnewswire.com/news-releases/constellation-and-meta-sign-20-year-power-purchase-agreement-for-clean-energy-from-clinton-clean-energy-center-302472635.html", note: "Named power procurement relationship supporting Meta data-center operations." },
      { id: "meta-reliance", title: "Meta strategic JV intent with Reliance", url: "https://about.fb.com/news/2025/08/accelerating-indias-ai-adoption-a-strategic-partnership-with-reliance-industries-to-build-llama-based-enterprise-ai-solutions/", note: "Named enterprise AI distribution and downstream channel partnership." },
    ],
  },
  "2222.SR": {
    theme: "energy",
    category: "Integrated Energy + Localization Network (Source-backed)",
    sourceByTier: { company: "aramco-results", "-2": "aramco-us-suppliers", "-1": "aramco-iktva", "1": "aramco-us-mous", "2": "aramco-results" },
    upstream: ["Crude Oil Production", "Natural Gas Operations", "SLB", "Halliburton", "Baker Hughes"],
    services: ["iktva Localization Program", "J.P. Morgan Cash Management", "Asset Management and Capital Services", "Engineering and Technical Services Partners"],
    channels: ["Refining and Petrochemical Offtake", "LNG and Gas Commercial Agreements", "Industrial and Utility Buyers", "Global Chemicals Distribution"],
    demand: ["Global Hydrocarbon Demand", "Petrochemical Demand", "Industrial Energy Demand"],
    sources: [
      { id: "aramco-results", title: "Aramco full-year 2024 results", url: "https://www.aramco.com/en/news-media/news/2025/aramco-announces-full-year-2024-results", note: "Operational and demand baseline for the business system." },
      { id: "aramco-us-suppliers", title: "Aramco 2025 US supplier agreements", url: "https://www.aramco.com/en/news-media/news/2025/aramco-announces-17-mous-and-agreements-with-companies-in-us", note: "Named strategic suppliers and procurement relationships." },
      { id: "aramco-us-mous", title: "Aramco 2025 US MoUs and agreements", url: "https://www.aramco.com/en/news-media/news/2025/aramco-announces-34-mous-and-agreements-with-us-companies", note: "Downstream collaboration and channel expansion context." },
      { id: "aramco-iktva", title: "Aramco iktva 2025 forum agreements", url: "https://www.aramco.com/en/news-media/news/2025/aramco-signs-145-agreements-and-mous", note: "Localization and services backbone across the supply chain." },
    ],
  },
  AVGO: {
    theme: "chip_network",
    category: "Networking Silicon + Infrastructure Software (Source-backed)",
    sourceByTier: { company: "avgo-annual", "-2": "avgo-tsmc", "-1": "avgo-annual", "1": "avgo-vcf", "2": "avgo-annual" },
    sourceByName: {
      "Taiwan Semiconductor Manufacturing Company (TSMC)": "avgo-tsmc",
      "VMware Cloud Foundation Ecosystem Partners": "avgo-vcf",
      "Telco Cloud Service Providers": "avgo-telia",
    },
    upstream: ["Taiwan Semiconductor Manufacturing Company (TSMC)", "Co-Packaged Optics Components", "Advanced Substrate and Interconnect Suppliers", "HBM and Packaging Ecosystem Inputs", "Hyperscale Networking Hardware Inputs"],
    services: ["Data Center Integration Services", "Cybersecurity and Compliance Programs", "Global Treasury and Risk Management", "Software and Platform Support Services"],
    channels: ["VMware Cloud Foundation Ecosystem Partners", "Telco Cloud Service Providers", "Enterprise Networking OEMs", "Public Cloud Infrastructure Partners"],
    demand: ["AI Networking Demand", "Private Cloud Modernization Demand", "Hyperscaler ASIC Demand"],
    sources: [
      { id: "avgo-annual", title: "Broadcom annual reports", url: "https://investors.broadcom.com/financial-information/annual-reports", note: "Core reporting source for platform and demand model context." },
      { id: "avgo-tsmc", title: "Broadcom Tomahawk 6 announcement with TSMC COUPE", url: "https://investors.broadcom.com/news-releases/news-release-details/broadcom-announces-tomahawkr-6-davisson-industrys-first-1024", note: "Named upstream TSMC technology relationship." },
      { id: "avgo-vcf", title: "Broadcom VCF open ecosystem announcement", url: "https://news.broadcom.com/releases/vcf-open-ecosystem/cloud-network-bigdata-security-system-concept", note: "Named downstream private-cloud channel ecosystem." },
      { id: "avgo-telia", title: "Broadcom and Telia expanded partnership", url: "https://news.broadcom.com/releases/broadcom-telia-partnership", note: "Named service-provider channel relationship." },
    ],
  },
  TSLA: {
    theme: "automotive_ev",
    category: "EV + Energy Platform (Source-backed)",
    sourceByTier: { company: "tsla-10k", "-2": "tsla-10k", "-1": "tsla-10k", "1": "tsla-10k", "2": "tsla-10k" },
    sourceByName: {
      "Panasonic": "tsla-10k",
      "Contemporary Amperex Technology Co. Limited (CATL)": "tsla-10k",
      "LG Energy Solution": "sne-research-2025",
      "BYD": "sne-research-2025",
    },
    upstream: [
      "Panasonic",
      "Contemporary Amperex Technology Co. Limited (CATL)",
      "LG Energy Solution",
      "BYD",
      "Automotive Semiconductor Suppliers",
      "Battery Materials and Cathode Inputs",
      "Power Electronics Component Suppliers",
    ],
    services: ["Global Vehicle and Parts Logistics", "Manufacturing Site Operations Network", "Commodity and Energy Risk Management", "Commercial Insurance and Liability Coverage"],
    channels: ["Direct Vehicle Sales", "Tesla Energy Storage Customers", "Supercharger and Service Network", "Fleet and Robotaxi Programs"],
    demand: ["EV Demand", "Energy Storage Demand", "Autonomy and AI Compute Demand"],
    sources: [
      { id: "tsla-10k", title: "Tesla FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/0001318605/000162828026003952/tsla-20251231.htm", note: "Supply-chain risk, production, and demand disclosures." },
      { id: "tsla-panasonic", title: "Panasonic battery manufacturing company at Tesla Gigafactory", url: "https://news.panasonic.com/global/press/en141003-5", note: "Named Panasonic-Tesla battery manufacturing relationship." },
      { id: "sne-research-2025", title: "SNE Research Global EV Battery Usage Oct 2025", url: "https://www.sneresearch.com/en/insight/release_view/548/page/12?s_cat=%7C&s_keyword=", note: "Panasonic, LG Energy Solution, CATL, BYD all supply Tesla batteries." },
    ],
  },
  "BRK-B": {
    theme: "holding_finance",
    category: "Diversified Holding + Insurance (Source-backed)",
    sourceByTier: { company: "brk-annual", "-2": "brk-annual", "-1": "brk-annual", "1": "brk-subs", "2": "brk-annual" },
    sourceByName: {
      "BNSF Railway": "brk-subs",
      "Berkshire Hathaway Energy": "brk-subs",
      GEICO: "brk-subs",
    },
    upstream: ["BNSF Railway", "Berkshire Hathaway Energy", "GEICO", "Manufacturing Subsidiary Supplier Base", "Capital Markets and Treasury Holdings"],
    services: ["Property and Catastrophe Risk Transfer", "Rail and Energy Infrastructure Services", "Centralized Treasury and Cash Management", "Compliance, Audit, and Risk Operations"],
    channels: ["Insurance Policyholder Channels", "BNSF Freight Customers", "Utility and Energy Customers", "Consumer Brands and Retail Subsidiaries"],
    demand: ["Insurance Demand Cycles", "Freight and Logistics Demand", "U.S. Energy and Utilities Demand"],
    sources: [
      { id: "brk-annual", title: "Berkshire Hathaway 2024 Annual Report", url: "https://berkshirehathaway.com/2024ar/2024ar.pdf", note: "Primary company disclosure covering operating segments and risk structure." },
      { id: "brk-subs", title: "Berkshire Hathaway subsidiaries", url: "https://www.berkshirehathaway.com/subs/sublinks.html", note: "Operating-company channel and business structure context." },
      { id: "brk-release", title: "Berkshire 2024 annual report release", url: "https://www.businesswire.com/news/home/20250218829862/en/Berkshire-Hathaway-Inc.-News-Release", note: "Confirms annual report publication timing and scope." },
    ],
  },
  WMT: {
    theme: "retail",
    category: "Omnichannel Retail Platform (Source-backed)",
    sourceByTier: { company: "wmt-10k", "-2": "wmt-10k", "-1": "wmt-10k", "1": "wmt-annual-report", "2": "wmt-10k" },
    sourceByName: {
      "PepsiCo": "kantar-poweranking-2025",
      "Procter & Gamble": "kantar-poweranking-2025",
      "Coca-Cola": "kantar-poweranking-2025",
      "Nestlé": "kantar-poweranking-2025",
      "Unilever": "kantar-poweranking-2025",
      "The Clorox Company": "clx-10k-wmt",
      "The Kraft Heinz Company": "khc-10k-wmt",
      "Kimberly-Clark Corporation": "kmb-10k-wmt",
      "Church & Dwight Co., Inc.": "chd-10k-wmt",
      "Symbotic Warehouse Automation Partnership": "wmt-symbotic",
      "Walmart Transportation and Fulfillment Network": "wmt-10k",
    },
    upstream: [
      "PepsiCo",
      "Procter & Gamble",
      "Coca-Cola",
      "Nestlé",
      "Unilever",
      "The Clorox Company",
      "The Kraft Heinz Company",
      "Kimberly-Clark Corporation",
      "Church & Dwight Co., Inc.",
      "Private Brand and Imported Goods Supplier Base",
    ],
    services: ["Walmart Transportation and Fulfillment Network", "Symbotic Warehouse Automation Partnership", "Supplier Requirements and Compliance Program", "Payments and Financial Services Rails"],
    channels: ["Supercenter and Club Store Network", "Walmart.com Marketplace", "Omnichannel Pickup and Delivery", "Third-Party Seller Ecosystem"],
    demand: ["U.S. Household Consumption Demand", "Membership and Loyalty Demand", "E-commerce and Last-Mile Demand"],
    sources: [
      { id: "wmt-10k", title: "Walmart FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/104169/000010416925000021/wmt-20250131.htm", note: "Annual filing with risk factors, supplier model, and channel disclosures." },
      { id: "wmt-suppliers", title: "Walmart suppliers portal", url: "https://corporate.walmart.com/suppliers", note: "Supplier onboarding, requirements, and supplier ecosystem structure." },
      { id: "wmt-annual-report", title: "Walmart 2025 annual report release", url: "https://corporate.walmart.com/news/2025/04/24/walmart-releases-2025-annual-report-and-proxy-statement", note: "Company annual report and operating highlights for channel demand context." },
      { id: "kantar-poweranking-2025", title: "Kantar PowerRanking 2025 - Top CPG Manufacturers", url: "https://www.kantar.com/north-america/company-news/poweranking-2025", note: "PepsiCo #1, P&G #2, Coca-Cola #3, Nestlé #4, Unilever #5 top suppliers to Walmart." },
      { id: "clx-10k-wmt", title: "The Clorox Company FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/21076/000002107625000022/clx-20250630.htm", note: "Discloses Walmart Inc. and affiliates as a major customer concentration." },
      { id: "khc-10k-wmt", title: "The Kraft Heinz Company FY2024 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/1637459/000163745925000011/khc-20241228.htm", note: "Discloses Walmart Inc. as a significant customer concentration." },
      { id: "kmb-10k-wmt", title: "Kimberly-Clark FY2024 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/55785/000005578525000013/kmb-20241231.htm", note: "Discloses Walmart as the largest customer by net sales concentration." },
      { id: "chd-10k-wmt", title: "Church & Dwight FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/313927/000031392725000007/chd-20250630.htm", note: "Discloses Walmart as the largest customer concentration." },
      { id: "wmt-symbotic", title: "Walmart and Symbotic expand partnership", url: "https://corporate.walmart.com/news/2024/01/18/walmart-and-symbotic-expand-partnership-to-transform-supply-chain-and-shopping", note: "Names Symbotic as a strategic automation partner in Walmart supply-chain operations." },
    ],
  },
  LLY: {
    theme: "pharma",
    category: "Biopharma Innovation Pipeline (Source-backed)",
    sourceByTier: { company: "lly-10k", "-2": "lly-10k", "-1": "lly-annual", "1": "lly-results", "2": "lly-results" },
    sourceByName: {
      "McKesson Corporation": "lly-10k",
      "Cencora, Inc.": "lly-10k",
      "Cardinal Health, Inc.": "lly-10k",
    },
    upstream: ["McKesson Corporation", "Cencora, Inc.", "Cardinal Health, Inc.", "API and Biologics Manufacturing Inputs", "Specialty Packaging and Cold-Chain Inputs"],
    services: ["Clinical Trial Operations and CRO Services", "Cold-Chain Distribution Network", "Treasury and FX Risk Management", "Regulatory and Pharmacovigilance Services"],
    channels: ["Hospital and Specialist Prescriber Channels", "Retail and Specialty Pharmacy Channels", "Payer and Formulary Access Channels", "Global Distribution Partners"],
    demand: ["Obesity and Diabetes Therapy Demand", "Oncology and Immunology Demand", "Global Specialty Medicine Demand"],
    sources: [
      { id: "lly-10k", title: "Eli Lilly 2024 Form 10-K (SEC)", url: "https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/59478/000005947825000067/lly-20241231.htm", note: "Filing discloses concentrated U.S. wholesale distribution through McKesson, Cencora, and Cardinal Health." },
      { id: "lly-annual", title: "Eli Lilly annual reports", url: "https://investor.lilly.com/financial-information/annual-reports", note: "Annual operating context and portfolio disclosures." },
      { id: "lly-results", title: "Eli Lilly Q2 2025 results", url: "https://investor.lilly.com/news-releases/news-release-details/lilly-reports-second-quarter-2025-financial-results-and-raises", note: "Recent demand and portfolio momentum signals." },
    ],
  },
  "005930.KS": {
    theme: "consumer_hardware",
    category: "Consumer Electronics + Components (Source-backed)",
    sourceByTier: { company: "ssg-sustain-report", "-2": "ssg-supply-chain", "-1": "ssg-supply-chain", "1": "ssg-sustain-report", "2": "ssg-sustain-report" },
    sourceByName: {
      "Corning Incorporated": "ssg-corning",
      Qualcomm: "qcom-samsung",
    },
    upstream: ["Corning Incorporated", "Qualcomm", "Semiconductor and Display Component Inputs", "Battery and Critical Mineral Inputs", "Camera and Sensor Module Suppliers"],
    services: ["Sustainable Supply Chain Governance", "Circular Battery Material Programs", "Global Logistics and Distribution Services", "Commercial Compliance and Quality Assurance"],
    channels: ["Mobile Carrier and Retail Distribution", "Online Direct-to-Consumer Channels", "Enterprise Device Sales", "Appliance and Consumer Electronics Retail Channels"],
    demand: ["Smartphone Upgrade Demand", "Consumer Electronics Replacement Demand", "AI Device and Memory Demand"],
    sources: [
      { id: "ssg-sustain-report", title: "Samsung Electronics 2025 sustainability report release", url: "https://news.samsung.com/us/samsung-releases-2025-sustainability-report/", note: "Company sustainability and operations update." },
      { id: "ssg-supply-chain", title: "Samsung sustainable supply chain", url: "https://www.samsung.com/us/sustainability/sustainable-supply-chain/", note: "Supplier governance and supply-chain management framework." },
      { id: "ssg-circular-battery", title: "Samsung circular battery supply chain update", url: "https://www.samsungmobilepress.com/feature-stories/samsung-reuters-sustainability-award-circular-battery-galaxy-s25/", note: "Material recovery and battery supply-chain initiative context." },
      { id: "ssg-corning", title: "Samsung and Corning long-term display glass agreement", url: "https://news.samsungdisplay.com/26553/", note: "Named strategic glass supply relationship with Corning Incorporated." },
      { id: "qcom-samsung", title: "Qualcomm and Samsung strategic partnership extension", url: "https://investor.qualcomm.com/news-events/press-releases/news-details/2022/Qualcomm-and-Samsung-Extend-and-Expand-Broad-Strategic-Partnership-07-27-2022/default.aspx", note: "Named long-term technology and chipset collaboration." },
    ],
  },
  JPM: {
    theme: "banking",
    category: "Global Universal Banking Platform (Source-backed)",
    sourceByTier: { company: "jpm-10k", "-2": "jpm-aws", "-1": "jpm-payments", "1": "jpm-coinbase", "2": "jpm-10k" },
    sourceByName: {
      "Amazon Web Services (AWS)": "jpm-aws",
      "Visa Direct": "visa-jpm-visa-direct",
      Coinbase: "jpm-coinbase",
    },
    upstream: ["Amazon Web Services (AWS)", "Core Banking and Risk Technology Vendors", "Market Data and Credit Data Providers", "Global Clearing and Custody Infrastructure"],
    services: ["J.P. Morgan Payments Platform", "Visa Direct", "Fraud, AML, and Compliance Operations", "Cybersecurity and Operational Resilience Programs"],
    channels: ["Retail and Commercial Banking Channels", "Corporate Treasury and Payments Channels", "Investment Banking Client Coverage", "Coinbase"],
    demand: ["Credit and Lending Demand", "Payments and Transaction Flow Demand", "Capital Markets and Treasury Demand"],
    sources: [
      { id: "jpm-10k", title: "JPMorgan Chase 2024 Form 10-K filing details", url: "https://jpmorganchaseco.gcs-web.com/sec-filings/sec-filing/10-k/0000019617-25-000270/", note: "Primary filing with segment and risk disclosures." },
      { id: "jpm-payments", title: "J.P. Morgan Payments", url: "https://www.jpmorgan.com/payments", note: "Payments platform capabilities and channel structure." },
      { id: "jpm-aws", title: "JPMorgan Chase Global CIO on strategic collaboration with AWS", url: "https://www.jpmorgan.com/technology/news/jpmc-global-cio-showcases-advancements-at-aws-re-invent", note: "JPMorgan discloses strategic cloud collaboration with Amazon Web Services." },
      { id: "visa-jpm-visa-direct", title: "Visa and J.P. Morgan Payments strategic collaboration via Visa Direct", url: "https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.20636.html", note: "Named payment-rail expansion between J.P. Morgan Payments and Visa Direct." },
      { id: "jpm-coinbase", title: "J.P. Morgan launches JPMD proof of concept on Base built within Coinbase", url: "https://www.jpmorgan.com/payments/newsroom/kinexys-usd-digital-deposit-tokens", note: "Named onchain institutional payments collaboration context with Coinbase ecosystem." },
      { id: "jpm-10k-release", title: "JPMorgan 2024 Form 10-K release", url: "https://www.businesswire.com/news/home/20250214788104/en/JPMorganChase-Files-Form-10-K-for-the-Fiscal-Year-Ended-December-31-2024", note: "Confirms filing and reporting period context." },
    ],
  },
  XOM: {
    theme: "energy",
    category: "Integrated Oil, Gas, and Emerging Lithium (Source-backed)",
    sourceByTier: { company: "xom-10k", "-2": "xom-10k", "-1": "xom-sec-filings", "1": "xom-lithium", "2": "xom-10k" },
    sourceByName: {
      QatarEnergy: "xom-qatarenergy",
      "CF Industries": "xom-cf-industries",
    },
    upstream: ["QatarEnergy", "Upstream Oil and Gas Service Companies", "Drilling and Production Equipment Suppliers", "Refining and Petrochemical Feedstock Inputs", "Lithium Project Inputs"],
    services: ["Global Shipping and Trading Services", "CF Industries", "Treasury and Commodity Risk Management", "Regulatory and Compliance Operations"],
    channels: ["Refining and Fuel Distribution Channels", "Industrial and Petrochemical Offtake", "LNG and Gas Commercial Agreements", "Battery Materials Offtake Agreements"],
    demand: ["Global Fuel Demand", "Industrial Energy Demand", "EV Battery Materials Demand"],
    sources: [
      { id: "xom-10k", title: "ExxonMobil FY2024 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/34088/000003408825000010/xom-20241231.htm", note: "Primary annual filing with operating and risk disclosures." },
      { id: "xom-sec-filings", title: "ExxonMobil SEC filings portal", url: "https://ir.exxonmobil.com/sec-filings/", note: "Company filing index for annual and quarterly reporting." },
      { id: "xom-qatarenergy", title: "ExxonMobil and QatarEnergy North Field East agreement", url: "https://corporate.exxonmobil.com/news/news-releases/2022/0621_exxonmobil-and-qatarenergy-to-expand-lng-production-with-north-field-east-agreement", note: "Named strategic LNG relationship with QatarEnergy." },
      { id: "xom-cf-industries", title: "ExxonMobil and CF Industries low-carbon partnership", url: "https://corporate.exxonmobil.com/what-we-do/delivering-industrial-solutions/cf-industries", note: "Named low-carbon and CCS relationship with CF Industries." },
      { id: "xom-lithium", title: "ExxonMobil and SK On lithium supply MOU", url: "https://corporate.exxonmobil.com/news/news-releases/2024/0625_exxonmobil-sk-lithium-supply-agreement", note: "Named downstream battery-materials offtake relationship." },
    ],
  },
  V: {
    theme: "payments",
    category: "Global Payments Network (Source-backed)",
    sourceByTier: { company: "visa-sec-filings", "-2": "visa-sec-filings", "-1": "visa-network-news", "1": "visa-ai-commerce", "2": "visa-network-news" },
    sourceByName: {
      "J.P. Morgan Payments": "visa-jpm-payments",
      Coinbase: "visa-coinbase",
      Fiserv: "visa-fiserv",
    },
    upstream: ["Issuer Bank Programs", "Acquirer and Processor Integrations", "J.P. Morgan Payments", "Tokenization and Identity Services"],
    services: ["Global Authorization and Settlement Infrastructure", "Risk and Fraud Management Services", "Commercial API and Embedded Payments Services", "Stablecoin and Multi-Rail Settlement Services"],
    channels: ["Merchant Acquirer Ecosystem", "Coinbase", "Fiserv", "Cross-border and B2B Payment Channels"],
    demand: ["Consumer Spend Volume", "E-commerce Checkout Demand", "B2B and Cross-border Payments Demand"],
    sources: [
      { id: "visa-sec-filings", title: "Visa SEC filings", url: "https://investor.visa.com/SEC-Filings", note: "Primary filing index for regulatory and annual reporting." },
      { id: "visa-network-news", title: "Visa FY2025 financial results release", url: "https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21731.html", note: "Company-reported network volume and demand context." },
      { id: "visa-jpm-payments", title: "Visa and J.P. Morgan Payments strategic collaboration via Visa Direct", url: "https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.20636.html", note: "Named partnership between Visa Direct and J.P. Morgan Payments." },
      { id: "visa-coinbase", title: "Coinbase to integrate Visa Direct", url: "https://investor.visa.com/news/news-details/2024/Coinbase-to-Integrate-Visa-Direct-to-Deliver-Real-Time-Account-Funding-for-Customers/default.aspx", note: "Named Visa network partnership with Coinbase." },
      { id: "visa-fiserv", title: "Fiserv collaborates with Visa to accelerate agentic commerce", url: "https://investors.fiserv.com/newsroom/detail/2881/fiserv-collaborates-with-visa-to-accelerate-agentic-commerce", note: "Named strategic collaboration between Fiserv and Visa." },
      { id: "visa-ai-commerce", title: "Visa intelligent commerce announcement", url: "https://investor.visa.com/news/news-details/2025/Find-and-Buy-with-AI-Visa-Unveils-New-Era-of-Commerce/default.aspx", note: "Named platform and partner channel expansion." },
    ],
  },
  TCEHY: {
    theme: "platform_ads",
    category: "Digital Platform + Cloud Ecosystem (Source-backed)",
    sourceByTier: { company: "tencent-financial-reports", "-2": "tencent-mercedes-ea", "-1": "tencent-esg", "1": "tencent-ewcf", "2": "tencent-financial-reports" },
    sourceByName: {
      "Mercedes-Benz": "tencent-mercedes-ea",
      "Electronic Arts (EA)": "tencent-mercedes-ea",
      "Esports World Cup Foundation": "tencent-ewcf",
    },
    upstream: ["Mercedes-Benz", "Electronic Arts (EA)", "Data Center and Server Infrastructure Inputs", "AI Compute and Networking Inputs"],
    services: ["Tencent ESG and Supply Chain Governance", "Cloud Security and Compliance Services", "Digital Payments and Treasury Services", "Platform Operations and Trust and Safety Services"],
    channels: ["Esports World Cup Foundation", "WeChat Ecosystem Businesses", "Tencent Cloud Enterprise Partners", "Gaming and Digital Content Channels"],
    demand: ["Digital Advertising Demand", "Cloud and Enterprise Transformation Demand", "Gaming and Social Engagement Demand"],
    sources: [
      { id: "tencent-financial-reports", title: "Tencent investor financial reports", url: "https://www.tencent.com/en-us/investors/financial-reports.html", note: "Primary annual and interim reporting source." },
      { id: "tencent-esg", title: "Tencent ESG reports", url: "https://www.tencent.com/en-us/esg/esg-reports.html", note: "Governance and supply-chain responsibility context." },
      { id: "tencent-mercedes-ea", title: "Tencent Games and EA announce Need for Speed Mobile with Mercedes-Benz", url: "https://www.tencent.com/en-us/articles/2201837.html", note: "Named strategic ecosystem partners Mercedes-Benz and Electronic Arts in Tencent game ecosystem." },
      { id: "tencent-ewcf", title: "Tencent and Esports World Cup Foundation collaboration", url: "https://www.tencent.com/en-us/articles/2202032.html", note: "Named distribution and ecosystem partnership with Esports World Cup Foundation." },
    ],
  },
  JNJ: {
    theme: "pharma",
    category: "Diversified Healthcare Platform (Source-backed)",
    sourceByTier: { company: "jnj-10k", "-2": "jnj-legend", "-1": "jnj-10k", "1": "jnj-shockwave", "2": "jnj-results" },
    sourceByName: {
      "Legend Biotech (CARVYKTI Collaboration)": "jnj-legend",
      "Shockwave Medical": "jnj-shockwave",
      Kenvue: "jnj-10k",
    },
    upstream: ["Legend Biotech (CARVYKTI Collaboration)", "Shockwave Medical", "Kenvue", "Medical Technology Component Suppliers", "Packaging and Sterile Manufacturing Inputs"],
    services: ["Responsible Supplier Program", "Global Quality and Regulatory Services", "Product Liability and Risk Management", "Treasury and Foreign Exchange Operations"],
    channels: ["Hospital and Health System Channels", "Retail and Specialty Pharmacy Channels", "Surgical and MedTech Distribution", "Government and Public Health Programs"],
    demand: ["Innovative Medicine Demand", "MedTech Procedure Demand", "Consumer Health and OTC Demand"],
    sources: [
      { id: "jnj-10k", title: "Johnson & Johnson 2024 Form 10-K filing details", url: "https://www.investor.jnj.com/financials/sec-filings/sec-filings-details/default.aspx?FilingId=18184494", note: "Primary annual filing details and disclosure access." },
      { id: "jnj-suppliers", title: "Johnson & Johnson suppliers", url: "https://www.jnj.com/suppliers", note: "Supplier governance and responsible sourcing framework." },
      { id: "jnj-results", title: "Johnson & Johnson Q4 and full-year 2024 results", url: "https://www.investor.jnj.com/investor-news/news-details/2025/Johnson--Johnson-Reports-Q4-and-Full-Year-2024-Results/default.aspx", note: "Demand and segment performance context." },
      { id: "jnj-legend", title: "Legend Biotech milestone under Johnson & Johnson collaboration", url: "https://investors.legendbiotech.com/news-releases/news-release-details/legend-biotech-achieves-milestone-under-collaboration-agreement", note: "Named biopharma collaboration relationship with Johnson & Johnson." },
      { id: "jnj-shockwave", title: "Johnson & Johnson completes acquisition of Shockwave Medical", url: "https://www.jnj.com/media-center/press-releases/johnson-johnson-completes-acquisition-of-shockwave-medical", note: "Named medtech integration relationship with Shockwave Medical." },
    ],
  },
  ASML: {
    theme: "semi_equipment",
    category: "Semiconductor Lithography Systems (Source-backed)",
    sourceByTier: { company: "asml-annual", "-2": "asml-supply-chain-story", "-1": "asml-responsible-supply", "1": "asml-highna-intel", "2": "asml-financial-results" },
    sourceByName: {
      "Carl Zeiss SMT (High-NA Optics Partner)": "asml-annual",
      "Intel Foundry (High-NA Early Adopter)": "asml-highna-intel",
      "imec High NA EUV Lab": "asml-imec-highna",
    },
    upstream: ["Carl Zeiss SMT (High-NA Optics Partner)", "TRUMPF Laser Systems", "Cymer Light Source Components", "Precision Motion and Vacuum Components", "Specialty Materials and Rare Gas Inputs"],
    services: ["imec High NA EUV Lab", "Responsible Supply Chain Program", "Sustainability and Emissions Collaboration", "Global Field Service and Installed Base Support"],
    channels: ["Intel Foundry (High-NA Early Adopter)", "Leading Foundry Customers", "Memory Manufacturer Customers", "Logic and IDM Customer Programs"],
    demand: ["Advanced Lithography Demand", "EUV and High-NA Adoption Demand", "Global Wafer Fab Equipment Demand"],
    sources: [
      { id: "asml-annual", title: "ASML annual reports", url: "https://www.asml.com/en/en/investors/annual-report", note: "Primary annual reporting for operations and demand context." },
      { id: "asml-financial-results", title: "ASML financial results", url: "https://www.asml.com/en/investors/financial-results", note: "Quarterly and annual performance and order trend context." },
      { id: "asml-responsible-supply", title: "ASML responsible supply chain", url: "https://www.asml.com/en/company/sustainability/responsible-supply-chain", note: "Supplier governance and value-chain emissions context." },
      { id: "asml-supply-chain-story", title: "ASML robust supply chain practices", url: "https://www.asml.com/news/stories/2023/6-ingredients-robust-supply-chain", note: "Supplier collaboration and resilience program context." },
      { id: "asml-highna-intel", title: "Intel and ASML strengthen collaboration for High-NA", url: "https://www.asml.com/en/en/news/press-releases/2022/intel-and-asml-strengthen-their-collaboration-to-drive-high-na-into-manufacturing-in-2025", note: "Named High-NA customer and co-development relationship with Intel Foundry." },
      { id: "asml-imec-highna", title: "ASML and imec open High-NA EUV lithography lab", url: "https://www.asml.com/en/news/press-releases/2024/asml-imec-opening-high-na-euv-lithography-lab", note: "Named R&D and ecosystem collaboration with imec." },
    ],
  },
  MU: {
    theme: "chip_ai",
    category: "Memory Semiconductors (Source-backed)",
    sourceByTier: { company: "mu-10k", "-2": "mu-nvidia", "-1": "mu-sustainability", "1": "mu-ir", "2": "mu-ir" },
    sourceByName: {
      "NVIDIA (HBM3E / SOCAMM Collaboration)": "mu-nvidia",
      "AMD Instinct MI350 Platform": "mu-amd-hbm",
      "Qualcomm Snapdragon 8 Gen 3": "mu-qualcomm",
    },
    upstream: ["NVIDIA (HBM3E / SOCAMM Collaboration)", "AMD Instinct MI350 Platform", "Qualcomm Snapdragon 8 Gen 3", "Advanced DRAM and HBM Packaging Inputs", "NAND Controller and Firmware Ecosystem"],
    services: ["Responsible Minerals and Supplier Audits", "Manufacturing Water and Energy Programs", "Global Semiconductor Logistics", "Treasury and Capex Financing Services"],
    channels: ["Hyperscale Cloud Memory Programs", "Enterprise Server and Storage OEMs", "PC and Mobile Memory Channels", "Automotive and Industrial Memory Channels"],
    demand: ["HBM and AI Accelerator Demand", "Data Center DRAM Demand", "Client and Mobile Memory Demand"],
    sources: [
      { id: "mu-10k", title: "Micron SEC filing (supply chain and risk factors)", url: "https://investors.micron.com/sec-filings/sec-filings-details/default.aspx?FilingId=18433492", note: "Describes supply chain concentration, procurement, and demand exposure." },
      { id: "mu-sustainability", title: "Micron sustainability and responsible supply chain", url: "https://www.micron.com/about/sustainability", note: "Discusses supplier responsibility and manufacturing ecosystem practices." },
      { id: "mu-ir", title: "Micron investor relations", url: "https://investors.micron.com/investor-relations", note: "Business model and market demand context for memory products." },
      { id: "mu-nvidia", title: "Micron and NVIDIA collaboration update", url: "https://investors.micron.com/news-releases/news-release-details/micron-innovates-data-center-edge-nvidia", note: "Named Micron memory collaboration with NVIDIA for AI and data-center workloads." },
      { id: "mu-amd-hbm", title: "Micron HBM announcement for AMD AI platform", url: "https://investors.micron.com/news-releases/news-release-details/micron-hbm-designed-leading-amd-ai-platform", note: "Named HBM relationship supporting AMD Instinct platform roadmap." },
      { id: "mu-qualcomm", title: "Micron collaboration with Qualcomm on edge AI", url: "https://investors.micron.com/news-releases/news-release-details/micron-collaborates-qualcomm-accelerate-generative-ai-edge", note: "Named mobile and edge AI memory collaboration with Qualcomm." },
    ],
  },
  MA: {
    theme: "payments",
    category: "Card Network (Source-backed)",
    sourceByTier: { company: "ma-sec", "-2": "ma-sec", "-1": "ma-annual", "1": "ma-business", "2": "ma-annual" },
    sourceByName: {
      "Citi WorldLink (Mastercard Move)": "ma-citi-worldlink",
      "PayPal (One Credential Partner)": "ma-paypal-one-credential",
      "The Clearing House RTP Network": "ma-tch-rtp",
    },
    upstream: ["Citi WorldLink (Mastercard Move)", "The Clearing House RTP Network", "Issuer Bank Programs", "Acquirer and Processor Partners", "Fraud and Identity Data Providers"],
    services: ["Cybersecurity and Fraud Services", "Regulatory Compliance and KYC/AML Programs", "Treasury and Network Risk Operations", "Global Authorization and Settlement Operations"],
    channels: ["Merchant Acceptance Network", "PayPal (One Credential Partner)", "Government and Transit Payment Programs", "B2B and Commercial Card Programs"],
    demand: ["Consumer Card Spend Demand", "E-commerce Checkout Demand", "Cross-border Travel and Commerce Demand"],
    sources: [
      { id: "ma-annual", title: "Mastercard annual reports", url: "https://investor.mastercard.com/financials-and-sec-filings/annual-reports/default.aspx", note: "Network economics and strategy disclosures." },
      { id: "ma-sec", title: "Mastercard SEC filings", url: "https://investor.mastercard.com/financials-and-sec-filings/sec-filings/default.aspx", note: "Risk disclosures covering issuer/acquirer, cyber, and regulatory dependencies." },
      { id: "ma-business", title: "Mastercard who we serve", url: "https://www.mastercard.com/us/en/business/overview/who-we-serve.html", note: "Describes issuer, acquirer, merchant, and partner ecosystem." },
      { id: "ma-citi-worldlink", title: "Citi and Mastercard cross-border payments partnership", url: "https://newsroom.mastercard.com/news/press/2024/october/citi-and-mastercard-join-forces-to-transform-global-cross-border-payments/", note: "Named Mastercard Move partnership with Citi WorldLink." },
      { id: "ma-paypal-one-credential", title: "Mastercard and PayPal One Credential partnership", url: "https://www.mastercard.com/news/press/2025/june/mastercard-and-paypal-to-partner-on-mastercard-one-credential-to-supercharge-choice-at-checkout/", note: "Named checkout and digital-wallet collaboration with PayPal." },
      { id: "ma-tch-rtp", title: "Mastercard and The Clearing House RTP partnership extension", url: "https://www.mastercard.com/us/en/news-and-trends/press/2024/January/mastercard-and-the-clearing-house-extend-partnership-on-real-time-payments.html", note: "Named U.S. real-time payments rail collaboration with The Clearing House." },
    ],
  },
  "000660.KS": {
    theme: "chip_ai",
    category: "Memory Semiconductors (Source-backed)",
    sourceByTier: { company: "skh-earnings", "-2": "skh-tsmc", "-1": "skh-earnings", "1": "skh-ai-ecosystem", "2": "skh-earnings" },
    sourceByName: {
      "TSMC (HBM4 and CoWoS Collaboration)": "skh-tsmc",
      "NVIDIA (HBM3 / HBM3E Programs)": "skh-nvidia",
      "SK Telecom (AI Data Center Collaboration)": "skh-ai-ecosystem",
    },
    upstream: ["TSMC (HBM4 and CoWoS Collaboration)", "NVIDIA (HBM3 / HBM3E Programs)", "HBM Process Inputs and Advanced Packaging Materials", "DRAM and NAND Equipment Suppliers", "Silicon Wafer and Specialty Chemical Inputs"],
    services: ["R&D and Product Qualification Services", "Global Memory Logistics and Distribution", "Supplier ESG and Audit Programs", "Treasury and Capacity Investment Support"],
    channels: ["SK Telecom (AI Data Center Collaboration)", "NVIDIA and AI Accelerator Memory Programs", "Hyperscaler Data Center Channels", "Enterprise Storage Channels"],
    demand: ["HBM AI Demand", "Server DRAM Demand", "Consumer Memory Demand"],
    sources: [
      { id: "skh-earnings", title: "SK Hynix 3Q 2025 results", url: "https://news.skhynix.com/sk-hynix-announces-financial-results-for-the-third-quarter-of-2025/", note: "Demand mix and customer segment signals for memory products." },
      { id: "skh-hbm4", title: "SK Hynix HBM4 samples announcement", url: "https://news.skhynix.com/sk-hynix-becomes-the-industrys-first-to-supply-hbm4-samples-advancing-ai-memory-leadership/", note: "Advanced memory product and AI demand positioning." },
      { id: "skh-tsmc", title: "SK Hynix and TSMC HBM4 collaboration", url: "https://news.skhynix.com/sk-hynix-partners-with-tsmc-to-strengthen-hbm-technological-leadership/", note: "Named upstream manufacturing collaboration with TSMC for HBM4 and advanced packaging." },
      { id: "skh-nvidia", title: "SK Hynix to supply HBM3 to NVIDIA", url: "https://news.skhynix.com/sk-hynix-to-supply-industrys-first-hbm3-dram-to-nvidia/", note: "Named AI memory supply relationship with NVIDIA." },
      { id: "skh-ai-ecosystem", title: "SK Hynix AI ecosystem collaboration update", url: "https://news.skhynix.com/exploring-the-ai-ecosystem-how-sk-hynixs-industry-leading-memory-fuels-ai-innovation/", note: "Named AI ecosystem relationships including collaboration with SK Telecom." },
    ],
  },
  COST: {
    theme: "retail",
    category: "Warehouse Retail (Source-backed)",
    sourceByTier: { company: "costco-results", "-2": "costco-vendors", "-1": "costco-vendors", "1": "costco-same-day", "2": "costco-results" },
    sourceByName: {
      "Instacart (Same-Day Delivery Partner)": "costco-same-day",
      "Citi (Costco Anywhere Visa Issuer)": "costco-citi-visa",
      "Visa Network (Costco Anywhere Card)": "costco-citi-visa",
    },
    upstream: ["Kirkland Private Label Manufacturing Partners", "Fresh Food and Grocery Supplier Base", "Instacart (Same-Day Delivery Partner)", "Citi (Costco Anywhere Visa Issuer)", "Visa Network (Costco Anywhere Card)"],
    services: ["Depot and Warehouse Distribution Logistics", "Supplier Onboarding and Compliance Programs", "Payments and Merchant Services Infrastructure", "Commercial Risk and Property Coverage"],
    channels: ["Warehouse Club Store Network", "Instacart (Same-Day Delivery Partner)", "Business Delivery and B2B Channels", "Membership Renewal and Loyalty Programs"],
    demand: ["Membership Fee and Renewal Demand", "Household Basket Demand", "Seasonal and Discretionary Demand"],
    sources: [
      { id: "costco-results", title: "Costco fiscal 2026 Q1 sales results", url: "https://investor.costco.com/news/news-details/2025/Costco-Wholesale-Corporation-Reports-First-Quarter-and-December-Sales-Results-for-Fiscal-Year-2026/default.aspx", note: "Operational throughput and consumer demand context." },
      { id: "costco-vendors", title: "Costco vendor inquiries", url: "https://www.costco.com/vendor-inquiries.html", note: "Supplier onboarding and vendor operating model context." },
      { id: "costco-diversity", title: "Costco supplier diversity", url: "https://www.costco.com/supplier-diversity.html", note: "Supplier ecosystem governance context." },
      { id: "costco-same-day", title: "Costco same-day delivery FAQ", url: "https://customerservice.costco.com/app/answers/answer_view/a_id/8155", note: "Costco support page naming Instacart same-day delivery service." },
      { id: "costco-citi-visa", title: "Costco Anywhere Visa Card by Citi support", url: "https://customerservice.costco.com/app/answers/answer_view/a_id/719", note: "Costco support page naming Citi issuer and Visa network for Costco co-brand card program." },
    ],
  },
  ORCL: {
    theme: "platform_cloud",
    category: "Enterprise Cloud Platform (Source-backed)",
    sourceByTier: { company: "orcl-sec", "-2": "orcl-nvidia", "-1": "orcl-10k", "1": "orcl-openai", "2": "orcl-sec" },
    sourceByName: {
      "NVIDIA (OCI AI Infrastructure)": "orcl-nvidia",
      "AMD Instinct GPU Platform": "orcl-amd",
      "OpenAI (Stargate Compute Partner)": "orcl-openai",
    },
    upstream: ["NVIDIA (OCI AI Infrastructure)", "AMD Instinct GPU Platform", "OpenAI (Stargate Compute Partner)", "Data Center Power and Cooling Infrastructure", "Global Colocation and Connectivity Inputs"],
    services: ["Cloud Security and Compliance Services", "Global Procurement and Treasury Operations", "Risk and Incident Management Programs", "Enterprise Support and Consulting Services"],
    channels: ["OCI Enterprise Contracts", "Oracle PartnerNetwork Channels", "SaaS Subscription Channels", "OpenAI (Stargate Compute Partner)"],
    demand: ["Database and ERP Modernization Demand", "AI Infrastructure Demand", "Mission-Critical Cloud Migration Demand"],
    sources: [
      { id: "orcl-sec", title: "Oracle SEC filings", url: "https://investor.oracle.com/financial-reporting/sec-filings", note: "Company-level operating and dependency disclosures." },
      { id: "orcl-10k", title: "Oracle FY2025 10-K", url: "https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/1341439/000134143925000041/orcl-20250531.htm", note: "Risk disclosures for suppliers, infrastructure, and customer concentration." },
      { id: "orcl-nvidia", title: "Oracle and NVIDIA sovereign AI announcement", url: "https://www.oracle.com/news/announcement/oracle-and-nvidia-to-deliver-sovereign-AI-worldwide-2024-03-18/", note: "Named platform supply and channel relationship with NVIDIA." },
      { id: "orcl-amd", title: "Oracle and AMD expand cloud partnership", url: "https://www.amd.com/en/newsroom/press-releases/oracle-and-amd-expand-partnership-to-help-customers-ach.html", note: "Named Oracle Cloud accelerated compute relationship with AMD Instinct." },
      { id: "orcl-openai", title: "Oracle Zettascale AI cluster announcement with OpenAI reference", url: "https://www.oracle.com/it/news/announcement/ai-world-oracle-unveils-next-generation-oci-zettascale10-cluster-for-ai-2025-10-14/", note: "Oracle announcement naming OpenAI alongside OCI large-scale AI infrastructure context." },
    ],
  },
  ABBV: {
    theme: "pharma",
    category: "Biopharma Pipeline (Source-backed)",
    sourceByTier: { company: "abbv-annual", "-2": "abbv-genmab", "-1": "abbv-annual", "1": "abbv-results", "2": "abbv-results" },
    sourceByName: {
      "Genmab (EPKINLY Collaboration)": "abbv-genmab",
      ImmunoGen: "abbv-immunogen",
      "Cerevel Therapeutics": "abbv-cerevel",
    },
    upstream: ["Genmab (EPKINLY Collaboration)", "ImmunoGen", "Cerevel Therapeutics", "External Manufacturing and Fill-Finish Partners", "Specialty Packaging and Cold-Chain Inputs"],
    services: ["Pharmacovigilance and Regulatory Services", "Global Quality and Supply Planning", "Commercial Risk and Liability Programs", "Treasury and FX Management"],
    channels: ["Specialty and Retail Pharmacy Channels", "Hospital and Infusion Center Channels", "Payer and Reimbursement Access Channels", "International Distribution Partners"],
    demand: ["Immunology Portfolio Demand", "Oncology and Neuroscience Demand", "Aesthetics and Specialty Care Demand"],
    sources: [
      { id: "abbv-annual", title: "AbbVie annual reports and proxy", url: "https://investors.abbvie.com/annual-reports-and-proxy/default.aspx", note: "Manufacturing, pipeline, and risk disclosures." },
      { id: "abbv-supplier", title: "AbbVie supplier diversity", url: "https://www.abbvie.com/our-company/supplier-diversity.html", note: "Supplier ecosystem and procurement governance context." },
      { id: "abbv-results", title: "AbbVie FY2025 results", url: "https://news.abbvie.com/2026-01-30-AbbVie-Reports-Full-Year-and-Fourth-Quarter-2025-Financial-Results", note: "Commercial demand and channel performance context." },
      { id: "abbv-genmab", title: "FDA approves EPKINLY developed by AbbVie and Genmab", url: "https://news.abbvie.com/2025-11-18-FDA-Approves-EPKINLY-R-epcoritamab-by-Epkinly-for-Subcutaneous-Injection-Co-Developed-by-Genmab-and-AbbVie-for-Adults-with-Relapsed-or-Refractory-Follicular-Lymphoma", note: "Named co-development relationship with Genmab." },
      { id: "abbv-immunogen", title: "AbbVie completes acquisition of ImmunoGen", url: "https://news.abbvie.com/2024-02-12-AbbVie-Completes-Acquisition-of-ImmunoGen", note: "Named oncology pipeline transaction with ImmunoGen." },
      { id: "abbv-cerevel", title: "AbbVie completes acquisition of Cerevel Therapeutics", url: "https://news.abbvie.com/2024-08-01-AbbVie-Completes-Acquisition-of-Cerevel-Therapeutics", note: "Named neuroscience pipeline transaction with Cerevel Therapeutics." },
    ],
  },
  BAC: {
    theme: "banking",
    category: "Universal Banking (Source-backed)",
    sourceByTier: { company: "bac-annual", "-2": "bac-rtp", "-1": "bac-filings", "1": "bac-zelle", "2": "swift-payments" },
    sourceByName: {
      "The Clearing House RTP Network": "bac-rtp",
      "Zelle Network": "bac-zelle",
      "SWIFT Network": "swift-payments",
    },
    upstream: ["The Clearing House RTP Network", "SWIFT Network", "Core Banking and Risk Model Technology Vendors", "Card and Payments Processing Infrastructure"],
    services: ["Regulatory Reporting and Compliance Programs", "Fraud, AML, and Cybersecurity Operations", "Treasury and Liquidity Services", "Global Transaction Banking Services"],
    channels: ["Zelle Network", "Commercial Banking and Treasury Channel", "Global Markets and Investment Banking Channel", "Wealth and Private Bank Channel"],
    demand: ["Loan and Deposit Demand", "Payments and Treasury Flow Demand", "Capital Markets Activity Demand"],
    sources: [
      { id: "bac-annual", title: "Bank of America annual reports and proxy", url: "https://investor.bankofamerica.com/annual-reports-and-proxy-statements", note: "Business segment and demand disclosures." },
      { id: "bac-filings", title: "Bank of America regulatory and SEC filings", url: "https://investor.bankofamerica.com/regulatory-and-other-filings", note: "Risk and third-party dependency disclosures." },
      { id: "bac-rtp", title: "Bank of America expands RTP capabilities", url: "https://newsroom.bankofamerica.com/content/newsroom/press-releases/2025/06/bofa-clients-embrace-new--10-million-limit-in-u-s--real-time-pay.html", note: "Named real-time payments relationship via The Clearing House RTP network." },
      { id: "bac-zelle", title: "Bank of America expands CashPro payment API with Zelle", url: "https://newsroom.bankofamerica.com/content/newsroom/press-releases/2022/10/bank-of-america-expands-its-cashpro--payment-api-capability-to-o.html", note: "Named Zelle network integration in corporate payments channels." },
      { id: "swift-payments", title: "SWIFT payments network overview", url: "https://www.swift.com/payments", note: "Industry settlement and messaging infrastructure context for global banks." },
    ],
  },
  HD: {
    theme: "retail",
    category: "Home Improvement Retail (Source-backed)",
    sourceByTier: { company: "hd-annual", "-2": "hd-10k", "-1": "hd-10k", "1": "hd-annual", "2": "hd-annual" },
    sourceByName: {
      "SRS Distribution": "hd-10k",
      "HD Supply": "hd-10k",
      "Home Depot Pro": "hd-annual",
    },
    upstream: ["SRS Distribution", "HD Supply", "Home Depot Pro", "Building Materials and Lumber Suppliers", "Tool and Hardware Vendor Ecosystem"],
    services: ["Distribution Center and Last-Mile Logistics", "Supplier Diversity and Compliance Program", "Installation and Pro Services Network", "Commercial Insurance and Risk Coverage"],
    channels: ["Home Depot Pro", "Store Network and Pro Desks", "HomeDepot.com and Marketplace", "Pro Contractor and Enterprise Accounts"],
    demand: ["Residential Repair and Remodel Demand", "Professional Contractor Demand", "Seasonal Home Improvement Demand"],
    sources: [
      { id: "hd-annual", title: "Home Depot annual reports", url: "https://ir.homedepot.com/financial-reports/annual-reports", note: "Demand, store operations, and channel disclosures." },
      { id: "hd-10k", title: "Home Depot FY2024 10-K", url: "https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/354950/000035495025000010/hd-20250202.htm", note: "Supplier, logistics, and risk discussion." },
      { id: "hd-supplier", title: "Home Depot supplier diversity", url: "https://www.homedepot.com/c/Supplier_Diversity", note: "Supplier ecosystem and procurement policy context." },
    ],
  },
  "ROG.SW": {
    theme: "pharma",
    category: "Pharma & Diagnostics (Source-backed)",
    sourceByTier: { company: "roche-reports", "-2": "roche-genentech", "-1": "roche-procurement", "1": "roche-foundation-medicine", "2": "roche-reports" },
    sourceByName: {
      Genentech: "roche-genentech",
      "Foundation Medicine": "roche-foundation-medicine",
      "Chugai Pharmaceutical": "roche-chugai",
    },
    upstream: ["Genentech", "Foundation Medicine", "Chugai Pharmaceutical", "Diagnostics Component and Instrument Inputs", "External Manufacturing and Fill-Finish Partners"],
    services: ["Procurement and Supplier Governance Programs", "Regulatory and Quality Assurance Services", "Global Distribution and Cold-Chain Logistics", "Risk and Treasury Operations"],
    channels: ["Foundation Medicine", "Hospital and Diagnostic Lab Channels", "Oncology and Specialty Care Networks", "Pharmacy and Provider Channels"],
    demand: ["Diagnostics Testing Demand", "Innovative Medicines Demand", "Hospital and Healthcare System Demand"],
    sources: [
      { id: "roche-reports", title: "Roche investor reports", url: "https://www.roche.com/investors/reports", note: "Operating, manufacturing, and market disclosures." },
      { id: "roche-procurement", title: "Roche procurement", url: "https://www.roche.com/about/procurement", note: "Supplier relationships and procurement structure." },
      { id: "roche-suppliers", title: "Roche suppliers", url: "https://www.roche.com/suppliers", note: "Supplier engagement standards and ecosystem context." },
      { id: "roche-genentech", title: "Roche Group structure: Genentech", url: "https://www.roche.com/innovation/structure/genentech", note: "Named Roche Group innovation and operating entity." },
      { id: "roche-foundation-medicine", title: "Roche Group structure: Foundation Medicine", url: "https://www.roche.com/innovation/structure/foundation-medicine", note: "Named Roche Group precision oncology entity and channel." },
      { id: "roche-chugai", title: "Roche Group structure: Chugai", url: "https://www.roche.com/innovation/structure/chugai", note: "Named Roche Group partner company in Japan." },
    ],
  },
  PG: {
    theme: "retail",
    category: "Consumer Packaged Goods (Source-backed)",
    sourceByTier: { company: "pg-annual", "-2": "pg-10k", "-1": "pg-supplier-portal", "1": "pg-10k", "2": "pg-annual" },
    sourceByName: {
      "Walmart Inc.": "pg-10k",
      Target: "pg-10k",
      "Tide Brand Portfolio": "pg-annual",
    },
    upstream: ["Multi-Category Ingredient and Chemical Inputs", "Packaging Resin and Fiber Inputs", "Contract and Internal Manufacturing Inputs", "Agricultural and Commodity Raw Material Inputs", "Tide Brand Portfolio"],
    services: ["Supplier Portal and Procurement Services", "Global Distribution and Freight Services", "Commercial Risk and Insurance Coverage", "Treasury and Commodity Hedging Support"],
    channels: ["Walmart Inc.", "Target", "E-commerce and D2C Channels", "Club and Wholesale Channels"],
    demand: ["Household Staples Demand", "Beauty and Personal Care Demand", "Fabric and Home Care Demand"],
    sources: [
      { id: "pg-annual", title: "P&G annual report", url: "https://annualreport.pg.com/home/default.aspx", note: "Brand/channel demand and operating model disclosures." },
      { id: "pg-10k", title: "P&G FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/80424/000008042425000076/pg-20250630.htm", note: "Primary filing with named customer/channel references including Walmart and Target." },
      { id: "pg-supplier-portal", title: "P&G supplier portal", url: "https://www.pgsupplier.com", note: "Supplier onboarding, purchasing, and compliance context." },
      { id: "pg-contact", title: "P&G contact and supplier resources", url: "https://us.pg.com/contact_us/", note: "Supplier access points and operating contacts." },
    ],
  },
  BABA: {
    theme: "commerce_cloud",
    category: "E-commerce + Logistics Platform (Source-backed)",
    sourceByTier: { company: "baba-reports", "-2": "baba-cainiao", "-1": "baba-reports", "1": "baba-lazada", "2": "baba-earnings" },
    sourceByName: {
      "Cainiao Smart Logistics Network": "baba-cainiao-business",
      Lazada: "baba-lazada",
      "Ant Group": "baba-ant",
    },
    upstream: ["Cainiao Smart Logistics Network", "Ant Group", "Alibaba Cloud Infrastructure Inputs", "Cross-border Fulfillment Partners", "Digital Payments and Risk Infrastructure"],
    services: ["Merchant Trust and Compliance Services", "Platform Cybersecurity and Data Governance", "Logistics Orchestration and Last-Mile Services", "Treasury and Settlement Services"],
    channels: ["Lazada", "Taobao and Tmall Consumer Channels", "International E-commerce Channels", "Alibaba Cloud Enterprise Channels"],
    demand: ["China Consumption and GMV Demand", "Cross-border E-commerce Demand", "Cloud and AI Service Demand"],
    sources: [
      { id: "baba-reports", title: "Alibaba investor reports", url: "https://www.alibabagroup.com/en/ir/reports", note: "Group business structure and platform disclosures." },
      { id: "baba-earnings", title: "Alibaba September quarter 2025 results", url: "https://www.businesswire.com/news/home/20251124757764/en/Alibaba-Group-Announces-September-Quarter-2025-Results-and-Interim-Results-for-the-Six-Months-Ended-September-30-2025", note: "Recent demand and reporting-structure context." },
      { id: "baba-cainiao", title: "Alibaba and Cainiao announcement", url: "https://www.alibabagroup.com/en-US/news/article?news=p240326", note: "Logistics and channel ecosystem relationship context." },
      { id: "baba-cainiao-business", title: "Alibaba business profile for Cainiao", url: "https://www.alibabagroup.com/en-US/about-alibaba/businesses?business=cainiao-smart-logistics-network-limited", note: "Named logistics business entity under Alibaba ecosystem." },
      { id: "baba-lazada", title: "Alibaba business profile for Lazada", url: "https://www.alibabagroup.com/en-US/about-alibaba/businesses?business=lazada", note: "Named international commerce channel entity in Alibaba ecosystem." },
      { id: "baba-ant", title: "Alibaba and Ant Group headquarters transaction", url: "https://www.alibabagroup.com/en-US/news/article?news=p230724", note: "Named relationship and transaction context with Ant Group." },
    ],
  },
  CVX: {
    theme: "energy",
    category: "Integrated Energy (Source-backed)",
    sourceByTier: { company: "cvx-10k", "-2": "cvx-10k", "-1": "cvx-10k", "1": "cvx-10k", "2": "cvx-10k" },
    sourceByName: {
      Halliburton: "cvx-10k",
      "SLB (Schlumberger)": "cvx-10k",
      "Bunge Chevron Ag Renewables": "cvx-10k",
    },
    upstream: ["Halliburton", "SLB (Schlumberger)", "Bunge Chevron Ag Renewables", "Refining and Petrochemical Feedstock Inputs", "LNG Project Construction Inputs"],
    services: ["Global Marine and Pipeline Logistics", "Commodity Trading and Risk Management", "Project Finance and Treasury Services", "Operational Safety and Insurance Programs"],
    channels: ["Refined Products Distribution Network", "Industrial and Utility Offtake Contracts", "LNG and Gas Sales Agreements", "Chemicals and Lubricants Channels"],
    demand: ["Global Fuels Demand", "Industrial Energy Demand", "Natural Gas and LNG Demand"],
    sources: [
      { id: "cvx-10k", title: "Chevron FY2024 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/93410/000009341025000009/cvx-20241231.htm", note: "Primary annual filing with operations, risk, and segment disclosures." },
      { id: "cvx-procurement", title: "Chevron procurement", url: "https://www.chevron.com/operations/procurement", note: "Supplier and contractor operating framework." },
      { id: "cvx-subsea7", title: "Chevron contract award news", url: "https://www.chevron.com/newsroom/2025/q1/subsea7-awarded-contract-by-chevron", note: "Named project supplier relationship example." },
    ],
  },
  "1398.HK": {
    theme: "banking",
    category: "State Commercial Banking (Source-backed)",
    sourceByTier: { company: "icbc-annual-index", "-2": "icbc-annual-index", "-1": "swift-payments", "1": "cips-site", "2": "swift-payments" },
    sourceByName: {
      "China UnionPay": "unionpay-home",
      "SWIFT Network": "swift-payments",
      "CIPS (Cross-Border Interbank Payment System)": "cips-site",
    },
    upstream: ["China UnionPay", "Core Banking Technology Platforms", "Credit and Risk Data Providers", "Clearing and Settlement Infrastructure"],
    services: ["SWIFT Network", "Regulatory and Compliance Operations", "AML and Fraud Monitoring Services", "Treasury and Liquidity Management"],
    channels: ["CIPS (Cross-Border Interbank Payment System)", "Corporate Banking Channels", "Retail Banking Channels", "Trade Finance and Cross-border Channels"],
    demand: ["Corporate Credit Demand", "Retail Lending and Deposits Demand", "Domestic and Cross-border Payments Demand"],
    sources: [
      { id: "icbc-annual", title: "ICBC annual reports index", url: "https://www.icbc-ltd.com/icbcltd/en/investorrelations/financialinformations/annualreports/", note: "Bank operations and disclosures across annual reports." },
      { id: "icbc-annual-index", title: "ICBC 2024 annual report", url: "https://www.icbc-ltd.com/ICBCLtd/AnnualReport/2024/EN/index.html", note: "Recent detailed report for operational and risk context." },
      { id: "unionpay-home", title: "UnionPay International overview", url: "https://www.unionpayintl.com/en/", note: "Named cross-border card network used across Asia and global issuing/acquiring flows." },
      { id: "cips-site", title: "CIPS official website", url: "https://www.cips.com.cn/en/index/index.html", note: "Named RMB cross-border interbank payment infrastructure." },
      { id: "swift-payments", title: "SWIFT payments network overview", url: "https://www.swift.com/payments", note: "Global payment and settlement infrastructure context." },
    ],
  },
  GE: {
    theme: "industrial",
    category: "Industrial Systems (Source-backed)",
    sourceByTier: { company: "ge-annual", "-2": "ge-10k", "-1": "ge-suppliers", "1": "ge-10k", "2": "ge-annual" },
    sourceByName: {
      "Safran Aircraft Engines (CFM Joint Venture)": "ge-10k",
      "Boeing 737 MAX Program": "ge-10k",
      "Airbus A320neo Program": "ge-10k",
    },
    upstream: ["Safran Aircraft Engines (CFM Joint Venture)", "Aerospace Engine Components and Casting Suppliers", "Specialty Metals and Materials Inputs", "Avionics and Control Systems Suppliers", "Aftermarket Parts Manufacturing Partners"],
    services: ["Supplier Portal and Transaction Services", "Quality and Safety Assurance Programs", "Global Logistics and Spares Distribution", "Treasury and Risk Management Services"],
    channels: ["Boeing 737 MAX Program", "Airbus A320neo Program", "Defense and Government Channels", "MRO and Aftermarket Service Channels"],
    demand: ["Commercial Flight Hours Demand", "Defense Modernization Demand", "Aftermarket Services Demand"],
    sources: [
      { id: "ge-annual", title: "GE Aerospace annual report", url: "https://www.geaerospace.com/investor-relations/annual-report", note: "Operations and demand disclosures." },
      { id: "ge-10k", title: "GE Aerospace FY2024 Form 10-K", url: "https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/40545/000004054525000014/ge-20241231.htm", note: "Primary filing with CFM/Safran context and Airbus/Boeing platform exposure disclosures." },
      { id: "ge-suppliers", title: "GE Aerospace supplier portal", url: "https://supplier.geaerospace.com/", note: "Supplier onboarding and transaction ecosystem context." },
      { id: "ge-press", title: "GE Aerospace press releases", url: "https://www.geaerospace.com/news/press-releases", note: "Named program and partner updates." },
    ],
  },
  CAT: {
    theme: "industrial",
    category: "Heavy Equipment Manufacturing (Source-backed)",
    sourceByTier: { company: "cat-annual", "-2": "cat-supplier-2025", "-1": "cat-annual", "1": "cat-press", "2": "cat-annual" },
    sourceByName: {
      "CEVA Freight": "cat-supplier-2025",
      "Randstad NV": "cat-supplier-2025",
      "DENSO Europe B.V.": "cat-supplier-2025",
    },
    upstream: ["CEVA Freight", "Randstad NV", "DENSO Europe B.V.", "Steel and Foundry Component Suppliers", "Hydraulic and Powertrain Suppliers"],
    services: ["Integrated Logistics and Freight Services", "Supplier Excellence and Quality Programs", "Dealer Financing via Cat Financial", "Warranty and Field Service Operations"],
    channels: ["Cat Dealer Network", "Aftermarket Parts and Services Channels", "Rental and Fleet Channels", "Mining and Infrastructure Project Channels"],
    demand: ["Construction Equipment Demand", "Mining Equipment Demand", "Energy and Transportation Equipment Demand"],
    sources: [
      { id: "cat-annual", title: "Caterpillar annual reports", url: "https://www.caterpillar.com/en/investors/reports-and-filings/annual-reports.html", note: "Demand cycles and operating disclosures." },
      { id: "cat-supplier-2025", title: "Caterpillar supplier excellence 2025", url: "https://www.caterpillar.com/en/news/caterpillarNews/2025/supplier-excellence-2025.html", note: "Named logistics and component supplier network examples." },
      { id: "cat-suppliers", title: "Caterpillar suppliers", url: "https://www.caterpillar.com/en/company/suppliers.html", note: "Supplier requirements and procurement model context." },
      { id: "cat-press", title: "Caterpillar corporate press releases", url: "https://www.caterpillar.com/en/news/corporate-press-releases.html", note: "Program and channel updates." },
    ],
  },
  KO: {
    theme: "retail",
    category: "Global Beverage System (Source-backed)",
    sourceByTier: { company: "ko-10k", "-2": "ko-suppliers", "-1": "ko-10k", "1": "ko-10k", "2": "ko-10k" },
    sourceByName: {
      "Coca-Cola FEMSA": "ko-10k",
      "Coca-Cola Europacific Partners (CCEP)": "ko-10k",
      "Coca-Cola HBC": "ko-10k",
    },
    upstream: ["Coca-Cola FEMSA", "Coca-Cola Europacific Partners (CCEP)", "Coca-Cola HBC", "Sweetener and Ingredient Suppliers", "Aluminum, PET and Packaging Suppliers"],
    services: ["Bottling System Coordination", "Cold Chain and Distribution Logistics", "Marketing and Brand Activation Services", "Commercial Risk and Compliance Programs"],
    channels: ["Coca-Cola FEMSA", "Coca-Cola Europacific Partners (CCEP)", "Coca-Cola HBC", "Modern Trade and Retail Channels"],
    demand: ["Sparkling Beverage Demand", "Hydration and Functional Drink Demand", "Emerging Market Consumption Demand"],
    sources: [
      { id: "ko-10k", title: "Coca-Cola FY2024 Form 10-K", url: "https://investors.coca-colacompany.com/filings-reports/annual-filings-10-k/content/0000021344-25-000011/ko-20241231.htm", note: "Primary filing with bottling partner and demand disclosures." },
      { id: "ko-filings", title: "Coca-Cola annual filings", url: "https://investors.coca-colacompany.com/financial-information/annual-filings", note: "Demand, channel, and operating model disclosures." },
      { id: "ko-suppliers", title: "Coca-Cola suppliers", url: "https://www.coca-colacompany.com/about-us/suppliers", note: "Supplier ecosystem standards and management context." },
    ],
  },
  NFLX: {
    theme: "platform_cloud",
    category: "Streaming Platform (Source-backed)",
    sourceByTier: { company: "nflx-10k", "-2": "nflx-openconnect", "-1": "nflx-microsoft", "1": "nflx-tf1", "2": "nflx-earnings" },
    sourceByName: {
      "Microsoft Advertising Platform": "nflx-microsoft",
      "TF1 Group": "nflx-tf1",
      "WWE (TKO Group)": "nflx-wwe",
    },
    upstream: ["Microsoft Advertising Platform", "Cloud Compute and Storage Infrastructure", "Content Production Studios and Vendors", "CDN and Open Connect Appliances", "Localization and Dubbing Partners"],
    services: ["Open Connect ISP Partnership Operations", "Content Licensing and Rights Management", "Trust and Safety and Compliance Services", "Treasury and Payment Processing Services"],
    channels: ["TF1 Group", "WWE (TKO Group)", "Direct-to-Consumer Streaming", "Ad-supported Subscription Channels"],
    demand: ["Streaming Viewing Hours Demand", "Advertising Inventory Demand", "Global Subscription Demand"],
    sources: [
      { id: "nflx-10k", title: "Netflix FY2024 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/1065280/000119312525084431/d914423dars.pdf", note: "Primary annual filing with operating model and risk disclosures." },
      { id: "nflx-annual", title: "Netflix annual reports and proxies", url: "https://ir.netflix.net/financials/annual-reports-and-proxies/default.aspx", note: "Business model and platform demand disclosures." },
      { id: "nflx-openconnect", title: "Netflix Open Connect network overview", url: "https://about.netflix.com/news/open-connect-celebrating-a-decade-of-smooth-and-efficient-streaming", note: "Named distribution infrastructure and ISP partner model." },
      { id: "nflx-microsoft", title: "Netflix and Microsoft advertising partnership", url: "https://about.netflix.com/en/news/netflix-and-microsoft-announce-global-advertising-partnership", note: "Named advertising technology platform partner for Netflix ad-supported plans." },
      { id: "nflx-tf1", title: "Netflix and TF1 Group distribution partnership", url: "https://about.netflix.com/en/news/netflix-and-tf1-group-join-forces-to-bring-tf1-to-netflix-members-in-france", note: "Named distribution-channel partnership example." },
      { id: "nflx-wwe", title: "Netflix to become new home of WWE RAW", url: "https://about.netflix.com/en/news/netflix-to-become-new-home-of-wwe-raw-beginning-2025", note: "Named live entertainment channel relationship with WWE / TKO Group." },
      { id: "nflx-earnings", title: "Netflix quarterly earnings", url: "https://ir.netflix.net/financials/quarterly-earnings/default.aspx", note: "Current demand and growth channel context." },
    ],
  },
  "601288.SS": {
    theme: "banking",
    category: "State Commercial Banking (Source-backed)",
    sourceByTier: { company: "abc-annual", "-2": "unionpay-home", "-1": "swift-payments", "1": "cips-site", "2": "swift-payments" },
    sourceByName: {
      "China UnionPay": "unionpay-home",
      "SWIFT Network": "swift-payments",
      "CIPS (Cross-Border Interbank Payment System)": "cips-site",
    },
    upstream: ["China UnionPay", "Core Banking Platforms and Infrastructure", "Credit and Risk Data Inputs", "Clearing and Settlement Systems"],
    services: ["SWIFT Network", "Regulatory Compliance Operations", "AML and Fraud Monitoring", "Treasury and Liquidity Management"],
    channels: ["CIPS (Cross-Border Interbank Payment System)", "Corporate Banking Channels", "Retail Branch and Digital Channels", "Trade Finance Channels"],
    demand: ["Corporate Credit Demand", "Retail Lending and Deposit Demand", "Domestic and Cross-border Payment Demand"],
    sources: [
      { id: "abc-annual", title: "Agricultural Bank of China annual reports", url: "https://www.abchina.com/en/investor-relations/financial-reports/annual-reports/", note: "Annual operational and risk disclosures." },
      { id: "abc-ir", title: "Agricultural Bank of China investor relations", url: "https://www.abchina.com/en/investor-relations/", note: "Financial reporting and governance context." },
      { id: "unionpay-home", title: "UnionPay International overview", url: "https://www.unionpayintl.com/en/", note: "Named cross-border card network used across issuing and acquiring flows." },
      { id: "cips-site", title: "CIPS official website", url: "https://www.cips.com.cn/en/index/index.html", note: "Named RMB cross-border interbank payment infrastructure." },
      { id: "swift-payments", title: "SWIFT payments network overview", url: "https://www.swift.com/payments", note: "Global settlement network context for banks." },
    ],
  },
  "601939.SS": {
    theme: "banking",
    category: "State Commercial Banking (Source-backed)",
    sourceByTier: { company: "ccb-annual", "-2": "unionpay-home", "-1": "swift-payments", "1": "cips-site", "2": "swift-payments" },
    sourceByName: {
      "China UnionPay": "unionpay-home",
      "SWIFT Network": "swift-payments",
      "CIPS (Cross-Border Interbank Payment System)": "cips-site",
    },
    upstream: ["China UnionPay", "Core Banking and Risk Technology Stack", "Credit Data and Scoring Inputs", "Settlement and Clearing Infrastructure"],
    services: ["SWIFT Network", "Regulatory and Capital Management Services", "AML, Fraud, and Risk Operations", "Treasury and Liquidity Services"],
    channels: ["CIPS (Cross-Border Interbank Payment System)", "Corporate and Institutional Banking Channels", "Retail and Mobile Banking Channels", "Trade and Supply Chain Finance Channels"],
    demand: ["Infrastructure and Corporate Credit Demand", "Household Lending Demand", "Domestic and International Settlement Demand"],
    sources: [
      { id: "ccb-annual", title: "China Construction Bank annual reports", url: "https://www.ccb.com/english/v3/investor/financials/ann_report.html", note: "Annual operating and risk disclosures." },
      { id: "ccb-quarterly", title: "China Construction Bank quarterly reports", url: "https://www.ccb.com/en/investorv3/financial/quarterlyreport/index.html", note: "Current business segment performance context." },
      { id: "unionpay-home", title: "UnionPay International overview", url: "https://www.unionpayintl.com/en/", note: "Named cross-border card network used across issuing and acquiring flows." },
      { id: "cips-site", title: "CIPS official website", url: "https://www.cips.com.cn/en/index/index.html", note: "Named RMB cross-border interbank payment infrastructure." },
      { id: "swift-payments", title: "SWIFT payments network overview", url: "https://www.swift.com/payments", note: "Global settlement network context for banks." },
    ],
  },
  AMD: {
    theme: "chip_ai",
    category: "Compute Semiconductors (Source-backed)",
    sourceByTier: { company: "amd-10k", "-2": "amd-tsmc-n2", "-1": "amd-10k", "1": "amd-ir", "2": "amd-ir" },
    sourceByName: {
      "TSMC N2 Process Technology": "amd-tsmc-n2",
      "OpenAI (AI Infrastructure Partner)": "amd-openai",
      "Oracle Cloud Infrastructure (OCI)": "amd-oracle-oci",
    },
    upstream: ["TSMC N2 Process Technology", "Advanced Packaging and Substrate Ecosystem", "HBM and Memory Supplier Ecosystem", "EDA and IP Tooling Providers", "Test and Assembly Partners"],
    services: ["Global Semiconductor Logistics", "Supply Risk and Quality Assurance Programs", "Treasury and Working Capital Services", "Design Verification and Software Enablement Services"],
    channels: ["OpenAI (AI Infrastructure Partner)", "Oracle Cloud Infrastructure (OCI)", "PC and Client OEM Channels", "Gaming Console and Graphics Channels"],
    demand: ["AI Accelerator Demand", "Server CPU Demand", "Client and Gaming Compute Demand"],
    sources: [
      { id: "amd-10k", title: "AMD FY2024 10-K", url: "https://www.sec.gov/ixviewer/ix.html?doc=/Archives/edgar/data/2488/000000248825000012/amd-20241228.htm", note: "Risk, supplier concentration, and demand disclosures." },
      { id: "amd-ir", title: "AMD investor relations", url: "https://ir.amd.com", note: "Product, customer, and demand channel context." },
      { id: "amd-tsmc-n2", title: "AMD achieves first TSMC N2 product silicon milestone", url: "https://ir.amd.com/news-events/press-releases/detail/1245/amd-achieves-first-tsmc-n2-product-silicon-milestone", note: "Named foundry collaboration for next-generation AMD EPYC on TSMC N2." },
      { id: "amd-openai", title: "AMD and OpenAI strategic partnership announcement", url: "https://ir.amd.com/news-events/press-releases/detail/1260/amd-and-openai-announce-strategic-partnership-to-deploy-6-gigawatts-of-amd-gpus", note: "Named AI infrastructure deployment relationship between OpenAI and AMD." },
      { id: "amd-oracle-oci", title: "Oracle and AMD partnership expansion", url: "https://www.amd.com/en/newsroom/press-releases/oracle-and-amd-expand-partnership-to-help-customers-ach.html", note: "Named Oracle Cloud Infrastructure relationship using AMD compute platforms." },
      { id: "tsmc-annual", title: "TSMC annual reports", url: "https://investor.tsmc.com/english/annual-reports", note: "Foundry ecosystem context for fabless semiconductor customers." },
    ],
  },
  "MC.PA": {
    theme: "retail",
    category: "Luxury Goods Portfolio (Source-backed)",
    sourceByTier: { company: "lvmh-investors", "-2": "lvmh-commitments", "-1": "lvmh-commitments", "1": "lvmh-houses", "2": "lvmh-investors" },
    sourceByName: {
      "Louis Vuitton": "lvmh-houses",
      "Christian Dior Couture": "lvmh-houses",
      Sephora: "lvmh-houses",
    },
    upstream: ["Louis Vuitton", "Christian Dior Couture", "Premium Raw Materials and Fabric Inputs", "Packaging and Fragrance Component Inputs", "Jewelry and Watchmaking Component Inputs"],
    services: ["Responsible Sourcing and ESG Programs", "Global Luxury Logistics and Distribution", "Brand Protection and Compliance Services", "Treasury and FX Risk Management"],
    channels: ["Sephora", "Wines and Spirits Distribution Channels", "Travel Retail and Duty-Free Channels", "Selective Retail and E-commerce Channels"],
    demand: ["Global Luxury Consumption Demand", "Travel Retail Demand", "Beauty and Personal Luxury Demand"],
    sources: [
      { id: "lvmh-investors", title: "LVMH investor relations", url: "https://www.lvmh.com/investors/", note: "Financial performance and demand context across business groups." },
      { id: "lvmh-commitments", title: "LVMH commitments", url: "https://www.lvmh.com/group/lvmh-commitments/", note: "Sourcing, environmental, and operational responsibility framework." },
      { id: "lvmh-houses", title: "LVMH Houses", url: "https://www.lvmh.com/houses/", note: "Brand/channel architecture across fashion, wines, and selective retailing." },
    ],
  },
  PLTR: {
    theme: "platform_cloud",
    category: "Enterprise AI Platform (Source-backed)",
    sourceByTier: { company: "pltr-ir", "-2": "pltr-msft", "-1": "pltr-orcl", "1": "pltr-databricks", "2": "pltr-ir" },
    sourceByName: {
      "Microsoft Azure OpenAI Service": "pltr-msft",
      "Oracle Cloud Infrastructure": "pltr-orcl",
      Databricks: "pltr-databricks",
    },
    upstream: ["Microsoft Azure OpenAI Service", "Oracle Cloud Infrastructure", "Databricks", "Mission-Critical Deployment Tooling", "Third-Party Data and Connector Ecosystem"],
    services: ["Government and Regulated Compliance Services", "Deployment and Forward-Deployed Engineering Services", "Cybersecurity and Platform Hardening", "Treasury and Contracting Operations"],
    channels: ["Government and Defense Program Channels", "Commercial Enterprise Channels", "Databricks", "AIP Developer and Partner Channels"],
    demand: ["AI Platform Adoption Demand", "Public Sector Modernization Demand", "Enterprise Data Operating System Demand"],
    sources: [
      { id: "pltr-ir", title: "Palantir investor relations", url: "https://investors.palantir.com/", note: "Financial and operating context for commercial/government demand." },
      { id: "pltr-sec", title: "Palantir SEC filings", url: "https://investors.palantir.com/financials/sec-filings/default.aspx", note: "Risk disclosures and dependency context." },
      { id: "pltr-aip", title: "Palantir AIP platform", url: "https://www.palantir.com/platforms/aip/", note: "Product and channel positioning for AI platform delivery." },
      { id: "pltr-msft", title: "Palantir and Microsoft partnership announcement", url: "https://news.microsoft.com/source/2024/08/08/palantir-and-microsoft-partner-to-deliver-enhanced-analytics-and-ai-services-to-classified-networks-for-critical-national-security-operations/", note: "Named Microsoft Azure OpenAI Service partnership with Palantir for classified AI operations." },
      { id: "pltr-orcl", title: "Oracle and Palantir mission-critical AI partnership", url: "https://www.oracle.com/news/announcement/oracle-and-palantir-join-forces-to-deliver-mission-critical-ai-solutions-to-governments-and-businesses-2024-04-04/", note: "Named Oracle Cloud Infrastructure and Palantir deployment partnership." },
      { id: "pltr-databricks", title: "Palantir Foundry announcements (June 2025)", url: "https://www.palantir.com/docs/foundry/announcements/2025-06", note: "Named Databricks integration announcement in Palantir Foundry ecosystem." },
    ],
  },
  AZN: {
    theme: "pharma",
    category: "Biopharma Pipeline (Source-backed)",
    sourceByTier: { company: "azn-20f", "-2": "azn-20f", "-1": "azn-20f", "1": "azn-20f", "2": "azn-20f" },
    sourceByName: {
      "Alexion Pharmaceuticals": "azn-20f",
      "Daiichi Sankyo": "azn-20f",
      "MSD (Merck)": "azn-20f",
    },
    upstream: ["Alexion Pharmaceuticals", "Daiichi Sankyo", "MSD (Merck)", "API and Biologics Manufacturing Inputs", "External Manufacturing and Fill-Finish Inputs"],
    services: ["Regulatory Affairs and Pharmacovigilance Services", "Global Distribution and Cold-Chain Services", "Treasury and Risk Management Services", "Clinical Development and Trial Operations"],
    channels: ["Hospital and Oncology Channels", "Specialty and Retail Pharmacy Channels", "Government and Public Health Channels", "Rare Disease and Specialty Channels"],
    demand: ["Oncology Portfolio Demand", "Rare Disease and Specialty Demand", "Global Biopharma Treatment Demand"],
    sources: [
      { id: "azn-20f", title: "AstraZeneca FY2024 Form 20-F", url: "https://www.sec.gov/Archives/edgar/data/901832/000110465925014750/azn-20241231x20f.htm", note: "Primary filing with named strategic collaborations including Alexion, Daiichi Sankyo, and MSD (Merck)." },
      { id: "azn-submissions", title: "SEC submissions for AstraZeneca plc", url: "https://data.sec.gov/submissions/CIK0000901832.json", note: "Regulatory filing index for AstraZeneca including annual 20-F and current 6-K disclosures." },
    ],
  },
  NVS: {
    theme: "pharma",
    category: "Biopharma Pipeline (Source-backed)",
    sourceByTier: { company: "nvs-ir", "-2": "nvs-morphosys", "-1": "nvs-ir", "1": "nvs-regulus", "2": "nvs-ir" },
    sourceByName: {
      "MorphoSys AG": "nvs-morphosys",
      "Regulus Therapeutics": "nvs-regulus",
      "Avidity Biosciences": "nvs-avidity",
    },
    upstream: ["MorphoSys AG", "Regulus Therapeutics", "Avidity Biosciences", "External Manufacturing and Supply Inputs", "Clinical Research and Trial Inputs"],
    services: ["Supplier Governance and Procurement Services", "Quality and Regulatory Compliance Services", "Cold-Chain and Global Distribution Services", "Treasury and Currency Risk Services"],
    channels: ["Specialty Care and Hospital Channels", "Retail and Specialty Pharmacy Channels", "Regulus Therapeutics", "Avidity Biosciences"],
    demand: ["Innovative Medicines Demand", "Specialty Care Demand", "Global Healthcare Demand"],
    sources: [
      { id: "nvs-ir", title: "Novartis investors", url: "https://www.novartis.com/investors", note: "Company performance and demand context." },
      { id: "nvs-suppliers", title: "Novartis suppliers", url: "https://www.novartis.com/about/suppliers", note: "Supplier framework and procurement standards." },
      { id: "nvs-news", title: "Novartis media releases", url: "https://www.novartis.com/news/media-releases", note: "Program and market channel updates." },
      { id: "nvs-morphosys", title: "Novartis agreement to acquire MorphoSys AG", url: "https://www.novartis.com/news/media-releases/novartis-strengthen-oncology-pipeline-agreement-acquire-morphosys-ag-eur-68-share-or-aggregate-eur-27bn-cash", note: "Named oncology pipeline acquisition of MorphoSys AG." },
      { id: "nvs-regulus", title: "Novartis completes acquisition of Regulus Therapeutics", url: "https://www.novartis.com/news/media-releases/novartis-completes-acquisition-regulus-therapeutics", note: "Named RNA therapeutics acquisition by Novartis." },
      { id: "nvs-avidity", title: "Novartis agrees to acquire Avidity Biosciences", url: "https://www.novartis.com/news/media-releases/novartis-agrees-acquire-avidity-biosciences-innovator-rna-therapeutics-strengthening-its-late-stage-neuroscience-pipeline", note: "Named neuroscience pipeline acquisition of Avidity Biosciences." },
    ],
  },
  CSCO: {
    theme: "platform_cloud",
    category: "Network Infrastructure Platform (Source-backed)",
    sourceByTier: { company: "csco-ir", "-2": "csco-nvidia", "-1": "csco-splunk", "1": "csco-nvidia", "2": "csco-ir" },
    sourceByName: {
      "NVIDIA Spectrum-X": "csco-nvidia",
      Splunk: "csco-splunk",
      "Cisco Silicon One": "csco-nvidia",
    },
    upstream: ["NVIDIA Spectrum-X", "Cisco Silicon One", "Splunk", "Optics and Switching Component Inputs", "Contract Manufacturing and Assembly Partners"],
    services: ["Supply Chain ESG and Resilience Programs", "Global Hardware Logistics and RMA Services", "Security and Compliance Services", "Treasury and Procurement Services"],
    channels: ["Enterprise Networking Channels", "Service Provider and Telecom Channels", "Splunk", "Partner and Integrator Ecosystem"],
    demand: ["Data Center Networking Demand", "Campus and Edge Infrastructure Demand", "Cybersecurity Platform Demand"],
    sources: [
      { id: "csco-ir", title: "Cisco investor relations", url: "https://investor.cisco.com/", note: "Demand, segment, and market channel disclosures." },
      { id: "csco-sec", title: "Cisco SEC filings", url: "https://investor.cisco.com/financial-information/sec-filings/default.aspx", note: "Operational risk and dependency disclosures." },
      { id: "csco-supply", title: "Cisco supply chain ESG", url: "https://www.cisco.com/c/en/us/about/csr/esg-hub/supply-chain.html", note: "Supplier governance and resilience context." },
      { id: "csco-nvidia", title: "Cisco expands partnership with NVIDIA for enterprise AI", url: "https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2025/m02/cisco-expands-partnership-with-nvidia-to-accelerate-ai-adoption-in-the-enterprise.html", note: "Named NVIDIA Spectrum-X and Cisco Silicon One partnership references." },
      { id: "csco-splunk", title: "Cisco completes acquisition of Splunk", url: "https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2024/m03/cisco-completes-acquisition-of-splunk.html", note: "Named integration of Splunk into Cisco security and observability ecosystem." },
    ],
  },
  TM: {
    theme: "automotive_ev",
    category: "Automotive Manufacturing (Source-backed)",
    sourceByTier: { company: "tm-ir", "-2": "tm-ppes", "-1": "tm-sustainability", "1": "tm-peve", "2": "tm-sales" },
    sourceByName: {
      "Prime Planet Energy & Solutions, Inc.": "tm-ppes",
      "Panasonic Corporation": "tm-ppes",
      "Primearth EV Energy Co., Ltd.": "tm-peve",
    },
    upstream: ["Prime Planet Energy & Solutions, Inc.", "Panasonic Corporation", "Primearth EV Energy Co., Ltd.", "Semiconductor and Electronics Inputs", "Steel and Materials Supply Inputs"],
    services: ["Production System and Supplier Quality Services", "Global Logistics and Distribution Services", "Finance and Captive Lending Services", "Warranty and After-sales Service Operations"],
    channels: ["Dealer and Retail Sales Channels", "Primearth EV Energy Co., Ltd.", "After-sales Parts and Service Channels", "Mobility and Electrification Channels"],
    demand: ["Global Vehicle Demand", "Hybrid and EV Demand", "Mobility Services Demand"],
    sources: [
      { id: "tm-ir", title: "Toyota investor relations", url: "https://global.toyota/en/ir/", note: "Financial, production, and market demand disclosures." },
      { id: "tm-sustainability", title: "Toyota sustainability", url: "https://global.toyota/en/sustainability/", note: "Supply chain and responsible production context." },
      { id: "tm-sales", title: "Toyota production and sales figures", url: "https://global.toyota/en/company/profile/production-sales-figures/", note: "Demand and distribution throughput context." },
      { id: "tm-ppes", title: "Toyota and Panasonic establish Prime Planet Energy & Solutions", url: "https://global.toyota/en/newsroom/corporate/31477926.html", note: "Named battery joint venture entity between Toyota and Panasonic." },
      { id: "tm-peve", title: "Toyota to make PEVE a wholly owned subsidiary", url: "https://global.toyota/en/newsroom/corporate/40515408.html", note: "Named Primearth EV Energy Co., Ltd. battery entity transaction." },
    ],
  },
  LRCX: {
    theme: "semi_equipment",
    category: "Semiconductor Equipment (Source-backed)",
    sourceByTier: { company: "lrcx-ir", "-2": "lrcx-supplier-awards", "-1": "lrcx-cea-leti", "1": "lrcx-micron", "2": "lrcx-ir" },
    sourceByName: {
      "Celestica Electronics SDN. BHD.": "lrcx-supplier-awards",
      "Texon Co., Ltd.": "lrcx-supplier-awards",
      "TOTO Ltd.": "lrcx-supplier-awards",
      "Micron Technology": "lrcx-micron",
      "CEA-Leti": "lrcx-cea-leti",
    },
    upstream: ["Celestica Electronics SDN. BHD.", "Texon Co., Ltd.", "TOTO Ltd.", "Precision Components and Vacuum System Inputs", "Process Chamber and Materials Inputs"],
    services: ["CEA-Leti", "Supplier Management and Qualification Services", "Field Service and Spares Logistics", "Reliability and Process Optimization Services"],
    channels: ["Micron Technology", "Foundry Customer Programs", "Memory Customer Programs", "Service and Upgrade Channels"],
    demand: ["Wafer Fab Equipment Demand", "Node Transition and Capacity Demand", "Advanced Packaging Equipment Demand"],
    sources: [
      { id: "lrcx-ir", title: "Lam Research investor relations", url: "https://investor.lamresearch.com/", note: "Operating model and demand context." },
      { id: "lrcx-sec", title: "Lam Research SEC filings", url: "https://investor.lamresearch.com/financials/sec-filings/default.aspx", note: "Risk and supply dependency disclosures." },
      { id: "lrcx-suppliers", title: "Lam Research suppliers", url: "https://www.lamresearch.com/company/suppliers/", note: "Supplier management and procurement framework." },
      { id: "lrcx-supplier-awards", title: "Lam Research announces 2024 supplier excellence award winners", url: "https://newsroom.lamresearch.com/2024-09-23-Lam-Research-Announces-2024-Supplier-Excellence-Award-Winners", note: "Named supplier entities including Celestica Electronics SDN. BHD., Texon Co., Ltd., and TOTO Ltd." },
      { id: "lrcx-micron", title: "Lam Research celebrates Micron investment in Boise", url: "https://newsroom.lamresearch.com/2025-10-21-Lam-Research-Celebrates-Micron-Investment-in-Boise-Strengthening-American-Semiconductor-Leadership", note: "Named Micron Technology relationship in domestic semiconductor capacity context." },
      { id: "lrcx-cea-leti", title: "Lam Research and CEA-Leti collaborate on plasma etch technology", url: "https://newsroom.lamresearch.com/2026-02-02-Lam-Research-and-CEA-Leti-Collaborate-to-Advance-Plasma-Etch-Technology-for-Next-Generation-Semiconductor-Devices", note: "Named CEA-Leti R&D collaboration in process technology development." },
    ],
  },
  MRK: {
    theme: "pharma",
    category: "Pharma Pipeline (Source-backed)",
    sourceByTier: { company: "mrk-ir", "-2": "mrk-10k", "-1": "mrk-sec", "1": "mrk-sec", "2": "mrk-ir" },
    sourceByName: {
      AstraZeneca: "mrk-10k",
      "Eisai Co., Ltd.": "mrk-10k",
      "Moderna, Inc.": "mrk-10k",
    },
    upstream: ["AstraZeneca", "Eisai Co., Ltd.", "Moderna, Inc.", "API and Biologics Input Materials", "External Manufacturing and Fill-Finish Inputs"],
    services: ["Supplier Onboarding and Procurement Services", "Regulatory and Quality Management Services", "Cold-Chain and Global Distribution Services", "Treasury and Risk Services"],
    channels: ["Hospital and Specialty Care Channels", "Retail and Specialty Pharmacy Channels", "AstraZeneca", "Global Distributor Channels"],
    demand: ["Oncology and Specialty Medicine Demand", "Vaccine and Preventive Care Demand", "Global Pharmaceutical Demand"],
    sources: [
      { id: "mrk-ir", title: "Merck investor relations", url: "https://investors.merck.com/", note: "Financial and commercial demand context." },
      { id: "mrk-sec", title: "Merck SEC filings", url: "https://investors.merck.com/financials/sec-filings/default.aspx", note: "Risk and operational disclosures." },
      { id: "mrk-10k", title: "Merck FY2024 10-K", url: "https://www.sec.gov/Archives/edgar/data/310158/000162828025007732/mrk-20241231.htm", note: "Primary filing with named collaboration counterparties including AstraZeneca, Eisai Co., Ltd., and Moderna, Inc." },
      { id: "mrk-suppliers", title: "Merck suppliers", url: "https://www.merck.com/company-overview/suppliers/", note: "Supplier ecosystem and onboarding context." },
    ],
  },
  HSBC: {
    theme: "banking",
    category: "Global Banking (Source-backed)",
    sourceByTier: { company: "hsbc-ir", "-2": "hsbc-20f", "-1": "hsbc-results", "1": "hsbc-20f", "2": "swift-payments" },
    sourceByName: {
      "Hang Seng Bank": "hsbc-20f",
      "Bank of Communications Co., Limited": "hsbc-20f",
      "HSBC UK Bank plc": "hsbc-20f",
      "The Hongkong and Shanghai Banking Corporation Limited": "hsbc-20f",
    },
    upstream: ["Hang Seng Bank", "Bank of Communications Co., Limited", "HSBC UK Bank plc", "Core Banking and Treasury Systems"],
    services: ["Global Payments and Cash Management Services", "Regulatory and Risk Management Services", "AML and Financial Crime Services", "Treasury and Liquidity Services"],
    channels: ["The Hongkong and Shanghai Banking Corporation Limited", "Retail Banking Channels", "Commercial and Corporate Banking Channels", "Trade Finance and Cross-border Channels"],
    demand: ["Corporate Treasury Demand", "Retail Credit and Deposit Demand", "Cross-border Payment Demand"],
    sources: [
      { id: "hsbc-ir", title: "HSBC investor relations", url: "https://www.hsbc.com/investors", note: "Financial and segment demand context." },
      { id: "hsbc-results", title: "HSBC results and announcements", url: "https://www.hsbc.com/investors/results-and-announcements", note: "Current business and risk disclosures." },
      { id: "swift-payments", title: "SWIFT payments network overview", url: "https://www.swift.com/payments", note: "Settlement and payment infrastructure context." },
      { id: "hsbc-20f", title: "HSBC FY2024 Form 20-F", url: "https://www.sec.gov/Archives/edgar/data/1089113/000108911325000040/hsbc-20241231.htm", note: "Primary filing with named entities including Hang Seng Bank, HSBC UK Bank plc, and Bank of Communications Co., Limited." },
    ],
  },
  "0857.HK": {
    theme: "energy",
    category: "Integrated Energy (Source-backed)",
    sourceByTier: { company: "petrochina-20f", "-2": "petrochina-20f", "-1": "petrochina-20f", "1": "petrochina-20f", "2": "petrochina-20f" },
    sourceByName: {
      "China National Petroleum Corporation (CNPC)": "petrochina-20f",
      "Kunlun Energy Company Limited": "petrochina-20f",
      "PetroChina International Company Limited": "petrochina-20f",
      PipeChina: "petrochina-20f",
    },
    upstream: ["China National Petroleum Corporation (CNPC)", "Kunlun Energy Company Limited", "PetroChina International Company Limited", "Exploration and Drilling Service Inputs", "Pipeline and Midstream Infrastructure Inputs"],
    services: ["Environmental and Safety Governance Services", "Global Commodity Logistics Services", "Treasury and Trading Risk Services", "Operations and Maintenance Services"],
    channels: ["PipeChina", "Refined Products Sales Channels", "Natural Gas Sales Channels", "Petrochemical and Industrial Buyer Channels"],
    demand: ["Transportation Fuel Demand", "Industrial Energy Demand", "Natural Gas and Petrochemical Demand"],
    sources: [
      { id: "petrochina-20f", title: "PetroChina FY2022 Form 20-F", url: "https://www.sec.gov/Archives/edgar/data/1108329/000119312523124228/d456049d20f.htm", note: "Primary filing with named entities including CNPC, Kunlun Energy Company Limited, PetroChina International Company Limited, and PipeChina." },
      { id: "petrochina-sec-submissions", title: "SEC submissions for PetroChina Co Ltd", url: "https://data.sec.gov/submissions/CIK0001108329.json", note: "Filing index for PetroChina periodic disclosures and 20-F submissions." },
    ],
  },
  AMAT: {
    theme: "semi_equipment",
    category: "Semiconductor Equipment (Source-backed)",
    sourceByTier: { company: "amat-ir", "-2": "amat-sec", "-1": "amat-supply", "1": "amat-ir", "2": "amat-ir" },
    sourceByName: {
      "Intel Foundry": "amat-intel",
      "Taiwan Semiconductor Manufacturing Company (TSMC)": "amat-tsmc",
      "BE Semiconductor Industries N.V. (Besi)": "amat-besi",
    },
    upstream: ["Intel Foundry", "Taiwan Semiconductor Manufacturing Company (TSMC)", "BE Semiconductor Industries N.V. (Besi)", "Precision Component and Vacuum System Inputs", "Deposition and Etch Materials Inputs"],
    services: ["Supplier Qualification and Risk Services", "Global Field Service and Spares Logistics", "Installation and Process Optimization Services", "Treasury and Working Capital Services"],
    channels: ["Intel Foundry", "Foundry Customer Channels", "Memory Customer Channels", "Service and Upgrade Channels"],
    demand: ["Wafer Fab Equipment Demand", "Node Migration and Capacity Demand", "Advanced Packaging Tool Demand"],
    sources: [
      { id: "amat-ir", title: "Applied Materials investor relations", url: "https://ir.appliedmaterials.com/", note: "Performance and market demand context." },
      { id: "amat-sec", title: "Applied Materials SEC filings", url: "https://ir.appliedmaterials.com/financial-information/sec-filings", note: "Risk and supplier dependency disclosures." },
      { id: "amat-supply", title: "Applied Materials supply chain responsibility", url: "https://www.appliedmaterials.com/us/en/corporate-responsibility/supply-chain-responsibility.html", note: "Supplier governance framework." },
      { id: "amat-intel", title: "Intel Foundry honors Applied Materials with EPIC Distinguished Supplier Award", url: "https://www.appliedmaterials.com/us/en/newsroom/company-news/2025/intel-foundry-honors-applied-materials-with-epic-distinguished-supplier-award", note: "Named Intel Foundry relationship and supplier recognition." },
      { id: "amat-tsmc", title: "Applied Materials quick take: advanced packaging at TSMC symposium", url: "https://www.appliedmaterials.com/us/en/newsroom/company-news/2025/quick-take-advanced-packaging-at-tsmc-technology-symposium-in-north-america", note: "Named TSMC collaboration context in advanced packaging technology." },
      { id: "amat-besi", title: "BE Semiconductor Industries and Applied Materials joint development project", url: "https://investor.appliedmaterials.com/news-events/press-releases/detail/708/be-semiconductor-industries-and-applied-materials-announce", note: "Named BE Semiconductor Industries N.V. (Besi) hybrid bonding collaboration and equity investment." },
    ],
  },
  PM: {
    theme: "retail",
    category: "Consumer Products Portfolio (Source-backed)",
    sourceByTier: { company: "pm-ir", "-2": "pm-10k", "-1": "pm-sec", "1": "pm-10k", "2": "pm-ir" },
    sourceByName: {
      "Swedish Match AB": "pm-10k",
      "Vectura Group Ltd.": "pm-10k",
      "Altria Group, Inc.": "pm-10k",
    },
    upstream: ["Swedish Match AB", "Vectura Group Ltd.", "Altria Group, Inc.", "Leaf Tobacco and Agricultural Inputs", "Reduced-Risk Product Component Inputs"],
    services: ["Responsible Sourcing and Farmer Programs", "Regulatory and Compliance Services", "Global Distribution and Trade Services", "Treasury and FX Risk Services"],
    channels: ["Altria Group, Inc.", "Combustible Product Retail Channels", "Heated Tobacco Device Channels", "PMI Global Travel Retail"],
    demand: ["Adult Smoker Conversion Demand", "Reduced-Risk Product Demand", "Global Nicotine Product Demand"],
    sources: [
      { id: "pm-ir", title: "Philip Morris investor relations", url: "https://investors.pmi.com/", note: "Financial performance and demand context." },
      { id: "pm-sec", title: "Philip Morris SEC filings", url: "https://investors.pmi.com/financials/sec-filings/default.aspx", note: "Operational and risk disclosures." },
      { id: "pm-10k", title: "Philip Morris International FY2025 10-K", url: "https://www.sec.gov/Archives/edgar/data/1413329/000162828026005939/pm-20251231.htm", note: "Primary filing with named entities including Swedish Match AB, Vectura Group Ltd., and Altria Group, Inc." },
      { id: "pm-supply", title: "PMI supply chain sustainability", url: "https://www.pmi.com/sustainability/our-supply-chain", note: "Supplier and sourcing strategy context." },
    ],
  },
  GS: {
    theme: "banking",
    category: "Investment Banking (Source-backed)",
    sourceByTier: { company: "gs-ir", "-2": "gs-10k", "-1": "gs-sec", "1": "gs-10k", "2": "gs-ir" },
    sourceByName: {
      "Goldman Sachs Bank USA": "gs-10k",
      "Goldman Sachs International": "gs-10k",
      "General Motors": "gs-10k",
    },
    upstream: ["Goldman Sachs Bank USA", "Goldman Sachs International", "General Motors", "Clearing and Settlement Infrastructure Inputs", "Cloud and Cybersecurity Inputs"],
    services: ["Risk Management and Compliance Services", "Treasury and Liquidity Services", "Prime Brokerage and Financing Services", "Technology and Operations Services"],
    channels: ["General Motors", "Investment Banking Advisory Channels", "Global Markets and Trading Channels", "Transaction Banking Channels"],
    demand: ["Institutional Capital Markets Demand", "Corporate Treasury Demand", "Wealth and Asset Management Demand"],
    sources: [
      { id: "gs-ir", title: "Goldman Sachs investor relations", url: "https://www.goldmansachs.com/investor-relations/", note: "Performance and segment demand context." },
      { id: "gs-sec", title: "Goldman Sachs SEC filings", url: "https://www.goldmansachs.com/investor-relations/sec-filings/", note: "Risk and operating disclosures." },
      { id: "gs-10k", title: "Goldman Sachs FY2024 10-K", url: "https://www.sec.gov/Archives/edgar/data/886982/000088698225000005/gs-20241231.htm", note: "Primary filing with named entities including Goldman Sachs Bank USA, Goldman Sachs International, and General Motors credit card program transition." },
      { id: "gs-txbank", title: "Goldman Sachs transaction banking", url: "https://www.goldmansachs.com/what-we-do/transaction-banking/", note: "Payments and cash management channel context." },
    ],
  },
  MS: {
    theme: "banking",
    category: "Investment Banking (Source-backed)",
    sourceByTier: { company: "ms-ir", "-2": "ms-10k", "-1": "ms-sec", "1": "ms-10k", "2": "ms-ir" },
    sourceByName: {
      "E*TRADE Futures LLC": "ms-10k",
      "Morgan Stanley Smith Barney LLC": "ms-10k",
      "Morgan Stanley Bank, N.A.": "ms-10k",
    },
    upstream: ["E*TRADE Futures LLC", "Morgan Stanley Smith Barney LLC", "Morgan Stanley Bank, N.A.", "Clearing and Custody Infrastructure Inputs", "Cybersecurity and Compliance Tech Inputs"],
    services: ["Regulatory and Enterprise Risk Services", "Prime Brokerage and Financing Services", "Operations and Trade Support Services", "Treasury and Funding Services"],
    channels: ["Morgan Stanley Smith Barney LLC", "Institutional Securities Channels", "Wealth Management Advisor Channels", "Investment Management Channels"],
    demand: ["Institutional Trading Demand", "Wealth Advisory Demand", "Alternative and Traditional Asset Demand"],
    sources: [
      { id: "ms-ir", title: "Morgan Stanley investor relations", url: "https://www.morganstanley.com/about-us-ir", note: "Financial and segment context." },
      { id: "ms-sec", title: "Morgan Stanley SEC filings", url: "https://www.morganstanley.com/about-us-ir/sec-filings", note: "Risk and operational disclosures." },
      { id: "ms-10k", title: "Morgan Stanley FY2025 10-K", url: "https://www.sec.gov/Archives/edgar/data/895421/000089542126000086/ms-20251231.htm", note: "Primary filing with named entities including E*TRADE Futures LLC, Morgan Stanley Smith Barney LLC, and Morgan Stanley Bank, N.A." },
      { id: "ms-supplier", title: "Morgan Stanley supplier diversity", url: "https://www.morganstanley.com/about-us/supplier-diversity", note: "Third-party supplier and procurement context." },
    ],
  },
  WFC: {
    theme: "banking",
    category: "Universal Banking (Source-backed)",
    sourceByTier: { company: "wfc-ir", "-2": "wfc-10k", "-1": "wfc-sec", "1": "wfc-10k", "2": "wfc-ir" },
    sourceByName: {
      "Wells Fargo Bank, N.A.": "wfc-10k",
      "Wells Fargo Securities, LLC": "wfc-10k",
      "Wells Fargo Clearing Services, LLC": "wfc-10k",
    },
    upstream: ["Wells Fargo Bank, N.A.", "Wells Fargo Securities, LLC", "Wells Fargo Clearing Services, LLC", "Credit Bureau and Risk Data Inputs", "Cloud and Security Infrastructure Inputs"],
    services: ["Consumer and Commercial Lending Services", "Regulatory and Financial Crime Services", "Treasury, Liquidity, and Balance Sheet Services", "Supplier and Procurement Governance Services"],
    channels: ["Retail Banking Channels", "Commercial Banking Channels", "Wells Fargo Securities, LLC", "Home Lending and Servicing Channels"],
    demand: ["Consumer Credit and Deposit Demand", "Commercial Treasury Demand", "Mortgage and Home Finance Demand"],
    sources: [
      { id: "wfc-ir", title: "Wells Fargo investor relations", url: "https://www08.wellsfargomedia.com/about/investor-relations/", note: "Financial and operating context." },
      { id: "wfc-sec", title: "Wells Fargo SEC filings", url: "https://www08.wellsfargomedia.com/about/investor-relations/sec-filings/", note: "Risk and dependency disclosures." },
      { id: "wfc-10k", title: "Wells Fargo FY2024 10-K", url: "https://www.sec.gov/Archives/edgar/data/72971/000007297125000066/wfc-20241231.htm", note: "Primary filing with named entities including Wells Fargo Bank, N.A., Wells Fargo Securities, LLC, and Wells Fargo Clearing Services, LLC." },
      { id: "wfc-supplier", title: "Wells Fargo supplier diversity", url: "https://www.wellsfargo.com/about/diversity/supplier-diversity/", note: "Supplier ecosystem management context." },
    ],
  },
  RTX: {
    theme: "industrial",
    category: "Aerospace & Defense Systems (Source-backed)",
    sourceByTier: { company: "rtx-ir", "-2": "rtx-10k", "-1": "rtx-sec", "1": "rtx-10k", "2": "rtx-ir" },
    sourceByName: {
      "Collins Aerospace": "rtx-10k",
      Raytheon: "rtx-10k",
      Boeing: "rtx-10k",
      Airbus: "rtx-10k",
    },
    upstream: ["Collins Aerospace", "Raytheon", "Boeing", "Aero Engine and Propulsion Component Inputs", "Avionics and Electronics Inputs"],
    services: ["Program Management and Engineering Services", "Quality, Certification, and Compliance Services", "Global Spares and MRO Logistics Services", "Government Contracting and Treasury Services"],
    channels: ["Boeing", "Airbus", "Defense Prime and Government Channels", "International Military Sales Channels"],
    demand: ["Commercial Flight Hour Demand", "Defense Modernization Demand", "Aerospace Aftermarket Demand"],
    sources: [
      { id: "rtx-ir", title: "RTX investor relations", url: "https://investors.rtx.com/", note: "Program and demand context." },
      { id: "rtx-sec", title: "RTX SEC filings", url: "https://investors.rtx.com/financial-information/sec-filings/default.aspx", note: "Risk and operational disclosures." },
      { id: "rtx-10k", title: "RTX FY2025 10-K", url: "https://www.sec.gov/Archives/edgar/data/101829/000010182926000006/rtx-20251231.htm", note: "Primary filing naming Collins Aerospace and Raytheon segments and major commercial customers including Boeing and Airbus." },
      { id: "rtx-suppliers", title: "RTX suppliers", url: "https://www.rtx.com/suppliers", note: "Supplier requirements and governance context." },
    ],
  },
  "600519.SS": {
    theme: "retail",
    category: "Chinese Premium Baijiu Network (Source-backed)",
    sourceByTier: { company: "moutai-annual-2024", "-2": "moutai-annual-2024", "-1": "moutai-annual-2024", "1": "moutai-annual-2024", "2": "moutai-sse" },
    sourceByName: {
      "CHINA GUIZHOU MOUTAI DISTILLERY (GROUP) CO., LTD.": "moutai-annual-2024",
      "GUIZHOU FUMING PACKAGING CO., LTD.": "moutai-annual-2024",
      "KWEICHOW MOUTAI DISTILLERY (GROUP) LOGISTICS CO., LTD.": "moutai-annual-2024",
      "CHINA GUIZHOU MOUTAI BREWERY TRADING (H.K.) LIMITED": "moutai-annual-2024",
      "i Moutai Digital Channel": "moutai-annual-2024",
    },
    upstream: [
      "CHINA GUIZHOU MOUTAI DISTILLERY (GROUP) CO., LTD.",
      "GUIZHOU FUMING PACKAGING CO., LTD.",
      "KWEICHOW MOUTAI DISTILLERY (GROUP) CIRCULATION INDUSTRY CO., LTD.",
      "Sorghum and Base-Liquor Production Inputs",
      "Bottling and Anti-Counterfeit Packaging Inputs",
    ],
    services: [
      "KWEICHOW MOUTAI DISTILLERY (GROUP) LOGISTICS CO., LTD.",
      "GUIZHOU MAOTAII INTERNATIONAL HOTEL CO., LTD.",
      "Quality Inspection and Compliance Services",
      "Treasury and Inventory Allocation Services",
    ],
    channels: [
      "CHINA GUIZHOU MOUTAI BREWERY TRADING (H.K.) LIMITED",
      "i Moutai Digital Channel",
      "Domestic Distributor and Retail Network",
      "Hospitality and Gifting Channel Demand",
    ],
    demand: ["Premium Baijiu Consumption Demand", "Festival and Gift-Driven Demand", "Collector and High-End Consumption Demand"],
    sources: [
      { id: "moutai-annual-2024", title: "Kweichow Moutai 2024 annual report (SSE filing)", url: "https://www.sse.com.cn/disclosure/listedinfo/announcement/c/new/2025-04-03/600519_2024_n.pdf", note: "Primary disclosure naming related-party and operating entities including logistics, packaging, and trading units." },
      { id: "moutai-sse", title: "SSE listing information (600519)", url: "https://www.sse.com.cn/assortment/stock/list/info/company/index.shtml?COMPANY_CODE=600519", note: "Issuer disclosure index and filing context for 600519." },
      { id: "moutai-company", title: "Kweichow Moutai corporate site", url: "https://www.moutaichina.com/", note: "Official company and channel context." },
    ],
  },
  "NESN.SW": {
    theme: "retail",
    category: "Global Food, Petcare and Nutrition Network (Source-backed)",
    sourceByTier: { company: "nesn-financials-2024", "-2": "nesn-financials-2024", "-1": "nesn-financials-2024", "1": "nesn-financials-2024", "2": "nesn-financials-2024" },
    sourceByName: {
      "Nestlé Nespresso SA": "nesn-financials-2024",
      "Nestlé Purina PetCare Company": "nesn-financials-2024",
      "Nestlé Health Science": "nesn-financials-2024",
      "Blue Bottle Coffee, LLC": "nesn-financials-2024",
      "Gerber Products Company": "nesn-financials-2024",
      "Sanpellegrino S.p.A.": "nesn-financials-2024",
    },
    upstream: [
      "Nestlé Nespresso SA",
      "Nestlé Purina PetCare Company",
      "Gerber Products Company",
      "Blue Bottle Coffee, LLC",
      "Sanpellegrino S.p.A.",
    ],
    services: [
      "Nestlé Health Science",
      "Global Procurement and Food Safety Services",
      "Commodity and Dairy Input Sourcing Services",
      "Treasury and FX Risk Services",
    ],
    channels: ["Nespresso Direct-to-Consumer Channels", "Global Grocery and Modern Retail Channels", "PetCare Specialist and Veterinary Channels", "Medical Nutrition and Health Science Channels"],
    demand: ["Global Packaged Food Demand", "Pet Care and Nutrition Demand", "Coffee and Premium Beverage Demand"],
    sources: [
      { id: "nesn-financials-2024", title: "Nestlé 2024 Financial Statements", url: "https://www.nestle.com/sites/default/files/2025-02/2024-financial-statements-en.pdf", note: "Primary disclosure naming operating entities including Nespresso, Purina, Health Science, Blue Bottle Coffee, Gerber, and Sanpellegrino." },
      { id: "nesn-annual-2024", title: "Nestlé 2024 annual report site", url: "https://www.reports.nestle.com/annual-report/2024/", note: "Official annual report context for group structure and segment performance." },
    ],
  },
  UNH: {
    theme: "pharma",
    category: "Healthcare Services and Benefits Platform (Source-backed)",
    sourceByTier: { company: "unh-10k-2024", "-2": "unh-10k-2024", "-1": "unh-10k-2024", "1": "unh-businesses", "2": "unh-10k-2024" },
    sourceByName: {
      UnitedHealthcare: "unh-10k-2024",
      "Optum Health": "unh-10k-2024",
      "Optum Rx": "unh-10k-2024",
      "Optum Insight": "unh-10k-2024",
      "Change Healthcare": "unh-10k-2024",
    },
    upstream: ["UnitedHealthcare", "Optum Health", "Optum Rx", "Optum Insight", "Change Healthcare"],
    services: ["Care Management and Utilization Services", "Regulatory, Privacy, and Compliance Services", "Payment Integrity and Risk Services", "Provider and Claims Platform Services"],
    channels: ["Employer and Group Benefit Channels", "Medicare and Government Program Channels", "Individual and Marketplace Channels", "Provider and Care Delivery Channels"],
    demand: ["Managed Care Enrollment Demand", "Healthcare Services Utilization Demand", "Pharmacy and Benefit Management Demand"],
    sources: [
      { id: "unh-10k-2024", title: "UnitedHealth Group FY2024 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/731766/000073176625000063/unh-20241231.htm", note: "Primary filing naming UnitedHealthcare and Optum operating platforms including Optum Health, Optum Rx, Optum Insight and Change Healthcare." },
      { id: "unh-investors", title: "UnitedHealth Group investor relations", url: "https://www.unitedhealthgroup.com/investors.html", note: "Financial and segment context." },
      { id: "unh-businesses", title: "UnitedHealth Group businesses", url: "https://www.unitedhealthgroup.com/about/businesses.html", note: "Official operating model and business segment overview." },
      { id: "unh-suppliers", title: "UnitedHealth Group suppliers", url: "https://www.unitedhealthgroup.com/suppliers.html", note: "Supplier and procurement governance context." },
    ],
  },
  "RMS.PA": {
    theme: "retail",
    category: "Hermès House and Craftsmanship Network (Source-backed)",
    sourceByTier: { company: "hermes-urd-2024", "-2": "hermes-urd-2024", "-1": "hermes-urd-2024", "1": "hermes-urd-2024", "2": "hermes-finance" },
    sourceByName: {
      "Bootmaker John Lobb": "hermes-urd-2024",
      "Silversmith Puiforcat": "hermes-urd-2024",
      "Cristalleries de Saint-Louis": "hermes-urd-2024",
      "Leather Goods & Saddlery": "hermes-urd-2024",
      "Hermès Perfume and Beauty": "hermes-urd-2024",
    },
    upstream: ["Leather Goods & Saddlery", "Tanneries and Precious Leathers", "Bootmaker John Lobb", "Silversmith Puiforcat", "Cristalleries de Saint-Louis"],
    services: ["Hermès Perfume and Beauty", "Logistics Platforms", "Craftsmanship and Training Services", "Treasury and FX Risk Services"],
    channels: ["Hermès Retail Branch Network (105 branches)", "Selective Concessionaire Network (25 concessionaires)", "Leather Goods and Accessories Channels", "Watches and Jewelry Channels"],
    demand: ["Global Luxury Consumption Demand", "Ultra-Premium Leather Goods Demand", "Heritage Brand Experience Demand"],
    sources: [
      { id: "hermes-urd-2024", title: "Hermès 2024 Universal Registration Document", url: "https://assets-finance.hermes.com/s3fs-public/node/pdf_file/2025-05/1746455904/250328_hermes_urd2024_en.pdf", note: "Primary filing naming houses and métiers including John Lobb, Puiforcat and Cristalleries de Saint-Louis." },
      { id: "hermes-finance", title: "Hermès finance", url: "https://finance.hermes.com/en/", note: "Financial and demand context." },
      { id: "hermes-investors", title: "Hermès investors", url: "https://finance.hermes.com/en/investors/", note: "Investor and governance context for operating structure." },
      { id: "hermes-key-figures", title: "Hermès key figures", url: "https://finance.hermes.com/en/key-figures/", note: "Segment and business-line performance context." },
    ],
  },
  "OR.PA": {
    theme: "retail",
    category: "Global Beauty Brand and Division Portfolio (Source-backed)",
    sourceByTier: { company: "loreal-deu-2024", "-2": "loreal-deu-2024", "-1": "loreal-deu-2024", "1": "loreal-deu-2024", "2": "loreal-finance" },
    sourceByName: {
      "Consumer Products Division": "loreal-deu-2024",
      "Dermatological Beauty Division": "loreal-deu-2024",
      "Professional Products Division": "loreal-deu-2024",
      "L'Oréal Paris": "loreal-deu-2024",
      "Garnier": "loreal-deu-2024",
      "Maybelline New York": "loreal-deu-2024",
      "La Roche-Posay": "loreal-deu-2024",
      CeraVe: "loreal-deu-2024",
      Lancôme: "loreal-deu-2024",
      Vichy: "loreal-deu-2024",
    },
    upstream: ["Consumer Products Division", "Dermatological Beauty Division", "Professional Products Division", "L'Oréal Luxe Division", "Global Manufacturing and Operations Network"],
    services: ["Research, Innovation and Technology Organization", "Responsible Sourcing and Supplier Auditing Services", "Regulatory and Product Safety Services", "Treasury and FX Risk Services"],
    channels: ["L'Oréal Paris", "Garnier", "Maybelline New York", "La Roche-Posay", "CeraVe", "Lancôme", "Vichy"],
    demand: ["Skincare and Dermatology Demand", "Premium Beauty Demand", "Global Personal Care Demand"],
    sources: [
      { id: "loreal-deu-2024", title: "L'Oréal 2024 Universal Registration Document", url: "https://www.loreal-finance.com/system/files/2025-03/LOREAL_DEU_2024_UK.pdf", note: "Primary filing naming divisions and major brands including L'Oréal Paris, Garnier, Maybelline New York, La Roche-Posay, CeraVe, Lancôme and Vichy." },
      { id: "loreal-finance", title: "L'Oréal finance", url: "https://www.loreal-finance.com/eng", note: "Financial performance and demand context." },
      { id: "loreal-annual-report", title: "L'Oréal annual report", url: "https://www.loreal-finance.com/eng/annual-report", note: "Annual report context for division and regional performance." },
      { id: "loreal-regulated", title: "L'Oréal regulated information", url: "https://www.loreal-finance.com/eng/regulated-information", note: "Official regulated disclosure archive context." },
    ],
  },
  "601988.SS": {
    theme: "banking",
    category: "State Commercial Banking and Subsidiary Network (Source-backed)",
    sourceByTier: { company: "boc-annual-2024", "-2": "boc-annual-2024", "-1": "boc-annual-2024", "1": "boc-annual-2024", "2": "boc-annual-2024" },
    sourceByName: {
      "BOC Aviation Limited": "boc-annual-2024",
      "BOC International Holdings Limited": "boc-annual-2024",
      "BOC Group Life Assurance Co., Ltd.": "boc-annual-2024",
      "Bank of China (Hong Kong) Limited": "boc-annual-2024",
      "Bank of China (Macau) Limited": "boc-annual-2024",
      "China UnionPay": "boc-annual-2024",
      "CIPS (Cross-Border Interbank Payment System)": "boc-annual-2024",
    },
    upstream: ["BOC Aviation Limited", "BOC International Holdings Limited", "BOC Group Life Assurance Co., Ltd.", "Core Banking and Treasury System Inputs", "Credit and Risk Data Inputs"],
    services: ["Cross-border Payments and Trade Finance Services", "Regulatory, AML, and Compliance Services", "Treasury and Liquidity Management Services", "Global Settlement and Clearing Services"],
    channels: ["Bank of China (Hong Kong) Limited", "Bank of China (Macau) Limited", "China UnionPay", "CIPS (Cross-Border Interbank Payment System)"],
    demand: ["Corporate Treasury Demand", "Consumer Credit and Deposit Demand", "Cross-border Settlement Demand"],
    sources: [
      { id: "boc-annual-2024", title: "Bank of China 2024 annual report", url: "https://pic.bankofchina.com/bocappd/report/202504/P020250428606533404882.pdf", note: "Primary filing naming principal subsidiaries including Bank of China (Hong Kong) Limited, BOC International Holdings Limited and BOC Aviation Limited, plus UnionPay/CIPS references." },
      { id: "boc-annual-page-2024", title: "Bank of China 2024 annual report release page", url: "https://www.boc.cn/en/investor/ir3/202504/t20250428_25337712.html", note: "Official annual report publication page." },
      { id: "boc-introduction", title: "Bank of China introduction", url: "https://www.boc.cn/en/aboutboc/ab2/200902/t20090209_1601159.html", note: "Group operating footprint and business scope context." },
    ],
  },
  "300750.SZ": {
    theme: "automotive_ev",
    category: "Battery Manufacturing and OEM Customer Network (Source-backed)",
    sourceByTier: { company: "stla-20f-2024", "-2": "stla-20f-2024", "-1": "li-20f-2024", "1": "tsla-10k", "2": "tsla-10k" },
    sourceByName: {
      "Stellantis N.V.": "stla-20f-2024",
      Leapmotor: "stla-20f-2024",
      "Automotive Cells Company (ACC)": "stla-20f-2024",
      "Tesla, Inc.": "tsla-10k",
      "Li Auto Inc.": "li-20f-2024",
    },
    upstream: ["Automotive Cells Company (ACC)", "Battery Pack Manufacturing and Integration Inputs", "Lithium and Cathode Material Inputs", "Cell Quality and Safety Validation Systems"],
    services: ["Global Battery Logistics and Distribution Services", "Manufacturing Safety and ESG Services", "Supplier Quality and Procurement Services", "Treasury and Commodity Risk Services"],
    channels: ["Stellantis N.V.", "Leapmotor", "Tesla, Inc.", "Li Auto Inc."],
    demand: ["Electric Vehicle Battery Demand", "Grid-Scale Storage Demand", "Industrial and Mobility Electrification Demand"],
    sources: [
      { id: "stla-20f-2024", title: "Stellantis 2024 Form 20-F", url: "https://www.sec.gov/Archives/edgar/data/1605484/000160548425000013/stellantis-20241231.htm", note: "Primary filing references CATL and Contemporary Amperex relationships, including battery initiatives with Stellantis/Leapmotor ecosystem entities." },
      { id: "li-20f-2024", title: "Li Auto 2024 Form 20-F", url: "https://www.sec.gov/Archives/edgar/data/1791706/000141057825000678/li-20241231x20f.htm", note: "Primary filing states CATL supplies a majority of Li Auto battery packs." },
      { id: "tsla-10k", title: "Tesla FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/0001318605/000162828026003952/tsla-20251231.htm", note: "Primary filing referencing CATL in Tesla battery supply context." },
    ],
  },
  RY: {
    theme: "banking",
    category: "Universal Banking and Business Segment Network (Source-backed)",
    sourceByTier: { company: "rbc-about", "-2": "rbc-about", "-1": "rbc-about", "1": "rbc-about", "2": "rbc-ir" },
    sourceByName: {
      "RBC Capital Markets": "rbc-about",
      "City National Bank": "rbc-about",
      "RBC Wealth Management": "rbc-about",
      "RBC Investor Services": "rbc-about",
      "RBC Insurance": "rbc-about",
      "Royal Bank of Canada Personal Banking": "rbc-royalbank",
    },
    upstream: ["RBC Capital Markets", "RBC Investor Services", "Credit and Risk Data Inputs", "Core Banking and Digital Platform Inputs"],
    services: ["RBC Wealth Management", "RBC Insurance", "Regulatory and Enterprise Risk Services", "Treasury and Funding Services"],
    channels: ["Royal Bank of Canada Personal Banking", "City National Bank", "RBC Commercial Banking Channels", "RBC Capital Markets Institutional Channels"],
    demand: ["Consumer Banking Demand", "Corporate Treasury Demand", "Investment and Wealth Demand"],
    sources: [
      { id: "rbc-ir", title: "RBC investor relations", url: "https://www.rbc.com/investor-relations/index.html", note: "Financial and segment reporting context." },
      { id: "rbc-about", title: "RBC about page and business links", url: "https://www.rbc.com/about-rbc.html", note: "Named business lines and links to RBC Capital Markets, RBC Wealth Management, RBC Investor Services, RBC Insurance, and City National Bank." },
      { id: "rbc-royalbank", title: "RBC Royal Bank personal banking", url: "https://www.rbcroyalbank.com/personal.html", note: "Primary personal and commercial channel context." },
      { id: "rbc-cnb", title: "City National Bank business banking", url: "https://www.cnb.com/business.html", note: "Named City National operating channel under RBC group." },
    ],
  },
  TMUS: {
    theme: "platform_cloud",
    category: "Telecom Network and Infrastructure Ecosystem (Source-backed)",
    sourceByTier: { company: "tmus-10k-2025", "-2": "tmus-10k-2025", "-1": "tmus-10k-2025", "1": "tmus-10k-2025", "2": "tmus-10k-2025" },
    sourceByName: {
      "Deutsche Telekom AG": "tmus-10k-2025",
      "Crown Castle International Corp.": "tmus-10k-2025",
      Sprint: "tmus-10k-2025",
      "Metro by T-Mobile": "tmus-10k-2025",
      "T-Mobile for Business": "tmus-10k-2025",
      Nokia: "nokia-tmus-slicing",
    },
    upstream: ["Crown Castle International Corp.", "Nokia", "Radio Access and Core Network Equipment Inputs", "Device Procurement and SIM Distribution Inputs"],
    services: ["Deutsche Telekom AG", "Sprint Network Integration Services", "Cybersecurity and Fraud Prevention Services", "Customer Care and Billing Services", "Treasury and Procurement Services"],
    channels: ["Metro by T-Mobile", "T-Mobile for Business", "Postpaid Consumer Channels", "Wholesale and MVNO Channels"],
    demand: ["5G Mobile Data Demand", "Enterprise Mobility Demand", "Fixed Wireless Access Demand"],
    sources: [
      { id: "tmus-10k-2025", title: "T-Mobile US FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/1283699/000128369926000010/tmus-20251231.htm", note: "Primary filing naming Deutsche Telekom, Sprint integration context, Metro by T-Mobile, T-Mobile for Business, and Crown Castle arrangements." },
      { id: "tmus-sec-submissions", title: "T-Mobile US SEC submissions index", url: "https://data.sec.gov/submissions/CIK0001283699.json", note: "Primary SEC filing index for current disclosure set." },
      { id: "nokia-tmus-slicing", title: "Nokia and T-Mobile network slicing call announcement", url: "https://www.nokia.com/about-us/news/releases/2024/06/26/t-mobile-and-nokia-complete-u.s.-first-call-using-nationwide-5g-non-standalone-network-slicing/", note: "Named network infrastructure collaboration between Nokia and T-Mobile." },
    ],
  },
  IBM: {
    theme: "platform_cloud",
    category: "Enterprise Tech Platform and Ecosystem (Source-backed)",
    sourceByTier: { company: "ibm-ir", "-2": "ibm-redhat", "-1": "ibm-hashicorp", "1": "ibm-partnerplus", "2": "ibm-ir" },
    sourceByName: {
      "Red Hat": "ibm-redhat",
      HashiCorp: "ibm-hashicorp",
      "IBM Partner Plus Ecosystem": "ibm-partnerplus",
      "IBM Consulting": "ibm-ir",
    },
    upstream: ["Red Hat", "HashiCorp", "Semiconductor and Hardware Component Inputs", "Open-Source Software and Developer Ecosystems"],
    services: ["IBM Consulting", "Managed Infrastructure and Operations Services", "AI Governance and Compliance Services", "Treasury and Procurement Services"],
    channels: ["IBM Partner Plus Ecosystem", "Enterprise Software and Hybrid Cloud Channels", "IBM Consulting Delivery Channels", "Systems Integrator and Independent Software Vendor Channels"],
    demand: ["Hybrid Cloud Modernization Demand", "Enterprise AI Deployment Demand", "Mission-Critical IT Operations Demand"],
    sources: [
      { id: "ibm-ir", title: "IBM investor relations", url: "https://www.ibm.com/investor", note: "Financial and demand context." },
      { id: "ibm-sec", title: "IBM SEC filings", url: "https://www.ibm.com/investor/sec-filings", note: "Risk and operating disclosures." },
      { id: "ibm-redhat", title: "IBM completes acquisition of Red Hat", url: "https://www.ibm.com/investor/news/ibm-completes-acquisition-of-red-hat", note: "Official IBM investor announcement of Red Hat acquisition and hybrid cloud positioning." },
      { id: "ibm-hashicorp", title: "IBM completes acquisition of HashiCorp", url: "https://newsroom.ibm.com/2025-02-27-IBM-Completes-Acquisition-of-HashiCorp,-Creates-Comprehensive,-End-to-End-Hybrid-Cloud-Platform", note: "Official IBM newsroom announcement of HashiCorp acquisition." },
      { id: "ibm-partnerplus", title: "IBM Partner Plus", url: "https://www.ibm.com/partnerplus", note: "IBM global partner ecosystem and channel program." },
    ],
  },
  "IHC.AE": {
    theme: "holding_finance",
    category: "Holding Company Portfolio (Source-backed)",
    sourceByTier: { company: "ihc-ir", "-2": "ihc-portfolio", "-1": "ihc-ir", "1": "ihc-portfolio", "2": "ihc-ir" },
    sourceByName: {
      "Alpha Dhabi Holding": "ihc-portfolio",
      PureHealth: "ihc-portfolio",
      "NMDC Group": "ihc-portfolio",
      "Multiply Group": "ihc-portfolio",
      "2PointZero": "ihc-portfolio",
      "Aldar Properties": "ihc-portfolio",
      "International Resources Holding": "ihc-portfolio",
    },
    upstream: ["Alpha Dhabi Holding", "PureHealth", "NMDC Group", "2PointZero", "Portfolio Company Capital and Deal Sourcing Inputs"],
    services: ["Group Governance and Risk Services", "Capital Allocation and Treasury Services", "Shared Services and Procurement Services", "ESG and Compliance Services"],
    channels: ["Multiply Group", "Aldar Properties", "International Resources Holding", "Healthcare and Infrastructure Portfolio Channels"],
    demand: ["Regional Infrastructure Demand", "Strategic Investment and M&A Demand", "Diversified Portfolio Earnings Demand"],
    sources: [
      { id: "ihc-ir", title: "IHC investor relations", url: "https://www.ihcuae.com/investor-relations", note: "Financial and portfolio context." },
      { id: "ihc-portfolio", title: "IHC portfolio and group news stream", url: "https://www.ihcuae.com/portfolio", note: "Lists and references named portfolio entities including Alpha Dhabi Holding, PureHealth, NMDC Group, Multiply Group, 2PointZero, and Aldar Properties." },
      { id: "ihc-sustainability", title: "IHC sustainability", url: "https://www.ihcuae.com/sustainability", note: "Risk, governance, and operating framework context." },
    ],
  },
  AXP: {
    theme: "payments",
    category: "Card Network and Issuer (Source-backed)",
    sourceByTier: { company: "axp-10k-2025", "-2": "axp-10k-2025", "-1": "axp-10k-2025", "1": "axp-10k-2025", "2": "axp-10k-2025" },
    sourceByName: {
      "Delta Air Lines": "axp-10k-2025",
      "Marriott International": "axp-10k-2025",
      "Hilton Worldwide Holdings": "axp-10k-2025",
      "British Airways": "axp-10k-2025",
      PayPal: "axp-10k-2025",
      Alipay: "axp-10k-2025",
      "Shop Pay": "axp-10k-2025",
      Visa: "axp-10k-2025",
      Mastercard: "axp-10k-2025",
    },
    upstream: ["Delta Air Lines", "Marriott International", "Hilton Worldwide Holdings", "British Airways", "Card Issuance and Merchant Acquiring Technology Inputs"],
    services: ["PayPal", "Alipay", "Shop Pay", "Credit and Risk Management Services"],
    channels: ["American Express Travel", "Global Merchant Network", "Consumer and Small Business Cobrand Cards", "Corporate Card and Commercial Services"],
    demand: ["Consumer Spending Demand", "Business Travel and Expense Demand", "Premium Card Membership Demand"],
    sources: [
      { id: "axp-ir", title: "American Express investor relations", url: "https://ir.americanexpress.com/", note: "Financial and demand context." },
      { id: "axp-sec-submissions", title: "American Express SEC submissions index", url: "https://data.sec.gov/submissions/CIK0000004962.json", note: "Primary SEC filing index for latest annual report artifacts." },
      { id: "axp-10k-2025", title: "American Express FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/4962/000000496226000080/axp-20251231.htm", note: "Primary filing naming Delta, Marriott, British Airways, Hilton, PayPal/Alipay/Shop Pay, and network peers Visa/Mastercard." },
    ],
  },
  SAP: {
    theme: "platform_cloud",
    category: "Enterprise Software Platform (Source-backed)",
    sourceByTier: { company: "sap-20f-2024", "-2": "sap-20f-2024", "-1": "sap-20f-2024", "1": "sap-20f-2024", "2": "sap-20f-2024" },
    sourceByName: {
      "SAP LeanIX": "sap-20f-2024",
      "SAP Signavio": "sap-20f-2024",
      "SAP Ariba": "sap-20f-2024",
      "SAP Concur": "sap-20f-2024",
      "SAP Fieldglass": "sap-20f-2024",
      "SAP SuccessFactors": "sap-20f-2024",
    },
    upstream: ["SAP LeanIX", "SAP Signavio", "SAP Ariba", "Cloud Infrastructure and Data Center Inputs", "Enterprise Data and Integration Ecosystem Inputs"],
    services: ["SAP Concur", "SAP Fieldglass", "SAP SuccessFactors", "Managed Cloud and Application Services"],
    channels: ["SAP S/4HANA", "SAP Business Technology Platform", "Partner and SI Channels", "SME and Midmarket Channels"],
    demand: ["ERP Modernization Demand", "Cloud Migration Demand", "Business AI and Automation Demand"],
    sources: [
      { id: "sap-sec-submissions", title: "SAP SE SEC submissions index", url: "https://data.sec.gov/submissions/CIK0001000184.json", note: "Primary SEC filing index for SAP annual Form 20-F documents." },
      { id: "sap-20f-2024", title: "SAP SE 2024 Form 20-F", url: "https://www.sec.gov/Archives/edgar/data/1000184/000110465925017815/sap-20241224x20f.htm", note: "Primary filing containing named product and subsidiary portfolio references, including SAP Signavio, SAP LeanIX, SAP Ariba, SAP Concur, SAP Fieldglass, and SAP SuccessFactors." },
      { id: "sap-home", title: "SAP corporate home", url: "https://www.sap.com/", note: "Company-level product and platform context." },
    ],
  },
  LIN: {
    theme: "materials",
    category: "Industrial Gases Platform (Source-backed)",
    sourceByTier: { company: "lin-10k-2024", "-2": "lin-10k-2024", "-1": "lin-10k-2024", "1": "lin-lindeus", "2": "lin-10k-2024" },
    sourceByName: {
      "Linde Engineering": "lin-10k-2024",
      "Praxair": "lin-10k-2024",
      "BOC India": "lin-10k-2024",
      "Linde Gas North America": "lin-10k-2024",
      "Linde U.S. Gas Applications": "lin-lindeus",
    },
    upstream: ["Linde Engineering", "Linde Gas North America", "Hydrogen Feedstock Inputs", "Helium Sourcing Streams", "Electricity and Utility Inputs"],
    services: ["Praxair", "BOC India", "Safety, Reliability, and Plant Operations Services", "Logistics and Distribution Services"],
    channels: ["Linde U.S. Gas Applications", "Chemicals and Refining Channels", "Healthcare and Life Sciences Channels", "Electronics and Manufacturing Channels"],
    demand: ["Industrial Production Gas Demand", "Healthcare Oxygen and Specialty Gas Demand", "Clean Energy and Hydrogen Demand"],
    sources: [
      { id: "lin-sec-submissions", title: "Linde SEC submissions index", url: "https://data.sec.gov/submissions/CIK0001707925.json", note: "Primary SEC filing index for annual reporting artifacts." },
      { id: "lin-10k-2024", title: "Linde FY2024 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/1707925/000162828025007990/lin-20241231.htm", note: "Primary filing with named references to Linde Engineering, Praxair legacy context, BOC India career history, and Linde Gas North America operating context." },
      { id: "lin-lindeus", title: "Linde U.S. market applications", url: "https://www.lindeus.com/", note: "Named channel context for U.S. gas applications and market routes." },
    ],
  },
  "PRX.AS": {
    theme: "commerce_cloud",
    category: "Platform Investment Portfolio (Source-backed)",
    sourceByTier: { company: "prosus-ir", "-2": "prosus-portfolio", "-1": "prosus-portfolio", "1": "prosus-portfolio", "2": "prosus-ir" },
    sourceByName: {
      Tencent: "prosus-portfolio",
      OLX: "prosus-portfolio",
      iFood: "prosus-portfolio",
      PayU: "prosus-portfolio",
      "Stack Overflow": "prosus-portfolio",
      "Delivery Hero": "prosus-portfolio",
      Swiggy: "prosus-portfolio",
    },
    upstream: ["Tencent", "OLX", "iFood", "PayU", "Stack Overflow"],
    services: ["Delivery Hero", "Swiggy", "Group Strategy and Portfolio Governance Services", "Treasury and Capital Markets Services"],
    channels: ["Classifieds and Marketplace Channels", "Food Delivery and E-commerce Channels", "Payments and Fintech Channels", "EdTech and Emerging Platform Channels"],
    demand: ["Digital Commerce Demand", "Consumer Fintech Demand", "Platform Monetization Demand"],
    sources: [
      { id: "prosus-ir", title: "Prosus investors", url: "https://www.prosus.com/investors", note: "Financial and portfolio context." },
      { id: "prosus-portfolio", title: "Prosus portfolio", url: "https://www.prosus.com/portfolio", note: "Named portfolio entities including Tencent, OLX, iFood, PayU, Stack Overflow, Delivery Hero, and Swiggy." },
      { id: "prosus-sustainability", title: "Prosus sustainability", url: "https://www.prosus.com/sustainability", note: "Governance and risk management context." },
    ],
  },
  "SIE.DE": {
    theme: "industrial",
    category: "Industrial Automation Platform (Source-backed)",
    sourceByTier: { company: "siemens-businesses", "-2": "siemens-businesses", "-1": "siemens-businesses", "1": "siemens-businesses", "2": "siemens-ir" },
    sourceByName: {
      "Digital Industries": "siemens-businesses",
      "Smart Infrastructure": "siemens-businesses",
      Mobility: "siemens-businesses",
      "Siemens Financial Services": "siemens-businesses",
      "Siemens Healthineers": "siemens-businesses",
    },
    upstream: ["Digital Industries", "Smart Infrastructure", "Mobility", "Siemens Financial Services", "Supplier Manufacturing Inputs"],
    services: ["Engineering and Digital Twin Services", "Lifecycle Maintenance and Service Contracts", "Cybersecurity and Compliance Services", "Treasury and Export Finance Services"],
    channels: ["Smart Infrastructure", "Digital Industries", "Mobility", "Siemens Healthineers"],
    demand: ["Industrial Automation Demand", "Electrification and Grid Modernization Demand", "Infrastructure Digitalization Demand"],
    sources: [
      { id: "siemens-ir", title: "Siemens investor relations", url: "https://www.siemens.com/investor/en.html", note: "Financial and segment demand context." },
      { id: "siemens-suppliers", title: "Siemens suppliers", url: "https://www.siemens.com/global/en/company/sustainability/sustainable-supply-chain/suppliers.html", note: "Supplier governance context." },
      { id: "siemens-businesses", title: "Siemens businesses", url: "https://www.siemens.com/global/en/company/about/businesses.html", note: "Named businesses including Digital Industries, Smart Infrastructure, Mobility, Siemens Financial Services, and Siemens Healthineers." },
    ],
  },
  PEP: {
    theme: "retail",
    category: "Global Food and Beverage (Source-backed)",
    sourceByTier: { company: "pep-10k-2025", "-2": "pep-10k-2025", "-1": "pep-10k-2025", "1": "pep-10k-2025", "2": "pep-10k-2025" },
    sourceByName: {
      "PepsiCo Beverages North America": "pep-10k-2025",
      "PepsiCo Foods North America": "pep-10k-2025",
      "Latin America Foods": "pep-10k-2025",
    },
    upstream: ["PepsiCo Beverages North America", "PepsiCo Foods North America", "Latin America Foods", "Packaging and Aluminum Inputs", "Flavor, Sweetener, and Ingredient Inputs"],
    services: ["Sustainable Agriculture and Sourcing Services", "Manufacturing and Quality Assurance Services", "Route-to-Market Logistics Services", "Treasury and Commodity Hedging Services"],
    channels: ["Grocery and Modern Retail Channels", "Convenience and Away-from-Home Channels", "Foodservice and QSR Channels", "Direct-to-Consumer and E-commerce Channels"],
    demand: ["Snacks Demand", "Beverage Demand", "Functional and Zero-Sugar Portfolio Demand"],
    sources: [
      { id: "pep-ir", title: "PepsiCo investor relations", url: "https://www.pepsico.com/investors", note: "Financial and demand context." },
      { id: "pep-sec-submissions", title: "PepsiCo SEC submissions index", url: "https://data.sec.gov/submissions/CIK0000077476.json", note: "Primary SEC filing index for current annual report artifacts." },
      { id: "pep-10k-2025", title: "PepsiCo FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/77476/000007747626000007/pep-20251227.htm", note: "Primary filing naming PepsiCo Beverages North America, PepsiCo Foods North America, and Latin America Foods operating structures." },
    ],
  },
  GEV: {
    theme: "energy",
    category: "Grid and Energy Equipment (Source-backed)",
    sourceByTier: { company: "gev-10k-2025", "-2": "gev-10k-2025", "-1": "gev-10k-2025", "1": "gev-10k-2025", "2": "gev-10k-2025" },
    sourceByName: {
      "Power Segment": "gev-10k-2025",
      "Wind Segment": "gev-10k-2025",
      "Electrification Segment": "gev-10k-2025",
      "Gas Power": "gev-10k-2025",
      "Hydro Power": "gev-10k-2025",
    },
    upstream: ["Power Segment", "Wind Segment", "Electrification Segment", "Gas Power", "Hydro Power"],
    services: ["Project Engineering and Grid Integration Services", "Field Service and Long-Term Maintenance Services", "Safety, Quality, and Compliance Services", "Treasury and Project Finance Services"],
    channels: ["Utility and Grid Operator Channels", "Renewable Developer Channels", "Power Generation Channels", "Industrial Electrification Channels"],
    demand: ["Grid Modernization Demand", "Electrification and Decarbonization Demand", "Utility Reliability and Capacity Demand"],
    sources: [
      { id: "gev-ir", title: "GE Vernova investor relations", url: "https://investors.gevernova.com/", note: "Financial and demand context." },
      { id: "gev-sec-submissions", title: "GE Vernova SEC submissions index", url: "https://data.sec.gov/submissions/CIK0001996810.json", note: "Primary SEC filing index for annual report artifacts." },
      { id: "gev-10k-2025", title: "GE Vernova FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/1996810/000199681026000015/gev-20251231.htm", note: "Primary filing naming Power Segment, Wind Segment, Electrification Segment, and Gas/Hydro Power structures." },
    ],
  },
  SHEL: {
    theme: "energy",
    category: "Integrated Energy (Source-backed)",
    sourceByTier: { company: "shel-20f-2024", "-2": "shel-20f-2024", "-1": "shel-20f-2024", "1": "shel-20f-2024", "2": "shel-20f-2024" },
    sourceByName: {
      "QatarEnergy LNG NFE": "shel-20f-2024",
      "QatarEnergy LNG NFS": "shel-20f-2024",
      "LNG Canada": "shel-20f-2024",
      "Integrated Gas": "shel-20f-2024",
      "Chemicals and Products": "shel-20f-2024",
      "Renewables and Energy Solutions": "shel-20f-2024",
    },
    upstream: ["QatarEnergy LNG NFE", "QatarEnergy LNG NFS", "LNG Canada", "Integrated Gas", "Chemicals and Products"],
    services: ["Renewables and Energy Solutions", "Global Trading and Risk Management Services", "Project Engineering and Operations Services", "Treasury and Commodity Hedging Services"],
    channels: ["Retail Fuels and Mobility Channels", "Industrial and Aviation Fuel Channels", "LNG and Gas Marketing Channels", "Chemicals and Lubricants Channels"],
    demand: ["Transportation Energy Demand", "Industrial Fuel and Feedstock Demand", "LNG and Power Demand"],
    sources: [
      { id: "shell-ir", title: "Shell investors", url: "https://www.shell.com/investors.html", note: "Financial and market context." },
      { id: "shell-sec-submissions", title: "Shell SEC submissions index", url: "https://data.sec.gov/submissions/CIK0001306965.json", note: "Primary SEC filing index for annual 20-F artifacts." },
      { id: "shel-20f-2024", title: "Shell plc 2024 Form 20-F", url: "https://www.sec.gov/Archives/edgar/data/1306965/000130696525000007/shel-20241231.htm", note: "Primary filing naming QatarEnergy LNG NFE/NFS, LNG Canada, Integrated Gas, Chemicals and Products, and Renewables and Energy Solutions." },
    ],
  },
  INTC: {
    theme: "chip_ai",
    category: "Integrated Semiconductor Platform (Source-backed)",
    sourceByTier: { company: "intc-10k-2025", "-2": "intc-foundry-1739", "-1": "intc-10k-2025", "1": "intc-10k-2025", "2": "intc-10k-2025" },
    sourceByName: {
      Synopsys: "intc-foundry-1739",
      Cadence: "intc-foundry-1739",
      "Siemens EDA": "intc-foundry-1739",
      MediaTek: "intc-foundry-1739",
      UMC: "intc-foundry-1739",
      "Client Computing Group (CCG)": "intc-10k-2025",
      "Data Center and AI Group (DCAI)": "intc-10k-2025",
      "Intel Foundry": "intc-10k-2025",
    },
    upstream: ["Synopsys", "Cadence", "Siemens EDA", "MediaTek", "UMC"],
    services: ["Intel Foundry Services", "Advanced Packaging Services", "Supply Chain Resilience and Quality Services", "Treasury and Capital Planning Services"],
    channels: ["Client Computing Group (CCG)", "Data Center and AI Group (DCAI)", "Intel Foundry", "Automotive and Edge Channels"],
    demand: ["PC and Enterprise Compute Demand", "AI and Data Center Acceleration Demand", "Foundry Outsourcing Demand"],
    sources: [
      { id: "intc-ir", title: "Intel investor relations", url: "https://www.intc.com/", note: "Financial and demand context." },
      { id: "intc-sec-submissions", title: "Intel SEC submissions index", url: "https://data.sec.gov/submissions/CIK0000050863.json", note: "Primary SEC filing index for annual report artifacts." },
      { id: "intc-10k-2025", title: "Intel FY2025 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/50863/000005086326000012/intc-20251227.htm", note: "Primary filing for operating segment disclosures including CCG, DCAI and Intel Foundry." },
      { id: "intc-foundry-1739", title: "Intel Foundry Direct Connect 2025 partner announcement", url: "https://www.intc.com/news-events/press-releases/detail/1739/intel-foundry-gathers-customers-and-partners-outlines", note: "Names ecosystem partners including Synopsys, Cadence, Siemens EDA, MediaTek and UMC collaboration." },
    ],
  },
  "0941.HK": {
    theme: "platform_cloud",
    category: "Telecom Network Platform (Source-backed)",
    sourceByTier: { company: "cm-ar2024", "-2": "cm-ar2024", "-1": "cm-ar2024", "1": "cm-ar2024", "2": "cm-ir" },
    sourceByName: {
      "China Tower Corporation Limited": "cm-ar2024",
      "China Mobile International Limited": "cm-ar2024",
      "MIGU Co., Ltd.": "cm-ar2024",
      "China Mobile Group Design Institute Co., Ltd.": "cm-ar2024",
      "China Mobile Hong Kong (BVI) Limited": "cm-ar2024",
    },
    upstream: ["China Tower Corporation Limited", "China Mobile International Limited", "MIGU Co., Ltd.", "China Mobile Group Design Institute Co., Ltd.", "China Mobile Hong Kong (BVI) Limited"],
    services: ["Network Operations and Optimization Services", "Enterprise Connectivity and Cloud Services", "Regulatory and Compliance Services", "Treasury and Procurement Services"],
    channels: ["Consumer Mobile Service Channels", "Enterprise and Government Channels", "Home Broadband and Integrated Service Channels", "Digital Platform and Value-Added Channels"],
    demand: ["Mobile Data Demand", "Enterprise Connectivity Demand", "Digital Service Ecosystem Demand"],
    sources: [
      { id: "cm-ir", title: "China Mobile investor relations", url: "https://www.chinamobileltd.com/en/ir/", note: "Financial and segment demand context." },
      { id: "cm-reports", title: "China Mobile annual/interim reports", url: "https://www.chinamobileltd.com/en/ir/reports.php", note: "Official annual report repository." },
      { id: "cm-ar2024", title: "China Mobile 2024 Annual Report", url: "https://www.chinamobileltd.com/en/ir/reports/ar2024.pdf", note: "Names key ecosystem entities including China Tower Corporation Limited, China Mobile International Limited and MIGU Co., Ltd." },
    ],
  },
  MUFG: {
    theme: "banking",
    category: "Global Banking (Source-backed)",
    sourceByTier: { company: "mufg-major-companies", "-2": "mufg-major-companies", "-1": "mufg-major-companies", "1": "mufg-ir", "2": "swift-payments" },
    sourceByName: {
      "MUFG Bank": "mufg-major-companies",
      "Mitsubishi UFJ Trust and Banking": "mufg-major-companies",
      "Mitsubishi UFJ Morgan Stanley Securities": "mufg-major-companies",
      "Morgan Stanley MUFG Securities": "mufg-major-companies",
      "Mitsubishi UFJ Securities Holdings": "mufg-major-companies",
    },
    upstream: ["MUFG Bank", "Mitsubishi UFJ Trust and Banking", "Mitsubishi UFJ Morgan Stanley Securities", "Morgan Stanley MUFG Securities", "Mitsubishi UFJ Securities Holdings"],
    services: ["Corporate and Investment Banking Services", "Wealth and Asset Management Services", "Regulatory, AML, and Risk Services", "Treasury and Liquidity Services"],
    channels: ["Retail Banking Channels", "Corporate and Institutional Channels", "Global Markets Channels", "International Banking Channels"],
    demand: ["Corporate Treasury Demand", "Consumer Banking Demand", "Cross-border Finance Demand"],
    sources: [
      { id: "mufg-ir", title: "MUFG investor relations", url: "https://www.mufg.jp/english/ir/", note: "Financial and market context." },
      { id: "mufg-major-companies", title: "MUFG major related companies", url: "https://www.mufg.jp/english/profile/biz_and_network/group/index.html", note: "Official list of major related companies including MUFG Bank, Mitsubishi UFJ Trust and Banking, and Mitsubishi UFJ Morgan Stanley Securities / Morgan Stanley MUFG Securities." },
      { id: "swift-payments", title: "SWIFT payments network overview", url: "https://www.swift.com/payments", note: "Payments infrastructure context." },
    ],
  },
  "CBA.AX": {
    theme: "banking",
    category: "Universal Banking (Source-backed)",
    sourceByTier: { company: "cba-ar2025", "-2": "cba-modern-slavery-2022", "-1": "cba-modern-slavery-2022", "1": "cba-ar2025", "2": "swift-payments" },
    sourceByName: {
      CommSec: "cba-modern-slavery-2022",
      "ASB Bank": "cba-modern-slavery-2022",
      Bankwest: "cba-modern-slavery-2022",
      NetBank: "cba-ar2025",
      CommBiz: "cba-ar2025",
      "CommBank Yello": "cba-ar2025",
    },
    upstream: ["CommSec", "ASB Bank", "Bankwest", "SWIFT Network", "Cloud and Cybersecurity Inputs"],
    services: ["Retail and Business Banking Services", "Wealth and Insurance Services", "Risk, Compliance, and Financial Crime Services", "Treasury and Funding Services"],
    channels: ["NetBank", "CommBiz", "CommBank Yello", "Institutional and Market Channels"],
    demand: ["Household Credit and Deposit Demand", "SME and Business Finance Demand", "Digital Banking Engagement Demand"],
    sources: [
      { id: "cba-ir", title: "Commonwealth Bank investor centre", url: "https://www.commbank.com.au/about-us/investors.html", note: "Financial and segment demand context." },
      { id: "cba-ar2025", title: "Commonwealth Bank 2025 Annual Report", url: "https://www.commbank.com.au/about-us/investors/annual-reports/annual-report-2025.html", note: "Current annual report and digital platform context (NetBank, CommBiz, CommBank Yello)." },
      { id: "cba-modern-slavery-2022", title: "CBA Modern Slavery Statement 2022", url: "https://www.commbank.com.au/content/dam/commbank-assets/about-us/2022-12/cba-modern-slavery-statement-2022.pdf", note: "States brand portfolio including CommSec, ASB and Bankwest." },
      { id: "swift-payments", title: "SWIFT payments network overview", url: "https://www.swift.com/payments", note: "Payments and settlement infrastructure context." },
    ],
  },
  "ITX.MC": {
    theme: "retail",
    category: "Global Apparel Retail (Source-backed)",
    sourceByTier: { company: "itx-annual-report-2024", "-2": "itx-suppliers", "-1": "itx-suppliers", "1": "itx-brands", "2": "itx-annual-report-2024" },
    sourceByName: {
      Zara: "itx-brands",
      "Pull&Bear": "itx-brands",
      "Massimo Dutti": "itx-brands",
      Bershka: "itx-brands",
      "Zara Home": "itx-brands",
    },
    upstream: ["Textile, Cotton, and Fabric Inputs", "Garment Manufacturing Partner Inputs", "Dyeing, Finishing, and Trim Inputs", "Packaging and Labeling Inputs", "Regional Logistics and Distribution Inputs"],
    services: ["Supplier Auditing and Responsible Sourcing Services", "Quality Control and Product Compliance Services", "Inventory and Omnichannel Logistics Services", "Treasury and FX Risk Services"],
    channels: ["Zara", "Pull&Bear", "Massimo Dutti", "Bershka"],
    demand: ["Zara Home", "Fast Fashion Demand", "Omnichannel Retail Demand"],
    sources: [
      { id: "itx-ir", title: "Inditex investor relations", url: "https://www.inditex.com/itxcomweb/en/investors", note: "Financial and demand context." },
      { id: "itx-annual-report-2024", title: "Inditex Annual Report 2024", url: "https://static.inditex.com/annualreport2024/en/", note: "Primary annual report for business and demand context." },
      { id: "itx-suppliers", title: "Inditex suppliers", url: "https://www.inditex.com/itxcomweb/en/suppliers", note: "Supplier governance and sourcing framework context." },
      { id: "itx-brands", title: "Inditex brands", url: "https://www.inditex.com/itxcomweb/en/our-brands", note: "Brand and channel portfolio context." },
    ],
  },
  "RELIANCE.NS": {
    theme: "energy",
    category: "Integrated Energy and Consumer Platforms (Source-backed)",
    sourceByTier: { company: "ril-ir", "-2": "ril-annual", "-1": "ril-annual", "1": "ril-businesses", "2": "ril-ir" },
    upstream: ["Reliance Retail", "Jio-bp", "JioMart", "Reliance Jio Infocomm", "Independent Retail and FMCG Sourcing Partners"],
    services: ["Refining and Operations Optimization Services", "Digital Network Operations Services", "Logistics and Distribution Services", "Treasury and Commodity Risk Services"],
    channels: ["Jio Consumer and Enterprise Channels", "Reliance Retail Channels", "Oil-to-Chemicals Industrial Channels", "Energy and Petrochemical Trading Channels"],
    demand: ["Digital Consumer Platform Demand", "Organized Retail Demand", "Industrial Energy and Materials Demand"],
    sources: [
      { id: "ril-ir", title: "Reliance Industries investor relations", url: "https://www.ril.com/investors.aspx", note: "Financial and segment demand context." },
      { id: "ril-annual", title: "Reliance annual report", url: "https://www.ril.com/InvestorRelations/FinancialReporting.aspx", note: "Operating and risk disclosures." },
      { id: "ril-businesses", title: "Reliance businesses", url: "https://www.ril.com/OurBusinesses.aspx", note: "Business portfolio and channel context." },
    ],
  },
  NVO: {
    theme: "pharma",
    category: "Biopharma Pipeline (Source-backed)",
    sourceByTier: { company: "novo-ir", "-2": "novo-suppliers", "-1": "novo-sustainability", "1": "novo-products", "2": "novo-ir" },
    upstream: ["Catalent Group", "Novonesis A/S", "Wegovy®", "External Manufacturing Partners", "Cold-chain and Packaging Suppliers"],
    services: ["Supplier Governance and Responsible Sourcing Services", "Regulatory Affairs and Pharmacovigilance Services", "Global Distribution and Market Access Services", "Treasury and Risk Management Services"],
    channels: ["Hospital and Specialist Care Channels", "Retail and Specialty Pharmacy Channels", "Government and Tender Channels", "International Partner Distribution Channels"],
    demand: ["Diabetes Care Demand", "Obesity Care Demand", "Chronic Disease Therapy Demand"],
    sources: [
      { id: "novo-ir", title: "Novo Nordisk investors", url: "https://www.novonordisk.com/investors.html", note: "Financial and demand context." },
      { id: "novo-products", title: "Novo Nordisk products", url: "https://www.novonordisk.com/products.html", note: "Portfolio and channel context." },
      { id: "novo-suppliers", title: "Novo Nordisk sustainability in the value chain", url: "https://www.novonordisk.com/sustainable-business/value-chain.html", note: "Supplier and responsible sourcing context." },
    ],
  },
  VZ: {
    theme: "platform_cloud",
    category: "Telecom Network Platform (Source-backed)",
    sourceByTier: { company: "vz-ir", "-2": "vz-sec", "-1": "vz-sec", "1": "vz-network", "2": "vz-ir" },
    upstream: ["American Tower Corporation", "Verizon Consumer Group", "Verizon Business Group", "Network Equipment and Infrastructure Suppliers", "Cloud and Edge Technology Partners"],
    services: ["Network Operations and Field Service", "Enterprise Connectivity and Managed Services", "Cybersecurity and Fraud Prevention Services", "Treasury and Procurement Services"],
    channels: ["Consumer Wireless Channels", "Fiber and Broadband Channels", "Enterprise and Government Channels", "Wholesale and IoT Channels"],
    demand: ["Mobile Data Demand", "Enterprise Connectivity Demand", "Broadband and Fixed Wireless Demand"],
    sources: [
      { id: "vz-ir", title: "Verizon investor relations", url: "https://www.verizon.com/about/investors", note: "Financial and segment demand context." },
      { id: "vz-sec", title: "Verizon SEC filings", url: "https://www.verizon.com/about/investors/sec-filings", note: "Operational and risk disclosures." },
      { id: "vz-network", title: "Verizon network and technology", url: "https://www.verizon.com/about/our-company/network-and-technology", note: "Service delivery and channel context." },
    ],
  },
  C: {
    theme: "banking",
    category: "Global Banking (Source-backed)",
    sourceByTier: { company: "citi-ir", "-2": "citi-filings", "-1": "citi-filings", "1": "citi-business", "2": "swift-payments" },
    upstream: ["Treasury and Trade Solutions (TTS)", "Securities Services", "The Home Depot", "Core Banking and Technology Platforms", "Cloud and Cybersecurity Partners"],
    services: ["Transaction Banking and Treasury Services", "Regulatory and Financial Crime Services", "Funding and Liquidity Management Services", "Wealth and Advisory Services"],
    channels: ["Retail Banking and Card Channels", "Institutional Client Channels", "Treasury and Trade Solutions Channels", "Private Bank and Wealth Channels"],
    demand: ["Consumer Banking Demand", "Corporate Treasury Demand", "Cross-border Finance Demand"],
    sources: [
      { id: "citi-ir", title: "Citigroup investor relations", url: "https://www.citigroup.com/global/investors", note: "Financial and demand context." },
      { id: "citi-filings", title: "Citigroup SEC filings", url: "https://www.citigroup.com/global/investors/sec-filings", note: "Risk and operating disclosures." },
      { id: "citi-business", title: "Citi businesses", url: "https://www.citigroup.com/global/about-us/global-presence", note: "Channel footprint and business context." },
    ],
  },
  AMGN: {
    theme: "pharma",
    category: "Biopharma Pipeline (Source-backed)",
    sourceByTier: { company: "amgn-ir", "-2": "amgn-suppliers", "-1": "amgn-sec", "1": "amgn-products", "2": "amgn-ir" },
    upstream: ["Horizon Therapeutics plc", "ChemoCentryx, Inc.", "AstraZeneca plc", "External Manufacturing and Fill-Finish Partners", "Cold-chain and Distribution Suppliers"],
    services: ["Supplier Qualification and Procurement Services", "Regulatory, Quality, and Safety Services", "Global Distribution and Access Services", "Treasury and Portfolio Risk Services"],
    channels: ["Hospital and Specialty Care Channels", "Retail and Specialty Pharmacy Channels", "Partner and Biosimilar Channels", "International Distribution Channels"],
    demand: ["Oncology and Inflammation Demand", "Rare Disease Therapy Demand", "Biosimilar and Specialty Medicine Demand"],
    sources: [
      { id: "amgn-ir", title: "Amgen investor relations", url: "https://investors.amgen.com/", note: "Financial and demand context." },
      { id: "amgn-sec", title: "Amgen SEC filings", url: "https://investors.amgen.com/financials/sec-filings/default.aspx", note: "Risk and operating disclosures." },
      { id: "amgn-suppliers", title: "Amgen suppliers", url: "https://www.amgen.com/about/responsibility/suppliers", note: "Supplier governance and sourcing context." },
    ],
  },
  TXN: {
    theme: "chip_ai",
    category: "Analog Semiconductor Platform (Source-backed)",
    sourceByTier: { company: "txn-ir", "-2": "txn-sec", "-1": "txn-supply", "1": "txn-products", "2": "txn-ir" },
    upstream: ["Industrial Market", "Automotive Market", "Personal Electronics Market", "Wafer Fabrication and Materials Suppliers", "Assembly and Test Partners"],
    services: ["Manufacturing Process and Quality Services", "Supply Chain Resilience Services", "Field Applications and Technical Services", "Treasury and Working Capital Services"],
    channels: ["Industrial and Automotive OEM Channels", "Personal Electronics and Communications Channels", "Enterprise Infrastructure Channels", "Distribution Partner Channels"],
    demand: ["Industrial Automation Demand", "Automotive Electrification Demand", "Embedded Analog Demand"],
    sources: [
      { id: "txn-ir", title: "Texas Instruments investor relations", url: "https://investor.ti.com/", note: "Financial and demand context." },
      { id: "txn-sec", title: "Texas Instruments SEC filings", url: "https://investor.ti.com/financial-information/sec-filings/default.aspx", note: "Operational and risk disclosures. Industrial and automotive markets represent approximately 70% of revenue." },
      { id: "txn-supply", title: "Texas Instruments supply chain responsibility", url: "https://www.ti.com/about-ti/corporate-responsibility/supply-chain.html", note: "Supplier and supply resilience context." },
    ],
  },
  T: {
    theme: "platform_cloud",
    category: "Telecom Network Platform (Source-backed)",
    sourceByTier: { company: "att-ir", "-2": "att-sec", "-1": "att-sec", "1": "att-network", "2": "att-ir" },
    upstream: ["Mobility", "Business Wireline", "Consumer Wireline", "Network Equipment and Infrastructure Suppliers", "Cloud and Security Technology Partners"],
    services: ["Network Operations and Field Maintenance", "Customer Care and Billing Services", "Cybersecurity and Fraud Protection Services", "Treasury and Procurement Services"],
    channels: ["Consumer Wireless Channels", "Fiber Broadband Channels", "Business and Enterprise Channels", "Public Sector and Wholesale Channels"],
    demand: ["Mobile Data Demand", "Broadband Connectivity Demand", "Enterprise Network Demand"],
    sources: [
      { id: "att-ir", title: "AT&T investor relations", url: "https://investors.att.com/", note: "Financial and demand context." },
      { id: "att-sec", title: "AT&T SEC filings", url: "https://investors.att.com/financial-reports/sec-filings", note: "Risk and operating disclosures. Communications segment includes Mobility, Business Wireline, and Consumer Wireline reporting units." },
      { id: "att-network", title: "AT&T network", url: "https://www.att.com/5g/", note: "Service and channel context." },
    ],
  },
  BHP: {
    theme: "materials",
    category: "Mining and Materials Platform (Source-backed)",
    sourceByTier: { company: "bhp-ir", "-2": "bhp-suppliers", "-1": "bhp-ir", "1": "bhp-markets", "2": "bhp-ir" },
    upstream: ["Olympic Dam", "Escondida", "Western Australia Iron Ore", "Mining Equipment and Consumable Suppliers", "Rail, Port, and Export Infrastructure Partners"],
    services: ["Operations, Processing, and Maintenance Services", "Safety, Environmental, and Compliance Services", "Shipping and Commodity Logistics Services", "Treasury and Commodity Risk Services"],
    channels: ["Iron Ore and Steelmaking Channels", "Copper and Battery Metals Channels", "Coal and Energy Commodity Channels", "Global Industrial Customer Channels"],
    demand: ["Steel Production Demand", "Energy Transition Metals Demand", "Industrial Commodity Demand"],
    sources: [
      { id: "bhp-ir", title: "BHP investors", url: "https://www.bhp.com/investors", note: "Financial and commodity demand context." },
      { id: "bhp-suppliers", title: "BHP suppliers", url: "https://www.bhp.com/suppliers", note: "Supplier and procurement framework context." },
      { id: "bhp-markets", title: "BHP operations", url: "https://www.bhp.com/what-we-do", note: "Operating assets include Olympic Dam, Escondida, Spence, Carrapateena (copper) and Western Australia Iron Ore." },
    ],
  },
  KLAC: {
    theme: "semi_equipment",
    category: "Semiconductor Process Control (Source-backed)",
    sourceByTier: { company: "klac-ir", "-2": "klac-sec", "-1": "klac-supply", "1": "klac-products", "2": "klac-ir" },
    upstream: ["TSMC", "Samsung Electronics", "Intel Foundry", "Precision Optics and Sensor Suppliers", "Electronics and Motion Control Suppliers"],
    services: ["Installation and Field Service Programs", "Process Control Software and Analytics Services", "Reliability and Quality Services", "Treasury and Working Capital Services"],
    channels: ["Foundry Customer Channels", "Memory Customer Channels", "Logic and Advanced Packaging Channels", "Service and Upgrade Channels"],
    demand: ["Yield Management Demand", "Node Transition Demand", "Advanced Packaging Process Control Demand"],
    sources: [
      { id: "klac-ir", title: "KLA investor relations", url: "https://ir.kla.com/", note: "Financial and demand context." },
      { id: "klac-sec", title: "KLA SEC filings", url: "https://ir.kla.com/financial-information/sec-filings/default.aspx", note: "Risk and operating disclosures." },
      { id: "klac-supply", title: "KLA sustainability", url: "https://www.kla.com/company/sustainability", note: "Supplier and operations governance context." },
    ],
  },
  ABT: {
    theme: "pharma",
    category: "Healthcare Products Platform (Source-backed)",
    sourceByTier: { company: "abt-ir", "-2": "abt-sec", "-1": "abt-sec", "1": "abt-products", "2": "abt-ir" },
    upstream: ["Medical Devices", "Diagnostic Products", "FreeStyle Libre", "Medical Device and Sensor Component Suppliers", "Nutrition Ingredient and Packaging Suppliers"],
    services: ["Regulatory, Quality, and Compliance Services", "Global Supply and Cold-Chain Services", "Clinical and Product Support Services", "Treasury and Working Capital Services"],
    channels: ["Hospital and Laboratory Channels", "Retail Pharmacy and Consumer Health Channels", "Nutrition and Specialty Care Channels", "International Distribution Channels"],
    demand: ["Diagnostics Demand", "Medical Device Demand", "Nutrition and Consumer Health Demand"],
    sources: [
      { id: "abt-ir", title: "Abbott investor relations", url: "https://www.abbottinvestor.com/", note: "Financial and segment demand context." },
      { id: "abt-sec", title: "Abbott SEC filings", url: "https://www.abbottinvestor.com/financial-information/sec-filings/default.aspx", note: "Operational and risk disclosures. Four reportable segments: Medical Devices, Diagnostic Products, Nutritional Products, Established Pharmaceutical Products." },
      { id: "abt-products", title: "Abbott products", url: "https://www.abbott.com/products.html", note: "Portfolio and channel context. FreeStyle Libre is part of Diabetes Care within Medical Devices segment." },
    ],
  },
  "601628.SS": {
    theme: "banking",
    category: "Life Insurance and Financial Services (Source-backed)",
    sourceByTier: { company: "clife-ir", "-2": "clife-ir", "-1": "clife-annual", "1": "clife-business", "2": "swift-payments" },
    upstream: ["Actuarial and Risk Modeling Inputs", "Core Insurance Platform Inputs", "Medical and Claims Data Inputs", "Asset Management and Market Data Inputs"],
    services: ["Underwriting and Claims Management Services", "Regulatory and Solvency Services", "Investment and Asset Allocation Services", "Treasury and Settlement Services"],
    channels: ["Agency and Advisor Channels", "Bancassurance Channels", "Group and Corporate Insurance Channels", "Digital and Direct Channels"],
    demand: ["Life Protection Demand", "Retirement and Savings Demand", "Health and Accident Coverage Demand"],
    sources: [
      { id: "clife-ir", title: "China Life investor relations", url: "https://www.chinalife.com.cn/chinalifeen/ir/list", note: "Financial and disclosure context." },
      { id: "clife-annual", title: "China Life annual reports", url: "https://www.chinalife.com.cn/chinalifeen/ir/reports", note: "Risk and operating disclosures." },
      { id: "clife-business", title: "China Life business overview", url: "https://www.chinalife.com.cn/chinalifeen/about/overview", note: "Product and channel context." },
    ],
  },
  RIO: {
    theme: "materials",
    category: "Mining and Materials Platform (Source-backed)",
    sourceByTier: { company: "rio-ir", "-2": "rio-suppliers", "-1": "rio-ir", "1": "rio-markets", "2": "rio-ir" },
    upstream: ["Iron Ore", "Aluminium", "Copper", "Heavy Equipment and Consumable Inputs", "Rail, Port, and Shipping Infrastructure Inputs"],
    services: ["Operations and Processing Services", "Safety, Environmental, and Compliance Services", "Bulk Shipping and Logistics Services", "Treasury and Commodity Risk Services"],
    channels: ["Iron Ore and Steelmaking Channels", "Aluminum and Materials Channels", "Copper and Energy Transition Channels", "Global Industrial Customer Channels"],
    demand: ["Steel and Construction Demand", "Energy Transition Metals Demand", "Industrial Materials Demand"],
    sources: [
      { id: "rio-ir", title: "Rio Tinto investors", url: "https://www.riotinto.com/invest", note: "Financial and demand context." },
      { id: "rio-suppliers", title: "Rio Tinto suppliers", url: "https://www.riotinto.com/suppliers", note: "Supplier and procurement framework context." },
      { id: "rio-markets", title: "Rio Tinto operations", url: "https://www.riotinto.com/operations", note: "Operating and downstream demand context. Iron ore, aluminium, and copper are core commodities." },
    ],
  },
  NEE: {
    theme: "energy",
    category: "Utility and Renewable Energy Platform (Source-backed)",
    sourceByTier: { company: "nee-ir", "-2": "nee-sec", "-1": "nee-sec", "1": "nee-business", "2": "nee-ir" },
    upstream: ["Florida Power & Light", "Renewable Energy", "Generation Fuel and Resource Inputs", "Grid, Transmission, and Storage Inputs", "Turbine, Solar, and Equipment Inputs"],
    services: ["Plant Operations and Maintenance Services", "Grid Reliability and Balancing Services", "Regulatory and Environmental Services", "Treasury and Project Finance Services"],
    channels: ["Regulated Utility Customer Channels", "Wholesale Power and Capacity Channels", "Corporate Renewable Offtake Channels", "Retail and Commercial Service Channels"],
    demand: ["Electricity Demand", "Renewable Energy Demand", "Grid Reliability Demand"],
    sources: [
      { id: "nee-ir", title: "NextEra Energy investor relations", url: "https://www.investor.nexteraenergy.com/", note: "Financial and demand context. FPL is America's largest electric utility." },
      { id: "nee-sec", title: "NextEra SEC filings", url: "https://www.investor.nexteraenergy.com/financials/sec-filings/default.aspx", note: "Operational and risk disclosures." },
      { id: "nee-business", title: "NextEra business profile", url: "https://www.nexteraenergy.com/company.html", note: "Channel and operating model context." },
    ],
  },
  TMO: {
    theme: "pharma",
    category: "Life Sciences Tools Platform (Source-backed)",
    sourceByTier: { company: "tmo-ir", "-2": "tmo-suppliers", "-1": "tmo-sec", "1": "tmo-business", "2": "tmo-ir" },
    upstream: ["Life Sciences Solutions", "Analytical Instruments", "Reagents, Chemicals, and Consumable Inputs", "Bioprocess and Manufacturing Inputs", "Laboratory Supply and Packaging Inputs"],
    services: ["Laboratory and Clinical Support Services", "Regulatory and Quality Services", "Global Distribution and Cold-Chain Services", "Treasury and Procurement Services"],
    channels: ["Pharma and Biotech Channels", "Academic and Government Lab Channels", "Clinical and Hospital Channels", "Industrial and Applied Market Channels"],
    demand: ["Biopharma R&D Demand", "Clinical Diagnostics Demand", "Lab Productivity and Automation Demand"],
    sources: [
      { id: "tmo-ir", title: "Thermo Fisher investor relations", url: "https://ir.thermofisher.com/", note: "Financial and demand context." },
      { id: "tmo-sec", title: "Thermo Fisher SEC filings", url: "https://ir.thermofisher.com/financial-information/sec-filings/default.aspx", note: "Risk and operating disclosures." },
      { id: "tmo-suppliers", title: "Thermo Fisher suppliers", url: "https://www.thermofisher.com/us/en/home/about-us/suppliers.html", note: "Supplier and sourcing framework context." },
    ],
  },
  "DTE.DE": {
    theme: "platform_cloud",
    category: "Telecom Network Platform (Source-backed)",
    sourceByTier: { company: "dt-ir", "-2": "dt-suppliers", "-1": "dt-ir", "1": "dt-business", "2": "dt-ir" },
    upstream: ["FMC Customers", "Germany Segment", "Radio and Core Network Inputs", "Fiber, Backbone, and Data Center Inputs", "Spectrum and Tower Inputs"],
    services: ["Network Operations and Service Assurance", "Enterprise Connectivity and ICT Services", "Cybersecurity and Compliance Services", "Treasury and Procurement Services"],
    channels: ["Consumer Mobile and Broadband Channels", "Enterprise and Public Sector Channels", "Wholesale and International Carrier Channels", "Digital Service Channels"],
    demand: ["Mobile Data Demand", "Broadband and Converged Service Demand", "Enterprise Connectivity Demand"],
    sources: [
      { id: "dt-ir", title: "Deutsche Telekom investor relations", url: "https://www.telekom.com/en/investor-relations", note: "Financial and demand context. FMC offerings reached 14.6M customers." },
      { id: "dt-suppliers", title: "Deutsche Telekom suppliers", url: "https://www.telekom.com/en/company/suppliers", note: "Supplier and procurement context." },
      { id: "dt-business", title: "Deutsche Telekom company profile", url: "https://www.telekom.com/en/company", note: "Business and channel context." },
    ],
  },
  SAN: {
    theme: "banking",
    category: "Global Banking (Source-backed)",
    sourceByTier: { company: "san-ir", "-2": "san-reports", "-1": "san-reports", "1": "san-business", "2": "swift-payments" },
    upstream: ["Digital Consumer Bank", "Santander Consumer Finance", "Core Banking and Digital Platform Inputs", "Credit and Risk Data Inputs", "Payments and Settlement Infrastructure Inputs"],
    services: ["Retail and Commercial Banking Services", "Regulatory and Risk Management Services", "Treasury and Liquidity Services", "Wealth and Insurance Services"],
    channels: ["Consumer Banking Channels", "SME and Corporate Channels", "Global Payments and Trade Channels", "Digital and Mobile Banking Channels"],
    demand: ["Consumer Credit and Deposit Demand", "SME Finance Demand", "International Banking Demand"],
    sources: [
      { id: "san-ir", title: "Santander investor relations", url: "https://www.santander.com/en/shareholders-and-investors", note: "Financial and demand context." },
      { id: "san-reports", title: "Santander annual reports", url: "https://www.santander.com/en/shareholders-and-investors/financial-and-economic-information/annual-report", note: "Risk and operating disclosures. Digital Consumer Bank and Santander Consumer Finance are key segments." },
      { id: "san-business", title: "Santander businesses", url: "https://www.santander.com/en/about-us", note: "Channel and business structure context." },
    ],
  },
  GILD: {
    theme: "pharma",
    category: "Biopharma Pipeline (Source-backed)",
    sourceByTier: { company: "gild-ir", "-2": "gild-suppliers", "-1": "gild-sec", "1": "gild-products", "2": "gild-ir" },
    upstream: ["HIV Franchise", "Oncology", "API and Biologics Manufacturing Inputs", "External Manufacturing and Fill-Finish Inputs", "Clinical Research and Trial Inputs"],
    services: ["Regulatory and Quality Management Services", "Supplier Governance and Responsible Sourcing", "Global Distribution and Market Access Services", "Treasury and Portfolio Risk Services"],
    channels: ["Hospital and Specialty Care Channels", "Retail and Specialty Pharmacy Channels", "Government and Global Health Channels", "International Distribution Channels"],
    demand: ["Antiviral Treatment Demand", "Oncology Therapy Demand", "Specialty Biopharma Demand"],
    sources: [
      { id: "gild-ir", title: "Gilead investor relations", url: "https://investors.gilead.com/", note: "Financial and demand context. HIV franchise $19.6B, Oncology $3.3B in 2024." },
      { id: "gild-sec", title: "Gilead SEC filings", url: "https://investors.gilead.com/financials/sec-filings/default.aspx", note: "Risk and operating disclosures." },
      { id: "gild-suppliers", title: "Gilead supply chain responsibility", url: "https://www.gilead.com/purpose/planet/supply-chain", note: "Supplier governance and sourcing context." },
    ],
  },
  DIS: {
    theme: "platform_ads",
    category: "Media and Entertainment Platform (Source-backed)",
    sourceByTier: { company: "dis-ir", "-2": "dis-sec", "-1": "dis-sec", "1": "dis-business", "2": "dis-ir" },
    upstream: ["Streaming Services", "Theme Parks", "Entertainment", "Content Production and Studio Inputs", "Streaming Infrastructure and CDN Inputs"],
    services: ["Distribution and Platform Operations Services", "Marketing and Audience Analytics Services", "Cybersecurity and Compliance Services", "Treasury and Rights Management Services"],
    channels: ["Streaming and Direct-to-Consumer Channels", "Linear Networks and Distribution Channels", "Theatrical and Studio Channels", "Parks, Experiences, and Consumer Products Channels"],
    demand: ["Streaming Subscription Demand", "Box Office and Content Demand", "Parks and Experiences Demand"],
    sources: [
      { id: "dis-ir", title: "Walt Disney investor relations", url: "https://thewaltdisneycompany.com/investor-relations/", note: "Financial and demand context. 150M+ streaming subscribers." },
      { id: "dis-sec", title: "Walt Disney SEC filings", url: "https://thewaltdisneycompany.com/investor-relations/#sec-filings", note: "Risk and operating disclosures." },
      { id: "dis-business", title: "Walt Disney company profile", url: "https://thewaltdisneycompany.com/about/", note: "Business segment and channel context." },
    ],
  },
  APH: {
    theme: "industrial",
    category: "Interconnect Components Platform (Source-backed)",
    sourceByTier: { company: "aph-ir", "-2": "aph-sec", "-1": "aph-sec", "1": "aph-markets", "2": "aph-ir" },
    upstream: ["Communications Solutions", "Harsh Environment Solutions", "Copper, Resin, and Connector Material Inputs", "Precision Manufacturing Component Inputs", "Cable and Antenna Sub-assembly Inputs"],
    services: ["Engineering and Product Customization Services", "Quality, Compliance, and Reliability Services", "Global Distribution and Fulfillment Services", "Treasury and Procurement Services"],
    channels: ["Automotive and Transportation Channels", "IT Datacom and Mobile Device Channels", "Industrial and Aerospace Channels", "Broadband and Communication Infrastructure Channels"],
    demand: ["High-speed Connectivity Demand", "Automotive Electronics Demand", "Industrial Interconnect Demand"],
    sources: [
      { id: "aph-ir", title: "Amphenol investor relations", url: "https://investors.amphenol.com/", note: "Financial and demand context." },
      { id: "aph-sec", title: "Amphenol SEC filings", url: "https://investors.amphenol.com/financial-information/sec-filings/default.aspx", note: "Risk and operating disclosures." },
      { id: "aph-markets", title: "Amphenol markets", url: "https://www.amphenol.com/markets", note: "Customer and channel context. Communications Solutions segment $6.3B in 2024." },
    ],
  },
};

const TOP20_DEEP_THEME_BY_SYMBOL = {
  NVDA: "chip_ai",
  AAPL: "consumer_hardware",
  GOOG: "platform_cloud",
  MSFT: "platform_cloud",
  AMZN: "commerce_cloud",
  TSM: "foundry",
  META: "platform_ads",
  "2222.SR": "energy",
  AVGO: "chip_network",
  TSLA: "automotive_ev",
  "BRK-B": "holding_finance",
  WMT: "retail",
  LLY: "pharma",
  "005930.KS": "consumer_hardware",
  JPM: "banking",
  XOM: "energy",
  V: "payments",
  TCEHY: "platform_ads",
  JNJ: "pharma",
  ASML: "semi_equipment",
};

const TOP20_DEEP_THEME_BY_LAYER = {
  "-3": "energy",
  "-2": "materials",
  "-1": "industrial",
  "0": "chip_ai",
  "1": "consumer_hardware",
  "2": "platform_ads",
  "3": "platform_cloud",
  "4": "banking",
  "5": "pharma",
  "6": "retail",
};

const DEEP_THEME_DATA = {
  chip_ai: {
    category: "AI Semiconductor Stack",
    upstream: ["TSMC", "SK Hynix", "ASE Technology", "Amkor", "Micron"],
    services: ["DHL Global Forwarding", "Aon Risk Services", "JPMorgan Treasury", "Synopsys EDA"],
    channels: ["Microsoft Azure", "AWS", "Oracle Cloud", "CoreWeave"],
    demand: ["Enterprise AI Training Demand", "Inference Workload Demand", "Sovereign AI Programs"],
  },
  foundry: {
    category: "Foundry Manufacturing",
    upstream: ["ASML", "Tokyo Electron", "Applied Materials", "Lam Research", "Shin-Etsu"],
    services: ["Linde Specialty Gases", "Air Liquide", "Mitsui Logistics", "Chubb Engineering Risk"],
    channels: ["NVIDIA", "Apple Silicon Programs", "AMD", "Broadcom"],
    demand: ["Advanced Node Demand", "AI Accelerator Demand", "Mobile SoC Demand"],
  },
  chip_network: {
    category: "Custom Silicon & Networking",
    upstream: ["TSMC", "Amkor", "KLA", "Marvell Ecosystem Suppliers", "Substrate Makers"],
    services: ["FedEx Cross-Border", "Allianz Commercial", "Goldman Sachs Treasury", "Cadence Design"],
    channels: ["Hyperscaler ASIC Programs", "Data Center Networking OEMs", "Telecom Infra Buyers"],
    demand: ["Cloud Networking Growth", "AI Fabric Demand", "Enterprise Switching Upgrades"],
  },
  semi_equipment: {
    category: "Semiconductor Equipment",
    upstream: ["Carl Zeiss SMT", "TRUMPF", "Cymer", "High-precision Mechatronics Suppliers", "Vacuum Component Vendors"],
    services: ["Siemens Financing", "Zurich Insurance", "Kuehne + Nagel", "SAP Supply Planning"],
    channels: ["TSMC Capex Programs", "Samsung Foundry Capex", "Intel Foundry Capex", "Global Fab Expansions"],
    demand: ["WFE Demand", "Node Transition Cycles", "Regional Fab Incentive Programs"],
  },
  consumer_hardware: {
    category: "Consumer Electronics",
    upstream: ["Foxconn", "Pegatron", "TSMC", "Samsung Display", "Corning"],
    services: ["UPS Supply Chain", "Marsh Risk Advisory", "Visa / Mastercard Acquiring", "Accenture IT Services"],
    channels: ["Carrier Sales Channels", "Global Retail Partners", "Direct E-commerce Stores", "Enterprise Procurement"],
    demand: ["Consumer Upgrade Cycles", "Emerging Market Demand", "Accessory Ecosystem Demand"],
  },
  platform_cloud: {
    category: "Platform + Cloud",
    upstream: ["NVIDIA", "AMD", "Arista Networks", "Schneider Electric", "Corning Fiber"],
    services: ["CrowdStrike Security", "AIG Cyber Insurance", "JPMorgan Treasury", "Deloitte Compliance Services"],
    channels: ["Enterprise Sales Channels", "Partner Marketplace", "Developer Ecosystem", "Public Sector Contracts"],
    demand: ["Cloud Compute Demand", "AI Platform Adoption", "Data & Analytics Demand"],
  },
  commerce_cloud: {
    category: "Commerce + Cloud",
    upstream: ["NVIDIA", "KLA-based Hardware Suppliers", "Packaging Vendors", "Warehouse Robotics Integrators", "Last-Mile Fleet Suppliers"],
    services: ["UPS", "FedEx", "Zurich Insurance", "Stripe & Payment Operations"],
    channels: ["Marketplace Sellers", "Prime Ecosystem", "Enterprise Cloud Contracts", "Streaming Channels"],
    demand: ["E-commerce Demand", "Cloud Service Demand", "Fulfillment Throughput Demand"],
  },
  platform_ads: {
    category: "Digital Platform",
    upstream: ["NVIDIA", "Broadcom", "Equinix", "Cloudflare", "CDN Infrastructure Vendors"],
    services: ["Palo Alto Networks", "Cyber Insurance Carriers", "Ad Measurement Vendors", "Treasury Banking Partners"],
    channels: ["Advertiser Agencies", "Developer API Partners", "Creator Economy Channels", "SMB Self-Serve Channels"],
    demand: ["Ad Spend Demand", "User Engagement Demand", "API Monetization Demand"],
  },
  energy: {
    category: "Integrated Energy",
    upstream: ["Schlumberger", "Halliburton", "Baker Hughes", "Steel Pipe Suppliers", "Drilling Equipment OEMs"],
    services: ["Maersk", "Lloyd's Market Insurance", "HSBC Trade Finance", "Commodity Hedging Desks"],
    channels: ["Refining Partners", "Industrial Offtake Buyers", "Utilities", "Petrochemical Buyers"],
    demand: ["Global Fuel Demand", "Industrial Energy Demand", "Refining Margin Demand"],
  },
  automotive_ev: {
    category: "EV Manufacturing",
    upstream: ["CATL", "Panasonic Energy", "LG Energy Solution", "NXP Semiconductors", "Magna"],
    services: ["DHL Automotive Logistics", "Aon", "Goldman Commodity Hedging", "Regional Utilities"],
    channels: ["Direct Sales Network", "Fleet Buyers", "Charging Network Partners", "Energy Storage Customers"],
    demand: ["EV Demand", "Energy Storage Demand", "Autonomy Compute Demand"],
  },
  holding_finance: {
    category: "Holding + Insurance Capital",
    upstream: ["Reinsurance Markets", "Banking Counterparties", "Data & Risk Vendors", "Audit & Advisory Firms"],
    services: ["Marsh McLennan", "AIG", "JPMorgan Custody", "Legal Compliance Counsel"],
    channels: ["Subsidiary Operating Companies", "Capital Markets Access", "Investment Counterparties", "Policyholder Channels"],
    demand: ["Insurance Demand", "Capital Allocation Demand", "Acquisition Pipeline Demand"],
  },
  banking: {
    category: "Global Banking",
    upstream: ["Core Banking Software Vendors", "Credit Bureau Data Providers", "Fraud Detection Platforms", "Cloud Infrastructure Vendors"],
    services: ["CrowdStrike", "Chubb Financial Lines", "SWIFT Infrastructure", "Regulatory Reporting Vendors"],
    channels: ["Corporate Treasury Clients", "Retail Banking Channels", "Investment Banking Pipeline", "Merchant Acquiring"],
    demand: ["Credit Demand", "Payment Flow Demand", "Liquidity & Treasury Demand"],
  },
  payments: {
    category: "Card Network",
    upstream: ["Issuer Banks", "Acquirer Banks", "Risk Scoring Vendors", "Fraud Monitoring Platforms"],
    services: ["Global Data Centers", "Cybersecurity Vendors", "Regulatory Compliance Vendors", "Insurance & Legal Risk Transfer"],
    channels: ["Merchant Acquirers", "Fintech Partners", "Issuer Programs", "Cross-border Remittance Partners"],
    demand: ["Consumer Spend Demand", "E-commerce Transaction Demand", "Cross-border Payments Demand"],
  },
  retail: {
    category: "Retail Distribution",
    upstream: ["Coca-Cola", "P&G", "Unilever", "Food Producers", "Packaging Suppliers"],
    services: ["DHL", "UPS", "Commercial Property Insurers", "Payments Acquiring Partners"],
    channels: ["Store Network", "E-commerce Channel", "Marketplace Partnerships", "B2B Wholesale Channels"],
    demand: ["Household Consumption Demand", "Seasonal Demand", "Membership/loyalty Demand"],
  },
  pharma: {
    category: "Pharma & Healthcare",
    upstream: ["Thermo Fisher", "Lonza", "Catalent", "WuXi AppTec", "Specialty Chemical Suppliers"],
    services: ["Cold Chain Logistics", "Product Liability Insurers", "Clinical CRO Partners", "Treasury & FX Services"],
    channels: ["Hospital Systems", "Retail Pharmacies", "Payer Networks", "Government Health Programs"],
    demand: ["Patient Treatment Demand", "Biologics Demand", "Global Health Demand"],
  },
  materials: {
    category: "Materials & Mining",
    upstream: ["BHP", "Rio Tinto", "Vale", "Glencore", "Energy Providers"],
    services: ["Bulk Freight Shipping", "Commodity Insurance Markets", "Trade Finance Banks", "Hedging Counterparties"],
    channels: ["Industrial Buyers", "Battery Supply Chain Buyers", "Infrastructure Projects"],
    demand: ["Metals Demand", "Construction Demand", "Battery Demand"],
  },
  industrial: {
    category: "Industrial Manufacturing",
    upstream: ["Steel Suppliers", "Precision Components", "Electronics Modules", "Automation Vendors"],
    services: ["Freight and 3PL", "Warranty Insurers", "Working Capital Banks", "ERP/PLM Vendors"],
    channels: ["OEM Customers", "Distributors", "Government Contractors"],
    demand: ["Capex Cycle Demand", "Maintenance Demand", "Infrastructure Program Demand"],
  },
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, idx) => {
      obj[h] = r[idx] ?? "";
    });
    return obj;
  });
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function compactUsd(num) {
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(2)}T`;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  return `${(num / 1_000_000).toFixed(2)}M`;
}

function fullUsd(num) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

function inferCountryCodeFromEntityName(name, fallbackCode) {
  const text = String(name || "").toLowerCase();
  for (const [keyword, code] of Object.entries(ENTITY_COUNTRY_BY_KEYWORD)) {
    if (text.includes(keyword)) return code;
  }
  return fallbackCode || "US";
}

function inferNodeCountryCode(name, row) {
  const code = inferCountryCodeFromEntityName(name, row.countryCode);
  if (code && code !== "XX") return code;
  if (row.countryCode && row.countryCode !== "XX") return row.countryCode;
  return "US";
}

function resolveOverrideCountryCode(rawCountry, name, row) {
  const mapped = COUNTRY_CODE[rawCountry] || rawCountry || "";
  if (mapped && mapped !== "XX") return mapped;
  return inferNodeCountryCode(name, row);
}

function pickLayerFallback(name, symbol) {
  const t = `${name} ${symbol}`.toLowerCase();
  if (/(oil|gas|petro|energy)/.test(t)) return -3;
  if (/(steel|mining|chemical|material)/.test(t)) return -2;
  if (/(auto|industrial|aerospace)/.test(t)) return -1;
  if (/(semi|chip|micro|foundry)/.test(t)) return 0;
  if (/(hardware|equipment|electronics)/.test(t)) return 1;
  if (/(software|platform|internet)/.test(t)) return 2;
  if (/(cloud|telecom|network|media)/.test(t)) return 3;
  if (/(bank|financial|insurance|visa|mastercard)/.test(t)) return 4;
  if (/(pharma|health|medical|bio)/.test(t)) return 5;
  return 6;
}

function computeNodeSizes(rows) {
  const values = rows.map((r) => r.marketcap);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const minSqrt = Math.sqrt(min);
  const maxSqrt = Math.sqrt(max);
  const span = Math.max(1, maxSqrt - minSqrt);
  return rows.map((r) => {
    const ratio = (Math.sqrt(r.marketcap) - minSqrt) / span;
    return Math.round(7 + ratio * 15);
  });
}

function addLink(links, seen, source, target, weight) {
  const key = `${source}->${target}`;
  if (source === target || seen.has(key)) return;
  seen.add(key);
  links.push({
    s: source,
    t: target,
    v: weight,
    k: "global-layer-flow",
    cf: "medium (structural)",
    sf: "",
    n: "Layer adjacency relationship in the global map.",
  });
}

function addProfileLink(links, source, target, weight, meta = {}) {
  links.push({
    s: source,
    t: target,
    v: weight,
    k: meta.k || "profile-relationship",
    cf: meta.cf || "medium (inferred)",
    sf: meta.sf || "",
    n: meta.n || "",
  });
}

function generateGlobalLinks(nodes) {
  // There is no source-backed global company-to-company edge list. Do not
  // invent dependencies merely to make the force layout look connected.
  return [];
}

function buildTemplateProfile(row) {
  const t = TEMPLATE_BY_LAYER[String(row.layer)] || TEMPLATE_BY_LAYER["6"];
  const nodes = [
    {
      id: "company",
      l: `${row.name}\n${row.symbol} - ${compactUsd(row.marketcap)}`,
      tier: 0,
      kind: "company",
      c: row.countryCode,
      d: `${t.category} anchor company. Rank #${row.rank}.`,
      s: `Market cap ${fullUsd(row.marketcap)}.`,
      z: 22,
    },
  ];
  const links = [];
  const addList = (list, tier, kind, direction) => {
    list.forEach((name, idx) => {
      const id = `${kind}-${direction}-${idx}`;
      nodes.push({
        id,
        l: `${name}\n${direction === "in" ? "Upstream dependency" : "Downstream connection"}`,
        tier,
        kind,
        c: inferNodeCountryCode(name, row),
        d: name,
        s: `${row.symbol} ${direction === "in" ? "depends on" : "serves"} this layer.`,
        z: 11,
      });
      if (direction === "in") {
        addProfileLink(links, id, "company", 2, {
          k: `${kind}-input`,
          cf: "low (template-inferred)",
          n: `Template-generated ${kind} input for ${row.symbol}.`,
        });
      } else {
        addProfileLink(links, "company", id, 2, {
          k: `${kind}-output`,
          cf: "low (template-inferred)",
          n: `Template-generated ${kind} output for ${row.symbol}.`,
        });
      }
    });
  };
  addList(t.upstream, -2, "supplier", "in");
  addList(t.services, -1, "service", "in");
  addList(t.channels, 1, "channel", "out");
  addList(t.demand, 2, "demand", "out");
  return {
    symbol: row.symbol,
    company: row.name,
    rank: row.rank,
    category: t.category,
    layers: PROFILE_LAYERS,
    nodes,
    links,
    sources: [],
  };
}

function pickDeepTheme(row) {
  if (TOP20_DEEP_THEME_BY_SYMBOL[row.symbol]) return TOP20_DEEP_THEME_BY_SYMBOL[row.symbol];
  return TOP20_DEEP_THEME_BY_LAYER[String(row.layer)] || "retail";
}

function buildDeepProfile(row) {
  const themeKey = pickDeepTheme(row);
  const theme = DEEP_THEME_DATA[themeKey] || DEEP_THEME_DATA.retail;
  const nodes = [
    {
      id: "company",
      l: `${row.name}\n${row.symbol} - ${compactUsd(row.marketcap)}`,
      tier: 0,
      kind: "company",
      c: row.countryCode,
      d: `${theme.category} anchor company. Rank #${row.rank}.`,
      s: `Market cap ${fullUsd(row.marketcap)}.`,
      z: 23,
      confidence: "high (company anchor)",
    },
  ];
  const links = [];

  const addGroup = (items, tier, kind, direction, conf) => {
    items.forEach((name, idx) => {
      const id = `${kind}-${direction}-${slugify(name)}-${idx}`;
      nodes.push({
        id,
        l: `${name}\n${direction === "in" ? "Upstream or enabling dependency" : "Downstream channel"}`,
        tier,
        kind,
        c: inferNodeCountryCode(name, row),
        d: name,
        s: `${row.symbol} ${direction === "in" ? "depends on" : "serves"} this node.`,
        confidence: conf,
        z: 11,
      });
      if (direction === "in") {
        addProfileLink(links, id, "company", 2, {
          k: `${kind}-input`,
          cf: conf,
          n: `Deep-profile ${kind} dependency for ${row.symbol}.`,
        });
      } else {
        addProfileLink(links, "company", id, 2, {
          k: `${kind}-output`,
          cf: conf,
          n: `Deep-profile ${kind} route for ${row.symbol}.`,
        });
      }
    });
  };

  addGroup(theme.upstream || [], -2, "supplier", "in", "medium (industry-inferred)");
  addGroup(theme.services || [], -1, "service", "in", "medium (industry-inferred)");
  addGroup(theme.channels || [], 1, "channel", "out", "medium (industry-inferred)");
  addGroup(theme.demand || [], 2, "demand", "out", "medium (industry-structural)");

  const demandNodes = nodes.filter((n) => n.tier === 2).map((n) => n.id);
  const channelNodes = nodes.filter((n) => n.tier === 1).map((n) => n.id);
  channelNodes.slice(0, Math.min(channelNodes.length, demandNodes.length)).forEach((cid, i) => {
    addProfileLink(links, cid, demandNodes[i], 1, {
      k: "channel-to-demand",
      cf: "medium (industry-structural)",
      n: `Deep-profile demand flow from channel to end demand for ${row.symbol}.`,
    });
  });

  return {
    symbol: row.symbol,
    company: row.name,
    rank: row.rank,
    category: `${theme.category} (Deep Profile)`,
    layers: PROFILE_LAYERS,
    nodes,
    links,
    sources: [],
  };
}

function buildSourceBackedProfile(row, config) {
  const theme = DEEP_THEME_DATA[config.theme] || DEEP_THEME_DATA.retail;
  const sourceByTier = config.sourceByTier || {};
  const sourceByName = config.sourceByName || {};
  const nodes = [
    {
      id: "company",
      l: `${row.name}\n${row.symbol} - ${compactUsd(row.marketcap)}`,
      tier: 0,
      kind: "company",
      c: row.countryCode,
      d: `${config.category || theme.category} anchor company. Rank #${row.rank}.`,
      s: `Market cap ${fullUsd(row.marketcap)}.`,
      z: 23,
      sourceId: sourceByTier.company || "",
      confidence: sourceByTier.company ? "high (company disclosure)" : "high (company anchor)",
    },
  ];
  const links = [];

  const addGroup = (items, tier, kind, direction, defaultConfidence) => {
    const tierKey = String(tier);
    const tierSource = sourceByTier[tierKey] || "";
    items.forEach((name, idx) => {
      const itemSource = sourceByName[name] || tierSource;
      const id = `${kind}-${direction}-${slugify(name)}-${idx}`;
      nodes.push({
        id,
        l: `${name}\n${direction === "in" ? "Upstream or enabling dependency" : "Downstream channel"}`,
        tier,
        kind,
        c: inferNodeCountryCode(name, row),
        d: name,
        s: `${row.symbol} ${direction === "in" ? "depends on" : "serves"} this node.`,
        sourceId: itemSource,
        confidence: itemSource ? "medium (source-backed)" : defaultConfidence,
        z: 11,
      });
      if (direction === "in") {
        addProfileLink(links, id, "company", 2, {
          k: `${kind}-input`,
          cf: itemSource ? "medium (source-backed)" : defaultConfidence,
          sf: itemSource,
          n: `Source-backed ${kind} dependency for ${row.symbol}.`,
        });
      } else {
        addProfileLink(links, "company", id, 2, {
          k: `${kind}-output`,
          cf: itemSource ? "medium (source-backed)" : defaultConfidence,
          sf: itemSource,
          n: `Source-backed ${kind} route for ${row.symbol}.`,
        });
      }
    });
  };

  addGroup(config.upstream || theme.upstream || [], -2, "supplier", "in", "medium (industry-inferred)");
  addGroup(config.services || theme.services || [], -1, "service", "in", "medium (industry-inferred)");
  addGroup(config.channels || theme.channels || [], 1, "channel", "out", "medium (industry-inferred)");
  addGroup(config.demand || theme.demand || [], 2, "demand", "out", "medium (industry-structural)");

  const demandNodes = nodes.filter((n) => n.tier === 2).map((n) => n.id);
  const channelNodes = nodes.filter((n) => n.tier === 1).map((n) => n.id);
  const demandSource = sourceByTier["2"] || sourceByTier["1"] || sourceByTier.company || "";
  channelNodes.slice(0, Math.min(channelNodes.length, demandNodes.length)).forEach((cid, i) => {
    addProfileLink(links, cid, demandNodes[i], 1, {
      k: "channel-to-demand",
      cf: demandSource ? "medium (source-backed)" : "medium (industry-structural)",
      sf: demandSource,
      n: `Source-backed demand transfer from channel to end-demand for ${row.symbol}.`,
    });
  });

  return {
    symbol: row.symbol,
    company: row.name,
    rank: row.rank,
    category: config.category || `${theme.category} (Source-backed)`,
    layers: PROFILE_LAYERS,
    nodes,
    links,
    sources: config.sources || [],
  };
}

function buildOverrideProfile(row, override) {
  const nodes = [
    {
      id: "company",
      l: `${row.name}\n${row.symbol} - ${compactUsd(row.marketcap)}`,
      tier: 0,
      kind: "company",
      c: row.countryCode,
      d: `${override.category} anchor company. Rank #${row.rank}.`,
      s: `Market cap ${fullUsd(row.marketcap)}.`,
      z: 23,
    },
  ];
  override.nodes.forEach((n) => {
    nodes.push({
      id: n.id,
      l: `${n.name}\n${n.sub}`,
      tier: n.tier,
      kind: n.kind,
      c: resolveOverrideCountryCode(n.country, n.name, row),
      d: n.note,
      s: "Sourced relationship / dependency context.",
      sourceId: n.sourceId || "",
      confidence: n.confidence || "",
      z: n.kind === "risk" ? 10 : 12,
    });
  });
  const links = [];
  const nodeMetaById = new Map(nodes.map((n) => [n.id, n]));
  override.links.forEach((l) => {
    const sourceId = l[0];
    const targetId = l[1];
    const weight = l[2];
    const sourceMeta = nodeMetaById.get(sourceId);
    const targetMeta = nodeMetaById.get(targetId);
    const linkSource = sourceMeta?.sourceId || targetMeta?.sourceId || "";
    const linkConfidence = sourceMeta?.confidence || targetMeta?.confidence || "medium (override relationship)";
    addProfileLink(links, sourceId, targetId, weight, {
      k: "override-relationship",
      cf: linkConfidence,
      sf: linkSource,
      n: `Custom override relationship for ${row.symbol}.`,
    });
  });
  return {
    symbol: row.symbol,
    company: row.name,
    rank: row.rank,
    category: override.category,
    layers: PROFILE_LAYERS,
    nodes,
    links,
    sources: override.sources || [],
  };
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function main() {
  await fs.mkdir("data", { recursive: true });
  const csvRaw = await fetchText(TOP100_CSV_URL);
  await fs.writeFile(OUTPUT_RAW_CSV_PATH, csvRaw, "utf8");

  const rows = parseCsv(csvRaw).slice(0, 100).map((row) => {
    const symbol = row.Symbol;
    return {
      rank: Number(row.Rank),
      name: row.Name,
      symbol,
      marketcap: Number(row.marketcap),
      country: row.country,
      countryCode: COUNTRY_CODE[row.country] || "XX",
      layer:
        typeof LAYER_OVERRIDES[symbol] === "number"
          ? LAYER_OVERRIDES[symbol]
          : pickLayerFallback(row.Name, symbol),
    };
  });

  const sizes = computeNodeSizes(rows);
  const globalNodes = rows.map((row, idx) => ({
    id: `${slugify(row.symbol)}-${row.rank}`,
    l: `${row.name}\n${row.symbol} - ${compactUsd(row.marketcap)}`,
    y: row.layer,
    c: row.countryCode,
    d: `${LAYERS[row.layer]}. Rank #${row.rank}.`,
    s: `Click to open ${row.symbol} company profile.`,
    bn: row.rank <= 12 || (row.layer <= 0 && row.rank <= 35),
    z: sizes[idx],
    rank: row.rank,
    marketcap: row.marketcap,
    symbol: row.symbol,
    company: row.name,
    country: row.country,
  }));
  const globalLinks = generateGlobalLinks(globalNodes);

  const profiles = {};
  rows.forEach((row) => {
    const override = PROFILE_OVERRIDES[row.symbol];
    if (override) {
      profiles[row.symbol] = buildOverrideProfile(row, override);
      return;
    }
    const sourceBacked = SOURCE_BACKED_PROFILE_OVERRIDES[row.symbol];
    if (sourceBacked) {
      profiles[row.symbol] = buildSourceBackedProfile(row, sourceBacked);
      return;
    }
    // Unresearched entrants receive an explicit empty profile. Generic
    // industry templates are not evidence of a company-specific dependency.
    profiles[row.symbol] = {
      symbol: row.symbol,
      company: row.name,
      rank: row.rank,
      category: 'Relationship research pending',
      layers: PROFILE_LAYERS,
      nodes: [{ id: 'company', l: `${row.name}\n${row.symbol} - ${compactUsd(row.marketcap)}`, tier: 0, kind: 'company', c: row.countryCode, d: 'No verified relationship data published.', s: `Market cap ${fullUsd(row.marketcap)}.`, z: 22 }],
      links: [],
      sources: [],
    };
  });

  const countries = {};
  [...globalNodes, ...Object.values(profiles).flatMap((p) => p.nodes)].forEach((n) => {
    const code = n.c || "XX";
    if (!countries[code]) {
      countries[code] = {
        n: Object.keys(COUNTRY_CODE).find((k) => COUNTRY_CODE[k] === code) || "Global",
        c: COUNTRY_COLORS[code] || COUNTRY_COLORS.XX,
      };
    }
  });

  const payload = {
    meta: {
      generatedAt: new Date().toISOString(),
      lastUpdated: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      source: TOP100_CSV_URL,
      count: globalNodes.length,
      profileCount: Object.keys(profiles).length,
    },
    layers: LAYERS,
    countries,
    nodes: globalNodes,
    links: globalLinks,
    profiles,
  };

  await fs.writeFile(OUTPUT_JSON_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await fs.writeFile(OUTPUT_JS_PATH, `window.SUPPLY_MAP_DATA = ${JSON.stringify(payload, null, 2)};\n`, "utf8");

  // eslint-disable-next-line no-console
  console.log(
    `Generated ${globalNodes.length} global companies, ${globalLinks.length} global links, ${Object.keys(profiles).length} company profiles.`
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
