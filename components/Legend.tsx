'use client';

import React from 'react';
import { LayerMode, Trajectory, TRAJECTORY_CONFIG, KEI_STOPS, ELA_STOPS } from '@/lib/types';


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
      style={{ background: 'rgba(255,255,255,0.95)', width: 220 }}
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

          {/* 4-diamond SVG: each category is a diamond polygon, all 4 share one center point
              Geometry (cx=110, cy=100, r=32):
                Top outer (110,36) | Left outer (46,100) | Right outer (174,100) | Bottom outer (110,164)
                Shared corners: TL(78,68) TR(142,68) BL(78,132) BR(142,132) | Center (110,100)
          */}
          {(() => {
            const PANELS: Array<{
              key: Trajectory;
              points: string;
              labelLines: string[];
              lx: number; ly: number; anchor: string;
            }> = [
              {
                key: 'stayed_high',
                points: '110,36 78,68 110,100 142,68',
                labelLines: ['Consistently', 'Strong'],
                lx: 110, ly: 22, anchor: 'middle',
              },
              {
                key: 'improved',
                points: '78,68 46,100 78,132 110,100',
                labelLines: ['Beat the', 'Odds'],
                lx: 42, ly: 93, anchor: 'end',
              },
              {
                key: 'declined',
                points: '142,68 174,100 142,132 110,100',
                labelLines: ['Fell', 'Behind'],
                lx: 178, ly: 93, anchor: 'start',
              },
              {
                key: 'stayed_low',
                points: '110,100 78,132 110,164 142,132',
                labelLines: ['Consistently', 'Struggling'],
                lx: 110, ly: 172, anchor: 'middle',
              },
            ];
            return (
              <svg
                viewBox="0 0 220 200"
                style={{ width: '100%', height: 'auto', display: 'block', marginBottom: 6 }}
                aria-label="Cohort trajectory spotlight legend"
              >
                {PANELS.map(({ key, points, labelLines, lx, ly, anchor }) => {
                  const cfg = TRAJECTORY_CONFIG[key];
                  const isActive = spotlightCategory === key;
                  const isDimmed = spotlightCategory !== null && !isActive;
                  return (
                    <g key={key} style={{ cursor: 'pointer' }} onClick={() => onSpotlightChange(isActive ? null : key)}>
                      <polygon
                        points={points}
                        fill={cfg.color}
                        stroke="white"
                        strokeWidth="2"
                        opacity={isDimmed ? 0.3 : 1}
                        style={{ transition: 'opacity 0.15s' }}
                      />
                      {/* Active ring */}
                      {isActive && (
                        <polygon
                          points={points}
                          fill="none"
                          stroke={cfg.color}
                          strokeWidth="3"
                          strokeOpacity="0.5"
                          style={{ transform: 'scale(1.04)', transformOrigin: '110px 100px' }}
                        />
                      )}
                      <text
                        x={lx}
                        y={ly}
                        textAnchor={anchor as React.SVGAttributes<SVGTextElement>['textAnchor']}
                        fontSize="12"
                        fontWeight="600"
                        fill="#1a3a2a"
                        fontFamily="var(--font-nunito)"
                        opacity={isDimmed ? 0.4 : 1}
                        style={{ transition: 'opacity 0.15s' }}
                      >
                        {labelLines.map((line, i) => (
                          <tspan key={i} x={lx} dy={i === 0 ? 0 : 14}>{line}</tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}
              </svg>
            );
          })()}

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
