'use client';

import { useRef, useEffect } from 'react';
import { Trajectory, TRAJECTORY_CONFIG } from '@/lib/types';

interface Props {
  onClose: () => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const SOURCE_ID = 'ct-districts';
const FILL_LAYER = 'districts-fill';
const LINE_LAYER = 'districts-line';

const CATEGORIES: Trajectory[] = ['stayed_high', 'improved', 'declined', 'stayed_low'];

// Same spotlight expression as MapView.trajColorExpr — show one category, grey out rest
function spotlightExpr(category: Trajectory) {
  const cfg = TRAJECTORY_CONFIG[category];
  return ['case',
    ['==', ['get', 'trajectory'], category], cfg.color,
    '#DEDEDE',
  ];
}

function MiniMap({ category }: { category: Trajectory }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const cfg = TRAJECTORY_CONFIG[category];

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current!,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-72.7, 41.6],
      zoom: 7.8,
      interactive: true,
      attributionControl: false,
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
          'fill-color': spotlightExpr(category) as any,
          'fill-opacity': 0.82,
        },
      });

      map.addLayer({
        id: LINE_LAYER,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': '#888',
          'line-width': 0.6,
        },
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {/* Category label bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          background: cfg.color,
          color: '#fff',
          padding: '5px 12px',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'var(--font-nunito)',
          letterSpacing: 0.3,
        }}
      >
        {cfg.label}
      </div>
    </div>
  );
}

export default function SplitMapView({ onClose }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 15,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 2,
        background: '#ddd',
      }}
    >
      {CATEGORIES.map((cat) => (
        <MiniMap key={cat} category={cat} />
      ))}

      {/* Close button */}
      <button
        onClick={onClose}
        title="Back to full map"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 20,
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid #ccc',
          borderRadius: 6,
          padding: '5px 12px',
          fontSize: 11,
          fontWeight: 600,
          fontFamily: 'var(--font-nunito)',
          color: '#1a3a2a',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        ← Back to map
      </button>
    </div>
  );
}
