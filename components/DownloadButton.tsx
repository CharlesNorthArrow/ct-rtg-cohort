'use client';

import { useState } from 'react';
import { DistrictProperties } from '@/lib/types';

interface Props {}  // eslint-disable-line @typescript-eslint/no-empty-object-type

const COLUMN_DESCRIPTIONS: Record<string, string> = {
  district_name: 'School district name',
  district_code: 'State district code',
  kei_li_pct1: 'KEI 2020-21: % of entering kindergarteners needing literacy support (higher = more need)',
  kei_quartile: 'KEI quartile 1-4 where 1=best (fewest needing support), 4=worst',
  kei_year: 'School year of KEI data',
  ela_performance_index: 'ELA 2024-25: District Performance Index, all students (higher = better)',
  ela_hn_rate: 'ELA 2024-25: Performance Index for high-needs students',
  ela_growth_rate: 'ELA 2024-25: Academic growth rate (average % of growth target achieved)',
  ela_participation_rate: 'ELA 2024-25: Assessment participation rate (%)',
  ela_quartile: 'ELA quartile 1-4 where 1=lowest performance, 4=highest',
  ela_year: 'School year of ELA data',
  trajectory:
    'Cohort trajectory: stayed_high | stayed_low | improved | declined | no_data',
};

export default function DownloadButton({}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch('/data/districts.geojson');
      const geojson = await res.json();
      const features: Array<{ properties: DistrictProperties }> = geojson.features;
      generateCSV(features);
    } finally {
      setLoading(false);
    }
  }

  function generateCSV(features: Array<{ properties: DistrictProperties }>) {
    const columns = Object.keys(COLUMN_DESCRIPTIONS);
    const descRow = columns.map((c) => `"${COLUMN_DESCRIPTIONS[c]}"`).join(',');
    const headerRow = columns.join(',');
    const dataRows = features.map((f) => {
      return columns
        .map((col) => {
          const val = f.properties[col as keyof DistrictProperties];
          if (val == null) return '';
          if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
          return String(val);
        })
        .join(',');
    });
    const csv = [descRow, headerRow, ...dataRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rtg-kei-ela-cohort-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
      style={{
        background: '#f0faf2',
        color: '#2E7D32',
        border: '1px solid #cce8d2',
        fontFamily: 'var(--font-nunito)',
      }}
      title="Download all district data as CSV"
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 11L3 6h3V1h4v5h3L8 11zM1 13h14v2H1v-2z" />
      </svg>
      Download Data
    </button>
  );
}
