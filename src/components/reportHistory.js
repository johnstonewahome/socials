/**
 * Report History Component
 */
export function renderReportHistory(reports, activeWeekId, onSelect) {
  if (!reports || reports.length === 0) return '';

  return `
    <div class="report-history-section">
      <h2>📅 Report History</h2>
      <div class="report-list" id="report-list">
        ${reports.map(r => {
          const weekId = r.week_id || r.weekId;
          const isActive = weekId === activeWeekId;
          const totalViews = r.total_views || r.totalViews || 0;
          const totalEng = r.total_engagement || r.totalEngagement || 0;
          const weekStart = r.week_start || r.weekStart;
          const weekEnd = r.week_end || r.weekEnd;
          return `
            <div class="report-item ${isActive ? 'active' : ''}" data-week-id="${weekId}">
              <div class="report-item-week">${weekId}</div>
              <div class="report-item-date">${fmtDate(weekStart)} — ${fmtDate(weekEnd)}</div>
              <div class="report-item-stats">
                <div class="report-item-stat">${fmtNum(totalViews)} <span>views</span></div>
                <div class="report-item-stat">${fmtNum(totalEng)} <span>engagement</span></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function bindReportHistoryEvents(onSelect) {
  document.querySelectorAll('.report-item').forEach(item => {
    item.addEventListener('click', () => {
      const weekId = item.dataset.weekId;
      if (onSelect) onSelect(weekId);
    });
  });
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtNum(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}
