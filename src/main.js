/**
 * Main Application Entry Point
 */
import './style.css';
import { getLatestReport, getReports, getReportByWeekId, generateReport } from './api.js';
import { renderHeader, bindHeaderEvents } from './components/header.js';
import { renderOverviewCards } from './components/overviewCards.js';
import { renderPlatformPanels } from './components/platformPanel.js';
import { renderCharts, initCharts } from './components/charts.js';
import { renderVideoTable, bindVideoTableEvents } from './components/videoTable.js';
import { renderReportHistory, bindReportHistoryEvents } from './components/reportHistory.js';

let currentReport = null;
let allReports = [];

const app = document.getElementById('app');

async function init() {
  showLoading();
  try {
    const [latestReport, reportsData] = await Promise.all([
      getLatestReport().catch(() => null),
      getReports(12).catch(() => ({ reports: [] })),
    ]);
    currentReport = latestReport;
    allReports = reportsData.reports || [];

    if (!currentReport && allReports.length > 0) {
      currentReport = allReports[0];
    }

    renderDashboard();
  } catch (err) {
    console.error('Init error:', err);
    showError('Could not connect to the API server. Make sure the backend is running on port 3001.');
  }
}

function renderDashboard() {
  const weekId = currentReport?.week_id || currentReport?.weekId;

  app.innerHTML = `
    ${renderHeader(currentReport, handleRefresh, handleFetchNow, handleExportPDF)}
    ${renderOverviewCards(currentReport)}
    ${renderVideoTable(currentReport)}
    ${renderPlatformPanels(currentReport)}
    ${renderCharts()}
    ${renderReportHistory(allReports, weekId, handleSelectReport)}
  `;

  // Bind events after DOM is rendered
  bindHeaderEvents(handleRefresh, handleFetchNow, handleExportPDF);
  bindVideoTableEvents();
  bindReportHistoryEvents(handleSelectReport);

  // Initialize charts (needs DOM canvas elements)
  requestAnimationFrame(() => initCharts(currentReport));
}

async function handleRefresh() {
  showLoading();
  try {
    const [latestReport, reportsData] = await Promise.all([
      getLatestReport().catch(() => null),
      getReports(12).catch(() => ({ reports: [] })),
    ]);
    currentReport = latestReport;
    allReports = reportsData.reports || [];
    renderDashboard();
  } catch (err) {
    console.error('Refresh error:', err);
    alert('Failed to refresh. Check if the server is running.');
  }
}

async function handleFetchNow() {
  const btn = document.getElementById('btn-fetch-now');
  if (btn) { btn.textContent = '⏳ Fetching...'; btn.disabled = true; }

  try {
    const result = await generateReport();
    // Re-fetch with week-over-week change from the server
    const [latestReport, reportsData] = await Promise.all([
      getLatestReport(),
      getReports(12),
    ]);
    currentReport = latestReport;
    allReports = reportsData.reports || [];
    renderDashboard();
  } catch (err) {
    console.error('Fetch error:', err);
    if (btn) { btn.textContent = '⚡ Fetch Data Now'; btn.disabled = false; }
    alert('Failed to fetch data. Check if the server is running.');
  }
}

async function handleSelectReport(weekId) {
  try {
    const report = await getReportByWeekId(weekId);
    if (report) {
      currentReport = report;
      renderDashboard();
    }
  } catch (err) {
    console.error('Failed to load report:', err);
  }
}

function handleExportPDF() {
  // Use browser print as PDF with styling
  const style = document.createElement('style');
  style.id = 'pdf-print-style';
  style.textContent = `
    @media print {
      body { background: #0a0e1a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body::before { display: none; }
      .btn, .filter-btn, .report-history-section { display: none !important; }
      .header-right { display: none !important; }
      #app { max-width: 100%; padding: 1rem; }
      .overview-grid { grid-template-columns: repeat(4, 1fr); }
      .platforms-grid { grid-template-columns: repeat(3, 1fr); }
      .charts-section { grid-template-columns: 2fr 1fr; }
      .kpi-card, .platform-card, .chart-card { break-inside: avoid; }
      .animate-in { animation: none !important; opacity: 1 !important; }
    }
  `;
  document.head.appendChild(style);
  window.print();
  setTimeout(() => document.getElementById('pdf-print-style')?.remove(), 1000);
}

function showLoading() {
  app.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Loading dashboard...</p>
    </div>
  `;
}

function showError(message) {
  app.innerHTML = `
    <div class="loading-container">
      <div class="empty-state-icon">⚠️</div>
      <p style="color:var(--text-primary);font-size:1.1rem;font-weight:600">Connection Error</p>
      <p class="loading-text" style="max-width:400px;text-align:center">${message}</p>
      <button class="btn btn-primary" onclick="location.reload()">↻ Retry</button>
    </div>
  `;
}

// Initialize
init();
