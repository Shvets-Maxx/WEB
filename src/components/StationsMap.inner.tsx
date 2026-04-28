import { useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { StationWithSnapshot } from '@/types';
import { aqiLabel } from '@/lib/aqi';
import { aqiColor } from '@/lib/aqiColor';
import { STATION_TYPE_LABEL } from '@/lib/stationType';
import { track } from '@/lib/analytics';
import styles from './StationsMap.module.css';

interface Props {
  stations: StationWithSnapshot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Marker click already fires onSelect — popup lists context only.

const UKRAINE_CENTER: [number, number] = [48.8, 31.2];
const UKRAINE_ZOOM = 6;
const ZOOM_DEBOUNCE_MS = 400;

// Leaflet inserts the marker's HTML directly into the DOM, so it needs a stable
// (unscoped) class. Keep `.map-marker` declared in globals.css.
function buildIcon(station: StationWithSnapshot, active: boolean): L.DivIcon {
  const fill = aqiColor(station.latest.aqi);
  const size = active ? 34 : 26;
  const fontSize = active ? 14 : 12;
  const ringColor = active ? '#ffffff' : 'rgba(255,255,255,0.85)';
  const ringWidth = active ? 3 : 2;
  const shadow = active
    ? '0 0 0 4px rgba(76,201,240,0.45)'
    : '0 2px 6px rgba(0,0,0,0.45)';
  const html = `<div class="map-marker" style="
    width:${size}px;height:${size}px;background:${fill};
    border:${ringWidth}px solid ${ringColor};box-shadow:${shadow};
    font-size:${fontSize}px;" aria-hidden="true">${station.latest.aqi}</div>`;
  return L.divIcon({
    html,
    className: 'station-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FocusOnSelected({
  stations,
  selectedId,
}: {
  stations: StationWithSnapshot[];
  selectedId: string | null;
}): null {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const s = stations.find((st) => st.id === selectedId);
    if (!s) return;
    map.flyTo([s.coordinates.latitude, s.coordinates.longitude], 9, {
      duration: 0.6,
    });
  }, [selectedId, stations, map]);
  return null;
}

function ZoomTracker(): null {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMapEvents({
    zoomend: (e) => {
      const zoom = e.target.getZoom();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        track('map_zoom_changed', { zoom });
        timerRef.current = null;
      }, ZOOM_DEBOUNCE_MS);
    },
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return null;
}

export default function StationsMapInner({
  stations,
  selectedId,
  onSelect,
}: Props): JSX.Element {
  const markers = useMemo(
    () =>
      stations.map((s) => ({
        station: s,
        icon: buildIcon(s, s.id === selectedId),
      })),
    [stations, selectedId],
  );

  return (
    <MapContainer
      center={UKRAINE_CENTER}
      zoom={UKRAINE_ZOOM}
      minZoom={5}
      maxZoom={14}
      scrollWheelZoom
      className={styles.map}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FocusOnSelected stations={stations} selectedId={selectedId} />
      <ZoomTracker />
      {markers.map(({ station, icon }) => (
        <Marker
          key={station.id}
          position={[station.coordinates.latitude, station.coordinates.longitude]}
          icon={icon}
          title={`${station.name} · AQI ${station.latest.aqi}`}
          eventHandlers={{ click: () => onSelect(station.id) }}
        >
          <Popup>
            <div className={styles.popup}>
              <strong>{station.name}</strong>
              <div className={styles.popupMeta}>
                {station.city} · {STATION_TYPE_LABEL[station.type]}
              </div>
              <div className={styles.popupAqi}>
                AQI <strong>{station.latest.aqi}</strong> ·{' '}
                {aqiLabel(station.latest.aqi)}
              </div>
              <div className={styles.popupDominant}>
                Домінуючий: {station.latest.dominant}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
