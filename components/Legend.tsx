'use client';

import { LayerMode, Trajectory, TRAJECTORY_CONFIG, KEI_STOPS, ELA_STOPS } from '@/lib/types';

// Spotlight grid order: positive outcomes top row, concerning bottom row
const SPOTLIGHT_ORDER: Trajectory[] = ['stayed_high', 'improved', 'declined', 'stayed_low'];

interface Props {
  activeLayer: LayerMode;
  spotlightCategory: Trajectory | null;
  onSpotlightChange: (cat: Trajectory | null) => void;
  onSplitView: () => void;
}

export default function Legend({ activeLayer, spotlightCategory, onSpotlightChange, onSplitView }: Props) {
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

          {/* 2×2 spotlight grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 8 }}>
            {SPOTLIGHT_ORDER.map((key) => {
              const cfg = TRAJECTORY_CONFIG[key];
              const isActive = spotlightCategory === key;
              const isDimmed = spotlightCategory !== null && !isActive;
              return (
                <button
                  key={key}
                  onClick={() => onSpotlightChange(isActive ? null : key)}
                  title={isActive ? 'Click to clear filter' : `Show only: ${cfg.label}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '7px 4px 6px',
                    borderRadius: 8,
                    border: `2px solid ${isActive ? cfg.color : 'transparent'}`,
                    background: isActive ? `${cfg.color}1a` : '#f4f4f4',
                    opacity: isDimmed ? 0.38 : 1,
                    cursor: 'pointer',
                    transition: 'opacity 0.15s, border-color 0.15s',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      background: cfg.color,
                      boxShadow: isActive ? `0 0 0 2px ${cfg.color}55` : 'none',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      textAlign: 'center',
                      color: '#1a3a2a',
                      lineHeight: 1.25,
                      fontFamily: 'var(--font-nunito)',
                    }}
                  >
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* No-data swatch */}
          <div className="flex items-center gap-2" style={{ opacity: spotlightCategory ? 0.4 : 1 }}>
            <span
              className="inline-block flex-shrink-0 rounded-sm"
              style={{ width: 14, height: 14, background: TRAJECTORY_CONFIG.no_data.color }}
            />
            <span style={{ color: '#888' }}>{TRAJECTORY_CONFIG.no_data.label}</span>
          </div>

          {spotlightCategory && (
            <button
              onClick={() => onSpotlightChange(null)}
              style={{
                marginTop: 8,
                width: '100%',
                fontSize: 9,
                color: '#555',
                background: 'none',
                border: '1px solid #ccc',
                borderRadius: 5,
                padding: '3px 0',
                cursor: 'pointer',
                fontFamily: 'var(--font-nunito)',
              }}
            >
              Clear filter
            </button>
          )}

          <button
            onClick={onSplitView}
            style={{
              marginTop: 6,
              width: '100%',
              fontSize: 9,
              color: '#fff',
              background: '#2a4a3a',
              border: 'none',
              borderRadius: 5,
              padding: '4px 0',
              cursor: 'pointer',
              fontFamily: 'var(--font-nunito)',
            }}
          >
            Compare all side by side →
          </button>
        </>
      )}
    </div>
  );
}
