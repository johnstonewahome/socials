import { Router } from 'express';
import { getReports, getLatestReport, getReportByWeekId, getVideoMetricsByWeek } from '../db/database.js';
import { generateWeeklyReport, getWeekDateRange } from '../services/reportGenerator.js';

const router = Router();

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 12;
  const reports = getReports(limit);
  res.json({ reports });
});

router.get('/latest', (req, res) => {
  const report = getLatestReport();
  if (!report) return res.status(404).json({ error: 'No reports generated yet' });

  // Calculate week-over-week change from the previous report in the database
  const allReports = getReports(2);
  if (allReports.length >= 2) {
    const current = allReports[0]; // latest
    const previous = allReports[1]; // previous week
    const prevViews = previous.total_views || 0;
    const prevEng = previous.total_engagement || 0;
    const curViews = current.total_views || 0;
    const curEng = current.total_engagement || 0;

    report.weekOverWeekChange = {
      views: prevViews > 0 ? parseFloat(((curViews - prevViews) / prevViews * 100).toFixed(1)) : 0,
      engagement: prevEng > 0 ? parseFloat(((curEng - prevEng) / prevEng * 100).toFixed(1)) : 0,
    };
  } else {
    report.weekOverWeekChange = { views: 0, engagement: 0 };
  }

  res.json(report);
});

router.get('/monthly', (req, res) => {
  const allReports = getReports(52); // Up to a year
  const monthlyMap = {};

  for (const report of allReports) {
    const weekStart = report.week_start;
    if (!weekStart) continue;
    const monthKey = weekStart.substring(0, 7); // "2026-04"
    const d = new Date(weekStart + 'T00:00:00');
    const monthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = {
        monthKey,
        monthLabel,
        totalViews: 0,
        totalEngagement: 0,
        weeksCount: 0,
        youtube: { views: 0, engagement: 0 },
        facebook: { views: 0, engagement: 0 },
        tiktok: { views: 0, engagement: 0 },
      };
    }

    const m = monthlyMap[monthKey];
    m.totalViews += report.total_views || 0;
    m.totalEngagement += report.total_engagement || 0;
    m.weeksCount += 1;

    const pb = report.platform_breakdown;
    if (pb) {
      m.youtube.views += pb.youtube?.views || 0;
      m.youtube.engagement += pb.youtube?.engagement || 0;
      m.facebook.views += pb.facebook?.views || 0;
      m.facebook.engagement += pb.facebook?.engagement || 0;
      m.tiktok.views += pb.tiktok?.views || 0;
      m.tiktok.engagement += pb.tiktok?.engagement || 0;
    }
  }

  // Sort by month descending
  const months = Object.values(monthlyMap).sort((a, b) => b.monthKey.localeCompare(a.monthKey));

  // Calculate month-over-month change
  for (let i = 0; i < months.length; i++) {
    if (i < months.length - 1) {
      const prev = months[i + 1];
      months[i].viewsChange = prev.totalViews > 0
        ? parseFloat(((months[i].totalViews - prev.totalViews) / prev.totalViews * 100).toFixed(1))
        : 0;
      months[i].engagementChange = prev.totalEngagement > 0
        ? parseFloat(((months[i].totalEngagement - prev.totalEngagement) / prev.totalEngagement * 100).toFixed(1))
        : 0;
    } else {
      months[i].viewsChange = 0;
      months[i].engagementChange = 0;
    }
  }

  res.json({ months });
});

router.get('/current-week', (req, res) => {
  const { start, end, weekId } = getWeekDateRange();
  res.json({ weekId, weekStart: start, weekEnd: end });
});

router.get('/:weekId', (req, res) => {
  const report = getReportByWeekId(req.params.weekId);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  // Calculate week-over-week change for this specific report
  const allReports = getReports(52);
  const idx = allReports.findIndex(r => (r.week_id || r.weekId) === req.params.weekId);
  if (idx >= 0 && idx < allReports.length - 1) {
    const current = allReports[idx];
    const previous = allReports[idx + 1];
    const prevViews = previous.total_views || 0;
    const prevEng = previous.total_engagement || 0;
    const curViews = current.total_views || 0;
    const curEng = current.total_engagement || 0;

    report.weekOverWeekChange = {
      views: prevViews > 0 ? parseFloat(((curViews - prevViews) / prevViews * 100).toFixed(1)) : 0,
      engagement: prevEng > 0 ? parseFloat(((curEng - prevEng) / prevEng * 100).toFixed(1)) : 0,
    };
  } else {
    report.weekOverWeekChange = { views: 0, engagement: 0 };
  }

  const videos = getVideoMetricsByWeek(req.params.weekId);
  res.json({ ...report, videos });
});

router.post('/generate', async (req, res) => {
  try {
    const useMock = process.env.USE_MOCK_DATA === 'true';
    const config = {
      youtube: { apiKey: process.env.YOUTUBE_API_KEY, channelId: process.env.YOUTUBE_CHANNEL_ID },
      facebook: { accessToken: process.env.FACEBOOK_ACCESS_TOKEN, pageId: process.env.FACEBOOK_PAGE_ID },
      tiktok: { accessToken: process.env.TIKTOK_ACCESS_TOKEN, openId: process.env.TIKTOK_OPEN_ID },
    };
    const report = await generateWeeklyReport(config, useMock);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
