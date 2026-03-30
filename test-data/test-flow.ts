// Test script: exercises CSV parsing with both mock and real GSC data
// Run with: npx tsx test-data/test-flow.ts

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parseQueryCsv, parsePageCsv } from '../src/lib/csv/parser';
import { mergeGscData, calculateOverview } from '../src/lib/csv/merger';
import { scorePages } from '../src/lib/scoring/engine';
import { CATEGORIES } from '../src/lib/scoring/categories';
import type { CategoryId } from '../src/types/scoring';

const dir = join(process.cwd(), 'test-data');
let issues = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  FAIL: ${msg}`);
    issues++;
  }
}

// ==========================================
// TEST 1: Mock CSVs (German format, semicolon)
// ==========================================
console.log('=== TEST 1: Mock CSVs (German format, semicolon) ===\n');

const mockQueryText = readFileSync(join(dir, 'suchanfragen.csv'), 'utf-8');
const mockPageText = readFileSync(join(dir, 'seiten.csv'), 'utf-8');

const mockQueries = parseQueryCsv(mockQueryText);
const mockPages = parsePageCsv(mockPageText);

console.log(`Queries: ${mockQueries.success ? 'OK' : 'FAIL'} — ${mockQueries.rowCount} rows`);
if (!mockQueries.success) console.log('  Errors:', mockQueries.errors);
assert(mockQueries.success, 'Mock queries should parse successfully');
assert(mockQueries.rowCount === 54, `Expected 54 query rows, got ${mockQueries.rowCount}`);

console.log(`Pages:   ${mockPages.success ? 'OK' : 'FAIL'} — ${mockPages.rowCount} rows`);
if (!mockPages.success) console.log('  Errors:', mockPages.errors);
assert(mockPages.success, 'Mock pages should parse successfully');
assert(mockPages.rowCount === 30, `Expected 30 page rows, got ${mockPages.rowCount}`);

// Verify German number parsing
const firstMockQuery = mockQueries.data[0];
if (firstMockQuery) {
  assert(firstMockQuery.klicks === 4521, `German klicks: expected 4521, got ${firstMockQuery.klicks}`);
  assert(firstMockQuery.impressionen === 142300, `German impressions: expected 142300, got ${firstMockQuery.impressionen}`);
  assert(Math.abs(firstMockQuery.ctr - 0.0318) < 0.001, `German CTR: expected ~0.0318, got ${firstMockQuery.ctr}`);
  assert(Math.abs(firstMockQuery.position - 8.2) < 0.1, `German position: expected ~8.2, got ${firstMockQuery.position}`);
}

// ==========================================
// TEST 2: Real GSC CSVs (English format, comma)
// ==========================================
const realDir = join(dir, 'real');
if (existsSync(realDir)) {
  console.log('\n=== TEST 2: Real GSC CSVs (English format, comma) ===\n');

  const realQueryPath = join(realDir, 'Suchanfragen.csv');
  const realPagePath = join(realDir, 'Seiten.csv');

  if (existsSync(realQueryPath)) {
    const realQueryText = readFileSync(realQueryPath, 'utf-8');
    const realQueries = parseQueryCsv(realQueryText);

    console.log(`Real Queries: ${realQueries.success ? 'OK' : 'FAIL'} — ${realQueries.rowCount} rows`);
    if (!realQueries.success) console.log('  Errors:', realQueries.errors);
    assert(realQueries.success, 'Real queries should parse successfully');

    const firstRealQuery = realQueries.data[0];
    if (firstRealQuery) {
      console.log(`  First: "${firstRealQuery.keyword}" — ${firstRealQuery.klicks} clicks, ${firstRealQuery.impressionen} imp, CTR=${(firstRealQuery.ctr * 100).toFixed(2)}%, pos=${firstRealQuery.position}`);
      // "goldesel,5700,24854,22.93%,1.94"
      assert(firstRealQuery.keyword === 'goldesel', `Expected keyword "goldesel", got "${firstRealQuery.keyword}"`);
      assert(firstRealQuery.klicks === 5700, `Expected 5700 clicks, got ${firstRealQuery.klicks}`);
      assert(firstRealQuery.impressionen === 24854, `Expected 24854 impressions, got ${firstRealQuery.impressionen}`);
      assert(Math.abs(firstRealQuery.ctr - 0.2293) < 0.001, `Expected CTR ~0.2293, got ${firstRealQuery.ctr}`);
      assert(Math.abs(firstRealQuery.position - 1.94) < 0.01, `Expected position ~1.94, got ${firstRealQuery.position}`);
    }
  }

  if (existsSync(realPagePath)) {
    const realPageText = readFileSync(realPagePath, 'utf-8');
    const realPages = parsePageCsv(realPageText);

    console.log(`Real Pages:   ${realPages.success ? 'OK' : 'FAIL'} — ${realPages.rowCount} rows`);
    if (!realPages.success) console.log('  Errors:', realPages.errors);
    assert(realPages.success, 'Real pages should parse successfully');

    const firstRealPage = realPages.data[0];
    if (firstRealPage) {
      console.log(`  First: "${firstRealPage.url}" — ${firstRealPage.klicks} clicks`);
      assert(firstRealPage.url === 'https://goldesel.de/', `Expected URL "https://goldesel.de/", got "${firstRealPage.url}"`);
      assert(firstRealPage.klicks === 7661, `Expected 7661 clicks, got ${firstRealPage.klicks}`);
    }
  }
} else {
  console.log('\n(Skipping real CSV test — /test-data/real/ not found)');
}

// ==========================================
// TEST 3: Scoring with real data
// ==========================================
if (mockPages.success) {
  console.log('\n=== TEST 3: Scoring ===\n');
  const merged = mergeGscData(mockPages.data, mockQueries.data);
  const scored = scorePages(merged);

  const dist: Record<CategoryId, number> = {
    'content-problem': 0,
    'packaging-problem': 0,
    'quick-win': 0,
    'low-priority': 0,
  };
  for (const p of scored) dist[p.category]++;

  console.log('Category distribution:');
  for (const [cat, count] of Object.entries(dist)) {
    console.log(`  ${CATEGORIES[cat as CategoryId].emoji} ${CATEGORIES[cat as CategoryId].label}: ${count}`);
  }

  assert(scored.length === 30, `Expected 30 scored pages, got ${scored.length}`);
  assert(dist['low-priority']! >= 1, 'Should have at least 1 low-priority page');
  assert(dist['content-problem']! >= 1, 'Should have at least 1 content-problem page');
}

// ==========================================
console.log(`\n=== ${issues === 0 ? 'ALL TESTS PASSED' : `${issues} ISSUE(S) FOUND`} ===`);
process.exit(issues > 0 ? 1 : 0);
