/**
 * TRUTH Observatory — Local Weather & Broadcast Station Registry
 * DarkWave Studios LLC — Copyright 2026
 *
 * Maps NOAA NWS Weather Forecast Offices (WFO), Radar Stations,
 * Designated Market Areas (DMA), and local television emergency streams.
 */

// Cache for NWS points lookup: key = `${lat.toFixed(2)},${lon.toFixed(2)}` -> 24 hour TTL
const pointOfficeCache = new Map();

/**
 * Curated registry of broadcast news affiliates & live coverage links
 * keyed by NWS WFO office code.
 */
export const WFO_METADATA = {
  ILN: {
    wfo: 'ILN',
    name: 'NWS Wilmington (Ohio Valley)',
    market: 'Cincinnati / Dayton / Columbus',
    state: 'OH',
    broadcasts: [
      { name: 'WLWT News 5 (NBC)', network: 'NBC', city: 'Cincinnati', url: 'https://www.wlwt.com/nowcast' },
      { name: 'WCPO 9 (ABC)', network: 'ABC', city: 'Cincinnati', url: 'https://www.wcpo.com/live' },
      { name: 'WHIO 7 (CBS)', network: 'CBS', city: 'Dayton', url: 'https://www.whio.com/live-stream/' },
      { name: 'WBNS 10TV (CBS)', network: 'CBS', city: 'Columbus', url: 'https://www.10tv.com/watch' },
      { name: 'FOX 19 NOW', network: 'FOX', city: 'Cincinnati', url: 'https://www.fox19.com/livestream/' }
    ]
  },
  IND: {
    wfo: 'IND',
    name: 'NWS Indianapolis',
    market: 'Central Indiana',
    state: 'IN',
    broadcasts: [
      { name: 'WTHR 13 (NBC)', network: 'NBC', city: 'Indianapolis', url: 'https://www.wthr.com/watch' },
      { name: 'WISH-TV 8 (CW)', network: 'CW', city: 'Indianapolis', url: 'https://www.wishtv.com/live-stream/' },
      { name: 'FOX 59 WXIN', network: 'FOX', city: 'Indianapolis', url: 'https://fox59.com/live/' }
    ]
  },
  CLE: {
    wfo: 'CLE',
    name: 'NWS Cleveland',
    market: 'Cleveland / Akron / Canton',
    state: 'OH',
    broadcasts: [
      { name: 'WKYC 3 (NBC)', network: 'NBC', city: 'Cleveland', url: 'https://www.wkyc.com/watch' },
      { name: 'WEWS 5 (ABC)', network: 'ABC', city: 'Cleveland', url: 'https://www.news5cleveland.com/live' },
      { name: 'FOX 8 Cleveland', network: 'FOX', city: 'Cleveland', url: 'https://fox8.com/live/' }
    ]
  },
  RLX: {
    wfo: 'RLX',
    name: 'NWS Charleston',
    market: 'Charleston / Huntington',
    state: 'WV',
    broadcasts: [
      { name: 'WSAZ 3 (NBC)', network: 'NBC', city: 'Huntington', url: 'https://www.wsaz.com/livestream/' },
      { name: 'WCHS 8 (ABC/FOX)', network: 'ABC', city: 'Charleston', url: 'https://wchstv.com/watch' }
    ]
  },
  LOT: {
    wfo: 'LOT',
    name: 'NWS Chicago',
    market: 'Chicago Metro',
    state: 'IL',
    broadcasts: [
      { name: 'WGN 9 Chicago', network: 'IND', city: 'Chicago', url: 'https://wgntv.com/live/' },
      { name: 'NBC 5 Chicago', network: 'NBC', city: 'Chicago', url: 'https://www.nbcchicago.com/live/' },
      { name: 'ABC 7 Chicago', network: 'ABC', city: 'Chicago', url: 'https://abc7chicago.com/live/' }
    ]
  },
  FWD: {
    wfo: 'FWD',
    name: 'NWS Dallas / Fort Worth',
    market: 'Dallas-Fort Worth Metroplex',
    state: 'TX',
    broadcasts: [
      { name: 'WFAA 8 (ABC)', network: 'ABC', city: 'Dallas', url: 'https://www.wfaa.com/watch' },
      { name: 'NBC 5 DFW', network: 'NBC', city: 'Fort Worth', url: 'https://www.nbcdfw.com/live/' },
      { name: 'FOX 4 KDFW', network: 'FOX', city: 'Dallas', url: 'https://www.fox4news.com/live' }
    ]
  },
  HGX: {
    wfo: 'HGX',
    name: 'NWS Houston / Galveston',
    market: 'Houston Metro',
    state: 'TX',
    broadcasts: [
      { name: 'KPRC 2 (NBC)', network: 'NBC', city: 'Houston', url: 'https://www.click2houston.com/live/' },
      { name: 'ABC 13 KTRK', network: 'ABC', city: 'Houston', url: 'https://abc13.com/live/' },
      { name: 'KHOU 11 (CBS)', network: 'CBS', city: 'Houston', url: 'https://www.khou.com/watch' }
    ]
  },
  FFC: {
    wfo: 'FFC',
    name: 'NWS Peachtree City (Atlanta)',
    market: 'Atlanta Metro',
    state: 'GA',
    broadcasts: [
      { name: 'WSB-TV 2 (ABC)', network: 'ABC', city: 'Atlanta', url: 'https://www.wsbtv.com/live-stream/' },
      { name: '11Alive WXIA (NBC)', network: 'NBC', city: 'Atlanta', url: 'https://www.11alive.com/watch' },
      { name: 'FOX 5 Atlanta', network: 'FOX', city: 'Atlanta', url: 'https://www.fox5atlanta.com/live' }
    ]
  },
  OKX: {
    wfo: 'OKX',
    name: 'NWS New York City',
    market: 'New York Tri-State',
    state: 'NY',
    broadcasts: [
      { name: 'WABC 7 Eyewitness News', network: 'ABC', city: 'New York', url: 'https://abc7ny.com/live/' },
      { name: 'NBC 4 New York', network: 'NBC', city: 'New York', url: 'https://www.nbcnewyork.com/live/' },
      { name: 'WPIX 11', network: 'CW', city: 'New York', url: 'https://pix11.com/live/' }
    ]
  },
  PHI: {
    wfo: 'PHI',
    name: 'NWS Mount Holly (Philadelphia)',
    market: 'Philadelphia / Delaware Valley',
    state: 'PA',
    broadcasts: [
      { name: '6abc Action News', network: 'ABC', city: 'Philadelphia', url: 'https://6abc.com/live/' },
      { name: 'NBC 10 Philadelphia', network: 'NBC', city: 'Philadelphia', url: 'https://www.nbcphiladelphia.com/live/' }
    ]
  },
  LWX: {
    wfo: 'LWX',
    name: 'NWS Baltimore / Washington',
    market: 'Washington DC / Baltimore',
    state: 'DC',
    broadcasts: [
      { name: 'NBC 4 Washington', network: 'NBC', city: 'Washington', url: 'https://www.nbcwashington.com/live/' },
      { name: 'FOX 5 DC', network: 'FOX', city: 'Washington', url: 'https://www.fox5dc.com/live' },
      { name: 'WBAL 11 (NBC)', network: 'NBC', city: 'Baltimore', url: 'https://www.wbaltv.com/nowcast' }
    ]
  },
  PBZ: {
    wfo: 'PBZ',
    name: 'NWS Pittsburgh',
    market: 'Pittsburgh Metro',
    state: 'PA',
    broadcasts: [
      { name: 'KDKA 2 (CBS)', network: 'CBS', city: 'Pittsburgh', url: 'https://www.cbsnews.com/pittsburgh/live/' },
      { name: 'WTAE 4 (ABC)', network: 'ABC', city: 'Pittsburgh', url: 'https://www.wtae.com/nowcast' }
    ]
  },
  MFL: {
    wfo: 'MFL',
    name: 'NWS Miami',
    market: 'South Florida / Miami',
    state: 'FL',
    broadcasts: [
      { name: 'WPLG Local 10 (ABC)', network: 'ABC', city: 'Miami', url: 'https://www.local10.com/live/' },
      { name: 'NBC 6 South Florida', network: 'NBC', city: 'Miami', url: 'https://www.nbcmiami.com/live/' }
    ]
  },
  TBW: {
    wfo: 'TBW',
    name: 'NWS Tampa Bay Area',
    market: 'Tampa / St. Petersburg',
    state: 'FL',
    broadcasts: [
      { name: 'FOX 13 Tampa Bay', network: 'FOX', city: 'Tampa', url: 'https://www.fox13news.com/live' },
      { name: 'WFLA News Channel 8', network: 'NBC', city: 'Tampa', url: 'https://www.wfla.com/live/' }
    ]
  },
  MLB: {
    wfo: 'MLB',
    name: 'NWS Melbourne',
    market: 'Orlando / Space Coast',
    state: 'FL',
    broadcasts: [
      { name: 'WESH 2 (NBC)', network: 'NBC', city: 'Orlando', url: 'https://www.wesh.com/nowcast' },
      { name: 'WFTV 9 (ABC)', network: 'ABC', city: 'Orlando', url: 'https://www.wftv.com/live-stream/' }
    ]
  },
  LSX: {
    wfo: 'LSX',
    name: 'NWS St. Louis',
    market: 'St. Louis Metro',
    state: 'MO',
    broadcasts: [
      { name: 'KSDK 5 (NBC)', network: 'NBC', city: 'St. Louis', url: 'https://www.ksdk.com/watch' },
      { name: 'KMOV 4 (CBS)', network: 'CBS', city: 'St. Louis', url: 'https://www.firstalert4.com/livestream/' }
    ]
  },
  EAX: {
    wfo: 'EAX',
    name: 'NWS Kansas City',
    market: 'Kansas City Metro',
    state: 'MO',
    broadcasts: [
      { name: 'KMBC 9 (ABC)', network: 'ABC', city: 'Kansas City', url: 'https://www.kmbc.com/nowcast' },
      { name: 'KSHB 41 (NBC)', network: 'NBC', city: 'Kansas City', url: 'https://www.kshb.com/live' }
    ]
  },
  OHX: {
    wfo: 'OHX',
    name: 'NWS Nashville (Middle Tennessee)',
    market: 'Nashville / Gladeville / Lebanon',
    state: 'TN',
    timeZone: 'America/Chicago',
    broadcasts: [
      { name: 'WSMV 4 (NBC)', network: 'NBC', city: 'Nashville', url: 'https://www.wsmv.com/livestream/' },
      { name: 'NewsChannel 5 (CBS)', network: 'CBS', city: 'Nashville', url: 'https://www.newschannel5.com/live' },
      { name: 'WKRN News 2 (ABC)', network: 'ABC', city: 'Nashville', url: 'https://www.wkrn.com/live/' },
      { name: 'FOX 17 Nashville', network: 'FOX', city: 'Nashville', url: 'https://fox17.com/watch' }
    ]
  },
  OUN: {
    wfo: 'OUN',
    name: 'NWS Norman (Oklahoma City)',
    market: 'Oklahoma City Metro',
    state: 'OK',
    broadcasts: [
      { name: 'KOCO 5 (ABC)', network: 'ABC', city: 'Oklahoma City', url: 'https://www.koco.com/nowcast' },
      { name: 'KFOR 4 (NBC)', network: 'NBC', city: 'Oklahoma City', url: 'https://kfor.com/live/' }
    ]
  },
  BOU: {
    wfo: 'BOU',
    name: 'NWS Boulder / Denver',
    market: 'Denver Front Range',
    state: 'CO',
    broadcasts: [
      { name: '9NEWS KUSA (NBC)', network: 'NBC', city: 'Denver', url: 'https://www.9news.com/watch' },
      { name: 'Denver7 KMGH (ABC)', network: 'ABC', city: 'Denver', url: 'https://www.denver7.com/live' }
    ]
  },
  SEW: {
    wfo: 'SEW',
    name: 'NWS Seattle',
    market: 'Seattle / Puget Sound',
    state: 'WA',
    broadcasts: [
      { name: 'KING 5 (NBC)', network: 'NBC', city: 'Seattle', url: 'https://www.king5.com/watch' },
      { name: 'KOMO 4 (ABC)', network: 'ABC', city: 'Seattle', url: 'https://komonews.com/watch' }
    ]
  },
  LOX: {
    wfo: 'LOX',
    name: 'NWS Los Angeles / Oxnard',
    market: 'Greater Los Angeles',
    state: 'CA',
    broadcasts: [
      { name: 'KTLA 5', network: 'CW', city: 'Los Angeles', url: 'https://ktla.com/live/' },
      { name: 'ABC7 Eyewitness News', network: 'ABC', city: 'Los Angeles', url: 'https://abc7.com/live/' },
      { name: 'NBC4 Southern California', network: 'NBC', city: 'Los Angeles', url: 'https://www.nbclosangeles.com/live/' }
    ]
  }
};

/**
 * Resolves NOAA NWS Weather Forecast Office and broadcast metadata for given lat/lon coordinates.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>}
 */
export async function resolveLocalStation(lat, lon) {
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLon = Math.round(lon * 100) / 100;
  const key = `${roundedLat.toFixed(2)},${roundedLon.toFixed(2)}`;

  const now = Date.now();
  const cached = pointOfficeCache.get(key);
  if (cached && (now - cached.timestamp) < 86400000) { // 24 hour TTL
    return cached.data;
  }

  try {
    const res = await fetch(`https://api.weather.gov/points/${roundedLat},${roundedLon}`, {
      headers: {
        'User-Agent': 'TruthObservatory/1.0 (contact@darkwavestudios.io)',
        'Accept': 'application/geo+json'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) {
      throw new Error(`NWS points returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const props = data.properties || {};
    const wfo = props.cwa || 'US';
    const radar = props.radarStation || '';
    let city = props.relativeLocation?.properties?.city || '';
    const state = props.relativeLocation?.properties?.state || '';
    // Home base Gladeville, TN check
    if (roundedLat >= 36.05 && roundedLat <= 36.25 && roundedLon >= -86.40 && roundedLon <= -86.15) {
      city = 'Gladeville';
    }

    const meta = WFO_METADATA[wfo] || {
      wfo,
      name: `NWS ${wfo}`,
      market: city && state ? `${city}, ${state} Area` : `${wfo} Region`,
      state: state || '',
      broadcasts: []
    };

    const stationPayload = {
      wfo,
      wfoName: meta.name,
      market: meta.market,
      city: city || meta.market,
      state: state || meta.state,
      timeZone: props.timeZone || 'UTC',
      radarStation: radar,
      links: {
        wfoPortal: `https://www.weather.gov/${wfo.toLowerCase()}/`,
        forecastDiscussion: `https://forecast.weather.gov/product.php?site=${wfo.toLowerCase()}&issuedby=${wfo.toUpperCase()}&product=AFD&format=CI&version=1&glossary=1`,
        hourlyForecast: props.forecastHourly || `https://forecast.weather.gov/MapClick.php?lat=${roundedLat}&lon=${roundedLon}`,
        radarStream: radar ? `https://radar.weather.gov/station/${radar.toLowerCase()}/standard` : 'https://radar.weather.gov/',
        noaaRadio: props.nwr ? {
          transmitter: props.nwr.transmitter,
          streamUrl: props.nwr.areaBroadcast
        } : null
      },
      broadcasts: meta.broadcasts.length > 0 ? meta.broadcasts : [
        {
          name: `${meta.name} Official Radar`,
          network: 'NWS',
          city: city || 'Local',
          url: radar ? `https://radar.weather.gov/station/${radar.toLowerCase()}/standard` : `https://www.weather.gov/${wfo.toLowerCase()}/`
        },
        {
          name: 'WeatherNation Live',
          network: 'Live',
          city: 'National/Regional',
          url: 'https://www.weathernationtv.com/'
        }
      ]
    };

    pointOfficeCache.set(key, { timestamp: now, data: stationPayload });
    if (pointOfficeCache.size > 1000) {
      const oldestKey = pointOfficeCache.keys().next().value;
      pointOfficeCache.delete(oldestKey);
    }

    return stationPayload;
  } catch (err) {
    console.warn(`[LOCAL STATION] Lookup failed for ${key}:`, err.message);
    if (cached) return cached.data;
    // Fallback payload
    return {
      wfo: 'US',
      wfoName: 'National Weather Service',
      market: 'United States',
      city: 'Local Area',
      state: '',
      timeZone: 'UTC',
      radarStation: '',
      links: {
        wfoPortal: 'https://www.weather.gov/',
        forecastDiscussion: 'https://www.weather.gov/',
        hourlyForecast: `https://forecast.weather.gov/MapClick.php?lat=${roundedLat}&lon=${roundedLon}`,
        radarStream: 'https://radar.weather.gov/'
      },
      broadcasts: [
        { name: 'NWS National Radar', network: 'NWS', city: 'National', url: 'https://radar.weather.gov/' },
        { name: 'WeatherNation Live', network: 'Live', city: 'National', url: 'https://www.weathernationtv.com/' }
      ]
    };
  }
}
