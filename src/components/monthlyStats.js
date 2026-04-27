/**
 * Monthly Stats Component
 * Shows monthly view totals with platform breakdown and month-over-month trends
 */
import Chart from 'chart.js/auto';

let monthlyChart = null;

export function renderMonthlyStats(monthlyData) {
  if (!monthlyData || !monthlyData.months || monthlyData.months.length === 0) {
    return '';
  }

  const months = monthlyData.months;
  const current = months[0];

  return `
    <div class="monthly-section">
      <h2>📅 Monthly Overview</h2>
      <div class="monthly-grid">
        <div class="monthly-summary-card animate-in">
          <div class="monthly-current">
            <div class="monthly-current-label">${current.monthLabel}</div>
            <div class="monthly-current-views">${fmt(current.totalViews)}</div>
            <div class="monthly-current-sublabel">total views</div>
            ${monthChangeTag(current.viewsChange)}
          </div>
          <div class="monthly-breakdown">
            <div class="monthly-platform-row">
              <span class="monthly-platform-dot" style="background:var(--youtube-primary)"></span>
              <span class="monthly-platform-name">YouTube</span>
              <span class="monthly-platform-value">${fmt(current.youtube.views)}</span>
            </div>
            <div class="monthly-platform-row">
              <span class="monthly-platform-dot" style="background:var(--facebook-primary)"></span>
              <span class="monthly-platform-name">Facebook</span>
              <span class="monthly-platform-value">${fmt(current.facebook.views)}</span>
            </div>
            <div class="monthly-platform-row">
              <span class="monthly-platform-dot" style="background:var(--tiktok-primary)"></span>
              <span class="monthly-platform-name">TikTok</span>
              <span class="monthly-platform-value">${fmt(current.tiktok.views)}</span>
            </div>
            <div class="monthly-divider"></div>
            <div class="monthly-platform-row">
              <span class="monthly-platform-dot" style="background:var(--accent-purple)"></span>
              <span class="monthly-platform-name">Engagement</span>
              <span class="monthly-platform-value">${fmt(current.totalEngagement)}</span>
            </div>
            <div class="monthly-weeks-note">${current.weeksCount} week${current.weeksCount !== 1 ? 's' : ''} of data</div>
          </div>
        </div>
        <div class="monthly-chart-card animate-in">
          <h3>Monthly Trend</h3>
          <div class="chart-container" style="height:240px">
            <canvas id="chart-monthly-views"></canvas>
          </div>
        </div>
      </div>
      ${months.length > 1 ? renderMonthlyTable(months) : ''}
    </div>
  `;
}

function renderMonthlyTable(months) {
  return `
    <div class="monthly-history-table animate-in">
      <table class="video-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Total Views</th>
            <th>YouTube</th>
            <th>Facebook</th>
            <th>TikTok</th>
            <th>Engagement</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          ${months.map(m => `
            <tr>
              <td style="font-weight:600">${m.monthLabel}</td>
              <td>${fmt(m.totalViews)}</td>
              <td><span style="color:var(--youtube-primary)">${fmt(m.youtube.views)}</span></td>
              <td><span style="color:var(--facebook-primary)">${fmt(m.facebook.views)}</span></td>
              <td><span style="color:var(--tiktok-primary)">${fmt(m.tiktok.views)}</span></td>
              <td>${fmt(m.totalEngagement)}</td>
              <td>${monthChangeTag(m.viewsChange)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export function initMonthlyChart(monthlyData) {
  if (!monthlyData || !monthlyData.months || monthlyData.months.length < 2) return;

  if (monthlyChart) { monthlyChart.destroy(); monthlyChart = null; }

  const months = [...monthlyData.months].reverse(); // oldest first for chart
  const ctx = document.getElementById('chart-monthly-views')?.getContext('2d');
  if (!ctx) return;

  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months.map(m => m.monthLabel.replace(/\s\d{4}$/, '')), // Just month name
      datasets: [
        {
          label: 'YouTube',
          data: months.map(m => m.youtube.views),
          backgroundColor: 'rgba(255, 0, 51, 0.7)',
          borderColor: '#FF0033',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Facebook',
          data: months.map(m => m.facebook.views),
          backgroundColor: 'rgba(24, 119, 242, 0.7)',
          borderColor: '#1877F2',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'TikTok',
          data: months.map(m => m.tiktok.views),
          backgroundColor: 'rgba(0, 242, 234, 0.7)',
          borderColor: '#00F2EA',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#64748b' },
          grid: { color: 'rgba(255,255,255,0.03)' },
        },
        y: {
          stacked: true,
          ticks: { color: '#64748b', callback: v => v >= 1000 ? (v/1000).toFixed(0) + 'K' : v },
          grid: { color: 'rgba(255,255,255,0.03)' },
        },
      },
    },
  });
}

function monthChangeTag(val) {
  if (val === 0 || val === undefined) return '<span class="kpi-change" style="color:var(--text-muted);background:transparent;font-size:0.72rem">—</span>';
  const cls = val > 0 ? 'positive' : 'negative';
  const arrow = val > 0 ? '↑' : '↓';
  return `<span class="kpi-change ${cls}">${arrow} ${Math.abs(val).toFixed(1)}%</span>`;
}

function fmt(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}
