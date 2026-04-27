import { Router } from 'express';
import { getVideoMetricsByWeek } from '../db/database.js';
import { getWeekDateRange } from '../services/reportGenerator.js';

const router = Router();

router.get('/videos', (req, res) => {
  const { weekId } = req.query;
  const wk = weekId || getWeekDateRange().weekId;
  const videos = getVideoMetricsByWeek(wk, 'tiktok');
  res.json({ weekId: wk, videos });
});

export default router;
