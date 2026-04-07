'use client';

import { LayerMode, BIVARIATE_COLORS, KEI_STOPS, ELA_STOPS } from '@/lib/types';

// Diamond bivariate legend
// Layout: col = kei_q - 1 (0–3, left→right = more need), row = 4 - ela_q (0–3, top→bottom = worse ELA)
// TOP corner = stayed_high (kei=1, ela=4), BOTTOM = stayed_low, LEFT = declined, RIGHT = improved
const CELL = 10;
const CX = 100;
const CY = 80;

function BivariateDiamond() {
  const cells = ([1, 2, 3, 4] as number[]).flatMap(kei =>
    ([1, 2, 3, 4] as number[]).map(ela => {
      const col = kei - 1;
      const row = 4 - ela;
      const cx = CX + (col - row) * CELL;
      const cy = CY + (col + row - 3) * CELL;
      const color = BIVARIATE_COLORS[`${kei}_${ela}`] || '#e0e0e0';
      return (
        <polygon
          key={`${kei}_${ela}`}
          points={`${cx},${cy - CELL} ${cx + CELL},${cy} ${cx},${cy + CELL} ${cx - CELL},${cy}`}
          fill={color}
          stroke="white"
          strokeWidth={0.5}
        />
      );
    })
  );

  return (
    <svg width={200} height={158} style={{ display: 'block' }}>
      <defs>
        <marker id="bv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#888" />
        </marker>
      </defs>

      {cells}

      {/* Axis arrows along outer NW and NE edges, offset 12 px outward */}
      {/* NW = ELA axis: LEFT tip (60,80) → TOP tip (100,40), outward normal (-0.707,-0.707) */}
      <line x1={52} y1={72} x2={92} y2={32} stroke="#888" strokeWidth={1} markerEnd="url(#bv-arrow)" />
      {/* NE = KEI axis: TOP tip (100,40) → RIGHT tip (140,80), outward normal (+0.707,-0.707) */}
      <line x1={109} y1={32} x2={149} y2={72} stroke="#888" strokeWidth={1} markerEnd="url(#bv-arrow)" />

      {/* Axis labels rotated along edges */}
      <text x={72} y={52} textAnchor="middle" fontSize={7} fill="#666"
        fontFamily="var(--font-nunito)" transform="rotate(-45 72 52)">
        Better ELA
      </text>
      <text x={129} y={52} textAnchor="middle" fontSize={7} fill="#666"
        fontFamily="var(--font-nunito)" transform="rotate(45 129 52)">
        KEI need
      </text>

      {/* Corner category labels */}
      <text x={CX} y={27} textAnchor="middle" fontSize={8} fontWeight="600"
        fill="#1a3a2a" fontFamily="var(--font-nunito)">Stayed High</text>
      <text x={CX} y={138} textAnchor="middle" fontSize={8}
        fill="#1a3a2a" fontFamily="var(--font-nunito)">Stayed Low</text>
      <text x={53} y={83} textAnchor="end" fontSize={8}
        fill="#555" fontFamily="var(--font-nunito)">Declined</text>
      <text x={148} y={83} textAnchor="start" fontSize={8}
        fill="#555" fontFamily="var(--font-nunito)">Improved</text>

      {/* No-data row */}
      <rect x={CX - 6} y={147} width={12} height={7} fill="#e0e0e0" stroke="#ccc" strokeWidth={0.5} rx={1} />
      <text x={CX + 9} y={154} fontSize={7} fill="#888" fontFamily="var(--font-nunito)">No data</text>
    </svg>
  );
}

interface Props {
  activeLayer: LayerMode;
}

export default function Legend({ activeLayer }: Props) {
  return (
    <div
      className="absolute bottom-8 left-3 z-10 rounded-xl shadow-lg p-3 text-xs"
      style={{ background: 'rgba(255,255,255,0.95)', minWidth: 180, maxWidth: 232 }}
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
          <p className="font-bold mb-1" style={{ fontFamily: 'var(--font-nunito)', color: '#1a3a2a' }}>
            Cohort Trajectory
          </p>
          <p className="mb-2" style={{ color: '#5a7a6a' }}>
            KEI 2020–21 → ELA 2024–25
          </p>
          <BivariateDiamond />
        </>
      )}
    </div>
  );
}
