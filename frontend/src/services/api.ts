import type { ForecastResponse, LocationInfo, VerificationReport, ExtremeEventAlert } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function fetchLocations(): Promise<LocationInfo[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/locations`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed fetching locations from API, using fallback defaults:', err);
    return [
      { id: "delhi", name: "New Delhi", state: "Delhi", lat: 28.6139, lon: 77.2090, region: "North India" },
      { id: "guwahati", name: "Guwahati", state: "Assam", lat: 26.1445, lon: 91.7362, region: "Northeast India" },
      { id: "mumbai", name: "Mumbai", state: "Maharashtra", lat: 19.0760, lon: 72.8777, region: "Western Coast" },
      { id: "kolkata", name: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639, region: "Eastern India" },
      { id: "chennai", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, region: "Southern Coast" },
      { id: "bengaluru", name: "Bengaluru", state: "Karnataka", lat: 12.9716, lon: 77.5946, region: "Deccan Plateau" },
      { id: "leh", name: "Leh", state: "Ladakh", lat: 34.1526, lon: 77.5771, region: "Trans-Himalayan" }
    ];
  }
}

export async function fetchForecast(
  lat: number,
  lon: number,
  leadTime: number = 24,
  mode: string = 'auto',
  variable: string = 'rainfall'
): Promise<ForecastResponse> {
  const url = `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&lead_time=${leadTime}&mode=${mode}&variable=${variable}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch forecast: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchVerification(
  region: string = 'All India',
  leadTime: number = 24,
  dataset: string = 'real'
): Promise<VerificationReport> {
  const url = `${API_BASE_URL}/verification?region=${encodeURIComponent(region)}&lead_time=${leadTime}&dataset=${encodeURIComponent(dataset)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch verification report: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchAllExtremes(leadTime: number = 24): Promise<ExtremeEventAlert[]> {
  const url = `${API_BASE_URL}/extremes?lead_time=${leadTime}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch extremes: HTTP ${res.status}`);
  }
  return await res.json();
}

export async function fetchLeadTimeAnalysis(): Promise<any> {
  const url = `${API_BASE_URL}/lead-time-analysis`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch lead-time analysis: HTTP ${res.status}`);
  }
  return await res.json();
}

