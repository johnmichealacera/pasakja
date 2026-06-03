/**
 * Shared Leaflet tile-layer helper.
 *
 * When NEXT_PUBLIC_MAPBOX_TOKEN is set (free signup at mapbox.com):
 *   → Uses Mapbox Streets + Mapbox Satellite-Streets (professional quality)
 *
 * Without a token (fallback):
 *   → Uses CartoDB Voyager (good street labels, free, no key)
 *   → Uses ESRI Satellite hybrid for the satellite option
 *
 * Both options include a 🗺/🛰 layer switcher in the top-right corner.
 */

// Leaflet is dynamic-imported at call time, so we type the args loosely.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addMapTiles(map: any, L: any): void {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();

  if (token) {
    // ── Mapbox (professional, fully-labelled, free tier) ───────────────────
    // Uses 512-px tiles with @2x for crisp retina rendering.
    // zoomOffset: -1 compensates for the doubled tile size.
    const mbAttr =
      '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> ' +
      '© <a href="https://www.openstreetmap.org/copyright">OSM</a>';

    const mbOpts = {
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 19,
      attribution: mbAttr,
    };

    // Streets — street names, place names, POIs, clear road hierarchy
    const streetLayer = L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`,
      mbOpts
    );

    // Satellite-Streets — real aerial imagery WITH all labels on top
    const satelliteLayer = L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`,
      mbOpts
    );

    streetLayer.addTo(map);

    L.control
      .layers(
        { "🗺 Street": streetLayer, "🛰 Satellite": satelliteLayer },
        {},
        { position: "topright", collapsed: false }
      )
      .addTo(map);
  } else {
    // ── Fallback — no API key required ─────────────────────────────────────
    // CartoDB Voyager: colourful, detailed labels, free.
    const streetLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors ' +
          '© <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    );

    // ESRI Satellite + labels overlay (free, no key)
    const esriSat = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Imagery © <a href='https://www.esri.com/'>Esri</a>",
        maxZoom: 19,
      }
    );
    const esriLabels = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "" }
    );
    const satelliteGroup = L.layerGroup([esriSat, esriLabels]);

    streetLayer.addTo(map);

    L.control
      .layers(
        { "🗺 Street": streetLayer, "🛰 Satellite": satelliteGroup },
        {},
        { position: "topright", collapsed: false }
      )
      .addTo(map);
  }
}

/** @deprecated renamed to addMapTiles */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addHybridTiles = addMapTiles;
