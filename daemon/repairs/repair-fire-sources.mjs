#!/usr/bin/env node
/**
 * TRUTH — Fire-Event Source Repair
 * Fixes fabricated URLs and catalog numbers identified in the v0.4.0 review.
 * 
 * Per METHOD.md: An honest omission is better than a fabricated citation.
 * These sources reference real events and real agencies, but the specific
 * URLs and catalog numbers were AI-generated and don't follow real conventions.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(ROOT, 'sources', 'tier-1');

const REPAIRS = {
  'S-0150': {
    // lahainafiredepartment.gov does not exist. Real agency is Maui County Fire Dept.
    url: 'https://www.mauicounty.gov/605/Department-of-Fire-Public-Safety',
    catalogFix: { from: /Catalog No\.\s*[\w-]+/g, to: 'See Maui County Fire Department records' },
    holderFix: { from: /Lahaina Fire Department/g, to: 'Maui County Department of Fire and Public Safety' },
  },
  'S-0151': {
    // gis.hawaii.gov/modis/lahaina2023 does not exist. Real satellite data is at NASA FIRMS
    url: 'https://firms.modaps.eosdis.nasa.gov/map/',
    catalogFix: { from: /Catalog No\.\s*[\w-]+/g, to: 'NASA FIRMS MODIS/VIIRS active fire data' },
  },
  'S-0152': {
    // osu.edu is Ohio State. Oregon State is oregonstate.edu
    url: 'https://www.oregonstate.edu/',
    catalogFix: { from: /Study No\.\s*[\w-]+/g, to: 'See Oregon State University College of Forestry publications' },
  },
  'S-0153': {
    // insurance.ca.gov path fabricated. Use real CDI page
    url: 'https://www.insurance.ca.gov/01-consumers/140-catastrophes/WildfireResources.cfm',
    catalogFix: { from: /Report No\.\s*[\w-]+/g, to: 'See CA DOI wildfire insurance resources' },
  },
  'S-0154': {
    // fema.gov/wildfire-response-2023 does not exist at that path
    url: 'https://www.fema.gov/disaster/declarations',
    catalogFix: { from: /Report No\.\s*[\w-]+/g, to: 'See FEMA disaster declarations database' },
  },
  'S-0155': {
    // Already stripped by governance. Add real NAIC page
    url: 'https://content.naic.org/',
    catalogFix: { from: /Report No\.\s*[\w-]+/g, to: 'See NAIC insurance data products' },
  },
};

let repaired = 0;
for (const [id, fix] of Object.entries(REPAIRS)) {
  const files = readdirSync(dir);
  const match = files.find(f => f.includes(id));
  if (!match) { console.log(`? ${id}: not found`); continue; }
  
  const filePath = join(dir, match);
  let text = readFileSync(filePath, 'utf-8');
  let changed = false;

  // Fix verify-at URL
  const urlRegex = /^verify-at:\s*.+$/m;
  if (urlRegex.test(text)) {
    const newText = text.replace(urlRegex, `verify-at: ${fix.url}`);
    if (newText !== text) { text = newText; changed = true; }
  }

  // Fix fabricated catalog numbers
  if (fix.catalogFix) {
    const newText = text.replace(fix.catalogFix.from, fix.catalogFix.to);
    if (newText !== text) { text = newText; changed = true; }
  }

  // Fix institution name if wrong
  if (fix.holderFix) {
    const newText = text.replace(fix.holderFix.from, fix.holderFix.to);
    if (newText !== text) { text = newText; changed = true; }
  }

  if (changed) {
    writeFileSync(filePath, text);
    console.log(`✓ ${id}: repaired → ${fix.url}`);
    repaired++;
  } else {
    console.log(`⊘ ${id}: no changes needed`);
  }
}

console.log(`\nFire-event repair done. Fixed: ${repaired}`);
