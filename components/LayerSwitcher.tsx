'use client';

import { LayerMode } from '@/lib/types';

interface Props {
  activeLayer: LayerMode;
  onLayerChange: (layer: LayerMode) => void;
}

const TABS: Array<{ id: LayerMode; label: string; sub: string }> = [
  { id: 'kei',        label: 'KEI 2020–21',        sub: '% Students Needing Support' },
  { id: 'ela',        label: 'ELA 2024–25',         sub: 'Performance Index' },
  { id: 'trajectory', label: 'Cohort Trajectory',   sub: 'How Did This Cohort Progress?' },
];

export default function LayerSwitcher({ activeLayer, onLayerChange }: Props) {
  return (
    <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
      {TABS.map((tab) => {
        const isActive = tab.id === activeLayer;
        return (
          <button
            key={tab.id}
            onClick={() => onLayerChange(tab.id)}
            className="rounded-lg px-3 py-1.5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
            style={{
              background: isActive ? '#2E7D32' : 'transparent',
              color: isActive ? '#fff' : '#4a6a5a',
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
            }}
            aria-pressed={isActive}
          >
            <div className="text-xs font-bold whitespace-nowrap">{tab.label}</div>
            <div
              className="text-xs whitespace-nowrap hidden sm:block"
              style={{ opacity: isActive ? 0.85 : 0.7 }}
            >
              {tab.sub}
            </div>
          </button>
        );
      })}
    </div>
  );
}
