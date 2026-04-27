/**
 * Header Component
 */
export function renderHeader(report, onRefresh, onFetchNow, onExportPDF) {
  const weekRange = report
    ? `${formatDate(report.week_start || report.weekStart)} — ${formatDate(report.week_end || report.weekEnd)}`
    : 'Loading...';
  const weekId = report?.week_id || report?.weekId || '—';

  return `
    <header class="dashboard-header" id="dashboard-header">
      <div class="header-left">
        <div class="header-logo">📊</div>
        <div>
          <h1 class="header-title">Socials Dashboard</h1>
          <p class="header-subtitle">Weekly Content Performance Dashboard</p>
        </div>
      </div>
      <div class="header-right">
        <div class="header-week-badge">
          <span class="dot"></span>
          <span>${weekId}</span>
          <span style="color:var(--text-muted)">|</span>
          <span>${weekRange}</span>
        </div>
        <button class="btn btn-primary" id="btn-fetch-now" title="Fetch latest data from all platforms">
          ⚡ Fetch Data Now
        </button>
        <button class="btn btn-ghost" id="btn-refresh" title="Regenerate report with cached data">
          ↻ Refresh
        </button>
        <button class="btn pdf-btn" id="btn-export-pdf" title="Export as PDF">
          ⬇ Export PDF
        </button>
      </div>
    </header>
  `;
}

export function bindHeaderEvents(onRefresh, onFetchNow, onExportPDF) {
  document.getElementById('btn-refresh')?.addEventListener('click', onRefresh);
  document.getElementById('btn-fetch-now')?.addEventListener('click', onFetchNow);
  document.getElementById('btn-export-pdf')?.addEventListener('click', onExportPDF);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
