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
  kei_rank: number | null;
  kei_total: number | null;
  kei_year: string | null;

  ela_performance_index: number | null;
  ela_hn_rate: number | null;
  ela_growth_rate: number | null;
  ela_participation_rate: number | null;
  ela_quartile: number | null;
  ela_rank: number | null;
  ela_total: number | null;
  ela_year: string | null;

  trajectory: Trajectory;
}

export const TRAJECTORY_CONFIG: Record<
  Trajectory,
  { color: string; label: string; description: string }
> = {
  stayed_high: {
    color: '#1976D2',
    label: 'Consistently Strong',
    description:
      'Students in this district entered kindergarten on track and maintained high ELA performance through 3rd grade.',
  },
  stayed_low: {
    color: '#D32F2F',
    label: 'Consistently Struggling',
    description:
      "This district's students entered kindergarten at risk and continued to struggle through 3rd grade ELA.",
  },
  improved: {
    color: '#2E7D32',
    label: 'Beat the Odds',
    description:
      'Despite a challenging start at kindergarten entry, students in this district made remarkable progress by 3rd grade.',
  },
  declined: {
    color: '#F9A825',
    label: 'Fell Behind',
    description:
      'Though students entered kindergarten on track, 3rd grade ELA outcomes fell below expectations.',
  },
  no_data: {
    color: '#9E9E9E',
    label: 'Insufficient Data',
    description: 'One or both metrics are unavailable for this district.',
  },
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
