export interface RegionPolygon {
  id: string;
  name: string;
  state: string;
  zone: string;
  ndvi_mean: number;
  ndvi_change: number;
  category: 'severe_decrease' | 'moderate_decrease' | 'no_change' | 'moderate_increase' | 'severe_increase';
  coordinates: { latitude: number; longitude: number }[];
  alertSeverity?: 'Critical' | 'High' | 'Medium' | null;
}

export const NDVI_COLORS = {
  severe_decrease: '#A50026',
  moderate_decrease: '#F46D43',
  no_change: '#FFFFBF',
  moderate_increase: '#74C476',
  severe_increase: '#006837',
};

export const mockRegionPolygons: RegionPolygon[] = [
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    state: 'Rajasthan',
    zone: 'Western',
    ndvi_mean: 0.28,
    ndvi_change: -0.31,
    category: 'severe_decrease',
    alertSeverity: 'Critical',
    coordinates: [
      { latitude: 30.0, longitude: 69.5 },
      { latitude: 30.2, longitude: 75.8 },
      { latitude: 27.5, longitude: 76.5 },
      { latitude: 24.5, longitude: 74.0 },
      { latitude: 23.0, longitude: 69.5 },
      { latitude: 24.0, longitude: 68.5 },
      { latitude: 27.0, longitude: 68.5 },
    ],
  },
  {
    id: 'madhya_pradesh',
    name: 'Madhya Pradesh',
    state: 'Madhya Pradesh',
    zone: 'Central',
    ndvi_mean: 0.42,
    ndvi_change: -0.14,
    category: 'moderate_decrease',
    alertSeverity: 'High',
    coordinates: [
      { latitude: 26.8, longitude: 74.7 },
      { latitude: 26.9, longitude: 82.7 },
      { latitude: 24.0, longitude: 82.8 },
      { latitude: 21.5, longitude: 81.5 },
      { latitude: 21.0, longitude: 74.5 },
      { latitude: 23.5, longitude: 74.0 },
    ],
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    state: 'Maharashtra',
    zone: 'Western',
    ndvi_mean: 0.48,
    ndvi_change: -0.02,
    category: 'no_change',
    alertSeverity: null,
    coordinates: [
      { latitude: 21.0, longitude: 74.0 },
      { latitude: 21.5, longitude: 80.5 },
      { latitude: 19.0, longitude: 80.5 },
      { latitude: 15.8, longitude: 77.5 },
      { latitude: 15.8, longitude: 73.0 },
      { latitude: 19.0, longitude: 72.8 },
    ],
  },
  {
    id: 'kerala',
    name: 'Kerala',
    state: 'Kerala',
    zone: 'Southern',
    ndvi_mean: 0.74,
    ndvi_change: 0.06,
    category: 'severe_increase',
    alertSeverity: null,
    coordinates: [
      { latitude: 12.8, longitude: 74.9 },
      { latitude: 11.2, longitude: 76.7 },
      { latitude: 8.4, longitude: 77.5 },
      { latitude: 8.0, longitude: 76.8 },
      { latitude: 10.0, longitude: 75.5 },
      { latitude: 12.5, longitude: 74.7 },
    ],
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    state: 'Karnataka',
    zone: 'Southern',
    ndvi_mean: 0.62,
    ndvi_change: 0.08,
    category: 'moderate_increase',
    alertSeverity: null,
    coordinates: [
      { latitude: 18.0, longitude: 74.0 },
      { latitude: 18.0, longitude: 78.5 },
      { latitude: 15.0, longitude: 78.5 },
      { latitude: 12.5, longitude: 77.5 },
      { latitude: 11.5, longitude: 76.5 },
      { latitude: 13.0, longitude: 74.5 },
      { latitude: 15.5, longitude: 73.8 },
    ],
  },
  {
    id: 'west_bengal',
    name: 'West Bengal',
    state: 'West Bengal',
    zone: 'Eastern',
    ndvi_mean: 0.65,
    ndvi_change: 0.04,
    category: 'moderate_increase',
    alertSeverity: null,
    coordinates: [
      { latitude: 27.5, longitude: 85.8 },
      { latitude: 27.5, longitude: 88.5 },
      { latitude: 25.0, longitude: 89.0 },
      { latitude: 21.5, longitude: 87.5 },
      { latitude: 21.5, longitude: 85.5 },
      { latitude: 24.0, longitude: 85.5 },
    ],
  },
  {
    id: 'uttarakhand',
    name: 'Uttarakhand',
    state: 'Uttarakhand',
    zone: 'Northern',
    ndvi_mean: 0.71,
    ndvi_change: 0.09,
    category: 'severe_increase',
    alertSeverity: null,
    coordinates: [
      { latitude: 31.5, longitude: 78.0 },
      { latitude: 31.5, longitude: 81.0 },
      { latitude: 29.5, longitude: 81.0 },
      { latitude: 29.0, longitude: 78.2 },
      { latitude: 29.5, longitude: 77.5 },
    ],
  },
  {
    id: 'assam',
    name: 'Assam',
    state: 'Assam',
    zone: 'Eastern',
    ndvi_mean: 0.69,
    ndvi_change: 0.03,
    category: 'moderate_increase',
    alertSeverity: null,
    coordinates: [
      { latitude: 27.5, longitude: 89.8 },
      { latitude: 28.0, longitude: 95.0 },
      { latitude: 27.0, longitude: 96.0 },
      { latitude: 24.5, longitude: 94.0 },
      { latitude: 24.0, longitude: 90.0 },
      { latitude: 26.0, longitude: 89.8 },
    ],
  },
];

export const mockMapAlerts = mockRegionPolygons
  .filter(r => r.alertSeverity)
  .map(r => ({
    id: r.id,
    region: r.name,
    state: r.state,
    severity: r.alertSeverity!,
    ndvi_change: r.ndvi_change,
    ndvi_mean: r.ndvi_mean,
    coordinates: {
      latitude: r.coordinates.reduce((s, c) => s + c.latitude, 0) / r.coordinates.length,
      longitude: r.coordinates.reduce((s, c) => s + c.longitude, 0) / r.coordinates.length,
    },
  }));