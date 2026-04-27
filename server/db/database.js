import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'reports.db');

let db;

export function initDatabase() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS weekly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_id TEXT UNIQUE NOT NULL,
      week_start TEXT NOT NULL,
      week_end TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      report_data TEXT NOT NULL,
      total_views INTEGER DEFAULT 0,
      total_engagement INTEGER DEFAULT 0,
      platform_breakdown TEXT
    );

    CREATE TABLE IF NOT EXISTS video_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      video_id TEXT NOT NULL,
      title TEXT,
      video_type TEXT,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      watch_time_minutes REAL DEFAULT 0,
      thumbnail_url TEXT,
      published_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(week_id, platform, video_id)
    );

    CREATE TABLE IF NOT EXISTS platform_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      total_views INTEGER DEFAULT 0,
      total_likes INTEGER DEFAULT 0,
      total_comments INTEGER DEFAULT 0,
      total_shares INTEGER DEFAULT 0,
      total_videos INTEGER DEFAULT 0,
      avg_engagement_rate REAL DEFAULT 0,
      top_video_id TEXT,
      top_video_title TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(week_id, platform)
    );

    CREATE INDEX IF NOT EXISTS idx_video_metrics_week ON video_metrics(week_id);
    CREATE INDEX IF NOT EXISTS idx_video_metrics_platform ON video_metrics(platform);
    CREATE INDEX IF NOT EXISTS idx_platform_summaries_week ON platform_summaries(week_id);
  `);

  console.log('✅ Database initialized');
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

export function saveWeeklyReport(report) {
  const stmt = getDb().prepare(`
    INSERT OR REPLACE INTO weekly_reports (week_id, week_start, week_end, generated_at, report_data, total_views, total_engagement, platform_breakdown)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    report.weekId, report.weekStart, report.weekEnd, report.generatedAt,
    JSON.stringify(report.data), report.totalViews, report.totalEngagement,
    JSON.stringify(report.platformBreakdown)
  );
}

export function getReports(limit = 12) {
  return getDb().prepare(`
    SELECT * FROM weekly_reports ORDER BY week_start DESC LIMIT ?
  `).all(limit).map(row => ({
    ...row,
    report_data: JSON.parse(row.report_data),
    platform_breakdown: row.platform_breakdown ? JSON.parse(row.platform_breakdown) : null
  }));
}

export function getLatestReport() {
  const row = getDb().prepare(`
    SELECT * FROM weekly_reports ORDER BY week_start DESC LIMIT 1
  `).get();
  if (!row) return null;
  return {
    ...row,
    report_data: JSON.parse(row.report_data),
    platform_breakdown: row.platform_breakdown ? JSON.parse(row.platform_breakdown) : null
  };
}

export function getReportByWeekId(weekId) {
  const row = getDb().prepare(`
    SELECT * FROM weekly_reports WHERE week_id = ?
  `).get(weekId);
  if (!row) return null;
  return {
    ...row,
    report_data: JSON.parse(row.report_data),
    platform_breakdown: row.platform_breakdown ? JSON.parse(row.platform_breakdown) : null
  };
}

export function saveVideoMetrics(metrics) {
  const stmt = getDb().prepare(`
    INSERT OR REPLACE INTO video_metrics (week_id, platform, video_id, title, video_type, views, likes, comments, shares, watch_time_minutes, thumbnail_url, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMany = getDb().transaction((items) => {
    for (const m of items) {
      stmt.run(m.weekId, m.platform, m.videoId, m.title, m.videoType, m.views, m.likes, m.comments, m.shares, m.watchTimeMinutes, m.thumbnailUrl, m.publishedAt);
    }
  });
  insertMany(metrics);
}

export function getVideoMetricsByWeek(weekId, platform = null) {
  if (platform) {
    return getDb().prepare(`
      SELECT * FROM video_metrics WHERE week_id = ? AND platform = ? ORDER BY views DESC
    `).all(weekId, platform);
  }
  return getDb().prepare(`
    SELECT * FROM video_metrics WHERE week_id = ? ORDER BY views DESC
  `).all(weekId);
}

export function savePlatformSummary(summary) {
  const stmt = getDb().prepare(`
    INSERT OR REPLACE INTO platform_summaries (week_id, platform, total_views, total_likes, total_comments, total_shares, total_videos, avg_engagement_rate, top_video_id, top_video_title)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    summary.weekId, summary.platform, summary.totalViews, summary.totalLikes,
    summary.totalComments, summary.totalShares, summary.totalVideos,
    summary.avgEngagementRate, summary.topVideoId, summary.topVideoTitle
  );
}

export function getPlatformSummariesByWeek(weekId) {
  return getDb().prepare(`
    SELECT * FROM platform_summaries WHERE week_id = ? ORDER BY platform
  `).all(weekId);
}
