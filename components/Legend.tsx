'use client';

import { LayerMode, TRAJECTORY_CONFIG, KEI_STOPS, ELA_STOPS } from '@/lib/types';

interface Props {
  activeLayer: LayerMode;
}

export default function Legend({ activeLayer }: Props) {
  return (
    <div
      className="absolute bottom-8 left-3 z-10 rounded-xl shadow-lg p-3 text-xs"
      style={{ background: 'rgba(255,255,255,0.95)', minWidth: 180, maxWidth: 220 }}
    >
      {activeLayer === 'kei' && (
        <>
          <p className="font-bold mb-1.5" style={{ fontFamily: 'var(--font-nunito)', color: '#1a3a2a' }}>
            KEI 2020–21
          </p>
          <p className="mb-2" style={{ color: '#5a7a6a' }}>
            % entering kindergarteners needing literacy support
          </p>
          {KEI_STOPS.map((stop) => (
            <div key={stop.value} className="flex items-center gap-2 mb-1">
              <span
                className="inline-block flex-shrink-0 rounded-sm border border-gray-200"
                style={{ width: 16, height: 16, background: stop.color }}
              />
              <span style={{ color: '#2a4a3a' }}>{stop.label}</span>
            </div>
          ))}
          <p className="mt-2" style={{ color: '#888', fontSize: 10 }}>
            → Higher % = more students needing support
          </p>
        </>
      )}

      {activeLayer === 'ela' && (
        <>
          <p className="font-bold mb-1.5" style={{ fontFamily: 'var(--font-nunito)', color: '#1a3a2a' }}>
            ELA 2024–25
          </p>
          <p className="mb-2" style={{ color: '#5a7a6a' }}>
            District ELA Performance Index — all students
          </p>
          {ELA_STOPS.map((stop) => (
            <div key={stop.value} className="flex items-center gap-2 mb-1">
              <span
                className="inline-block flex-shrink-0 rounded-sm border border-gray-200"
                style={{ width: 16, height: 16, background: stop.color }}
              />
              <span style={{ color: '#2a4a3a' }}>{stop.label}</span>
            </div>
          ))}
          <p className="mt-2" style={{ color: '#888', fontSize: 10 }}>
            → Higher score = stronger performance
          </p>
        </>
      )}

      {activeLayer === 'trajectory' && (
        <>
          <p className="font-bold mb-1.5" style={{ fontFamily: 'var(--font-nunito)', color: '#1a3a2a' }}>
            Cohort Trajectory
          </p>
          <p className="mb-2" style={{ color: '#5a7a6a' }}>
            KEI 2020–21 → ELA 2024–25
          </p>
          {(Object.entries(TRAJECTORY_CONFIG) as Array<[string, typeof TRAJECTORY_CONFIG[keyof typeof TRAJECTORY_CONFIG]]>).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2 mb-1">
              <span
                className="inline-block flex-shrink-0 rounded-sm border border-gray-200"
                style={{ width: 16, height: 16, background: cfg.color }}
              />
              <span style={{ color: '#2a4a3a' }}>{cfg.label}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
