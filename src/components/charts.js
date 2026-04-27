/**
 * Charts Component — Chart.js visualizations
 */
import Chart from 'chart.js/auto';

let barChart = null;
let doughnutChart = null;

export function renderCharts() {
  return `
    <div class="charts-section">
      <div class="chart-card animate-in">
        <h3>📊 Views by Platform</h3>
        <div class="chart-container">
          <canvas id="chart-platform-views"></canvas>
        </div>
      </div>
      <div class="chart-card animate-in">
        <h3>📈 Engagement Breakdown</h3>
        <div class="chart-container">
          <canvas id="chart-engagement"></canvas>
        </div>
      </div>
    </div>
  `;
}

export function initCharts(report) {
  if (!report) return;
  const data = report.report_data || report.data || {};
  const pb = report.platform_breakdown || report.platformBreakdown || {};

  // Destroy existing charts
  if (barChart) { barChart.destroy(); barChart = null; }
  if (doughnutChart) { doughnutChart.destroy(); doughnutChart = null; }

  // Bar chart — views by platform
  const barCtx = document.getElementById('chart-platform-views')?.getContext('2d');
  if (barCtx) {
    barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['YouTube', 'Facebook', 'TikTok'],
        datasets: [
          {
            label: 'Views',
            data: [pb.youtube?.views || 0, pb.facebook?.views || 0, pb.tiktok?.views || 0],
            backgroundColor: ['rgba(255,0,51,0.7)', 'rgba(24,119,242,0.7)', 'rgba(0,242,234,0.7)'],
            borderColor: ['#FF0033', '#1877F2', '#00F2EA'],
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.5,
          },
          {
            label: 'Engagement',
            data: [pb.youtube?.engagement || 0, pb.facebook?.engagement || 0, pb.tiktok?.engagement || 0],
            backgroundColor: ['rgba(255,0,51,0.25)', 'rgba(24,119,242,0.25)', 'rgba(0,242,234,0.25)'],
            borderColor: ['#FF0033', '#1877F2', '#00F2EA'],
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } },
        },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } },
          y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } },
        },
      },
    });
  }

  // Doughnut chart — engagement breakdown
  const yt = data.youtube?.summary || {};
  const fb = data.facebook?.summary || {};
  const tt = data.tiktok?.summary || {};
  const totalLikes = (yt.totalLikes||0) + (fb.totalLikes||0) + (tt.totalLikes||0);
  const totalComments = (yt.totalComments||0) + (fb.totalComments||0) + (tt.totalComments||0);
  const totalShares = (yt.totalShares||0) + (fb.totalShares||0) + (tt.totalShares||0);

  const doughCtx = document.getElementById('chart-engagement')?.getContext('2d');
  if (doughCtx) {
    doughnutChart = new Chart(doughCtx, {
      type: 'doughnut',
      data: {
        labels: ['Likes', 'Comments', 'Shares'],
        datasets: [{
          data: [totalLikes, totalComments, totalShares],
          backgroundColor: ['rgba(139,92,246,0.8)', 'rgba(24,119,242,0.8)', 'rgba(16,185,129,0.8)'],
          borderColor: ['#8b5cf6', '#1877F2', '#10b981'],
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 10 },
          },
        },
      },
    });
  }
}
