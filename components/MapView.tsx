'use client';

import { useRef, useEffect } from 'react';
import { LayerMode, DistrictProperties, TRAJECTORY_CONFIG, KEI_STOPS, ELA_STOPS } from '@/lib/types';
import Legend from './Legend';

interface Props {
  activeLayer: LayerMode;
  onDistrictClick: (props: DistrictProperties | null) => void;
  selectedDistrict: string | null;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const SOURCE_ID = 'ct-districts';
const FILL_LAYER = 'districts-fill';
const LINE_LAYER = 'districts-line';

// Color expression builders — returned as Mapbox GL style expressions
function keiColorExpr() {
  return [
    'case',
    ['==', ['get', 'kei_li_pct1'], null], '#e0e0e0',
    ['step', ['get', 'kei_li_pct1'],
      KEI_STOPS[0].color,
      0.20, KEI_STOPS[1].color,
      0.30, KEI_STOPS[2].color,
      0.40, KEI_STOPS[3].color,
      0.50, KEI_STOPS[4].color,
    ],
  ];
}

function elaColorExpr() {
  return [
    'case',
    ['==', ['get', 'ela_performance_index'], null], '#e0e0e0',
    ['step', ['get', 'ela_performance_index'],
      ELA_STOPS[0].color,
      40, ELA_STOPS[1].color,
      55, ELA_STOPS[2].color,
      65, ELA_STOPS[3].color,
      75, ELA_STOPS[4].color,
    ],
  ];
}

function trajColorExpr() {
  return [
    'match', ['get', 'trajectory'],
    'stayed_high', TRAJECTORY_CONFIG.stayed_high.color,
    'stayed_low',  TRAJECTORY_CONFIG.stayed_low.color,
    'improved',    TRAJECTORY_CONFIG.improved.color,
    'declined',    TRAJECTORY_CONFIG.declined.color,
    TRAJECTORY_CONFIG.no_data.color,
  ];
}

function getFillColorExpr(layer: LayerMode) {
  if (layer === 'kei') return keiColorExpr();
  if (layer === 'ela') return elaColorExpr();
  return trajColorExpr();
}

export default function MapView({ activeLayer, onDistrictClick, selectedDistrict }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const activeLayerRef = useRef(activeLayer);
  const selectedDistrictRef = useRef(selectedDistrict);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoveredIdRef = useRef<string | null>(null);

  // Keep refs current without re-creating the map
  useEffect(() => { activeLayerRef.current = activeLayer; }, [activeLayer]);
  useEffect(() => { selectedDistrictRef.current = selectedDistrict; }, [selectedDistrict]);

  // ── Update fill color when layer switches ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer(FILL_LAYER)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.setPaintProperty(FILL_LAYER, 'fill-color', getFillColorExpr(activeLayer) as any);
  }, [activeLayer]);

  // ── Update stroke when selected district changes ───────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer(LINE_LAYER)) return;
    map.setPaintProperty(LINE_LAYER, 'line-color', lineColorExpr(selectedDistrict));
    map.setPaintProperty(LINE_LAYER, 'line-width', lineWidthExpr(selectedDistrict));
  }, [selectedDistrict]);

  function lineColorExpr(sel: string | null) {
    return ['case',
      ['==', ['get', 'district_name'], sel ?? '__none__'], '#2E7D32',
      ['boolean', ['feature-state', 'hover'], false], '#222',
      '#888',
    ];
  }

  function lineWidthExpr(sel: string | null) {
    return ['case',
      ['==', ['get', 'district_name'], sel ?? '__none__'], 2.5,
      ['boolean', ['feature-state', 'hover'], false], 2,
      0.8,
    ];
  }

  const onDistrictClickRef = useRef(onDistrictClick);
  useEffect(() => { onDistrictClickRef.current = onDistrictClick; }, [onDistrictClick]);

  // ── Initialize map once ───────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // mapbox-gl is loaded via CDN script tag in layout.tsx — access via window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) {
      // Script not yet loaded — retry shortly
      const timer = setTimeout(() => {
        if (containerRef.current) containerRef.current.dispatchEvent(new Event('mapbox-retry'));
      }, 200);
      return () => clearTimeout(timer);
    }

    {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-72.7, 41.6],
        zoom: 8.5,
      });
      mapRef.current = map;
      map.on('load', () => {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: '/data/districts.geojson',
          promoteId: 'district_name',
        });

        map.addLayer({
          id: FILL_LAYER,
          type: 'fill',
          source: SOURCE_ID,
          paint: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'fill-color': getFillColorExpr(activeLayerRef.current) as any,
            'fill-opacity': ['case',
              ['boolean', ['feature-state', 'hover'], false], 0.9,
              0.75,
            ],
          },
        });

        map.addLayer({
          id: LINE_LAYER,
          type: 'line',
          source: SOURCE_ID,
          paint: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'line-color': lineColorExpr(selectedDistrictRef.current) as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'line-width': lineWidthExpr(selectedDistrictRef.current) as any,
          },
        });

        // ── Hover ────────────────────────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.on('mousemove', FILL_LAYER, (e: any) => {
          if (!e.features?.length) return;
          const id = e.features[0].properties?.district_name as string;
          if (hoveredIdRef.current && hoveredIdRef.current !== id) {
            map.setFeatureState({ source: SOURCE_ID, id: hoveredIdRef.current }, { hover: false });
          }
          hoveredIdRef.current = id;
          map.setFeatureState({ source: SOURCE_ID, id }, { hover: true });
          map.getCanvas().style.cursor = 'pointer';

          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'block';
            tooltipRef.current.style.left = `${e.point.x + 12}px`;
            tooltipRef.current.style.top = `${e.point.y - 28}px`;
            tooltipRef.current.textContent = id;
          }
        });

        map.on('mouseleave', FILL_LAYER, () => {
          if (hoveredIdRef.current) {
            map.setFeatureState({ source: SOURCE_ID, id: hoveredIdRef.current }, { hover: false });
            hoveredIdRef.current = null;
          }
          map.getCanvas().style.cursor = '';
          if (tooltipRef.current) tooltipRef.current.style.display = 'none';
        });

        // ── Click ────────────────────────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.on('click', FILL_LAYER, (e: any) => {
          if (e.features?.length) {
            onDistrictClickRef.current(e.features[0].properties as DistrictProperties);
          }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.on('click', (e: any) => {
          const features = map.queryRenderedFeatures(e.point, { layers: [FILL_LAYER] });
          if (!features.length) onDistrictClickRef.current(null);
        });
      });
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex-1" style={{ minHeight: 0 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Hover tooltip */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none z-10 px-2 py-1 rounded shadow text-xs font-semibold"
        style={{
          display: 'none',
          background: 'rgba(255,255,255,0.95)',
          color: '#1a3a2a',
          border: '1px solid #cce8d2',
          fontFamily: 'var(--font-nunito)',
          whiteSpace: 'nowrap',
        }}
      />

      <Legend activeLayer={activeLayer} />
    </div>
  );
}
