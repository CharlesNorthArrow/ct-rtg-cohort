'use client';

import { useEffect, useRef } from 'react';
import { DistrictProperties, LayerMode, TRAJECTORY_CONFIG } from '@/lib/types';

interface Props {
  district: DistrictProperties | null;
  activeLayer: LayerMode;
  onClose: () => void;
}

const QUARTILE_LABELS: Record<number, string> = {
  1: 'Q1', 2: 'Q2', 3: 'Q3', 4: 'Q4',
};

function QuartileBadge({ q, invert }: { q: number | null; invert?: boolean }) {
  if (q == null) return <span className="text-gray-400 text-xs">—</span>;
  // For KEI: Q1 = best (invert=true). For ELA: Q4 = best (invert=false).
  const isBest = invert ? q >= 3 : q >= 3;
  const colors = isBest
    ? 'bg-green-100 text-green-800'
    : q === 2 || q === 3
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-red-100 text-red-800';
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors}`}>
      {QUARTILE_LABELS[q]}
    </span>
  );
}

export default function Sidebar({ district, activeLayer, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus the close button when sidebar opens
  useEffect(() => {
    if (district) closeRef.current?.focus();
  }, [district]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const traj = district ? TRAJECTORY_CONFIG[district.trajectory] : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="District detail"
      className="absolute top-0 right-0 h-full z-20 flex flex-col overflow-y-auto shadow-2xl transition-transform duration-300"
      style={{
        width: 320,
        background: '#fff',
        transform: district ? 'translateX(0)' : 'translateX(100%)',
        borderLeft: '1px solid #e0ece4',
        pointerEvents: district ? 'auto' : 'none',
      }}
    >
      {district && (
        <>
          {/* Header */}
          <div
            className="flex items-start justify-between p-4"
            style={{ background: '#f0faf2', borderBottom: '1px solid #cce8d2' }}
          >
            <h2
              className="text-base font-bold leading-snug pr-2"
              style={{ fontFamily: 'var(--font-nunito)', color: '#1a3a2a' }}
            >
              {district.district_name}
            </h2>
            <button
              ref={closeRef}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-xl leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded flex-shrink-0"
              aria-label="Close district detail"
            >
              ×
            </button>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {/* KEI Section */}
            <section>
              <h3
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: '#2E7D32' }}
              >
                Kindergarten Entry Index · 2020–21
              </h3>
              {district.kei_li_pct1 != null ? (
                <div className="flex flex-col gap-1">
                  <p className="text-sm" style={{ color: '#2a4a3a' }}>
                    <span className="font-bold text-base">
                      {Math.round(district.kei_li_pct1 * 100)}%
                    </span>{' '}
                    of entering students needed additional literacy support
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Quartile rank:</span>
                    <QuartileBadge q={district.kei_quartile} invert />
                    <span className="text-xs text-gray-400">
                      {district.kei_quartile === 4 && '(highest need)'}
                      {district.kei_quartile === 3 && '(above avg need)'}
                      {district.kei_quartile === 2 && '(below avg need)'}
                      {district.kei_quartile === 1 && '(lowest need)'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Data not available</p>
              )}
            </section>

            <hr style={{ borderColor: '#e0ece4' }} />

            {/* ELA Section */}
            <section>
              <h3
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: '#1A5276' }}
              >
                ELA Performance Index · 2024–25
              </h3>
              {district.ela_performance_index != null ? (
                <div className="flex flex-col gap-1">
                  <p className="text-sm" style={{ color: '#2a4a3a' }}>
                    Performance Index:{' '}
                    <span className="font-bold text-base">
                      {district.ela_performance_index}
                    </span>
                  </p>
                  {district.ela_hn_rate != null && (
                    <p className="text-xs text-gray-500">
                      High-needs students: {district.ela_hn_rate}
                    </p>
                  )}
                  {district.ela_growth_rate != null && (
                    <p className="text-xs text-gray-500">
                      Growth rate: {Math.round(district.ela_growth_rate * 100)}%
                    </p>
                  )}
                  {district.ela_participation_rate != null && (
                    <p className="text-xs text-gray-500">
                      Assessment participation: {district.ela_participation_rate}%
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Quartile rank:</span>
                    <QuartileBadge q={district.ela_quartile} />
                    <span className="text-xs text-gray-400">
                      {district.ela_quartile === 4 && '(top performer)'}
                      {district.ela_quartile === 3 && '(above average)'}
                      {district.ela_quartile === 2 && '(below average)'}
                      {district.ela_quartile === 1 && '(lowest performance)'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Data not available</p>
              )}
            </section>

            <hr style={{ borderColor: '#e0ece4' }} />

            {/* Trajectory Section */}
            <section>
              <h3
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: '#555' }}
              >
                Cohort Trajectory
              </h3>
              {traj && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: traj.color }}
                    />
                    <span
                      className="font-bold text-sm"
                      style={{ color: traj.color, fontFamily: 'var(--font-nunito)' }}
                    >
                      {traj.label}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: '#3a5a4a', lineHeight: 1.5 }}>
                    {traj.description}
                  </p>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
