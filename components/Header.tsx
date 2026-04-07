'use client';

import Image from 'next/image';
import { LayerMode } from '@/lib/types';
import LayerSwitcher from './LayerSwitcher';

interface Props {
  activeLayer: LayerMode;
  onLayerChange: (layer: LayerMode) => void;
}

export default function Header({ activeLayer, onLayerChange }: Props) {
  return (
    <header
      className="flex items-center justify-between px-5 py-3 bg-white shadow-sm z-10 flex-shrink-0"
      style={{ borderBottom: '2px solid #e8f5e9', minHeight: 64 }}
    >
      <div className="flex items-center gap-3">
        <Image src="/RTG.png" alt="Read to Grow" width={48} height={48} className="object-contain" />
        <div>
          <h1
            className="text-base font-bold leading-tight"
            style={{ fontFamily: 'var(--font-nunito), Nunito, sans-serif', color: '#1a3a2a' }}
          >
            Reading Ready? Tracking Connecticut&rsquo;s Youngest Learners
          </h1>
          <p className="text-xs mt-0.5" style={{ color: '#5a7a6a' }}>
            Kindergarten Entry Index 2020–21 &rarr; 3rd Grade ELA 2024–25
          </p>
        </div>
      </div>

      <LayerSwitcher activeLayer={activeLayer} onLayerChange={onLayerChange} />
    </header>
  );
}
