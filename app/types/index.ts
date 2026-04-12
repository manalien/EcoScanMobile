export interface Region {
  region_id: string;
  name: string;
  level: 'national' | 'state' | 'district';
}

export interface NDVIRecord {
  record_id: string;
  region_id: string;
  period_start: string;
  period_end: string;
  ndvi_mean: number;
  ndvi_min: number;
  ndvi_max: number;
  composite_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Alert {
  alert_id: string;
  region_id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Informational';
  status: 'active' | 'acknowledged' | 'dismissed';
  created_at: string;
  percent_change: number;
}