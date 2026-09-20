/**
 * ONE-TIME SETUP SCRIPT — run this on your own computer (not on your server)
 * to authorize SkillSprint to upload videos to your YouTube channel.
 *
 * Usage:
 *   YOUTUBE_CLIENT_ID=xxx YOUTUBE_CLIENT_SECRET=yyy node utils/youtubeAuth.js
 * (or set them in backend/.env first, then just: node utils/youtubeAuth.js)
 *
 * What it does:
 *   1. Starts a tiny local web server on http://localhost:4321
 *   2. Prints a Google consent URL — open it in your browser and log in
 *      with the Google account that owns the YouTube channel you want
 *      course videos uploaded to
 *   3. After you approve, Google redirects back to the local server with
 *      an authorization code, which this script exchanges for a refresh
 *      token and prints to the terminal
 *   4. Copy that refresh token into backend/.env as YOUTUBE_REFRESH_TOKEN
 *
 * See backend/README.md → "Uploading videos from a computer" for the
 * Google Cloud Console steps to get YOUTUBE_CLIENT_ID/SECRET first.
 */
require('dotenv').config();
const http = require('http');
const { google } = require('googleapis');

const PORT = 4321;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET } = process.env;

if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET) {
  console.error('Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET (in backend/.env or as env vars) before running this.');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // required to get a refresh_token back
  prompt: 'consent', // forces a refresh_token even on repeat runs
  scope: ['https://www.googleapis.com/auth/youtube.upload'],
});

console.log('\n1. Open this URL in your browser, and log in with the Google account for your YouTube channel:\n');
console.log(authUrl);
console.log('\n2. Approve access. This script will catch the redirect automatically.\n');
console.log(`Waiting on http://localhost:${PORT} ...\n`);

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/oauth2callback')) {
    res.writeHead(404);
    return res.end();
  }

  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end('<h2>No authorization code received. Close this tab and try again.</h2>');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h2>Success — you can close this tab and return to your terminal.</h2>');

    console.log('✅ Authorization successful!\n');
    console.log('Add this line to backend/.env:\n');
    console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}\n`);

    if (!tokens.refresh_token) {
      console.log(
        '⚠️  No refresh token was returned. This usually means you\'ve authorized this app before.\n' +
          'Go to https://myaccount.google.com/permissions, remove access for this app, then run this script again.'
      );
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<h2>Something went wrong exchanging the code — check your terminal.</h2>');
    console.error('Token exchange failed:', err.message);
  } finally {
    server.close(() => process.exit(0));
  }
});

server.listen(PORT);
