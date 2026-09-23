import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const map = JSON.parse(fs.readFileSync("tests/fixtures/top100-map-2026-02.json", "utf8"));
const profiles = map.profiles || {};

function labelsFor(symbol) {
  const p = profiles[symbol];
  if (!p) return [];
  return (p.nodes || []).map((n) => (n.l || "").split("\n")[0]);
}

test("AAPL profile includes named key suppliers (not only generic buckets)", () => {
  const labels = labelsFor("AAPL");
  assert.ok(labels.includes("Hon Hai Precision Industry (Foxconn)"));
  assert.ok(labels.includes("Taiwan Semiconductor Manufacturing Company (TSMC)"));
});

test("TSLA profile includes named battery cell suppliers from Tesla filing", () => {
  const labels = labelsFor("TSLA");
  assert.ok(labels.includes("Panasonic"));
  assert.ok(labels.includes("Contemporary Amperex Technology Co. Limited (CATL)"));
});

test("MCD profile includes named integrated logistics supply-chain operator", () => {
  const labels = labelsFor("MCD");
  assert.ok(labels.includes("HAVI Supply Chain"));
});

test("GOOG profile includes named AI infrastructure partners", () => {
  const labels = labelsFor("GOOG");
  assert.ok(labels.includes("NVIDIA (Google Cloud AI Infrastructure)"));
  assert.ok(labels.includes("AMD (Google Cloud Compute Infrastructure)"));
});

test("TSM profile includes named semiconductor equipment suppliers", () => {
  const labels = labelsFor("TSM");
  assert.ok(labels.includes("Applied Materials"));
  assert.ok(labels.includes("ASML"));
});

test("META profile includes named fiber and power infrastructure partners", () => {
  const labels = labelsFor("META");
  assert.ok(labels.includes("Corning Incorporated"));
  assert.ok(labels.includes("Constellation Energy (Nuclear Power Partner)"));
});

test("AVGO profile includes named foundry and ecosystem relationships", () => {
  const labels = labelsFor("AVGO");
  assert.ok(labels.includes("Taiwan Semiconductor Manufacturing Company (TSMC)"));
  assert.ok(labels.includes("VMware Cloud Foundation Ecosystem Partners"));
});

test("WMT profile includes named suppliers with customer concentration disclosures", () => {
  const labels = labelsFor("WMT");
  assert.ok(labels.includes("The Clorox Company"));
  assert.ok(labels.includes("The Kraft Heinz Company"));
  assert.ok(labels.includes("Kimberly-Clark Corporation"));
  assert.ok(labels.includes("Church & Dwight Co., Inc."));
});

test("LLY profile includes named U.S. wholesale distributors from filing", () => {
  const labels = labelsFor("LLY");
  assert.ok(labels.includes("McKesson Corporation"));
  assert.ok(labels.includes("Cencora, Inc."));
  assert.ok(labels.includes("Cardinal Health, Inc."));
});

test("005930.KS profile includes named strategic technology partners", () => {
  const labels = labelsFor("005930.KS");
  assert.ok(labels.includes("Corning Incorporated"));
  assert.ok(labels.includes("Qualcomm"));
});

test("JPM profile includes named payment and platform partners", () => {
  const labels = labelsFor("JPM");
  assert.ok(labels.includes("Amazon Web Services (AWS)"));
  assert.ok(labels.includes("Visa Direct"));
  assert.ok(labels.includes("Coinbase"));
});

test("XOM profile includes named LNG and low-carbon partners", () => {
  const labels = labelsFor("XOM");
  assert.ok(labels.includes("QatarEnergy"));
  assert.ok(labels.includes("CF Industries"));
});

test("V profile includes named bank and network ecosystem partners", () => {
  const labels = labelsFor("V");
  assert.ok(labels.includes("J.P. Morgan Payments"));
  assert.ok(labels.includes("Coinbase"));
  assert.ok(labels.includes("Fiserv"));
});

test("MA profile includes named payment rail collaborators", () => {
  const labels = labelsFor("MA");
  assert.ok(labels.includes("Citi WorldLink (Mastercard Move)"));
  assert.ok(labels.includes("PayPal (One Credential Partner)"));
  assert.ok(labels.includes("The Clearing House RTP Network"));
});

test("ORCL profile includes named AI infrastructure collaborators", () => {
  const labels = labelsFor("ORCL");
  assert.ok(labels.includes("NVIDIA (OCI AI Infrastructure)"));
  assert.ok(labels.includes("AMD Instinct GPU Platform"));
  assert.ok(labels.includes("OpenAI (Stargate Compute Partner)"));
});

test("MU profile includes named AI memory platform relationships", () => {
  const labels = labelsFor("MU");
  assert.ok(labels.includes("NVIDIA (HBM3E / SOCAMM Collaboration)"));
  assert.ok(labels.includes("AMD Instinct MI350 Platform"));
  assert.ok(labels.includes("Qualcomm Snapdragon 8 Gen 3"));
});

test("000660.KS profile includes named AI memory ecosystem partners", () => {
  const labels = labelsFor("000660.KS");
  assert.ok(labels.includes("TSMC (HBM4 and CoWoS Collaboration)"));
  assert.ok(labels.includes("NVIDIA (HBM3 / HBM3E Programs)"));
  assert.ok(labels.includes("SK Telecom (AI Data Center Collaboration)"));
});

test("ASML profile includes named high-NA development collaborators", () => {
  const labels = labelsFor("ASML");
  assert.ok(labels.includes("Intel Foundry (High-NA Early Adopter)"));
  assert.ok(labels.includes("imec High NA EUV Lab"));
});

test("BRK-B profile includes named core operating subsidiaries", () => {
  const labels = labelsFor("BRK-B");
  assert.ok(labels.includes("BNSF Railway"));
  assert.ok(labels.includes("Berkshire Hathaway Energy"));
  assert.ok(labels.includes("GEICO"));
});

test("TCEHY profile includes named strategic ecosystem partners", () => {
  const labels = labelsFor("TCEHY");
  assert.ok(labels.includes("Mercedes-Benz"));
  assert.ok(labels.includes("Electronic Arts (EA)"));
  assert.ok(labels.includes("Esports World Cup Foundation"));
});

test("JNJ profile includes named biopharma and medtech transactions", () => {
  const labels = labelsFor("JNJ");
  assert.ok(labels.includes("Legend Biotech (CARVYKTI Collaboration)"));
  assert.ok(labels.includes("Shockwave Medical"));
  assert.ok(labels.includes("Kenvue"));
});

test("ABBV profile includes named oncology and neuroscience transactions", () => {
  const labels = labelsFor("ABBV");
  assert.ok(labels.includes("Genmab (EPKINLY Collaboration)"));
  assert.ok(labels.includes("ImmunoGen"));
  assert.ok(labels.includes("Cerevel Therapeutics"));
});

test("COST profile includes named commerce and payments partners", () => {
  const labels = labelsFor("COST");
  assert.ok(labels.includes("Instacart (Same-Day Delivery Partner)"));
  assert.ok(labels.includes("Citi (Costco Anywhere Visa Issuer)"));
  assert.ok(labels.includes("Visa Network (Costco Anywhere Card)"));
});

test("BAC profile includes named real-time payments infrastructure partners", () => {
  const labels = labelsFor("BAC");
  assert.ok(labels.includes("The Clearing House RTP Network"));
  assert.ok(labels.includes("Zelle Network"));
  assert.ok(labels.includes("SWIFT Network"));
});

test("HD profile includes named pro-distribution and delivery partners", () => {
  const labels = labelsFor("HD");
  assert.ok(labels.includes("SRS Distribution"));
  assert.ok(labels.includes("HD Supply"));
  assert.ok(labels.includes("Home Depot Pro"));
});

test("BABA profile includes named logistics and international commerce entities", () => {
  const labels = labelsFor("BABA");
  assert.ok(labels.includes("Cainiao Smart Logistics Network"));
  assert.ok(labels.includes("Lazada"));
  assert.ok(labels.includes("Ant Group"));
});

test("CVX profile includes named technology and feedstock partners", () => {
  const labels = labelsFor("CVX");
  assert.ok(labels.includes("Halliburton"));
  assert.ok(labels.includes("SLB (Schlumberger)"));
  assert.ok(labels.includes("Bunge Chevron Ag Renewables"));
});

test("1398.HK profile includes named cross-border payments networks", () => {
  const labels = labelsFor("1398.HK");
  assert.ok(labels.includes("China UnionPay"));
  assert.ok(labels.includes("SWIFT Network"));
  assert.ok(labels.includes("CIPS (Cross-Border Interbank Payment System)"));
});

test("GE profile includes named aerospace platform relationships", () => {
  const labels = labelsFor("GE");
  assert.ok(labels.includes("Safran Aircraft Engines (CFM Joint Venture)"));
  assert.ok(labels.includes("Boeing 737 MAX Program"));
  assert.ok(labels.includes("Airbus A320neo Program"));
});

test("CAT profile includes named supplier excellence partners", () => {
  const labels = labelsFor("CAT");
  assert.ok(labels.includes("CEVA Freight"));
  assert.ok(labels.includes("Randstad NV"));
  assert.ok(labels.includes("DENSO Europe B.V."));
});

test("KO profile includes named anchor bottling partners", () => {
  const labels = labelsFor("KO");
  assert.ok(labels.includes("Coca-Cola FEMSA"));
  assert.ok(labels.includes("Coca-Cola Europacific Partners (CCEP)"));
  assert.ok(labels.includes("Coca-Cola HBC"));
});

test("NFLX profile includes named advertising and distribution partners", () => {
  const labels = labelsFor("NFLX");
  assert.ok(labels.includes("Microsoft Advertising Platform"));
  assert.ok(labels.includes("TF1 Group"));
  assert.ok(labels.includes("WWE (TKO Group)"));
});

test("AMD profile includes named foundry and cloud infrastructure collaborators", () => {
  const labels = labelsFor("AMD");
  assert.ok(labels.includes("TSMC N2 Process Technology"));
  assert.ok(labels.includes("OpenAI (AI Infrastructure Partner)"));
  assert.ok(labels.includes("Oracle Cloud Infrastructure (OCI)"));
});

test("PG profile includes named retail channels and flagship brand context", () => {
  const labels = labelsFor("PG");
  assert.ok(labels.includes("Walmart Inc."));
  assert.ok(labels.includes("Target"));
  assert.ok(labels.includes("Tide Brand Portfolio"));
});

test("ROG.SW profile includes named Roche Group innovation entities", () => {
  const labels = labelsFor("ROG.SW");
  assert.ok(labels.includes("Genentech"));
  assert.ok(labels.includes("Foundation Medicine"));
  assert.ok(labels.includes("Chugai Pharmaceutical"));
});

test("601288.SS profile includes named cross-border clearing networks", () => {
  const labels = labelsFor("601288.SS");
  assert.ok(labels.includes("China UnionPay"));
  assert.ok(labels.includes("SWIFT Network"));
  assert.ok(labels.includes("CIPS (Cross-Border Interbank Payment System)"));
});

test("601939.SS profile includes named cross-border clearing networks", () => {
  const labels = labelsFor("601939.SS");
  assert.ok(labels.includes("China UnionPay"));
  assert.ok(labels.includes("SWIFT Network"));
  assert.ok(labels.includes("CIPS (Cross-Border Interbank Payment System)"));
});

test("MC.PA profile includes named maisons and retail entities", () => {
  const labels = labelsFor("MC.PA");
  assert.ok(labels.includes("Louis Vuitton"));
  assert.ok(labels.includes("Christian Dior Couture"));
  assert.ok(labels.includes("Sephora"));
});

test("PLTR profile includes named AI and cloud platform partners", () => {
  const labels = labelsFor("PLTR");
  assert.ok(labels.includes("Microsoft Azure OpenAI Service"));
  assert.ok(labels.includes("Oracle Cloud Infrastructure"));
  assert.ok(labels.includes("Databricks"));
});

test("AZN profile includes named strategic collaboration entities", () => {
  const labels = labelsFor("AZN");
  assert.ok(labels.includes("Alexion Pharmaceuticals"));
  assert.ok(labels.includes("Daiichi Sankyo"));
  assert.ok(labels.includes("MSD (Merck)"));
});

test("NVS profile includes named pipeline acquisition entities", () => {
  const labels = labelsFor("NVS");
  assert.ok(labels.includes("MorphoSys AG"));
  assert.ok(labels.includes("Regulus Therapeutics"));
  assert.ok(labels.includes("Avidity Biosciences"));
});

test("CSCO profile includes named infrastructure and ecosystem entities", () => {
  const labels = labelsFor("CSCO");
  assert.ok(labels.includes("NVIDIA Spectrum-X"));
  assert.ok(labels.includes("Splunk"));
  assert.ok(labels.includes("Cisco Silicon One"));
});

test("TM profile includes named battery and electrification joint-venture entities", () => {
  const labels = labelsFor("TM");
  assert.ok(labels.includes("Prime Planet Energy & Solutions, Inc."));
  assert.ok(labels.includes("Panasonic Corporation"));
  assert.ok(labels.includes("Primearth EV Energy Co., Ltd."));
});

test("LRCX profile includes named semiconductor equipment ecosystem entities", () => {
  const labels = labelsFor("LRCX");
  assert.ok(labels.includes("Celestica Electronics SDN. BHD."));
  assert.ok(labels.includes("Texon Co., Ltd."));
  assert.ok(labels.includes("Micron Technology"));
});

test("MRK profile includes named strategic pharma collaboration entities", () => {
  const labels = labelsFor("MRK");
  assert.ok(labels.includes("AstraZeneca"));
  assert.ok(labels.includes("Eisai Co., Ltd."));
  assert.ok(labels.includes("Moderna, Inc."));
});

test("HSBC profile includes named core banking entities", () => {
  const labels = labelsFor("HSBC");
  assert.ok(labels.includes("Hang Seng Bank"));
  assert.ok(labels.includes("Bank of Communications Co., Limited"));
  assert.ok(labels.includes("HSBC UK Bank plc"));
});

test("0857.HK profile includes named integrated energy entities", () => {
  const labels = labelsFor("0857.HK");
  assert.ok(labels.includes("China National Petroleum Corporation (CNPC)"));
  assert.ok(labels.includes("Kunlun Energy Company Limited"));
  assert.ok(labels.includes("PetroChina International Company Limited"));
});

test("AMAT profile includes named semiconductor ecosystem relationships", () => {
  const labels = labelsFor("AMAT");
  assert.ok(labels.includes("Intel Foundry"));
  assert.ok(labels.includes("Taiwan Semiconductor Manufacturing Company (TSMC)"));
  assert.ok(labels.includes("BE Semiconductor Industries N.V. (Besi)"));
});

test("PM profile includes named reduced-risk and partnership entities", () => {
  const labels = labelsFor("PM");
  assert.ok(labels.includes("Swedish Match AB"));
  assert.ok(labels.includes("Vectura Group Ltd."));
  assert.ok(labels.includes("Altria Group, Inc."));
});

test("GS profile includes named platform and institutional entities", () => {
  const labels = labelsFor("GS");
  assert.ok(labels.includes("Goldman Sachs Bank USA"));
  assert.ok(labels.includes("Goldman Sachs International"));
  assert.ok(labels.includes("General Motors"));
});

test("MS profile includes named brokerage and banking entities", () => {
  const labels = labelsFor("MS");
  assert.ok(labels.includes("E*TRADE Futures LLC"));
  assert.ok(labels.includes("Morgan Stanley Smith Barney LLC"));
  assert.ok(labels.includes("Morgan Stanley Bank, N.A."));
});

test("WFC profile includes named core operating entities", () => {
  const labels = labelsFor("WFC");
  assert.ok(labels.includes("Wells Fargo Bank, N.A."));
  assert.ok(labels.includes("Wells Fargo Securities, LLC"));
  assert.ok(labels.includes("Wells Fargo Clearing Services, LLC"));
});

test("RTX profile includes named aerospace platform entities", () => {
  const labels = labelsFor("RTX");
  assert.ok(labels.includes("Collins Aerospace"));
  assert.ok(labels.includes("Raytheon"));
  assert.ok(labels.includes("Boeing"));
});

test("600519.SS profile includes named Moutai logistics and packaging entities", () => {
  const labels = labelsFor("600519.SS");
  assert.ok(labels.includes("KWEICHOW MOUTAI DISTILLERY (GROUP) LOGISTICS CO., LTD."));
  assert.ok(labels.includes("GUIZHOU FUMING PACKAGING CO., LTD."));
  assert.ok(labels.includes("CHINA GUIZHOU MOUTAI BREWERY TRADING (H.K.) LIMITED"));
});

test("NESN.SW profile includes named Nestle operating entities", () => {
  const labels = labelsFor("NESN.SW");
  assert.ok(labels.includes("Nestlé Nespresso SA"));
  assert.ok(labels.includes("Nestlé Purina PetCare Company"));
  assert.ok(labels.includes("Blue Bottle Coffee, LLC"));
});

test("UNH profile includes named health services operating entities", () => {
  const labels = labelsFor("UNH");
  assert.ok(labels.includes("UnitedHealthcare"));
  assert.ok(labels.includes("Optum Health"));
  assert.ok(labels.includes("Optum Rx"));
});

test("RMS.PA profile includes named Hermes house entities", () => {
  const labels = labelsFor("RMS.PA");
  assert.ok(labels.includes("Bootmaker John Lobb"));
  assert.ok(labels.includes("Silversmith Puiforcat"));
  assert.ok(labels.includes("Cristalleries de Saint-Louis"));
});

test("OR.PA profile includes named L'Oreal brand portfolio entities", () => {
  const labels = labelsFor("OR.PA");
  assert.ok(labels.includes("L'Oréal Paris"));
  assert.ok(labels.includes("Maybelline New York"));
  assert.ok(labels.includes("La Roche-Posay"));
});
test("601988.SS profile includes named Bank of China group entities", () => {
  const labels = labelsFor("601988.SS");
  assert.ok(labels.includes("Bank of China (Hong Kong) Limited"));
  assert.ok(labels.includes("BOC Aviation Limited"));
  assert.ok(labels.includes("BOC International Holdings Limited"));
});

test("300750.SZ profile includes named CATL customer and partnership entities", () => {
  const labels = labelsFor("300750.SZ");
  assert.ok(labels.includes("Tesla, Inc."));
  assert.ok(labels.includes("Li Auto Inc."));
  assert.ok(labels.includes("Stellantis N.V."));
});

test("RY profile includes named RBC operating entities", () => {
  const labels = labelsFor("RY");
  assert.ok(labels.includes("RBC Capital Markets"));
  assert.ok(labels.includes("City National Bank"));
  assert.ok(labels.includes("RBC Wealth Management"));
});

test("TMUS profile includes named telecom infrastructure and ownership entities", () => {
  const labels = labelsFor("TMUS");
  assert.ok(labels.includes("Deutsche Telekom AG"));
  assert.ok(labels.includes("Crown Castle International Corp."));
  assert.ok(labels.includes("Nokia"));
});

test("IBM profile includes named platform and acquisition entities", () => {
  const labels = labelsFor("IBM");
  assert.ok(labels.includes("Red Hat"));
  assert.ok(labels.includes("HashiCorp"));
  assert.ok(labels.includes("IBM Partner Plus Ecosystem"));
});

test("IHC.AE profile includes named portfolio operating entities", () => {
  const labels = labelsFor("IHC.AE");
  assert.ok(labels.includes("Alpha Dhabi Holding"));
  assert.ok(labels.includes("PureHealth"));
  assert.ok(labels.includes("NMDC Group"));
});

test("AXP profile includes named cobrand and network counterparties", () => {
  const labels = labelsFor("AXP");
  assert.ok(labels.includes("Delta Air Lines"));
  assert.ok(labels.includes("Marriott International"));
  assert.ok(labels.includes("Hilton Worldwide Holdings"));
});

test("SAP profile includes named enterprise platform portfolio entities", () => {
  const labels = labelsFor("SAP");
  assert.ok(labels.includes("SAP Signavio"));
  assert.ok(labels.includes("SAP LeanIX"));
  assert.ok(labels.includes("SAP Concur"));
});

test("LIN profile includes named industrial gas and engineering entities", () => {
  const labels = labelsFor("LIN");
  assert.ok(labels.includes("Linde Engineering"));
  assert.ok(labels.includes("BOC India"));
  assert.ok(labels.includes("Praxair"));
});

test("MCD profile includes named supply and channel entities", () => {
  const labels = labelsFor("MCD");
  assert.ok(labels.includes("OSI Group"));
  assert.ok(labels.includes("Lamb Weston"));
  assert.ok(labels.includes("Arcos Dorados"));
});

test("PRX.AS profile includes named portfolio entities", () => {
  const labels = labelsFor("PRX.AS");
  assert.ok(labels.includes("Tencent"));
  assert.ok(labels.includes("OLX"));
  assert.ok(labels.includes("iFood"));
});

test("SIE.DE profile includes named Siemens business entities", () => {
  const labels = labelsFor("SIE.DE");
  assert.ok(labels.includes("Digital Industries"));
  assert.ok(labels.includes("Smart Infrastructure"));
  assert.ok(labels.includes("Mobility"));
});

test("PEP profile includes named PepsiCo operating segment entities", () => {
  const labels = labelsFor("PEP");
  assert.ok(labels.includes("PepsiCo Beverages North America"));
  assert.ok(labels.includes("PepsiCo Foods North America"));
  assert.ok(labels.includes("Latin America Foods"));
});

test("GEV profile includes named GE Vernova operating segment entities", () => {
  const labels = labelsFor("GEV");
  assert.ok(labels.includes("Power Segment"));
  assert.ok(labels.includes("Wind Segment"));
  assert.ok(labels.includes("Electrification Segment"));
});

test("SHEL profile includes named integrated gas and LNG entities", () => {
  const labels = labelsFor("SHEL");
  assert.ok(labels.includes("QatarEnergy LNG NFE"));
  assert.ok(labels.includes("LNG Canada"));
  assert.ok(labels.includes("Integrated Gas"));
});

test("INTC profile includes named foundry ecosystem entities", () => {
  const labels = labelsFor("INTC");
  assert.ok(labels.includes("Synopsys"));
  assert.ok(labels.includes("Cadence"));
  assert.ok(labels.includes("Siemens EDA"));
});

test("0941.HK profile includes named China Mobile ecosystem entities", () => {
  const labels = labelsFor("0941.HK");
  assert.ok(labels.includes("China Tower Corporation Limited"));
  assert.ok(labels.includes("China Mobile International Limited"));
  assert.ok(labels.includes("MIGU Co., Ltd."));
});

test("MUFG profile includes named MUFG major related companies", () => {
  const labels = labelsFor("MUFG");
  assert.ok(labels.includes("MUFG Bank"));
  assert.ok(labels.includes("Mitsubishi UFJ Trust and Banking"));
  assert.ok(labels.includes("Mitsubishi UFJ Morgan Stanley Securities"));
});

test("CBA.AX profile includes named CBA brand entities", () => {
  const labels = labelsFor("CBA.AX");
  assert.ok(labels.includes("CommSec"));
  assert.ok(labels.includes("ASB Bank"));
  assert.ok(labels.includes("Bankwest"));
});

test("ITX.MC profile includes named Inditex brand entities", () => {
  const labels = labelsFor("ITX.MC");
  assert.ok(labels.includes("Zara"));
  assert.ok(labels.includes("Pull&Bear"));
  assert.ok(labels.includes("Massimo Dutti"));
});

test("RELIANCE.NS profile includes named Reliance consumer and mobility entities", () => {
  const labels = labelsFor("RELIANCE.NS");
  assert.ok(labels.includes("Reliance Retail"));
  assert.ok(labels.includes("Jio-bp"));
  assert.ok(labels.includes("JioMart"));
});

test("NVO profile includes named Novo Nordisk related-party and product entities", () => {
  const labels = labelsFor("NVO");
  assert.ok(labels.includes("Catalent Group"));
  assert.ok(labels.includes("Novonesis A/S"));
  assert.ok(labels.includes("Wegovy®"));
});

test("VZ profile includes named Verizon infrastructure and segment entities", () => {
  const labels = labelsFor("VZ");
  assert.ok(labels.includes("American Tower Corporation"));
  assert.ok(labels.includes("Verizon Consumer Group"));
  assert.ok(labels.includes("Verizon Business Group"));
});

test("C profile includes named Citi operating and partner entities", () => {
  const labels = labelsFor("C");
  assert.ok(labels.includes("Treasury and Trade Solutions (TTS)"));
  assert.ok(labels.includes("Securities Services"));
  assert.ok(labels.includes("The Home Depot"));
});

test("AMGN profile includes named Amgen transaction and collaboration entities", () => {
  const labels = labelsFor("AMGN");
  assert.ok(labels.includes("Horizon Therapeutics plc"));
  assert.ok(labels.includes("ChemoCentryx, Inc."));
  assert.ok(labels.includes("AstraZeneca plc"));
});

test("NVDA profile includes named data center customer concentration", () => {
  const labels = labelsFor("NVDA");
  assert.ok(labels.includes("Data Center Revenue"));
  assert.ok(labels.includes("Cloud Service Providers"));
});

test("MSFT profile includes named Azure cloud customer segments", () => {
  const labels = labelsFor("MSFT");
  assert.ok(labels.includes("Azure AI Customers"));
  assert.ok(labels.includes("Enterprise Cloud"));
});

test("AMZN profile includes named marketplace and AWS segments", () => {
  const labels = labelsFor("AMZN");
  assert.ok(labels.includes("Third-Party Sellers"));
  assert.ok(labels.includes("AWS Cloud Services"));
});

test("2222.SR profile includes named Saudi Aramco oil and gas operations", () => {
  const labels = labelsFor("2222.SR");
  assert.ok(labels.includes("Crude Oil Production"));
  assert.ok(labels.includes("Natural Gas Operations"));
});

test("RIO profile includes named Rio Tinto mining operations", () => {
  const labels = labelsFor("RIO");
  assert.ok(labels.includes("Iron Ore"));
  assert.ok(labels.includes("Aluminium"));
  assert.ok(labels.includes("Copper"));
});

test("NEE profile includes named Nextera Energy utility operations", () => {
  const labels = labelsFor("NEE");
  assert.ok(labels.includes("Florida Power & Light"));
  assert.ok(labels.includes("Renewable Energy"));
});

test("TMO profile includes named Thermo Fisher life sciences segments", () => {
  const labels = labelsFor("TMO");
  assert.ok(labels.includes("Life Sciences Solutions"));
  assert.ok(labels.includes("Analytical Instruments"));
});

test("DTE.DE profile includes named Deutsche Telekom customer segments", () => {
  const labels = labelsFor("DTE.DE");
  assert.ok(labels.includes("FMC Customers"));
  assert.ok(labels.includes("Germany Segment"));
});

test("SAN profile includes named Santander banking segments", () => {
  const labels = labelsFor("SAN");
  assert.ok(labels.includes("Digital Consumer Bank"));
  assert.ok(labels.includes("Santander Consumer Finance"));
});

test("GILD profile includes named Gilead therapy franchises", () => {
  const labels = labelsFor("GILD");
  assert.ok(labels.includes("HIV Franchise"));
  assert.ok(labels.includes("Oncology"));
});

test("DIS profile includes named Disney operating segments", () => {
  const labels = labelsFor("DIS");
  assert.ok(labels.includes("Streaming Services"));
  assert.ok(labels.includes("Theme Parks"));
  assert.ok(labels.includes("Entertainment"));
});

test("APH profile includes named Amphenol interconnect segments", () => {
  const labels = labelsFor("APH");
  assert.ok(labels.includes("Communications Solutions"));
  assert.ok(labels.includes("Harsh Environment Solutions"));
});

test("TXN profile includes named industrial and automotive market segments", () => {
  const labels = labelsFor("TXN");
  assert.ok(labels.includes("Industrial Market"));
  assert.ok(labels.includes("Automotive Market"));
  assert.ok(labels.includes("Personal Electronics Market"));
});

test("T profile includes named AT&T business reporting units", () => {
  const labels = labelsFor("T");
  assert.ok(labels.includes("Mobility"));
  assert.ok(labels.includes("Business Wireline"));
  assert.ok(labels.includes("Consumer Wireline"));
});

test("BHP profile includes named BHP operating assets and commodities", () => {
  const labels = labelsFor("BHP");
  assert.ok(labels.includes("Olympic Dam"));
  assert.ok(labels.includes("Escondida"));
  assert.ok(labels.includes("Western Australia Iron Ore"));
});

test("KLAC profile includes named KLA customer and technology entities", () => {
  const labels = labelsFor("KLAC");
  assert.ok(labels.includes("TSMC"));
  assert.ok(labels.includes("Samsung Electronics"));
  assert.ok(labels.includes("Intel Foundry"));
});

test("ABT profile includes named Abbott operating segments and products", () => {
  const labels = labelsFor("ABT");
  assert.ok(labels.includes("Medical Devices"));
  assert.ok(labels.includes("Diagnostic Products"));
  assert.ok(labels.includes("FreeStyle Libre"));
});
