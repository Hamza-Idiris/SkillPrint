const { google } = require('googleapis');

/**
 * Returns an authenticated YouTube Data API v3 client for the channel that
 * hosts course videos. Unlike Mongo/Supabase (required for the app to run
 * at all), this is only checked when someone actually tries to upload a
 * video — so a site without YouTube configured yet still boots and runs
 * fine, it just can't accept video-file uploads until set up.
 */
const getYoutubeClient = () => {
  const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN } = process.env;

  if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REFRESH_TOKEN) {
    const err = new Error(
      'Video upload is not configured. An admin needs to set YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, ' +
        'and YOUTUBE_REFRESH_TOKEN in .env — see backend/README.md "Uploading videos from a computer" for setup steps.'
    );
    err.statusCode = 503;
    throw err;
  }

  const oauth2Client = new google.auth.OAuth2(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: YOUTUBE_REFRESH_TOKEN });

  return google.youtube({ version: 'v3', auth: oauth2Client });
};

module.exports = { getYoutubeClient };
