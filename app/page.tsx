'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { LayerMode, Trajectory, DistrictProperties } from '@/lib/types';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Legend from '@/components/Legend';
import DownloadButton from '@/components/DownloadButton';

// MapView and SplitMapView use browser APIs — load client-side only
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });
const SplitMapView = dynamic(() => import('@/components/SplitMapView'), { ssr: false });

export default function HomePage() {
  const [activeLayer, setActiveLayer] = useState<LayerMode>('trajectory');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictProperties | null>(null);
  const [spotlightCategory, setSpotlightCategory] = useState<Trajectory | null>(null);
  const [splitView, setSplitView] = useState(false);

  const handleDistrictClick = useCallback((props: DistrictProperties | null) => {
    setSelectedDistrict(props);
  }, []);

  const handleLayerChange = useCallback((layer: LayerMode) => {
    setActiveLayer(layer);
    setSpotlightCategory(null);
    setSplitView(false);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header activeLayer={activeLayer} onLayerChange={handleLayerChange} />

      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapView
          activeLayer={activeLayer}
          onDistrictClick={handleDistrictClick}
          selectedDistrict={selectedDistrict?.district_name ?? null}
          spotlightCategory={spotlightCategory}
        />

        {splitView && <SplitMapView onClose={() => setSplitView(false)} />}

        <Legend
          activeLayer={activeLayer}
          spotlightCategory={spotlightCategory}
          onSpotlightChange={setSpotlightCategory}
          onSplitView={() => setSplitView(true)}
        />

        <Sidebar
          district={selectedDistrict}
          activeLayer={activeLayer}
          onClose={() => setSelectedDistrict(null)}
        />
      </div>

      {/* Download button — bottom right of map, above sidebar */}
      <div className="absolute bottom-4 z-20" style={{ right: selectedDistrict ? 332 : 12 }}>
        <DownloadButton />
      </div>
    </div>
  );
}
