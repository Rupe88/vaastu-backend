import { config } from '../config/env.js';

/**
 * Zoom API Service
 * Supports both Zoom SDK integration and manual meeting URL entry
 */

// Zoom API base URL
const ZOOM_API_BASE = 'https://api.zoom.us/v2';

/**
 * Get Zoom OAuth token (Server-to-Server OAuth)
 */
const getZoomAccessToken = async () => {
  const accountId = config.zoom?.accountId;
  const clientId = config.zoom?.clientId;
  const clientSecret = config.zoom?.clientSecret;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom credentials not configured');
  }

  try {
    // Use Zoom Server-to-Server OAuth
    const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Zoom OAuth failed: ${error.error_description || error.error}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Zoom OAuth error:', error);
    throw new Error('Failed to authenticate with Zoom API');
  }
};

/**
 * Check if Zoom is configured
 */
export const isZoomConfigured = () => {
  return !!(
    config.zoom?.accountId &&
    config.zoom?.clientId &&
    config.zoom?.clientSecret
  );
};

/**
 * Create Zoom meeting
 */
export const createMeeting = async (liveClassData) => {
  if (!isZoomConfigured()) {
    throw new Error('Zoom is not configured. Please configure Zoom credentials in environment variables.');
  }

  try {
    const accessToken = await getZoomAccessToken();

    const meetingData = {
      topic: liveClassData.title || 'Live Class',
      type: 2, // Scheduled meeting
      start_time: liveClassData.scheduledAt
        ? new Date(liveClassData.scheduledAt).toISOString().replace(/\.\d{3}Z$/, 'Z')
        : undefined,
      duration: liveClassData.duration || 60,
      timezone: 'Asia/Kathmandu', // Adjust as needed
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: false,
        waiting_room: false,
        auto_recording: 'none', // Can be 'local', 'cloud', or 'none'
        meeting_authentication: false,
      },
    };

    // Optional: Use host email if available
    const hostEmail = liveClassData.hostEmail || config.zoom?.hostEmail;

    const response = await fetch(`${ZOOM_API_BASE}/users/${hostEmail || 'me'}/meetings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Zoom API error: ${error.message || JSON.stringify(error)}`);
    }

    const meeting = await response.json();

    return {
      zoomMeetingId: meeting.id.toString(),
      zoomJoinUrl: meeting.join_url,
      zoomStartUrl: meeting.start_url,
      meetingPassword: meeting.password || null,
      meetingUrl: meeting.join_url, // For backward compatibility
      meetingId: meeting.id.toString(), // For backward compatibility
    };
  } catch (error) {
    console.error('Zoom create meeting error:', error);
    throw error;
  }
};

/**
 * Update Zoom meeting
 */
export const updateMeeting = async (zoomMeetingId, liveClassData) => {
  if (!isZoomConfigured()) {
    throw new Error('Zoom is not configured');
  }

  try {
    const accessToken = await getZoomAccessToken();

    const meetingData = {
      topic: liveClassData.title || undefined,
      start_time: liveClassData.scheduledAt
        ? new Date(liveClassData.scheduledAt).toISOString().replace(/\.\d{3}Z$/, 'Z')
        : undefined,
      duration: liveClassData.duration || undefined,
      settings: {
        host_video: true,
        participant_video: true,
      },
    };

    // Remove undefined fields
    Object.keys(meetingData).forEach((key) => {
      if (meetingData[key] === undefined) {
        delete meetingData[key];
      }
    });

    const hostEmail = liveClassData.hostEmail || config.zoom?.hostEmail;

    const response = await fetch(
      `${ZOOM_API_BASE}/meetings/${zoomMeetingId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Zoom API error: ${error.message || JSON.stringify(error)}`);
    }

    // Get updated meeting info
    return getMeetingInfo(zoomMeetingId);
  } catch (error) {
    console.error('Zoom update meeting error:', error);
    throw error;
  }
};

/**
 * Delete Zoom meeting
 */
export const deleteMeeting = async (zoomMeetingId) => {
  if (!isZoomConfigured()) {
    throw new Error('Zoom is not configured');
  }

  try {
    const accessToken = await getZoomAccessToken();

    const response = await fetch(`${ZOOM_API_BASE}/meetings/${zoomMeetingId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(`Zoom API error: ${error.message || JSON.stringify(error)}`);
    }

    return true;
  } catch (error) {
    console.error('Zoom delete meeting error:', error);
    throw error;
  }
};

/**
 * Get Zoom meeting info
 */
export const getMeetingInfo = async (zoomMeetingId) => {
  if (!isZoomConfigured()) {
    throw new Error('Zoom is not configured');
  }

  try {
    const accessToken = await getZoomAccessToken();

    const response = await fetch(`${ZOOM_API_BASE}/meetings/${zoomMeetingId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Zoom API error: ${error.message || JSON.stringify(error)}`);
    }

    const meeting = await response.json();

    return {
      zoomMeetingId: meeting.id.toString(),
      zoomJoinUrl: meeting.join_url,
      zoomStartUrl: meeting.start_url,
      meetingPassword: meeting.password || null,
      meetingUrl: meeting.join_url,
      meetingId: meeting.id.toString(),
      topic: meeting.topic,
      startTime: meeting.start_time,
      duration: meeting.duration,
    };
  } catch (error) {
    console.error('Zoom get meeting info error:', error);
    throw error;
  }
};

/**
 * Generate join URL (returns the join URL for a meeting)
 */
export const generateJoinUrl = async (zoomMeetingId) => {
  const meetingInfo = await getMeetingInfo(zoomMeetingId);
  return meetingInfo.zoomJoinUrl;
};

/**
 * Generate start URL (returns the start URL for host)
 */
export const generateStartUrl = async (zoomMeetingId) => {
  const meetingInfo = await getMeetingInfo(zoomMeetingId);
  return meetingInfo.zoomStartUrl;
};

/**
 * Validate meeting URL (checks if it's a valid Zoom or Google Meet URL)
 */
export const validateMeetingUrl = (url, provider) => {
  if (!url) {
    return false;
  }

  try {
    const urlObj = new URL(url);

    if (provider === 'ZOOM') {
      return urlObj.hostname.includes('zoom.us') || urlObj.hostname.includes('zoom.com');
    } else if (provider === 'GOOGLE_MEET') {
      return (
        urlObj.hostname.includes('meet.google.com') ||
        urlObj.hostname.includes('google.com')
      );
    } else {
      // Generic URL validation
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    }
  } catch {
    return false;
  }
};

/**
 * Parse meeting provider from URL
 */
export const parseMeetingProvider = (url) => {
  if (!url) {
    return null;
  }

  try {
    const urlObj = new URL(url);

    if (urlObj.hostname.includes('zoom.us') || urlObj.hostname.includes('zoom.com')) {
      return 'ZOOM';
    } else if (
      urlObj.hostname.includes('meet.google.com') ||
      urlObj.hostname.includes('google.com')
    ) {
      return 'GOOGLE_MEET';
    } else {
      return 'OTHER';
    }
  } catch {
    return 'OTHER';
  }
};

