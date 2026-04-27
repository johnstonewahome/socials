/**
 * Facebook Graph API Integration
 * Tracks: All Live Videos + Videos with "Theme Vision" in title
 */
import axios from 'axios';

const GRAPH_API_BASE = 'https://graph.facebook.com/v20.0';

export async function fetchFacebookData(accessToken, pageId, weekStart, weekEnd) {
  if (!accessToken || !pageId) throw new Error('Facebook access token and Page ID required');

  const start = new Date(weekStart); start.setHours(0,0,0,0);
  const end = new Date(weekEnd); end.setHours(23,59,59,999);
  const startUnix = Math.floor(start.getTime() / 1000);
  const endUnix = Math.floor(end.getTime() / 1000);

  // Fetch all videos from the page
  const allVideos = await fetchPageVideos(accessToken, pageId);

  // Filter by date range
  const weekVideos = allVideos.filter(v => {
    const pub = new Date(v.created_time).getTime();
    return pub >= start.getTime() && pub <= end.getTime();
  });

  // Separate live and theme vision videos
  const results = [];
  const seen = new Set();

  for (const video of weekVideos) {
    const isLive = video.live_status === 'LIVE' || video.live_status === 'VOD' || video.is_live_streaming === true;
    const isThemeVision = (video.title || video.description || '').toLowerCase().includes('theme vision');

    if (isLive || isThemeVision) {
      if (!seen.has(video.id)) {
        seen.add(video.id);
        const insights = await getVideoInsights(accessToken, video.id);
        results.push({
          videoId: video.id,
          title: video.title || video.description?.substring(0, 80) || 'Untitled Video',
          videoType: isThemeVision ? 'theme_vision' : 'live',
          views: insights.totalViews || 0,
          likes: insights.likes || 0,
          comments: insights.comments || 0,
          shares: insights.shares || 0,
          watchTimeMinutes: insights.watchTimeMinutes || 0,
          thumbnailUrl: video.picture || video.thumbnails?.data?.[0]?.uri || '',
          publishedAt: video.created_time,
          reach: insights.reach || 0,
        });
      }
    }
  }

  return results;
}

async function fetchPageVideos(accessToken, pageId) {
  const videos = [];
  let url = `${GRAPH_API_BASE}/${pageId}/videos?fields=id,title,description,created_time,live_status,picture,length,thumbnails&limit=100&access_token=${accessToken}`;

  while (url) {
    const res = await axios.get(url);
    videos.push(...(res.data.data || []));
    url = res.data.paging?.next || null;
  }
  return videos;
}

async function getVideoInsights(accessToken, videoId) {
  try {
    const res = await axios.get(
      `${GRAPH_API_BASE}/${videoId}/video_insights?metric=total_video_views,total_video_views_unique&access_token=${accessToken}`
    );
    const data = res.data.data || [];
    const totalViews = data.find(m => m.name === 'total_video_views')?.values?.[0]?.value || 0;
    const uniqueViews = data.find(m => m.name === 'total_video_views_unique')?.values?.[0]?.value || 0;

    // Also get engagement from the post
    const postRes = await axios.get(
      `${GRAPH_API_BASE}/${videoId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`
    );
    return {
      totalViews,
      uniqueViews,
      likes: postRes.data.likes?.summary?.total_count || 0,
      comments: postRes.data.comments?.summary?.total_count || 0,
      shares: postRes.data.shares?.count || 0,
      watchTimeMinutes: 0,
      reach: uniqueViews,
    };
  } catch (err) {
    console.error(`Failed to get insights for video ${videoId}:`, err.message);
    return { totalViews: 0, uniqueViews: 0, likes: 0, comments: 0, shares: 0, watchTimeMinutes: 0, reach: 0 };
  }
}

export function generateFacebookSummary(videos) {
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0);
  const totalComments = videos.reduce((s, v) => s + (v.comments || 0), 0);
  const totalShares = videos.reduce((s, v) => s + (v.shares || 0), 0);
  const topVideo = [...videos].sort((a, b) => (b.views||0) - (a.views||0))[0];
  return {
    totalViews, totalLikes, totalComments, totalShares,
    totalVideos: videos.length,
    liveVideos: videos.filter(v => v.videoType === 'live').length,
    themeVisionVideos: videos.filter(v => v.videoType === 'theme_vision').length,
    avgEngagementRate: totalViews > 0 ? parseFloat(((totalLikes+totalComments+totalShares)/totalViews*100).toFixed(2)) : 0,
    topVideo: topVideo ? { id: topVideo.videoId, title: topVideo.title, views: topVideo.views } : null,
  };
}
