/**
 * Overview KPI Cards
 */
export function renderOverviewCards(report) {
  if (!report) return '<div class="overview-grid"></div>';

  const pb = report.platform_breakdown || report.platformBreakdown || {};
  const wow = report.weekOverWeekChange || {};

  const totalViews = report.total_views || report.totalViews || 0;
  const totalEngagement = report.total_engagement || report.totalEngagement || 0;

  const totalVideos = (pb.youtube?.videoCount || 0) + (pb.facebook?.videoCount || 0) + (pb.tiktok?.videoCount || 0);
  const viewsChange = wow.views ?? 0;
  const engChange = wow.engagement ?? 0;

  return `
    <div class="overview-grid">
      <div class="kpi-card views animate-in">
        <div class="kpi-label">Total Views</div>
        <div class="kpi-value">${formatNumber(totalViews)}</div>
        ${changeTag(viewsChange, 'vs last week')}
      </div>
      <div class="kpi-card engagement animate-in">
        <div class="kpi-label">Total Engagement</div>
        <div class="kpi-value">${formatNumber(totalEngagement)}</div>
        ${changeTag(engChange, 'vs last week')}
      </div>
      <div class="kpi-card videos animate-in">
        <div class="kpi-label">Videos Tracked</div>
        <div class="kpi-value">${totalVideos}</div>
        <div class="kpi-change" style="color:var(--text-muted);background:transparent;font-size:0.72rem">
          ${platformCounts(pb)}
        </div>
      </div>
      <div class="kpi-card growth animate-in">
        <div class="kpi-label">Top Platform</div>
        <div class="kpi-value" style="font-size:1.4rem">${getTopPlatform(pb)}</div>
        <div class="kpi-change" style="color:var(--text-muted);background:transparent;font-size:0.72rem">
          by total views
        </div>
      </div>
    </div>
  `;
}

function changeTag(val, label = '') {
  if (val === 0) return `<span class="kpi-change" style="color:var(--text-muted);background:transparent">— no prior data</span>`;
  const cls = val > 0 ? 'positive' : 'negative';
  const arrow = val > 0 ? '↑' : '↓';
  return `<span class="kpi-change ${cls}">${arrow} ${Math.abs(val).toFixed(1)}% <span style="opacity:0.7">${label}</span></span>`;
}

function getTopPlatform(pb) {
  const platforms = [
    { name: 'YouTube', icon: '▶', views: pb.youtube?.views || 0 },
    { name: 'Facebook', icon: 'f', views: pb.facebook?.views || 0 },
    { name: 'TikTok', icon: '♪', views: pb.tiktok?.views || 0 },
  ];
  platforms.sort((a, b) => b.views - a.views);
  return platforms[0].views > 0 ? platforms[0].name : '—';
}

function platformCounts(pb) {
  return `YT: ${pb.youtube?.videoCount || 0} · FB: ${pb.facebook?.videoCount || 0} · TT: ${pb.tiktok?.videoCount || 0}`;
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}
