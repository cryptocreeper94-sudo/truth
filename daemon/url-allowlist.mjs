/**
 * TRUTH — URL Domain Allowlist
 * Lume-V Governance Layer 4, Invariant 2 (No Fabricated URLs)
 *
 * If GPT-4o-mini outputs a verify-at URL, it must resolve to one of these
 * known-legitimate domains. Any URL outside this list is stripped and logged.
 * An empty verify-at is honest. A fabricated one is contamination.
 */

export const ALLOWED_DOMAINS = [
  // ── Digital archives ──
  'archive.org',
  'loc.gov',
  'gallica.bnf.fr',
  'hathitrust.org',
  'chroniclingamerica.loc.gov',
  'newspapers.com',
  'babel.hathitrust.org',
  'digitallibrary.hsp.org',

  // ── Government (any TLD) ──
  '.gov',
  '.gov.uk',
  '.gov.au',
  '.gov.ie',
  '.gc.ca',
  '.gv.at',

  // ── Academic (any TLD) ──
  '.edu',
  '.ac.uk',
  '.ac.at',
  'jstor.org',
  'doi.org',
  'scholar.google.com',
  'pubmed.ncbi.nlm.nih.gov',
  'arxiv.org',

  // ── Reference / encyclopedic ──
  'wikipedia.org',
  'wikimedia.org',
  'wikidata.org',
  'wikisource.org',
  'newadvent.org',
  'sefaria.org',
  'perseus.tufts.edu',
  'glottolog.org',
  'britannica.com',

  // ── Museums & institutions ──
  'britishmuseum.org',
  'si.edu',
  'nhm.ac.uk',
  'vaticanlibrary.va',
  'digi.vatlib.it',
  'bodleian.ox.ac.uk',
  'bl.uk',
  'vam.ac.uk',
  'museedelhomme.fr',
  'nyhistory.org',
  'chicagohistory.org',
  'coram.org.uk',
  'nationalarchives.gov.uk',
  'nationalarchives.ie',
  'canmore.org.uk',
  'historicenvironment.scot',
  'deadseascrolls.org.il',
  'fortticonderoga.org',
  'chateauversailles.fr',
  'bourtange.nl',

  // ── Declassified / FOIA ──
  'vault.fbi.gov',
  'cia.gov',
  'nsarchive.gwu.edu',
  'nsarchive2.gwu.edu',
  'intelligence.senate.gov',
  'federalreservehistory.org',
  'bankofengland.co.uk',

  // ── Patent offices ──
  'patents.google.com',
  'patft.uspto.gov',
  'worldwide.espacenet.com',

  // ── Satellite / geospatial ──
  'earthdata.nasa.gov',
  'firms.modaps.eosdis.nasa.gov',
  'landsat.gsfc.nasa.gov',
  'sentinel.esa.int',

  // ── Forensic / engineering ──
  'nist.gov',
  'fema.gov',
  'asce.org',
  'fire.ca.gov',
  'noaa.gov',

  // ── News archives (for media coverage analysis) ──
  'web.archive.org',
];

/**
 * Check if a URL belongs to an allowed domain.
 * @param {string} url - The URL to check
 * @returns {{ allowed: boolean, domain: string|null, reason: string }}
 */
export function checkUrlAllowed(url) {
  if (!url || typeof url !== 'string') {
    return { allowed: false, domain: null, reason: 'empty or non-string URL' };
  }

  let hostname;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return { allowed: false, domain: null, reason: `invalid URL: ${url}` };
  }

  for (const domain of ALLOWED_DOMAINS) {
    if (domain.startsWith('.')) {
      // TLD match: .gov, .edu, .ac.uk etc
      if (hostname.endsWith(domain)) {
        return { allowed: true, domain: hostname, reason: `matches TLD pattern ${domain}` };
      }
    } else {
      // Exact domain or subdomain match
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return { allowed: true, domain: hostname, reason: `matches allowed domain ${domain}` };
      }
    }
  }

  return { allowed: false, domain: hostname, reason: `${hostname} is not on the allowlist` };
}
