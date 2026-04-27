/**
 * API Client — communicates with the Express backend
 */
const BASE_URL = '/api';

async function fetchJSON(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getLatestReport() {
  return fetchJSON('/reports/latest');
}

export async function getReports(limit = 12) {
  return fetchJSON(`/reports?limit=${limit}`);
}

export async function getReportByWeekId(weekId) {
  return fetchJSON(`/reports/${weekId}`);
}

export async function getCurrentWeek() {
  return fetchJSON('/reports/current-week');
}

export async function getMonthlyStats() {
  return fetchJSON('/reports/monthly');
}

export async function generateReport() {
  const res = await fetch(`${BASE_URL}/reports/generate`, { method: 'POST' });
  if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
  return res.json();
}

export async function getYouTubeVideos(weekId) {
  return fetchJSON(`/youtube/videos?weekId=${weekId}`);
}

export async function getFacebookVideos(weekId) {
  return fetchJSON(`/facebook/videos?weekId=${weekId}`);
}

export async function getTikTokVideos(weekId) {
  return fetchJSON(`/tiktok/videos?weekId=${weekId}`);
}

export async function healthCheck() {
  return fetchJSON('/health');
}
