/**
 * Mock Data Generator
 * Provides realistic demo data when API credentials are not configured.
 */

const THEME_VISION_TITLES = [
  'Theme Vision: Walking in Faith',
  'Theme Vision: The Power of Prayer',
  'Theme Vision: Grace & Mercy',
  'Theme Vision: Building Community',
  'Theme Vision: Hope in Darkness',
  'Theme Vision: Joy Unspeakable',
  'Theme Vision: Living with Purpose',
  'Theme Vision: The Heart of Worship',
];

const LIVE_TITLES = [
  'Sunday Service — Live Worship & Word',
  'Wednesday Bible Study — LIVE',
  'Early Bird Prayer — Morning Devotion LIVE',
  'Worship Night — Praise & Encounter LIVE',
  'Family Discipleship — Building Strong Homes',
  'She Conference — Women Empowered LIVE',
  'Sunday Morning Service — Live',
  'Wednesday Night Prayer Meeting — LIVE',
  'Early Bird Devotion — Start Your Day Right',
  'Worship Experience — Live From Sanctuary',
];

const TIKTOK_TITLES = [
  'Sunday Highlights ✨',
  'Worship Moment 🎵',
  'Quick Word for Today 📖',
  'Behind the Scenes at Church',
  'Praise Break! 🙌',
  'Sermon Clip — Faith Over Fear',
  'Church Family Moments',
  'Worship Team Practice 🎶',
  'Pastor\'s Corner — 60 Seconds',
  'Community Outreach Day',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateVideoId(platform) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const len = platform === 'youtube' ? 11 : platform === 'facebook' ? 15 : 19;
  let id = '';
  for (let i = 0; i < len; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

function generateDateInRange(start, end) {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return new Date(startMs + Math.random() * (endMs - startMs)).toISOString();
}

function generateThumbnail(platform, index) {
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E9'];
  const color = colors[index % colors.length];
  return `https://via.placeholder.com/480x270/${color}/FFFFFF?text=${platform}+Video+${index + 1}`;
}

export function generateMockYouTubeData(weekStart, weekEnd) {
  const videos = [];

  // Generate 2-3 live videos
  const liveCount = randomInt(2, 3);
  for (let i = 0; i < liveCount; i++) {
    videos.push({
      videoId: generateVideoId('youtube'),
      title: LIVE_TITLES[randomInt(0, LIVE_TITLES.length - 1)],
      videoType: 'live',
      views: randomInt(150, 2500),
      likes: randomInt(30, 300),
      comments: randomInt(10, 80),
      shares: randomInt(5, 40),
      watchTimeMinutes: randomFloat(45, 180),
      thumbnailUrl: generateThumbnail('YouTube', i),
      publishedAt: generateDateInRange(weekStart, weekEnd),
      peakConcurrentViewers: randomInt(20, 200),
      duration: `PT${randomInt(30, 120)}M`,
    });
  }

  // Generate 1-2 Theme Vision videos
  const tvCount = randomInt(1, 2);
  for (let i = 0; i < tvCount; i++) {
    videos.push({
      videoId: generateVideoId('youtube'),
      title: THEME_VISION_TITLES[randomInt(0, THEME_VISION_TITLES.length - 1)],
      videoType: 'theme_vision',
      views: randomInt(100, 1800),
      likes: randomInt(20, 200),
      comments: randomInt(5, 50),
      shares: randomInt(3, 25),
      watchTimeMinutes: randomFloat(10, 60),
      thumbnailUrl: generateThumbnail('YouTube', liveCount + i),
      publishedAt: generateDateInRange(weekStart, weekEnd),
      duration: `PT${randomInt(5, 30)}M`,
    });
  }

  return videos;
}

export function generateMockFacebookData(weekStart, weekEnd) {
  const videos = [];

  // Generate 2-4 live videos
  const liveCount = randomInt(2, 4);
  for (let i = 0; i < liveCount; i++) {
    videos.push({
      videoId: generateVideoId('facebook'),
      title: LIVE_TITLES[randomInt(0, LIVE_TITLES.length - 1)],
      videoType: 'live',
      views: randomInt(200, 5000),
      likes: randomInt(50, 400),
      comments: randomInt(20, 150),
      shares: randomInt(10, 80),
      watchTimeMinutes: randomFloat(60, 240),
      thumbnailUrl: generateThumbnail('Facebook', i),
      publishedAt: generateDateInRange(weekStart, weekEnd),
      reach: randomInt(500, 8000),
    });
  }

  // Generate 1-2 Theme Vision videos
  const tvCount = randomInt(1, 2);
  for (let i = 0; i < tvCount; i++) {
    videos.push({
      videoId: generateVideoId('facebook'),
      title: THEME_VISION_TITLES[randomInt(0, THEME_VISION_TITLES.length - 1)],
      videoType: 'theme_vision',
      views: randomInt(100, 3000),
      likes: randomInt(30, 250),
      comments: randomInt(10, 80),
      shares: randomInt(5, 50),
      watchTimeMinutes: randomFloat(15, 90),
      thumbnailUrl: generateThumbnail('Facebook', liveCount + i),
      publishedAt: generateDateInRange(weekStart, weekEnd),
      reach: randomInt(300, 5000),
    });
  }

  return videos;
}

export function generateMockTikTokData(weekStart, weekEnd) {
  const videos = [];
  const count = randomInt(3, 7);

  for (let i = 0; i < count; i++) {
    videos.push({
      videoId: generateVideoId('tiktok'),
      title: TIKTOK_TITLES[randomInt(0, TIKTOK_TITLES.length - 1)],
      videoType: 'short',
      views: randomInt(500, 50000),
      likes: randomInt(50, 5000),
      comments: randomInt(10, 500),
      shares: randomInt(5, 300),
      watchTimeMinutes: randomFloat(0.5, 5),
      thumbnailUrl: generateThumbnail('TikTok', i),
      publishedAt: generateDateInRange(weekStart, weekEnd),
      avgWatchTime: randomFloat(3, 45),
      completionRate: randomFloat(20, 85),
    });
  }

  return videos;
}

export function generateMockWeeklyReport(weekStart, weekEnd, weekId) {
  const youtube = generateMockYouTubeData(weekStart, weekEnd);
  const facebook = generateMockFacebookData(weekStart, weekEnd);
  const tiktok = generateMockTikTokData(weekStart, weekEnd);

  const ytViews = youtube.reduce((s, v) => s + v.views, 0);
  const fbViews = facebook.reduce((s, v) => s + v.views, 0);
  const ttViews = tiktok.reduce((s, v) => s + v.views, 0);

  const ytEngagement = youtube.reduce((s, v) => s + v.likes + v.comments + v.shares, 0);
  const fbEngagement = facebook.reduce((s, v) => s + v.likes + v.comments + v.shares, 0);
  const ttEngagement = tiktok.reduce((s, v) => s + v.likes + v.comments + v.shares, 0);

  const topYT = youtube.sort((a, b) => b.views - a.views)[0];
  const topFB = facebook.sort((a, b) => b.views - a.views)[0];
  const topTT = tiktok.sort((a, b) => b.views - a.views)[0];

  return {
    weekId,
    weekStart,
    weekEnd,
    generatedAt: new Date().toISOString(),
    totalViews: ytViews + fbViews + ttViews,
    totalEngagement: ytEngagement + fbEngagement + ttEngagement,
    platformBreakdown: {
      youtube: { views: ytViews, engagement: ytEngagement, videoCount: youtube.length },
      facebook: { views: fbViews, engagement: fbEngagement, videoCount: facebook.length },
      tiktok: { views: ttViews, engagement: ttEngagement, videoCount: tiktok.length },
    },
    data: {
      youtube: {
        videos: youtube,
        summary: {
          totalViews: ytViews,
          totalLikes: youtube.reduce((s, v) => s + v.likes, 0),
          totalComments: youtube.reduce((s, v) => s + v.comments, 0),
          totalShares: youtube.reduce((s, v) => s + v.shares, 0),
          totalVideos: youtube.length,
          liveVideos: youtube.filter(v => v.videoType === 'live').length,
          themeVisionVideos: youtube.filter(v => v.videoType === 'theme_vision').length,
          avgEngagementRate: youtube.length > 0 ? parseFloat((ytEngagement / ytViews * 100).toFixed(2)) : 0,
          topVideo: topYT ? { id: topYT.videoId, title: topYT.title, views: topYT.views } : null,
        },
      },
      facebook: {
        videos: facebook,
        summary: {
          totalViews: fbViews,
          totalLikes: facebook.reduce((s, v) => s + v.likes, 0),
          totalComments: facebook.reduce((s, v) => s + v.comments, 0),
          totalShares: facebook.reduce((s, v) => s + v.shares, 0),
          totalVideos: facebook.length,
          liveVideos: facebook.filter(v => v.videoType === 'live').length,
          themeVisionVideos: facebook.filter(v => v.videoType === 'theme_vision').length,
          avgEngagementRate: facebook.length > 0 ? parseFloat((fbEngagement / fbViews * 100).toFixed(2)) : 0,
          topVideo: topFB ? { id: topFB.videoId, title: topFB.title, views: topFB.views } : null,
        },
      },
      tiktok: {
        videos: tiktok,
        summary: {
          totalViews: ttViews,
          totalLikes: tiktok.reduce((s, v) => s + v.likes, 0),
          totalComments: tiktok.reduce((s, v) => s + v.comments, 0),
          totalShares: tiktok.reduce((s, v) => s + v.shares, 0),
          totalVideos: tiktok.length,
          avgEngagementRate: tiktok.length > 0 ? parseFloat((ttEngagement / ttViews * 100).toFixed(2)) : 0,
          topVideo: topTT ? { id: topTT.videoId, title: topTT.title, views: topTT.views } : null,
        },
      },
    },
    weekOverWeekChange: {
      views: randomFloat(-15, 25),
      engagement: randomFloat(-10, 30),
    },
  };
}

/**
 * Generate historical mock reports for the past N weeks
 */
export function generateMockHistory(weeks = 8) {
  const reports = [];
  const now = new Date();

  for (let i = 0; i < weeks; i++) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - (7 * i) - ((now.getDay() + 6) % 7)); // Previous Sunday
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6); // Monday

    const weekId = `${weekStart.getFullYear()}-W${String(getISOWeek(weekStart)).padStart(2, '0')}`;
    reports.push(generateMockWeeklyReport(
      weekStart.toISOString().split('T')[0],
      weekEnd.toISOString().split('T')[0],
      weekId
    ));
  }

  return reports;
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
