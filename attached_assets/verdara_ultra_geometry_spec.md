VERDARA ULTRA — 2D/3D GEOMETRY SPEC (v1.0)
Deterministic visual geometry for the Lume-Outdoor organism.

============================================================
0. GEOMETRY PURPOSE
============================================================
Verdara Ultra's geometry is not decorative. It is a direct, visual encoding of:
- the 4 outdoor flow primitives,
- the 42 operational nodes,
- their current states,
- and their relationships in an outdoor terrain, weather, environmental, and biological system.

The geometry must:
- be renderable in both 2D and 3D,
- preserve the 4/42 structure,
- support real-time state updates,
- and remain legible at multiple scales (trail segment, route, region, expedition).

============================================================
1. CORE LAYOUT — 4/42 ORGANISM FRAME
============================================================
Base frame:
- Center: 4-axis core (Terrain, Weather, Environmental, Biological).
- Surrounding ring: 42 nodes, grouped by primitive.
- Outer field: contextual overlays (flow vectors, hazard envelopes, routing corridors).

Coordinate system:
- Use polar coordinates for the ring (angle = node index, radius = state).
- Use Cartesian coordinates for 3D extrusion and layering.

============================================================
2. CORE — 4 PRIMITIVE AXES
============================================================
At the center of the organism, define a 4-armed cross (or diamond) with equal angular separation (90° between axes):

Axis assignments (clockwise from top in 2D):
- Up (0°): TERRAIN FLOW
- Right (90°): WEATHER FLOW
- Down (180°): ENVIRONMENTAL FLOW
- Left (270°): BIOLOGICAL FLOW

Each axis:
- Length encodes aggregate primitive health (normalized -1.0 to +1.0).
- Color encodes primitive type (fixed palette).
- Thickness encodes volatility (rate of change).

Suggested color palette:
- Terrain: earth brown / ochre
- Weather: storm grey / electric white
- Environmental: sky blue / mist cyan
- Biological: forest green / deep moss

============================================================
3. RING — 42 NODE POSITIONS
============================================================
The 42 nodes are placed on a circular ring around the core.

Ring radius:
- Fixed base radius R_base in 2D.
- Node radial offset encodes node state (R = R_base + delta).

Angular segmentation:
- Divide 360° into 42 equal sectors (~8.571° each).
- Group nodes by primitive in contiguous arcs.

Primitive arc allocation:
- Terrain nodes (T1–T10): 10 sectors
- Weather nodes (W1–W10): 10 sectors
- Environmental nodes (E1–E11): 11 sectors
- Biological nodes (B1–B11): 11 sectors

Ordering (clockwise from top):
- Start at 0° with T1 and proceed T1–T10.
- Then W1–W10.
- Then E1–E11.
- Then B1–B11.

Node representation:
- Each node is a small circle or hexagon.
- Node radius encodes importance or alert level.
- Node fill color encodes state:
  - Green: favorable / safe
  - Yellow: advisory
  - Orange: caution
  - Red: critical
- Node border thickness encodes confidence (data quality or sensor fidelity).

Radial state mapping:
- Node state s ∈ [-1.0, +1.0]
- Map to radial offset:
  - s = +1.0 → slightly outside R_base (healthy outward pulse)
  - s = 0.0 → exactly on R_base
  - s = -1.0 → pulled inward toward core (collapsing / hazard)

============================================================
4. 2D GEOMETRY — TOP-DOWN ORGANISM VIEW
============================================================
Primary 2D view:
- Center: 4-axis core cross.
- Ring: 42 nodes in a circle.
- Optional: thin arcs connecting nodes within the same primitive group.

Connections:
- Draw faint lines between:
  - nodes within the same primitive (intra-primitive coupling),
  - nodes with strong correlation (e.g., T2–T5 slope/technicality, W1–W8 temp/thermal load, E4–E3 visibility/fog, B1–B2 wildlife density/risk).

Overlays:
- Terrain envelope: a smooth contour line connecting all Terrain nodes.
- Weather envelope: same for Weather, etc.
- These envelopes can be drawn as colored "petals" extending from the core.
- A hazard corridor overlay can be drawn on top of the ring to highlight
  any arc segment where multiple adjacent nodes are in caution or critical.

State animation (optional):
- Pulsing of nodes to indicate active change (e.g., W6 Storm Proximity closing).
- Slow rotation of the outer ring to indicate ongoing environmental monitoring.
- Weather nodes can animate faster rotation speed during high volatility (W9).

============================================================
5. 3D GEOMETRY — EXTRUDED ORGANISM
============================================================
3D representation builds on the 2D layout and extrudes it into a volumetric form.

Z-axis usage:
- Z encodes either:
  - time (past → present → future), for temporal state history,
  - or scale (trail segment → route → region), for spatial hierarchy.

Option A — Time stack:
- Each "slice" in Z is a snapshot of the 2D organism at a given time.
- Stacking slices creates a 3D "outdoor state history column."
- Node trajectories over time become vertical ribbons.
- Useful for post-expedition analysis and safety review.

Option B — Scale stack:
- Bottom slice: micro (trail segment, single crossing, 100 m window).
- Middle slice: meso (route section, day's travel, 10 km window).
- Top slice: macro (region, multi-day expedition, 100+ km window).
- Lines connect corresponding nodes across scales to show how local
  conditions aggregate into regional risk.

Node extrusion:
- Each node becomes a short cylinder or pillar.
- Height encodes magnitude of deviation from neutral (|s|).
- Color and top cap match 2D state encoding.

Primitive volumes:
- Each primitive's nodes can be wrapped in a semi-transparent 3D "lobe" or volume.
- Terrain lobe, Weather lobe, Environmental lobe, Biological lobe.
- These lobes expand/contract based on aggregate primitive state.
- A collapsed lobe (critical primitive) visually distorts the organism's silhouette
  toward the failing axis — providing immediate gestalt-level hazard recognition.

============================================================
6. FLOW VECTORS AND FIELD LINES
============================================================
To visually encode outdoor movement and environmental flow:

2D:
- Draw directional arrows along the ring or radiating outward to show:
  - recommended route direction (Terrain-derived),
  - wind direction and magnitude (Weather-derived),
  - biological hazard gradient (Biological-derived).
- Arrow thickness encodes flow magnitude or hazard intensity.

3D:
- Use streamlines or particle traces that:
  - originate from the organism's position,
  - follow the recommended routing path through terrain,
  - color-shift based on the dominant hazard primitive at each point.

Color coding:
- Terrain-driven lines: earth brown.
- Weather-driven lines: storm grey or electric white.
- Environmental lines: sky blue.
- Biological lines: forest green or warning amber (when hazard is elevated).

============================================================
7. ALERT AND ENVELOPE VISUALIZATION
============================================================
Critical states:
- Any node in critical state:
  - flashes or pulses red,
  - triggers a halo or ring segment highlight around its arc.

Primitive envelope breach:
- If a primitive's aggregate state crosses a threshold:
  - its axis glows in the primitive's accent color,
  - its lobe in 3D distorts or spikes outward (advisory) or inward (collapse).

Hard constraint trigger:
- When Verdara's routing engine halts forward progress on a path
  (any node crossing critical threshold):
  - the corresponding ring arc flashes with a blocked/stop indicator,
  - a bold routing overlay shows the proposed alternate path.

Global system alert:
- If multiple primitives are in caution or critical simultaneously:
  - the entire organism's outer ring pulses,
  - a global "outdoor instability" indicator appears at the core center,
  - the 4-axis core collapses visibly toward the failing primitives.

============================================================
8. INTERACTION MODEL (FOR UI/TOOLS)
============================================================
Hover/select:
- Hovering a node shows:
  - node ID (e.g., W7 Lightning Risk),
  - raw value or descriptor,
  - normalized state,
  - threshold bands (advisory / caution / critical).

Zoom:
- Zoom in to see micro-level detail (individual trail segment nodes).
- Zoom out to see primitive envelopes and global outdoor state.

Route overlay:
- Overlay the recommended route on top of the 2D organism view,
  color-coded by segment risk level (green → yellow → orange → red).
- Each waypoint or bailout point is marked on the route overlay.

Time scrub (3D time stack mode):
- Scrub along Z to see how the organism evolved over the expedition.
- Highlight transitions where nodes crossed thresholds.
- Animate playback to review weather windows and terrain decisions.

============================================================
9. IMPLEMENTATION GUIDANCE
============================================================
For Claude or any renderer:
- Define a data model:
  - primitives: {terrain, weather, environmental, biological}
  - nodes: 42 entries with angle, primitive, state, thresholds
- Implement:
  - 2D polar layout,
  - 3D extrusion,
  - color/state mapping,
  - route overlay,
  - optional animation hooks.

The geometry must remain:
- deterministic,
- reproducible,
- and directly driven by Verdara Ultra's live state vector.
