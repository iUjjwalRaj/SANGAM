import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { LocationInfo, ForecastResponse } from '../types';
import { MapPin } from 'lucide-react';

interface ForecastMapProps {
  currentLocation: LocationInfo;
  presetLocations: LocationInfo[];
  forecast: ForecastResponse | null;
  onSelectLocation: (loc: LocationInfo) => void;
  onMapClickCoords: (lat: number, lon: number) => void;
}

export const ForecastMap: React.FC<ForecastMapProps> = ({
  currentLocation,
  presetLocations,
  forecast,
  onSelectLocation,
  onMapClickCoords
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered over India
    const map = L.map(mapContainerRef.current, {
      center: [22.5, 79.5],
      zoom: 4.8,
      minZoom: 3,
      maxZoom: 14,
      zoomControl: true,
      attributionControl: true
    });

    // OpenStreetMap tiles (free, no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);
    markerGroupRef.current = markerGroup;

    // Handle Map Click
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Math.round(e.latlng.lat * 10000) / 10000;
      const lon = Math.round(e.latlng.lng * 10000) / 10000;
      onMapClickCoords(lat, lon);
    });

    mapInstanceRef.current = map;
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and View when location or forecast changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markerGroupRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();

    // Custom icon helper
    const createMarkerIcon = (isSelected: boolean, rain: number = 0) => {
      const isWet = rain > 20.0;
      const color = isSelected ? 'var(--accent-primary)' : (isWet ? 'var(--accent-primary)' : 'var(--text-muted)');
      const size = isSelected ? 24 : 14;
      
      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 ${isSelected ? '14px var(--accent-primary)' : '6px rgba(0,0,0,0.4)'};
            transition: all 0.3s ease;
          "></div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });
    };

    // Add preset markers
    presetLocations.forEach((loc) => {
      const isSelected = Math.abs(loc.lat - currentLocation.lat) < 0.1 && Math.abs(loc.lon - currentLocation.lon) < 0.1;
      const marker = L.marker([loc.lat, loc.lon], {
        icon: createMarkerIcon(isSelected)
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectLocation(loc);
      });

      marker.bindTooltip(`<b>${loc.name}</b>`, {
        permanent: false,
        direction: 'top',
        className: 'glass-tooltip'
      });

      markerGroup.addLayer(marker);
    });

    // Add selected location marker with popup
    const activeMarker = L.marker([currentLocation.lat, currentLocation.lon], {
      icon: createMarkerIcon(true, forecast?.blended_forecast?.rainfall || 0)
    });

    const rain = forecast?.blended_forecast?.rainfall ?? '--';
    const temp = forecast?.blended_forecast?.temperature ?? '--';
    const wind = forecast?.blended_forecast?.wind_speed ?? '--';
    const regime = forecast?.weather_regime?.regime?.replace('_', ' ').toUpperCase() ?? 'NORMAL';

    activeMarker.bindPopup(`
      <div style="font-size: 13px; line-height: 1.5; min-width: 170px;">
        <div style="font-weight: 700; color: var(--accent-primary); font-size: 14px; margin-bottom: 4px;">
          ${currentLocation.name || 'Selected Coordinate'}
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">
          ${currentLocation.lat.toFixed(2)}°N, ${currentLocation.lon.toFixed(2)}°E
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; padding-top: 4px; border-top: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">SANGAM Rain:</span>
            <span style="font-weight: 700; color: var(--accent-primary);">${rain} mm</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">Temperature:</span>
            <span style="font-weight: 700; color: var(--accent-warning);">${temp} °C</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">Wind Speed:</span>
            <span style="font-weight: 700; color: var(--accent-success);">${wind} km/h</span>
          </div>
          <div style="margin-top: 6px; padding: 2px 6px; background: color-mix(in srgb, var(--accent-primary) 15%, transparent); border-radius: 4px; font-size: 10px; font-weight: 700; color: var(--accent-primary); text-align: center;">
            REGIME: ${regime}
          </div>
        </div>
      </div>
    `);

    markerGroup.addLayer(activeMarker);

    // Pan smoothly to current location if changed
    map.flyTo([currentLocation.lat, currentLocation.lon], Math.max(map.getZoom(), 5.5), {
      duration: 1.2
    });
  }, [currentLocation, presetLocations, forecast]);

  return (
    <div className="glass-panel" style={{ height: '100%', minHeight: '430px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Top Map Header Controls */}
      <div style={{
        position: 'absolute',
        top: '14px',
        left: '14px',
        right: '14px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{
          background: 'var(--surface-elevated)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'auto'
        }}>
          <MapPin size={15} color="var(--accent-primary)" />
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {currentLocation.name}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            ({currentLocation.lat.toFixed(2)}°N, {currentLocation.lon.toFixed(2)}°E)
          </span>
        </div>

        <div style={{
          background: 'var(--surface-elevated)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '11px',
          color: 'var(--accent-primary)',
          fontWeight: '600',
          pointerEvents: 'auto'
        }}>
          Click anywhere on map to blend
        </div>
      </div>

      {/* Map Container Wrapper */}
      <div style={{ position: 'relative', flex: 1, minHeight: '400px', width: '100%' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />

        {/* Preset Quick Chips on Bottom of Map */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          zIndex: 1000,
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          padding: '6px',
          background: 'var(--surface-elevated)',
          backdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid var(--border)'
        }}>
          {presetLocations.map((loc) => {
            const isSelected = Math.abs(loc.lat - currentLocation.lat) < 0.1 && Math.abs(loc.lon - currentLocation.lon) < 0.1;
            return (
              <button
                key={loc.id || loc.name}
                onClick={() => onSelectLocation(loc)}
                style={{
                  background: isSelected ? 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' : 'var(--surface)',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {loc.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cartographic Provenance & Boundary Notice */}
      <div style={{
        padding: '7px 14px',
        background: 'var(--surface-elevated)',
        borderTop: '1px solid var(--border)',
        fontSize: '10px',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '6px',
        lineHeight: 1.45,
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '850px' }}>
          <span>
            <b>Cartographic Notice:</b> Basemap rendered from standard OpenStreetMap contributors (ODbL). International boundaries and disputed areas follow the conventions represented by the OpenStreetMap basemap and may differ from national governmental cartographic representations. Station coordinates use WGS84.
          </span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          WGS84 Reference
        </div>
      </div>
    </div>
  );
};
