# Plan: colored property buildings

## Goal

Highlight buildings at each property location with a distinct color on the 3D map, controlled via a toggle in the camera explorer dev tool.

## The 5 properties

| Property | Coords (lat, lng) | Zone |
|---|---|---|
| Chateau Life Ozu 1 | 32.865, 130.87 | Ozu |
| Chateau Life Ozu 2 | 32.862, 130.865 | Ozu |
| Chateau Life Kikuyo 1 | 32.88, 130.825 | Kikuyo |
| Chateau Life Haramizu 1 | 32.8698, 130.823 | Kikuyo |
| Chateau Life Haramizu 2 | 32.871, 130.826 | Kikuyo |

## Approach

The existing `3d-buildings` layer pulls from Mapbox's `composite` source (OSM data). These buildings have no custom IDs, so we cannot filter them directly. Instead:

1. **Create bounding polygons** - for each property coordinate, define a small polygon (roughly 100m x 100m) that covers the property site.

2. **Add a highlight layer** - add a second `fill-extrusion` layer called `property-buildings` that sits on top of `3d-buildings`. This layer uses the same `composite` source but with a `["within", polygon]` geographic filter matching only buildings inside the property bounding polygons.

3. **Color per zone** - Ozu properties get one color (e.g. amber `#fbb931`), Kikuyo properties get another (e.g. blue `#007aff`). This makes zones visually distinct.

4. **Fallback for missing buildings** - if no OSM building footprint exists at a property location (new construction or land acquisition sites), create a custom GeoJSON polygon with a fill-extrusion to represent the property anyway.

## Code example

```javascript
// 1. Create a small polygon around the property location
const propertyPolygon = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [[
      [130.8695, 32.8645],  // sw
      [130.8705, 32.8645],  // se
      [130.8705, 32.8655],  // ne
      [130.8695, 32.8655],  // nw
      [130.8695, 32.8645],  // close
    ]],
  },
};

// 2. Add a colored extrusion layer filtered to that area
map.addLayer({
  id: "highlight-ozu-1",
  source: "composite",
  "source-layer": "building",
  type: "fill-extrusion",
  minzoom: 12,
  filter: ["within", propertyPolygon],
  paint: {
    "fill-extrusion-color": "#fbb931",  // amber
    "fill-extrusion-height": ["get", "height"],
    "fill-extrusion-base": ["get", "min_height"],
    "fill-extrusion-opacity": 0.9,
  },
});
```

This takes every OSM building footprint that falls within the bounding polygon and renders it in the specified color instead of the default gray. Buildings keep their real shape and height from the map data.

## Integration with camera explorer

- Add a **"Properties"** toggle button in the layer toggles row (next to 3D buildings, labels, terrain).
- When toggled on: add highlight layers for all 5 properties.
- When toggled off: remove the highlight layers.

## Files to modify

- `js/dev/camera-explorer.js` - add toggle logic and highlight layer management
- `index.html` - add the toggle button markup
- No changes to existing map, property, or app code

## Risks

- Some properties may not have OSM building footprints (new construction or land acquisition sites). The fallback polygon handles this.
- The `["within", polygon]` filter requires Mapbox GL JS v2.15+. If the project uses an older version, an alternative approach using `querySourceFeatures` would be needed.
- Bounding polygon sizes may need manual tuning per property to capture the right buildings without including neighbors.
