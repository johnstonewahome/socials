/**
 * TikTok Business API Integration
 * Tracks: All viewership for past week
 */
import axios from 'axios';

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';

export async function fetchTikTokData(accessToken, openId, weekStart, weekEnd) {
  if (!accessToken || !openId) throw new Error('TikTok access token and Open ID required');

  const start = new Date(weekStart); start.setHours(0,0,0,0);
  const end = new Date(weekEnd); end.setHours(23,59,59,999);

  // Fetch user's videos
  const allVideos = await fetchUserVideos(accessToken);

  // Filter by date range
  const weekVideos = allVideos.filter(v => {
    const created = new Date(v.create_time * 1000);
    return created >= start && created <= end;
  });

  return weekVideos.map(v => ({
    videoId: v.id,
    title: v.title || v.video_description || 'TikTok Video',
    videoType: 'short',
    views: v.view_count || 0,
    likes: v.like_count || 0,
    comments: v.comment_count || 0,
    shares: v.share_count || 0,
    watchTimeMinutes: 0,
    thumbnailUrl: v.cover_image_url || '',
    publishedAt: new Date(v.create_time * 1000).toISOString(),
    avgWatchTime: v.average_watch_time || 0,
    completionRate: v.video_completion_rate || 0,
  }));
}

async function fetchUserVideos(accessToken) {
  const videos = [];
  let cursor = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await axios.post(`${TIKTOK_API_BASE}/video/list/`, {
        max_count: 20, cursor,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = res.data.data;
      videos.push(...(data.videos || []));
      hasMore = data.has_more || false;
      cursor = data.cursor || 0;
    } catch (err) {
      console.error('TikTok API error:', err.message);
      hasMore = false;
    }
  }
  return videos;
}

export function generateTikTokSummary(videos) {
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0);
  const totalComments = videos.reduce((s, v) => s + (v.comments || 0), 0);
  const totalShares = videos.reduce((s, v) => s + (v.shares || 0), 0);
  const topVideo = [...videos].sort((a, b) => (b.views||0) - (a.views||0))[0];
  return {
    totalViews, totalLikes, totalComments, totalShares,
    totalVideos: videos.length,
    avgEngagementRate: totalViews > 0 ? parseFloat(((totalLikes+totalComments+totalShares)/totalViews*100).toFixed(2)) : 0,
    topVideo: topVideo ? { id: topVideo.videoId, title: topVideo.title, views: topVideo.views } : null,
  };
}
