#!/usr/bin/env node

/**
 * Auto-update market cap data from companiesmarketcap.com
 * Runs weekly via GitHub Actions
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const DATA_DIR = join(ROOT_DIR, 'data');
const BACKUP_DIR = join(DATA_DIR, 'backups');

const CSV_URL = 'https://companiesmarketcap.com/?download=CSV';

// Ensure backup directory exists
if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Fetch CSV from companiesmarketcap.com
 */
async function fetchCSV() {
  console.log('📥 Downloading latest market cap data...');
  
  const response = await fetch(CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to download CSV: ${response.status} ${response.statusText}`);
  }
  
  return await response.text();
}

/**
 * Parse CSV into structured data
 */
function parseCSV(csvText) {
  console.log('📊 Parsing CSV data...');
  
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  const companies = lines.slice(1).map(line => {
    const values = line.split(',');
    const company = {};
    
    headers.forEach((header, index) => {
      let value = values[index]?.trim() || '';
      
      // Clean company name (remove quotes)
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      // Parse market cap (remove $ and T/B/M suffixes)
      if (header.includes('Market Cap')) {
        value = parseMarketCap(value);
      }
      
      // Parse rank as number
      if (header.includes('Rank')) {
        value = parseInt(value, 10) || 0;
      }
      
      company[header.trim().toLowerCase().replace(/\s+/g, '_')] = value;
    });
    
    return company;
  });
  
  return companies;
}

/**
 * Parse market cap string to number (in trillions)
 */
function parseMarketCap(value) {
  if (!value || value === 'N/A') return 0;
  
  const match = value.match(/[\$]?([0-9.]+)([TBM])?/);
  if (!match) return 0;
  
  const num = parseFloat(match[1]);
  const suffix = match[2]?.toUpperCase() || 'B';
  
  switch (suffix) {
    case 'T': return num; // Already in trillions
    case 'B': return num / 1000; // Convert billions to trillions
    case 'M': return num / 1000000; // Convert millions to trillions
    default: return num / 1000;
  }
}

/**
 * Load existing data to preserve supply chain relationships
 */
function loadExistingData() {
  const filePath = join(DATA_DIR, 'top100-map-updated.json');
  
  if (!existsSync(filePath)) {
    console.log('⚠️  No existing data found, creating fresh dataset');
    return null;
  }
  
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Merge new market cap data with existing supply chain data
 */
function mergeData(existingData, newCompanies) {
  console.log('🔀 Merging new market cap data with existing supply chain data...');
  
  if (!existingData) {
    return createFreshDataset(newCompanies);
  }
  
  // Create map of new data by symbol
  const newMap = new Map();
  newCompanies.forEach(c => {
    if (c.symbol) {
      newMap.set(c.symbol.toUpperCase(), c);
    }
  });
  
  // Update existing companies with new market caps
  const updatedCompanies = existingData.companies.map(existing => {
    const symbol = existing.symbol?.toUpperCase();
    const newData = newMap.get(symbol);
    
    if (newData) {
      return {
        ...existing,
        rank: newData.rank || existing.rank,
        marketCap: newData.market_cap_usd || existing.marketCap,
        // Preserve all supply chain data
        profile: existing.profile,
        hq: existing.hq,
        sector: existing.sector || newData.sector || 'Diversified',
      };
    }
    
    return existing;
  });
  
  // Add any new companies not in existing data
  newCompanies.forEach(newCompany => {
    const symbol = newCompany.symbol?.toUpperCase();
    const exists = updatedCompanies.some(c => c.symbol?.toUpperCase() === symbol);
    
    if (!exists && symbol) {
      updatedCompanies.push({
        rank: newCompany.rank,
        symbol: symbol,
        name: newCompany.name,
        marketCap: newCompany.market_cap_usd,
        sector: newCompany.sector || 'Diversified',
        hq: {
          city: 'Unknown',
          country: 'Unknown',
          country_code: 'XX',
          flag_emoji: '🏳️',
          logo_url: `https://companiesmarketcap.com/img/company-logos/64/${symbol}.png`
        },
        profile: {
          upstream: ['Supply Chain Data Pending'],
          services: ['Data Pending'],
          channels: ['Data Pending'],
          demand: ['Data Pending']
        }
      });
    }
  });
  
  // Sort by rank
  updatedCompanies.sort((a, b) => (a.rank || 999) - (b.rank || 999));
  
  return {
    ...existingData,
    snapshot_date: new Date().toISOString().split('T')[0],
    last_auto_update: new Date().toISOString(),
    update_source: 'companiesmarketcap.com',
    companies: updatedCompanies
  };
}

/**
 * Create fresh dataset if no existing data
 */
function createFreshDataset(companies) {
  console.log('📝 Creating fresh dataset...');
  
  return {
    snapshot_date: new Date().toISOString().split('T')[0],
    last_auto_update: new Date().toISOString(),
    update_source: 'companiesmarketcap.com',
    companies: companies.map(c => ({
      rank: c.rank,
      symbol: c.symbol?.toUpperCase(),
      name: c.name,
      marketCap: c.market_cap_usd,
      sector: c.sector || 'Diversified',
      hq: {
        city: 'Unknown',
        country: 'Unknown',
        country_code: 'XX',
        flag_emoji: '🏳️',
        logo_url: `https://companiesmarketcap.com/img/company-logos/64/${c.symbol?.toUpperCase()}.png`
      },
      profile: {
        upstream: ['Supply Chain Data Pending'],
        services: ['Data Pending'],
        channels: ['Data Pending'],
        demand: ['Data Pending']
      }
    }))
  };
}

/**
 * Generate change report
 */
function generateChangeReport(oldData, newData) {
  const changes = [];
  
  if (!oldData) {
    return 'Fresh dataset created';
  }
  
  // Find ranking changes
  const oldRankMap = new Map();
  oldData.companies.forEach(c => oldRankMap.set(c.symbol, c.rank));
  
  newData.companies.slice(0, 20).forEach(company => {
    const oldRank = oldRankMap.get(company.symbol);
    if (oldRank && oldRank !== company.rank) {
      const change = oldRank - company.rank;
      const direction = change > 0 ? '↑' : change < 0 ? '↓' : '─';
      changes.push(`${company.symbol}: #${oldRank} → #${company.rank} (${direction}${Math.abs(change)})`);
    }
  });
  
  return changes.length > 0 
    ? `Top ranking changes:\n${changes.slice(0, 10).join('\n')}`
    : 'No significant changes in top 20';
}

/**
 * Write data files
 *
 * QUARANTINE GUARD (see 03-RESEARCH.md Pitfall 1):
 * This weekly updater produces only the FLAT {snapshot_date, last_auto_update,
 * update_source, companies:[...]} shape — it carries NO meta/layers/countries/
 * nodes/links/profiles. Historically it overwrote the browser-served
 * `data/top100-map.js` with that flat shape, which silently broke the live app
 * (DATA.meta/DATA.profiles undefined → no paint, "Unknown" freshness).
 *
 * The served `data/top100-map.js` is the RICH shape and is owned exclusively by
 * `scripts/generate-top100-data.mjs` (which emits both top100-map.json and the
 * rich top100-map.js from the same payload). The weekly market-cap refresh must
 * therefore write ONLY to the side file `data/top100-map-updated.json` and MUST
 * NEVER touch `data/top100-map.js`. Do not re-add a top100-map.js write here.
 */
function writeDataFiles(data) {
  console.log('💾 Writing data files...');

  // Write JSON side file ONLY. The browser-served data/top100-map.js (rich shape)
  // is intentionally NOT written here — see QUARANTINE GUARD above (Pitfall 1).
  const jsonPath = join(DATA_DIR, 'top100-map-updated.json');
  writeFileSync(jsonPath, JSON.stringify(data, null, 2));

  console.log(`✅ Data side file updated: ${data.companies.length} companies (served top100-map.js left untouched)`);
}

/**
 * Create backup of existing data
 */
function createBackup() {
  const filePath = join(DATA_DIR, 'top100-map-updated.json');
  
  if (existsSync(filePath)) {
    const backupPath = join(BACKUP_DIR, `top100-backup-${new Date().toISOString().split('T')[0]}.json`);
    const content = readFileSync(filePath);
    writeFileSync(backupPath, content);
    console.log(`💾 Backup created: ${backupPath}`);
  }
}

/**
 * Main update function
 */
async function main() {
  try {
    console.log('🚀 Starting market cap data update...\n');
    
    // Create backup first
    createBackup();
    
    // Load existing data
    const existingData = loadExistingData();
    
    // Fetch and parse new data
    const csvText = await fetchCSV();
    const newCompanies = parseCSV(csvText);
    
    console.log(`📊 Found ${newCompanies.length} companies in latest data\n`);
    
    // Merge data
    const mergedData = mergeData(existingData, newCompanies);
    
    // Generate change report
    const report = generateChangeReport(existingData, mergedData);
    console.log('\n📋 Change Report:');
    console.log(report);
    
    // Write updated files
    writeDataFiles(mergedData);
    
    console.log('\n✅ Update completed successfully!');
    console.log(`📅 Snapshot date: ${mergedData.snapshot_date}`);
    console.log(`🕐 Last update: ${mergedData.last_auto_update}`);
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

// Run update
main();
