import axios from 'axios';
import auth from '@react-native-firebase/auth';
import { API_BASE_URL } from '../constants/config';

const getAuthHeader = async () => {
  const token = await auth().currentUser?.getIdToken();
  return { Authorization: `Bearer ${token}` };
};


// ─── Regions ───────────────────────────────────────────────────────────────

export async function fetchRegions() {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_BASE_URL}/api/regions`, { headers });
  return response.data.regions; // [{ region_id, name, level, area_km2 }]
}

export async function fetchRegionById(id: string) {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_BASE_URL}/api/regions/${id}`, { headers });
  return response.data;
}

export async function fetchNDVI(regionId: string) {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_BASE_URL}/api/ndvi/${regionId}`, { headers });
  return response.data;
}

// ─── Alerts ────────────────────────────────────────────────────────────────

export async function fetchAlerts() {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_BASE_URL}/api/alerts`, { headers });
  return response.data.alerts; // [{ alert_id, region_name, severity, message, ndvi_change, percent_change, created_at }]
}

// ─── Reports ───────────────────────────────────────────────────────────────

export async function fetchReports() {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_BASE_URL}/api/reports`, { headers });
  return response.data.reports;
}

export async function createReport(payload: object) {
  const headers = await getAuthHeader();
  const response = await axios.post(`${API_BASE_URL}/api/reports`, payload, { headers });
  return response.data;
}

// ─── Change Detection ──────────────────────────────────────────────────────

export async function fetchNDVIChange(
  regionId: string,
  period1Start: string,
  period1End: string,
  period2Start: string,
  period2End: string,
) {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_BASE_URL}/api/change/${regionId}`, {
    headers,
    params: { period1_start: period1Start, period1_end: period1End, period2_start: period2Start, period2_end: period2End },
  });
  return response.data;
}