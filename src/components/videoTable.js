/**
 * Video Table Component — sortable, filterable
 */
export function renderVideoTable(report) {
  if (!report) return '';
  const data = report.report_data || report.data || {};
  const allVideos = [
    ...(data.youtube?.videos || []).map(v => ({ ...v, platform: 'youtube' })),
    ...(data.facebook?.videos || []).map(v => ({ ...v, platform: 'facebook' })),
    ...(data.tiktok?.videos || []).map(v => ({ ...v, platform: 'tiktok' })),
  ].sort((a, b) => (b.views || 0) - (a.views || 0));

  return `
    <div class="video-table-section" id="video-table-section">
      <h2>📋 Video Performance</h2>
      <div class="table-filters">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="youtube">YouTube</button>
        <button class="filter-btn" data-filter="facebook">Facebook</button>
        <button class="filter-btn" data-filter="tiktok">TikTok</button>
        <button class="filter-btn" data-filter="live">Live Only</button>
        <button class="filter-btn" data-filter="theme_vision">Theme Vision</button>
      </div>
      <table class="video-table" id="video-table">
        <thead>
          <tr>
            <th data-sort="title">Title</th>
            <th data-sort="platform">Platform</th>
            <th data-sort="videoType">Type</th>
            <th data-sort="views">Views ↕</th>
            <th data-sort="likes">Likes ↕</th>
            <th data-sort="comments">Comments ↕</th>
            <th data-sort="shares">Shares ↕</th>
          </tr>
        </thead>
        <tbody id="video-table-body">
          ${allVideos.map(v => videoRow(v)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function videoRow(v) {
  return `
    <tr data-platform="${v.platform}" data-type="${v.videoType}">
      <td>
        <div class="video-title-cell">
          <div class="video-title-text">${v.title || 'Untitled'}</div>
        </div>
      </td>
      <td><span class="badge badge-${v.platform}">${capitalize(v.platform)}</span></td>
      <td>${typeBadge(v.videoType)}</td>
      <td>${fmt(v.views)}</td>
      <td>${fmt(v.likes)}</td>
      <td>${fmt(v.comments)}</td>
      <td>${fmt(v.shares)}</td>
    </tr>
  `;
}

function typeBadge(type) {
  const map = {
    live: '<span class="badge badge-live">Live</span>',
    theme_vision: '<span class="badge badge-theme-vision">Theme Vision</span>',
    short: '<span class="badge badge-short">Short</span>',
  };
  return map[type] || `<span class="badge">${type}</span>`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmt(n) {
  if (!n && n !== 0) return '0';
  return n.toLocaleString();
}

export function bindVideoTableEvents() {
  // Filter buttons
  document.querySelectorAll('.table-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.table-filters .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('#video-table-body tr').forEach(row => {
        if (filter === 'all') { row.style.display = ''; return; }
        const matchPlatform = row.dataset.platform === filter;
        const matchType = row.dataset.type === filter;
        row.style.display = (matchPlatform || matchType) ? '' : 'none';
      });
    });
  });

  // Sort headers
  let sortDir = {};
  document.querySelectorAll('#video-table thead th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      sortDir[key] = !sortDir[key];
      const tbody = document.getElementById('video-table-body');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.sort((a, b) => {
        let aVal, bVal;
        const idx = Array.from(th.parentNode.children).indexOf(th);
        aVal = a.children[idx]?.textContent?.trim() || '';
        bVal = b.children[idx]?.textContent?.trim() || '';
        const aNum = parseFloat(aVal.replace(/,/g, ''));
        const bNum = parseFloat(bVal.replace(/,/g, ''));
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDir[key] ? aNum - bNum : bNum - aNum;
        }
        return sortDir[key] ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
      rows.forEach(r => tbody.appendChild(r));
    });
  });
}
