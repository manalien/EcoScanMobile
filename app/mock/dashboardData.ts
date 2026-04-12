export const mockSummary = {
  avg_ndvi: 0.61,
  ndvi_change: +0.04,
  area_km2: 3280000,
  active_alerts: 3,
  critical_alerts: 2,
};

export const mockNDVITrend = {
  labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
  values: [0.54, 0.58, 0.55, 0.52, 0.57, 0.59, 0.61],
};

export const mockAlerts = [
  {
    alert_id: '1',
    region: 'Rajasthan — Jaisalmer',
    severity: 'Critical' as const,
    description: 'Severe vegetation loss detected',
    ndvi_change: -0.31,
    area_affected: 23,
    created_at: '2h ago',
  },
  {
    alert_id: '2',
    region: 'Madhya Pradesh — Shivpuri',
    severity: 'High' as const,
    description: 'Moderate decrease in greenery',
    ndvi_change: -0.14,
    area_affected: 11,
    created_at: '5h ago',
  },
];

export const mockRegions = [
  {
    region_id: '1',
    name: 'Kerala',
    level: 'State',
    zone: 'Southern',
    ndvi_mean: 0.74,
    ndvi_change: +0.06,
  },
  {
    region_id: '2',
    name: 'Assam',
    level: 'State',
    zone: 'Eastern',
    ndvi_mean: 0.69,
    ndvi_change: +0.03,
  },
  {
    region_id: '3',
    name: 'Rajasthan',
    level: 'State',
    zone: 'Western',
    ndvi_mean: 0.28,
    ndvi_change: -0.09,
  },
];