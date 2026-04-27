/**
 * Weekly Report Generator
 * Aggregates data from all platforms into a unified weekly report
 */
import { fetchYouTubeData, generateYouTubeSummary } from './youtube.js';
import { fetchFacebookData, generateFacebookSummary } from './facebook.js';
import { fetchTikTokData, generateTikTokSummary } from './tiktok.js';
import { generateMockWeeklyReport, generateMockHistory } from './mockData.js';
import { saveWeeklyReport, saveVideoMetrics, savePlatformSummary, getLatestReport } from '../db/database.js';

export function getWeekDateRange(referenceDate = new Date()) {
  const d = new Date(referenceDate);
  // Find previous Monday
  const day = d.getDay();
  const diffToMon = day === 0 ? 6 : day - 1;
  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMon - 7); // Last week's Monday
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
    weekId: `${monday.getFullYear()}-W${String(getISOWeek(monday)).padStart(2, '0')}`,
  };
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function calculateGrowth(current, previous) {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return parseFloat(((current - previous) / previous * 100).toFixed(2));
}

export async function generateWeeklyReport(config, useMock = false) {
  const { start, end, weekId } = getWeekDateRange();
  console.log(`📊 Generating report for ${weekId}: ${start} → ${end}`);

  if (useMock) {
    console.log('🎭 Using mock data');
    const report = generateMockWeeklyReport(start, end, weekId);
    saveWeeklyReport(report);

    // Save video metrics
    const allVideos = [
      ...report.data.youtube.videos.map(v => ({ ...v, platform: 'youtube', weekId })),
      ...report.data.facebook.videos.map(v => ({ ...v, platform: 'facebook', weekId })),
      ...report.data.tiktok.videos.map(v => ({ ...v, platform: 'tiktok', weekId })),
    ];
    saveVideoMetrics(allVideos);

    // Save platform summaries
    for (const [platform, summary] of Object.entries(report.data)) {
      savePlatformSummary({ weekId, platform, ...summary.summary });
    }
    return report;
  }

  try {
    // Fetch real data from all platforms
    const [ytVideos, fbVideos, ttVideos] = await Promise.all([
      config.youtube?.apiKey
        ? fetchYouTubeData(config.youtube.apiKey, config.youtube.channelId, start, end)
        : [],
      config.facebook?.accessToken
        ? fetchFacebookData(config.facebook.accessToken, config.facebook.pageId, start, end)
        : [],
      config.tiktok?.accessToken
        ? fetchTikTokData(config.tiktok.accessToken, config.tiktok.openId, start, end)
        : [],
    ]);

    const ytSummary = generateYouTubeSummary(ytVideos);
    const fbSummary = generateFacebookSummary(fbVideos);
    const ttSummary = generateTikTokSummary(ttVideos);

    const totalViews = ytSummary.totalViews + fbSummary.totalViews + ttSummary.totalViews;
    const totalEngagement = (ytSummary.totalLikes + ytSummary.totalComments + ytSummary.totalShares) +
      (fbSummary.totalLikes + fbSummary.totalComments + fbSummary.totalShares) +
      (ttSummary.totalLikes + ttSummary.totalComments + ttSummary.totalShares);

    // Get previous report for comparison
    const prevReport = getLatestReport();
    const viewsGrowth = prevReport ? calculateGrowth(totalViews, prevReport.total_views) : 0;
    const engGrowth = prevReport ? calculateGrowth(totalEngagement, prevReport.total_engagement) : 0;

    const report = {
      weekId, weekStart: start, weekEnd: end,
      generatedAt: new Date().toISOString(),
      totalViews, totalEngagement,
      platformBreakdown: {
        youtube: { views: ytSummary.totalViews, engagement: ytSummary.totalLikes + ytSummary.totalComments + ytSummary.totalShares, videoCount: ytVideos.length },
        facebook: { views: fbSummary.totalViews, engagement: fbSummary.totalLikes + fbSummary.totalComments + fbSummary.totalShares, videoCount: fbVideos.length },
        tiktok: { views: ttSummary.totalViews, engagement: ttSummary.totalLikes + ttSummary.totalComments + ttSummary.totalShares, videoCount: ttVideos.length },
      },
      data: {
        youtube: { videos: ytVideos, summary: ytSummary },
        facebook: { videos: fbVideos, summary: fbSummary },
        tiktok: { videos: ttVideos, summary: ttSummary },
      },
      weekOverWeekChange: { views: viewsGrowth, engagement: engGrowth },
    };

    saveWeeklyReport(report);

    const allVideos = [
      ...ytVideos.map(v => ({ ...v, platform: 'youtube', weekId })),
      ...fbVideos.map(v => ({ ...v, platform: 'facebook', weekId })),
      ...ttVideos.map(v => ({ ...v, platform: 'tiktok', weekId })),
    ];
    if (allVideos.length > 0) saveVideoMetrics(allVideos);

    savePlatformSummary({ weekId, platform: 'youtube', ...ytSummary });
    savePlatformSummary({ weekId, platform: 'facebook', ...fbSummary });
    savePlatformSummary({ weekId, platform: 'tiktok', ...ttSummary });

    console.log(`✅ Report ${weekId} generated: ${totalViews} views, ${totalEngagement} engagement`);
    return report;
  } catch (err) {
    console.error('❌ Report generation failed:', err.message);
    throw err;
  }
}

export function seedMockHistory() {
  console.log('🌱 Seeding mock historical data...');
  const reports = generateMockHistory(8);
  for (const report of reports) {
    try {
      saveWeeklyReport(report);
      const allVideos = [
        ...report.data.youtube.videos.map(v => ({ ...v, platform: 'youtube', weekId: report.weekId })),
        ...report.data.facebook.videos.map(v => ({ ...v, platform: 'facebook', weekId: report.weekId })),
        ...report.data.tiktok.videos.map(v => ({ ...v, platform: 'tiktok', weekId: report.weekId })),
      ];
      saveVideoMetrics(allVideos);
      for (const [platform, data] of Object.entries(report.data)) {
        savePlatformSummary({ weekId: report.weekId, platform, ...data.summary });
      }
    } catch (e) { /* ignore duplicates */ }
  }
  console.log(`✅ Seeded ${reports.length} weeks of mock data`);
}
