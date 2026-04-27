/**
 * Platform Panel Component
 */
export function renderPlatformPanels(report) {
  if (!report) return '<div class="platforms-grid"></div>';
  const data = report.report_data || report.data || {};
  return `
    <div class="platforms-grid">
      ${renderPanel('youtube', 'YouTube', '▶', data.youtube)}
      ${renderPanel('facebook', 'Facebook', 'f', data.facebook)}
      ${renderPanel('tiktok', 'TikTok', '♪', data.tiktok)}
    </div>
  `;
}

function renderPanel(platform, label, icon, platformData) {
  const s = platformData?.summary || {};
  const topVideo = s.topVideo || null;
  const typeBadges = platform === 'tiktok'
    ? `<span style="font-size:0.72rem;color:var(--text-muted)">${s.totalVideos || 0} videos</span>`
    : `<span style="font-size:0.72rem;color:var(--text-muted)">${s.liveVideos || 0} live · ${s.themeVisionVideos || 0} theme vision</span>`;

  return `
    <div class="platform-card ${platform} animate-in">
      <div class="platform-header">
        <div class="platform-name">
          <div class="platform-icon">${icon}</div>
          ${label}
        </div>
        <span class="platform-video-count">${s.totalVideos || 0} videos</span>
      </div>
      <div class="platform-stats">
        <div class="platform-stat">
          <div class="platform-stat-value">${fmt(s.totalViews)}</div>
          <div class="platform-stat-label">Views</div>
        </div>
        <div class="platform-stat">
          <div class="platform-stat-value">${fmt(s.totalLikes)}</div>
          <div class="platform-stat-label">Likes</div>
        </div>
        <div class="platform-stat">
          <div class="platform-stat-value">${fmt(s.totalComments)}</div>
          <div class="platform-stat-label">Comments</div>
        </div>
        <div class="platform-stat">
          <div class="platform-stat-value">${s.avgEngagementRate || 0}%</div>
          <div class="platform-stat-label">Eng. Rate</div>
        </div>
      </div>
      <div style="margin-bottom:var(--space-sm)">${typeBadges}</div>
      ${topVideo ? `
        <div class="platform-top-video">
          <div class="platform-top-video-label">🏆 Top Video</div>
          <div class="platform-top-video-title">${topVideo.title}</div>
          <div class="platform-top-video-views">${fmt(topVideo.views)} views</div>
        </div>
      ` : ''}
    </div>
  `;
}

function fmt(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}
