# India Land Boundary & Vector Cartography: Provenance, Derivation & Licensing Audit

## 1. File & Retrieval Summary (Boundary Overlay)
- **Local File**: `frontend/public/data/india-boundary.json`
- **Upstream File Name**: `Country/india-land-simplified.geojson`
- **Upstream Repository**: [DataMeet Maps (`datameet/maps`)](https://github.com/datameet/maps)
- **Exact Source URL**: `https://raw.githubusercontent.com/datameet/maps/2b2b9dc7d29a4b81ad0eb349ab2e2492cb71cb5a/Country/india-land-simplified.geojson`
- **Commit Hash**: `2b2b9dc7d29a4b81ad0eb349ab2e2492cb71cb5a` (PR #33, merged 2018-10-24 by Devdatta Tengshe)
- **Blob SHA**: `b5d42e0d0ec3759a598e5ddd6f90d61d3be64f36`
- **Date Retrieved**: 2026-09-29
- **Format**: GeoJSON (FeatureCollection containing 1 LineString feature, 2,247 vertices)
- **Coordinate Reference System**: WGS84 (EPSG:4326)
- **Bounding Box**:
  - Latitude: 21.9360° N to 37.0870° N
  - Longitude: 68.1990° E to 97.4070° E

## 2. Derivation Chain & Upstream Data Sources
The dataset `india-land-simplified.geojson` was contributed by Arun Ganesh (`@planemad`) in DataMeet Pull Request #33 as a lightweight (44.6 KB) web overlay. Its lineage traces back to `Country/india-composite.geojson` within the same repository:

1. **`india-composite.geojson` (DataMeet `Country/` directory)**:
   - Documented in [`Country/README.md`](https://github.com/datameet/maps/blob/master/Country/README.md) as a single-feature shapefile for India's land area including disputed territories in accordance with the official boundary of India as per the Survey of India (SOI).
   - Explicitly licensed under **Creative Commons Zero 1.0 Universal (CC-0)**.

2. **Upstream Primary Sources for `india-composite.geojson`**:
   - **India, Aksai Chin, and disputed territories with China**: [U.S. Department of State - Humanitarian Information Unit (LSIB - Global LSIB Polygons Detailed)](https://data.humdata.org/dataset/global-lsib-polygons-detailed) — *Public Domain (U.S. Government Work)*.
   - **Pakistan-administered Kashmir**: [Alhasan Systems Pakistan Admin Boundaries Dataset via Humanitarian Data Exchange (HDX)](https://data.humdata.org/dataset/pakistan-union-council-boundaries-along-with-other-admin-boundaries-dataset) — *Open Data*.
   - **Shaksgam Valley**: [Natural Earth 10m Admin-0 Breakaway, Disputed Areas](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-breakaway-disputed-areas/) — *Public Domain*.

3. **Intermediate Processing**:
   - Terrestrial land boundary extracted from the dissolved composite polygon.
   - Simplified using Douglas-Peucker geometric simplification to 2,247 vertices (reducing size from 10.7 MB to 44.6 KB) to serve as a high-performance vector line overlay over OpenStreetMap base tiles.
   - Alignment preserves the official Survey of India cartographic depiction of Jammu & Kashmir, Ladakh (including Aksai Chin), and Arunachal Pradesh.

## 3. Boundary Overlay License
- **License**: **Creative Commons Zero 1.0 Universal (CC0 1.0) Public Domain Dedication**
  - Documented in upstream repository path [`Country/README.md`](https://github.com/datameet/maps/blob/master/Country/README.md#license) specifically governing `india-composite.geojson` and its derived simplified shapes.
  - To the extent permitted by law, the authors have dedicated all copyright and related rights in this dataset to the public domain worldwide.

## 4. Required Boundary Overlay Attribution
> "India national land boundary overlay derived from DataMeet maps community (`Country/india-land-simplified.geojson`), compiled by Arun Ganesh from U.S. Department of State LSIB, Alhasan Systems, and Natural Earth under Creative Commons Zero 1.0 Universal (CC0), referenced to Survey of India official boundary alignment."

---

## 5. Vector Basemap & Custom MapLibre Style Specification
To resolve the cartographic issue where raster OSM tiles display competing international/disputed boundaries under the Survey of India aligned overlay, SANGAM uses a vector-tile basemap with international border layers selectively disabled:

- **Vector Tile Provider**: [OpenFreeMap](https://openfreemap.org/)
- **Upstream Style**: [OpenFreeMap Liberty](https://tiles.openfreemap.org/styles/liberty)
- **Local Style Specification**: `frontend/public/data/maplibre-style.json`
- **Vector Data Source**: OpenMapTiles Planet (`https://tiles.openfreemap.org/planet`)
- **Raster Shading Source**: Natural Earth II shaded relief (`https://tiles.openfreemap.org/natural_earth/ne2sr/{z}/{x}/{y}.png`)
- **Integration Engine**: Leaflet 1.9.4 via `@maplibre/maplibre-gl-leaflet` and `maplibre-gl` 5.x/6.x
- **Exact Boundary Layers Disabled**:
  - `boundary_2` (`admin_level == 2`): International country border lines — *set to `visibility: "none"`*
  - `boundary_disputed` (`disputed == 1`): Disputed boundary lines — *set to `visibility: "none"`*
- **Preserved Internal Layers**:
  - `boundary_3` (`admin_level >= 3 && admin_level <= 6`): State, province, and regional internal administrative boundaries — *preserved and visible*
  - All transportation (roads, highways, railways, aeroways), hydrology (oceans, lakes, rivers), terrain hillshading, landuse, buildings, and toponymic labels (countries, states, cities, towns) are fully preserved.

### Vector Basemap Licensing & Mandatory Attribution
- **OpenFreeMap Service**: MIT License (no API key required, public open-source vector tile hosting).
- **OpenMapTiles Data**: Creative Commons Attribution 4.0 International (CC-BY 4.0).
- **OpenStreetMap Data**: Open Data Commons Open Database License (ODbL).
- **Mandatory Attribution**:
  `OpenFreeMap © OpenMapTiles Data © OpenStreetMap contributors`
