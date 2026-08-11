---
name: Observatory API quirks
description: Confirmed working/broken public seismic and geophysical API endpoints as of August 2026.
---

# Observatory API Endpoint Notes

**Why:** Several endpoints that appeared plausible (USGS VHP, USGS QFaults WFS, Smithsonian GVP) are broken or inaccessible at runtime. Spending time on these wastes iterations. Use the confirmed-working list.

## Confirmed WORKING

| Source | URL | Format | Notes |
|---|---|---|---|
| USGS ComCat | `https://earthquake.usgs.gov/fdsnws/event/1/query` | GeoJSON | Primary event catalog |
| ISC events | `https://www.isc.ac.uk/fdsnws/event/1/query` | **text only** | Rejects `format=geojson`; timestamp must be `YYYY-MM-DDTHH:MM:SS` (no Z, no ms) |
| EMSC/INGV/GeoNet/BGR | respective FDSN base URLs | GeoJSON | All support `orderby` |
| NOAA NGDC volcanoes | `https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/volcanoes?maxResults=2000` | JSON `{items:[...]}` | Dedupe by `volcanoLocationId`; returns ~63 unique locations |
| IRIS/EarthScope stations | `https://service.iris.edu/fdsnws/station/1/query` | FDSN text | `level=station` works |
| EarthScope PBO deformation | `https://data.unavco.org/archive/gnss/products/velocity/pbo.final_nam14.vel` | space-delimited | HTTP 302 redirect; ~10 MB |
| USGS mrdata QFaults WFS GetCapabilities | `https://mrdata.usgs.gov/wfs/qfaults?service=WFS&...request=GetCapabilities` | HTTP 200 | But GetFeature returns MapServer HTML error |

## Confirmed BROKEN

| Source | URL | Failure mode |
|---|---|---|
| USGS VHP HANS API | `https://volcanoes.usgs.gov/hans-public/api/vhp/*` | Returns HTTP 200 with `{"error":"Did not find vhp/..."}` for all routes tested (status, activity, current, volcano, volcanoes) |
| USGS QFaults WFS GetFeature | `https://mrdata.usgs.gov/wfs/qfaults?...outputFormat=json` | Returns MapServer HTML error page with HTTP 200 |
| USGS QFaults old endpoint | `https://earthquake.usgs.gov/hazards/qfaults/ws/faults` | HTTP 404 |
| USGS ArcGIS QFaults | `https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/.../query` | `{"error":{"code":400,"message":"Invalid URL"}}` |
| Smithsonian GVP API | `https://volcano.si.edu/api/GVPVolcanoes` | HTTP 403 |

## FDSN text format (ISC)

Pipe-delimited, header starts with `#`:
```
#EventID|Time|Latitude|Longitude|Depth/km|Author|Catalog|Contributor|ContributorID|MagType|Magnitude|MagAuthor|EventLocationName|EventType
646128171|2026-08-10T00:27:23.769|40.8365|14.1098|3.6|ROM|ROM|ROM|639745159|Md|3.00|ROM|Southern Italy|earthquake
```
Comment lines (agency descriptions) follow data rows; they also start with `#` but lack pipes — skip them.

## How to apply

- Adding a new FDSN catalog: check `preferredFormat` and `supportsOrderBy` before adding to `FDSN_CATALOGS` in `observatory/collectors/seismic-fdsn.ts`.
- Volcano data: always use NOAA NGDC, not USGS VHP.
- Fault data: no working public JSON/GeoJSON endpoint exists; expect a DataGapRecord on every context run.
