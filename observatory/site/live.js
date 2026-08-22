/**
 * ═══════════════════════════════════════════════════════════
 *  Truth Observatory — Live Status Engine
 *  DarkWave Studios LLC — Copyright 2026
 *
 *  Pings public APIs to verify stream availability.
 *  Pulses the card dot green when data is confirmed live.
 * ═══════════════════════════════════════════════════════════
 */

const LiveStatus = {

  // Endpoints to health-check — keys MUST match data-stream attributes in HTML
  endpoints: {
    nexrad: 'https://api.weather.gov/radar/stations?stationType=WSR-88D',
    solar: 'https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json',
    goes: 'https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json',
    geomag: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
    schumann: 'https://services.swpc.noaa.gov/products/summary/10cm-flux.json',
    seismic: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
    grid: 'https://api.eia.gov/v2/electricity/rto/region-data/data/?api_key=HCrxkfcdEVdmMTEW9MvJbMNDylrRs6l7TCPWKGWL&frequency=hourly&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=1',
    iono: 'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json',
    lightning: 'https://services.swpc.noaa.gov/json/goes/primary/differential-protons-1-day.json',
    // Stage 3 — new collectors
    surface: 'https://mesonet.agron.iastate.edu/api/1/currents.json?network=ASOS&only_online=true',
    blitz: 'https://map.blitzortung.org/GEOjson/GEOjson.php?c=America/New_York',
    aircraft: 'https://opensky-network.org/api/states/all?lamin=25&lomin=-125&lamax=50&lomax=-66',
    notam: 'https://www.tdlr.texas.gov/weather/wmlicensees.htm',
    celltower: 'https://www.fcc.gov/api/license-view/basicSearch/getLicenses?searchValue=cell&limit=1&format=json',
    haarp: 'https://haarp.gi.alaska.edu/',
    metals: 'https://waterservices.usgs.gov/nwis/iv/?format=json&period=P1D&siteStatus=active&stateCd=tn&parameterCd=01105',
    ecology: 'https://api.inaturalist.org/v1/observations?quality_grade=research&place_id=1&per_page=1&taxon_id=47336',
    chemistry: 'https://nadp.slh.wisc.edu/networks/national-trends-network/',
  },

  async checkAll() {
    const streams = Object.keys(this.endpoints);
    let liveCount = 0;

    for (const streamId of streams) {
      try {
        const resp = await fetch(this.endpoints[streamId]);
        if (resp.ok) {
          this.markLive(streamId);
          liveCount++;
        }
      } catch (err) {
        console.warn(`[Observatory] ${streamId} check failed:`, err.message);
      }
    }

    // Update the hero badge count
    const heroCount = document.querySelector('.hero__badge span:last-child');
    if (heroCount) heroCount.textContent = `${liveCount} streams active`;

    // Update status bar
    const statStreams = document.getElementById('stat-streams');
    if (statStreams) statStreams.textContent = `${liveCount} / 18`;
  },

  markLive(streamId) {
    const card = document.getElementById(`card-${streamId}`);
    if (!card) return;

    // Pulse the dot green
    const dot = card.querySelector('.stream-card__dot');
    if (dot) dot.classList.add('stream-card__dot--live');

    // Update badge to show confirmed
    const badge = card.querySelector('.stream-card__badge');
    if (badge && badge.textContent === 'Live') {
      badge.textContent = '● Live';
      badge.style.background = 'rgba(0, 255, 136, 0.15)';
      badge.style.color = '#00ff88';
      badge.style.borderColor = 'rgba(0, 255, 136, 0.3)';
    }
  },

  init() {
    this.checkAll();
    // Re-check every 5 minutes
    setInterval(() => this.checkAll(), 5 * 60 * 1000);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => LiveStatus.init());
} else {
  LiveStatus.init();
}
