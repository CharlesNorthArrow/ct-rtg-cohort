export type LayerMode = 'kei' | 'ela' | 'trajectory';

export type Trajectory =
  | 'stayed_high'
  | 'stayed_low'
  | 'improved'
  | 'declined'
  | 'no_data';

export interface DistrictProperties {
  district_name: string;
  district_code: string | null;

  kei_li_pct1: number | null;
  kei_quartile: number | null;
  kei_year: string | null;

  ela_performance_index: number | null;
  ela_hn_rate: number | null;
  ela_growth_rate: number | null;
  ela_participation_rate: number | null;
  ela_quartile: number | null;
  ela_year: string | null;

  trajectory: Trajectory;
}

export const TRAJECTORY_CONFIG: Record<
  Trajectory,
  { color: string; label: string; description: string }
> = {
  stayed_high: {
    color: '#2e7d32',
    label: 'Consistently Strong',
    description:
      'Students in this district entered kindergarten on track and maintained high ELA performance through 3rd grade.',
  },
  stayed_low: {
    color: '#d62c1a',
    label: 'Consistently Struggling',
    description:
      "This district's students entered kindergarten at risk and continued to struggle through 3rd grade ELA.",
  },
  improved: {
    color: '#1565c0',
    label: 'Beat the Odds',
    description:
      'Despite a challenging start at kindergarten entry, students in this district made remarkable progress by 3rd grade.',
  },
  declined: {
    color: '#f0c419',
    label: 'Fell Behind',
    description:
      'Though students entered kindergarten on track, 3rd grade ELA outcomes fell below expectations.',
  },
  no_data: {
    color: '#BDBDBD',
    label: 'Insufficient Data',
    description: 'One or both metrics are unavailable for this district.',
  },
};

// Bivariate color matrix: key = "${kei_quartile}_${ela_quartile}"
// kei_q 1 = lowest need (best start), 4 = highest need (hardest start)
// ela_q 1 = lowest performance (worst end), 4 = highest performance (best end)
// Four corners: declined (amber), stayed_high (green), stayed_low (red), improved (blue)
// Interior cells bilinearly interpolated between the four corners.
export const BIVARIATE_COLORS: Record<string, string> = {
  '1_1': '#f0c419', '1_2': '#afac21', '1_3': '#6f952a', '1_4': '#2e7d32',
  '2_1': '#e79119', '2_2': '#a78831', '2_3': '#667e49', '2_4': '#267561',
  '3_1': '#df5f1a', '3_2': '#9e6341', '3_3': '#5e6869', '3_4': '#1d6d91',
  '4_1': '#d62c1a', '4_2': '#963f51', '4_3': '#555289', '4_4': '#1565c0',
};

export const KEI_STOPS: Array<{ value: number; color: string; label: string }> = [
  { value: 0,    color: '#2E7D32', label: '< 20% needing support' },
  { value: 0.20, color: '#8BC34A', label: '20–30%' },
  { value: 0.30, color: '#FFF176', label: '30–40%' },
  { value: 0.40, color: '#FF8A65', label: '40–50%' },
  { value: 0.50, color: '#C62828', label: '> 50% needing support' },
];

export const ELA_STOPS: Array<{ value: number; color: string; label: string }> = [
  { value: 0,  color: '#C62828', label: '< 40 (Low)' },
  { value: 40, color: '#FF8A65', label: '40–55' },
  { value: 55, color: '#FFF176', label: '55–65' },
  { value: 65, color: '#8BC34A', label: '65–75' },
  { value: 75, color: '#2E7D32', label: '> 75 (High)' },
];
