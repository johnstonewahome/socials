/**
 * YouTube Data API v3 Integration
 * Tracks:
 *   - "Live" videos identified by title keywords: Sunday, Wednesday, Early Bird,
 *     Worship, Family Discipleship, She Conference
 *   - Videos with "Theme Vision" in title
 */
import { google } from 'googleapis';
const youtube = google.youtube('v3');

// Keywords that identify a "live" video by title
const LIVE_KEYWORDS = [
  'sunday',
  'wednesday',
  'early bird',
  'worship',
  'family discipleship',
  'she conference',
];

export async function fetchYouTubeData(apiKey, channelId, weekStart, weekEnd) {
  if (!apiKey || !channelId) throw new Error('YouTube API key and Channel ID required');
  const start = new Date(weekStart); start.setHours(0, 0, 0, 0);
  const end = new Date(weekEnd); end.setHours(23, 59, 59, 999);

  // Fetch ALL channel videos for the week, then filter by title keywords
  const allChannelVideos = await fetchChannelVideos(apiKey, channelId, start, end);

  const seen = new Set();
  const results = [];

  for (const video of allChannelVideos) {
    if (seen.has(video.videoId)) continue;
    const titleLower = (video.title || '').toLowerCase();

    // Check if it matches a "live" keyword
    const isLive = LIVE_KEYWORDS.some(kw => titleLower.includes(kw));
    // Check if it's a Theme Vision video
    const isThemeVision = titleLower.includes('theme vision');

    if (isLive || isThemeVision) {
      seen.add(video.videoId);
      video.videoType = isThemeVision ? 'theme_vision' : 'live';
      results.push(video);
    }
  }

  // Fetch detailed stats for matched videos
  if (results.length > 0) {
    const stats = await getVideoStats(apiKey, results.map(v => v.videoId));
    for (const video of results) {
      const s = stats.find(x => x.id === video.videoId);
      if (s) {
        video.views = parseInt(s.statistics?.viewCount || '0');
        video.likes = parseInt(s.statistics?.likeCount || '0');
        video.comments = parseInt(s.statistics?.commentCount || '0');
        video.duration = s.contentDetails?.duration || '';
        video.thumbnailUrl = s.snippet?.thumbnails?.medium?.url || '';
        if (s.liveStreamingDetails) {
          video.peakConcurrentViewers = parseInt(s.liveStreamingDetails.concurrentViewers || '0');
        }
      }
    }
  }

  console.log(`🎬 YouTube: Found ${results.length} matching videos (${results.filter(v => v.videoType === 'live').length} live, ${results.filter(v => v.videoType === 'theme_vision').length} theme vision)`);
  return results;
}

/**
 * Fetch all videos from the channel published within the date range.
 * Uses search.list without eventType filter to get ALL public videos.
 */
async function fetchChannelVideos(apiKey, channelId, start, end) {
  const videos = [];
  let pageToken = null;

  do {
    const res = await youtube.search.list({
      key: apiKey,
      part: 'snippet',
      channelId,
      type: 'video',
      publishedAfter: start.toISOString(),
      publishedBefore: end.toISOString(),
      maxResults: 50,
      pageToken,
      order: 'date',
    });

    for (const item of (res.data.items || [])) {
      videos.push({
        videoId: item.id.videoId,
        title: item.snippet.title,
        videoType: 'unknown', // will be classified later
        publishedAt: item.snippet.publishedAt,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        watchTimeMinutes: 0,
      });
    }

    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return videos;
}

async function getVideoStats(apiKey, videoIds) {
  const results = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const res = await youtube.videos.list({
      key: apiKey,
      part: 'statistics,contentDetails,snippet,liveStreamingDetails',
      id: batch.join(','),
    });
    results.push(...(res.data.items || []));
  }
  return results;
}

export function generateYouTubeSummary(videos) {
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0);
  const totalComments = videos.reduce((s, v) => s + (v.comments || 0), 0);
  const totalShares = videos.reduce((s, v) => s + (v.shares || 0), 0);
  const topVideo = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
  return {
    totalViews, totalLikes, totalComments, totalShares,
    totalVideos: videos.length,
    liveVideos: videos.filter(v => v.videoType === 'live').length,
    themeVisionVideos: videos.filter(v => v.videoType === 'theme_vision').length,
    avgEngagementRate: totalViews > 0 ? parseFloat(((totalLikes + totalComments + totalShares) / totalViews * 100).toFixed(2)) : 0,
    topVideo: topVideo ? { id: topVideo.videoId, title: topVideo.title, views: topVideo.views } : null,
  };
}
