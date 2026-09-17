/**
 * ═══════════════════════════════════════════════════════════════
 *  TRUTH OBSERVATORY — Expertise Level System
 *  DarkWave Studios LLC — Copyright 2026
 *
 *  Three expertise levels adapt language, depth, and UX:
 *    observer   — Plain English, guided explanations
 *    analyst    — Technical-lite, proper terms with context
 *    researcher — Full raw data, provenance, zero hand-holding
 *
 *  Stored in localStorage. Switchable anytime.
 * ═══════════════════════════════════════════════════════════════
 */

const Levels = {

  STORAGE_KEY: 'obs-expertise-level',
  VALID: ['observer', 'analyst', 'researcher'],

  // ── Get / Set ───────────────────────────────────────────────
  get() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return this.VALID.includes(stored) ? stored : null;
  },

  set(level) {
    if (!this.VALID.includes(level)) return;
    localStorage.setItem(this.STORAGE_KEY, level);
    document.body.setAttribute('data-level', level);
    window.dispatchEvent(new CustomEvent('level-change', { detail: { level } }));
  },

  needsOnboarding() {
    return this.get() === null;
  },

  apply() {
    const level = this.get() || 'observer';
    document.body.setAttribute('data-level', level);
  },

  // ── Level Metadata ──────────────────────────────────────────
  meta: {
    observer: {
      label: 'OBSERVER',
      icon: '🟢',
      color: '#00e676',
      tagline: "I'm curious. Show me what's happening and explain it like I'm new to this.",
      cockpitLabel: 'START WATCHING',
      heroSubtitle: 'See what\'s really happening in the atmosphere — in plain English.',
      atmoscore: 'How interesting is the atmosphere right now?',
    },
    analyst: {
      label: 'ANALYST',
      icon: '🟡',
      color: '#ffab00',
      tagline: 'I know the basics. I want to explore the data and understand the patterns.',
      cockpitLabel: 'OPEN DASHBOARD',
      heroSubtitle: 'Multi-stream atmospheric monitoring with cross-feed correlation analysis.',
      atmoscore: 'Atmospheric Composite Index — 4 primitive deterministic state engine.',
    },
    researcher: {
      label: 'RESEARCHER',
      icon: '🔴',
      color: '#ff5252',
      tagline: 'Give me the raw data, provenance, and full technical interface.',
      cockpitLabel: 'ENTER COCKPIT',
      heroSubtitle: 'Continuous atmospheric, geophysical, and infrastructure monitoring. Every observation hashed, manifest-logged, and provenance-tracked.',
      atmoscore: 'AtmosCore 4/42 Deterministic State Engine',
    },
  },

  // ── AtmoScore Primitive Labels ──────────────────────────────
  atmosLabels: {
    TH: {
      observer:   'Heat Energy',
      analyst:    'Thermodynamic',
      researcher: 'THERMODYNAMIC',
    },
    OP: {
      observer:   'Light & Visibility',
      analyst:    'Optical Propagation',
      researcher: 'OPTICAL PROPAGATION',
    },
    DY: {
      observer:   'Wind & Movement',
      analyst:    'Dynamic Flow',
      researcher: 'DYNAMIC FLOW',
    },
    TS: {
      observer:   'Stability',
      analyst:    'Temporal Stability',
      researcher: 'TEMPORAL STABILITY',
    },
  },

  // ── Suitability Labels ─────────────────────────────────────
  suitabilityLabels: {
    observer: {
      SUITABLE: 'Good conditions for observation',
      MARGINAL: 'Conditions are so-so right now',
      UNSUITABLE: 'Poor conditions — limited visibility',
    },
    analyst: {
      SUITABLE: 'Observation conditions: SUITABLE',
      MARGINAL: 'Observation conditions: MARGINAL',
      UNSUITABLE: 'Observation conditions: UNSUITABLE',
    },
    researcher: {
      SUITABLE: 'SUITABLE',
      MARGINAL: 'MARGINAL',
      UNSUITABLE: 'UNSUITABLE',
    },
  },

  // ── Domain Labels ──────────────────────────────────────────
  domainLabels: {
    'Atmospheric': {
      observer: '🌤️ Weather & Sky',
      analyst: 'Atmospheric',
      researcher: 'Atmospheric',
    },
    'Space Weather': {
      observer: '☀️ Sun & Magnetic Activity',
      analyst: 'Space Weather',
      researcher: 'Space Weather',
    },
    'Geological': {
      observer: '🌍 Earth & Earthquakes',
      analyst: 'Geological',
      researcher: 'Geological',
    },
    'RF Research': {
      observer: '📡 Radio & Research Facilities',
      analyst: 'RF Research',
      researcher: 'RF Research',
    },
    'Infrastructure': {
      observer: '🏗️ Power Grid & Aircraft',
      analyst: 'Infrastructure',
      researcher: 'Infrastructure',
    },
    'Ecological': {
      observer: '🌿 Nature & Environment',
      analyst: 'Ecological',
      researcher: 'Ecological',
    },
    'Airspace': {
      observer: '✈️ Flight Notices',
      analyst: 'Airspace',
      researcher: 'Airspace',
    },
    'Geophysical': {
      observer: '🔊 Earth Signals',
      analyst: 'Geophysical',
      researcher: 'Geophysical',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // FEED CONTENT DICTIONARY — 20 feeds × 3 levels
  // ═══════════════════════════════════════════════════════════
  feeds: {

    nexrad: {
      observer: {
        name: 'Weather Radar',
        tagline: 'Shows rain, storms, and things in the sky across the entire US.',
        why: 'Weather radar can detect more than just rain. Unusual returns can reveal particles, dispersals, or atmospheric anomalies that aren\'t precipitation. We watch for the patterns that most people never see.',
      },
      analyst: {
        name: 'NEXRAD Radar (160 stations)',
        tagline: 'WSR-88D Doppler network. Reflectivity, velocity, spectrum width. 5-min volumetric scans.',
        why: 'Non-precipitation echoes, chaff dispersal patterns, and anomalous returns are flagged and cross-correlated with other atmospheric streams.',
      },
      researcher: {
        name: 'NEXRAD Level II Reflectivity',
        tagline: 'NOAA WSR-88D S-band Doppler. N0Q base reflectivity from Iowa State Mesonet IEM.',
        why: null,
      },
    },

    goes: {
      observer: {
        name: 'Satellite View',
        tagline: 'Live satellite images of the US — what clouds and the atmosphere look like from space.',
        why: 'Satellites show cloud patterns, moisture movement, and atmospheric conditions that ground-level observation can\'t capture. Sometimes what looks like normal clouds from below shows very different patterns from above.',
      },
      analyst: {
        name: 'GOES Satellite (East + West)',
        tagline: 'GOES-19 East / GOES-18 West. Visible, infrared, and water vapor channels. 10-min CONUS scans.',
        why: 'Multi-band imagery allows differentiation between natural cloud formations and aerosol dispersal patterns. IR reveals cloud-top temperature anomalies.',
      },
      researcher: {
        name: 'GOES IMF + Satellite Imagery',
        tagline: 'NOAA SWPC solar wind magnetic field + GOES-East/West multi-band imagery via Iowa State WMS.',
        why: null,
      },
    },

    solar: {
      observer: {
        name: 'Sun Activity',
        tagline: 'Tracks solar flares and energy from the sun that can affect Earth.',
        why: 'The sun sends out bursts of energy that can disrupt electronics, affect the power grid, and change how radio signals travel. When the sun is active, effects ripple through every other system we monitor.',
      },
      analyst: {
        name: 'Solar X-Ray Flux',
        tagline: 'GOES X-ray irradiance, 0.1-0.8 nm band. Flare classification A through X.',
        why: 'Solar flare class correlates with geomagnetic disturbances. M and X-class events are cross-referenced against Kp index, ionospheric TEC, and grid demand anomalies.',
      },
      researcher: {
        name: 'SWPC X-Ray / Solar Wind',
        tagline: 'NOAA SWPC GOES primary sensor. XRS 0.05-0.4 nm and 0.1-0.8 nm bands.',
        why: null,
      },
    },

    earthquake: {
      observer: {
        name: 'Earthquake Activity',
        tagline: 'Real-time earthquakes happening around the world right now.',
        why: 'Earthquakes can be triggered by many things, and they often correlate with other geophysical activity. We track them to see patterns — not to predict, but to document.',
      },
      analyst: {
        name: 'USGS Earthquake Catalog',
        tagline: 'M2.5+ events in the last 24 hours. Magnitude, depth, location, review status.',
        why: 'Seismic activity is correlated with geomagnetic indices and atmospheric pressure changes. Temporal proximity between events is logged, never assumed causal.',
      },
      researcher: {
        name: 'USGS Seismic Feed (M2.5+ 24h)',
        tagline: 'GeoJSON earthquake feed. ComCat reviewed + automatic detections.',
        why: null,
      },
    },

    lightning: {
      observer: {
        name: 'Lightning',
        tagline: 'Where lightning is striking across the US, detected from space.',
        why: 'Lightning patterns tell us about storm intensity and atmospheric energy. Unusual lightning in clear air or in unexpected patterns can indicate atmospheric disturbances worth investigating.',
      },
      analyst: {
        name: 'Geostationary Lightning Mapper',
        tagline: 'GOES GLM L2 cluster data from both East and West platforms. 5-min integration.',
        why: 'Lightning density anomalies are cross-referenced with radar returns and surface station pressure data. Anomalous clear-air lightning events are flagged.',
      },
      researcher: {
        name: 'GOES GLM L2 Clusters',
        tagline: 'Dual-satellite GLM NetCDF cluster products via NOAA CLASS.',
        why: null,
      },
    },

    grid: {
      observer: {
        name: 'Power Grid',
        tagline: 'How much electricity the US is using right now.',
        why: 'Sudden spikes or drops in power demand that can\'t be explained by weather or time-of-day could indicate something affecting the grid — like space weather, equipment failures, or unusual activity.',
      },
      analyst: {
        name: 'EIA-930 Power Grid',
        tagline: 'Hourly demand and generation from major US balancing authorities.',
        why: 'Grid demand anomalies not explained by temperature, time, or season are cross-referenced with geomagnetic indices. Geomagnetically induced currents (GICs) are a documented phenomenon.',
      },
      researcher: {
        name: 'EIA-930 Hourly Grid Demand',
        tagline: 'US Energy Information Administration RTO region-data API. Hourly resolution.',
        why: null,
      },
    },

    geomag: {
      observer: {
        name: 'Earth\'s Magnetic Field',
        tagline: 'Measures disturbances in Earth\'s magnetic field caused by the sun.',
        why: 'When Earth\'s magnetic field gets disturbed, it can affect compass readings, animal navigation, radio communications, and even how we feel. Big disturbances are called geomagnetic storms.',
      },
      analyst: {
        name: 'Kp Geomagnetic Index',
        tagline: 'Global activity index from 13 ground magnetometers between 44-60° latitude. Scale 0-9.',
        why: 'Kp ≥ 5 indicates storm conditions. Cross-referenced with solar wind Bz, IMF conditions, and ionospheric TEC for multi-layer correlation.',
      },
      researcher: {
        name: 'Estimated Planetary Kp Index',
        tagline: 'NOAA SWPC planetary K-index product. 3-hourly cadence.',
        why: null,
      },
    },

    ionosonde: {
      observer: {
        name: 'Ionosphere',
        tagline: 'The invisible electric layer above us that affects radio signals and GPS.',
        why: 'The ionosphere sits 50-600 miles above Earth and reflects radio waves. When it gets disturbed — by solar activity, by heater facilities, or by unknown causes — GPS can glitch, radio goes haywire, and we want to know why.',
      },
      analyst: {
        name: 'Ionospheric TEC',
        tagline: 'Total Electron Content from GIRO (Global Ionospheric Radio Observatory). Measures ionization density.',
        why: 'TEC anomalies are cross-referenced with heater facility schedules, solar flare events, and geomagnetic conditions to distinguish natural from artificial ionospheric modification.',
      },
      researcher: {
        name: 'GIRO Ionosonde TEC',
        tagline: 'DIDBase ionogram records via UML GIRO. SAO-format TEC products.',
        why: null,
      },
    },

    schumann: {
      observer: {
        name: 'Earth\'s Heartbeat',
        tagline: 'A natural electromagnetic pulse that resonates around the entire planet.',
        why: 'The Schumann Resonance is like Earth\'s own heartbeat — a hum at 7.83 Hz caused by lightning between the ground and ionosphere. When it shifts, something changed. We track what.',
      },
      analyst: {
        name: 'Schumann Resonance',
        tagline: 'Fundamental mode ~7.83 Hz. Aggregated from multiple global observation stations.',
        why: 'SR frequency and amplitude shifts correlate with global lightning activity, ionospheric modification, and large-scale geomagnetic events. Baselines tracked for anomaly detection.',
      },
      researcher: {
        name: 'Schumann Resonance Aggregator',
        tagline: 'Multi-station aggregation. ELF band fundamental and harmonic modes.',
        why: null,
      },
    },

    surface: {
      observer: {
        name: 'Ground Weather',
        tagline: 'Temperature, wind, and pressure readings from stations on the ground.',
        why: 'Ground-level readings tell us what\'s actually happening where people live. When temperature, pressure, or humidity doesn\'t match what the forecast says, we notice.',
      },
      analyst: {
        name: 'Surface Stations (ASOS)',
        tagline: 'NOAA ASOS/Mesonet automated observations. Wind, temp, pressure, humidity, visibility.',
        why: 'Surface data grounds the satellite view. Pressure anomalies, temperature inversions, and unexpected humidity patterns are flagged for cross-correlation.',
      },
      researcher: {
        name: 'ASOS / Mesonet Surface Obs',
        tagline: 'NOAA ASOS + Oklahoma Mesonet + MADIS. Multi-element ground truth observations.',
        why: null,
      },
    },

    blitzortung: {
      observer: {
        name: 'Lightning Network',
        tagline: 'A worldwide network of volunteers tracking lightning strikes in real time.',
        why: 'Unlike the government satellite data, this is a citizen-run network — thousands of receivers around the world, independently detecting and triangulating lightning. Two sources are better than one.',
      },
      analyst: {
        name: 'Blitzortung Network',
        tagline: 'Community lightning detection network. VLF radio receivers worldwide. Independent of GOES GLM.',
        why: 'Independent ground-truth for GOES GLM satellite data. Discrepancies between the two systems are logged as potential data quality events.',
      },
      researcher: {
        name: 'Blitzortung VLF Lightning',
        tagline: 'Community VLF receiver network. Crowdsourced TOA triangulation.',
        why: null,
      },
    },

    aircraft: {
      observer: {
        name: 'Airplane Tracker',
        tagline: 'Live positions of aircraft flying over the US right now.',
        why: 'We track aircraft to see what\'s flying, where, and at what altitude. Sometimes the most interesting patterns come from what\'s flying where you wouldn\'t expect it — or from planes with no public flight plan.',
      },
      analyst: {
        name: 'ADS-B Exchange',
        tagline: 'Unfiltered ADS-B transponder data. Flight, altitude, speed, heading within 500nm CONUS.',
        why: 'Unlike FlightRadar24 or FlightAware, ADS-B Exchange is unfiltered — military and government aircraft that are blocked on commercial trackers still appear here.',
      },
      researcher: {
        name: 'ADS-B Exchange (Unfiltered)',
        tagline: 'RapidAPI ADS-B Exchange. Unfiltered, non-commercial feed. Military visible.',
        why: null,
      },
    },

    notam: {
      observer: {
        name: 'Flight Restrictions',
        tagline: 'Official notices about airspace closures and special activities, including cloud seeding.',
        why: 'Before anything unusual happens in the sky, there\'s usually a paper trail. NOTAMs (Notices to Air Missions) are the aviation system\'s way of saying "something is going on here." We specifically track the ones related to weather modification.',
      },
      analyst: {
        name: 'NOTAMs / Cloud Seeding Permits',
        tagline: 'FAA NOTAMs filtered for weather modification, TFRs, and airspace restrictions.',
        why: 'Active cloud seeding operations, weather modification permits, and temporary flight restrictions are cross-referenced with radar returns and surface precipitation data.',
      },
      researcher: {
        name: 'FAA NOTAM / Cloud Seeding Registry',
        tagline: 'FAA NOTAM API + NOAA weather modification activity reports. Filtered by WX MOD keywords.',
        why: null,
      },
    },

    celltower: {
      observer: {
        name: 'Cell Towers',
        tagline: 'Maps of cell tower locations and their registered information.',
        why: 'Cell tower data creates a map of RF infrastructure. When towers appear or disappear, change frequency, or cluster in unusual patterns, it\'s worth documenting.',
      },
      analyst: {
        name: 'Cell Tower Registry',
        tagline: 'FCC-registered cell tower locations, frequencies, and operators. Daily snapshot.',
        why: 'Tower density, frequency allocation, and deployment patterns are archived for longitudinal analysis. New deployments near sensitive areas are flagged.',
      },
      researcher: {
        name: 'OpenCelliD / FCC Registry',
        tagline: 'OpenCelliD crowdsourced + FCC ASR/ULS licensing data. Daily refresh.',
        why: null,
      },
    },

    heater: {
      observer: {
        name: 'Research Transmitters',
        tagline: 'Powerful radio facilities that can temporarily change the ionosphere for research.',
        why: 'Facilities like HAARP in Alaska use powerful radio waves to heat tiny patches of the ionosphere for scientific experiments. We track when they operate and what other systems show during those windows.',
      },
      analyst: {
        name: 'Ionospheric Heater Facilities',
        tagline: 'HAARP, EISCAT, Sura, Jicamarca, Arecibo, MU Radar. Public experiment schedules archived.',
        why: 'Operating windows are cross-referenced with ionosonde TEC data, geomagnetic indices, and Schumann resonance to identify temporal correlations. Each facility identified by real name and location.',
      },
      researcher: {
        name: 'HF Ionospheric Heaters',
        tagline: 'Phased-array HF facilities. HAARP (3.6 MW ERP), EISCAT, Sura, Jicamarca. Public schedule archival.',
        why: null,
      },
    },

    metals: {
      observer: {
        name: 'Water Quality',
        tagline: 'Traces of metals like aluminum, barium, and strontium in water supplies.',
        why: 'Certain metals show up in rainwater and surface water. The question isn\'t whether they\'re there — they naturally occur. The question is whether the levels are higher than the geological baseline, and whether they correlate with atmospheric events.',
      },
      analyst: {
        name: 'Trace Metal Deposition',
        tagline: 'USGS NWIS real-time water quality. Aluminum (01105), Barium, Strontium in surface water.',
        why: 'Concentrations compared against geological baselines, seasonal patterns, and industrial discharge records. Elevations must rule out natural weathering before any attribution.',
      },
      researcher: {
        name: 'USGS NWIS Trace Metals',
        tagline: 'USGS National Water Information System. Parameter codes 01105 (Al), 01007 (Ba), 01082 (Sr).',
        why: null,
      },
    },

    ecology: {
      observer: {
        name: 'Bee & Pollinator Watch',
        tagline: 'Tracking bee, butterfly, and dragonfly populations across the US.',
        why: 'Pollinators are canaries in the coal mine. When bee populations drop, something in the environment changed. We track research-grade observations from real scientists and volunteers to see the long-term trends.',
      },
      analyst: {
        name: 'Pollinator Ecology Index',
        tagline: 'iNaturalist research-grade observations. Apoidea, Lepidoptera, Odonata. US coverage.',
        why: 'Population trends serve as ecosystem health indicators. Declines analyzed against pesticide use, habitat loss, climate shifts, and atmospheric deposition data.',
      },
      researcher: {
        name: 'iNaturalist Pollinator Obs',
        tagline: 'iNaturalist API v1. Research-grade only. Taxon 47336 (Apoidea). US place_id=1.',
        why: null,
      },
    },

    deposition: {
      observer: {
        name: 'Rain Chemistry',
        tagline: 'What chemicals are actually in the rain that falls on your lawn.',
        why: 'Rain isn\'t just water. The NADP has been testing rain chemistry at 250+ stations for decades. Sulfate, nitrate, mercury, and other compounds tell the story of what\'s in the atmosphere — with real numbers, not speculation.',
      },
      analyst: {
        name: 'Atmospheric Deposition (NADP)',
        tagline: 'National Atmospheric Deposition Program NTN. 250+ sites, weekly composite samples.',
        why: 'Long-term sulfate, nitrate, ammonium, and mercury trends. Supplemented by CoCoRaHS volunteer precipitation measurements from 20,000+ observers.',
      },
      researcher: {
        name: 'NADP NTN / MDN / CoCoRaHS',
        tagline: 'NADP National Trends Network + Mercury Deposition Network + CoCoRaHS. Ion chromatography.',
        why: null,
      },
    },

    wildfire: {
      observer: {
        name: 'Wildfires',
        tagline: 'Active wildfires burning across the US right now.',
        why: 'We track every active wildfire — size, containment, and cause. Some fires have known causes, some don\'t. We log the data and let the patterns speak for themselves.',
      },
      analyst: {
        name: 'Wildfires (NIFC/IRWIN)',
        tagline: 'National Interagency Fire Center incident feed. Acreage, containment, cause, discovery date.',
        why: 'Wildfire locations and timing are cross-referenced with satellite thermal detections (FIRMS), wind patterns, and atmospheric conditions for pattern analysis.',
      },
      researcher: {
        name: 'NIFC/IRWIN Active Incidents',
        tagline: 'NIFC IRWIN via ESRI ArcGIS Feature Service. Incident Command System data model.',
        why: null,
      },
    },

    volcanic: {
      observer: {
        name: 'Volcanoes',
        tagline: 'US volcanoes that are currently showing elevated activity.',
        why: 'Volcanic activity connects to the bigger geophysical picture. Eruptions affect the atmosphere, air travel, and weather patterns. We track what the USGS reports.',
      },
      analyst: {
        name: 'Volcanic Activity (USGS)',
        tagline: 'USGS Volcano Hazards Program. Alert level, aviation color code, threat assessment.',
        why: 'Volcanic eruptions inject aerosols into the stratosphere. Alert level changes are cross-referenced with atmospheric chemistry and satellite imagery.',
      },
      researcher: {
        name: 'USGS VHP Alert Levels',
        tagline: 'USGS Volcano Hazards Program API. NVEWS very high + high threat scores.',
        why: null,
      },
    },
  },

  // ── Get feed content for current level ─────────────────────
  getFeedContent(feedId) {
    const level = this.get() || 'observer';
    const feed = this.feeds[feedId];
    if (!feed) return null;
    return feed[level] || feed.researcher;
  },

  // ── Get domain label for current level ─────────────────────
  getDomainLabel(domain) {
    const level = this.get() || 'observer';
    const labels = this.domainLabels[domain];
    return labels ? labels[level] : domain;
  },

  // ── Get atmos label for current level ──────────────────────
  getAtmosLabel(primitive) {
    const level = this.get() || 'observer';
    const labels = this.atmosLabels[primitive];
    return labels ? labels[level] : primitive;
  },

  // ── Get current level metadata ─────────────────────────────
  getCurrentMeta() {
    const level = this.get() || 'observer';
    return this.meta[level];
  },
};
