const fs = require('fs');
const { getYoutubeClient } = require('../config/youtube');

/**
 * Uploads a video file (already saved to a temp path on disk by multer) to
 * the configured YouTube channel as an UNLISTED video, and returns a normal
 * watch URL — the same format an admin would get by uploading manually and
 * pasting the link, so nothing downstream (lesson storage, the gated
 * stream-token flow) needs to know the difference.
 *
 * googleapis handles the resumable upload protocol internally for large
 * files when given a stream, so this works the same for a 10MB clip or a
 * 500MB lecture recording.
 */
const uploadVideo = async ({ filePath, title, description }) => {
  const youtube = getYoutubeClient();

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: title?.slice(0, 100) || 'SkillSprint lesson',
        description: description?.slice(0, 5000) || 'Uploaded via SkillSprint admin dashboard.',
      },
      status: {
        privacyStatus: 'unlisted',
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(filePath),
    },
  });

  const videoId = response.data.id;
  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
};

/**
 * Optional cleanup — deletes a video from YouTube by its ID. Not currently
 * wired into course/lesson deletion (kept as a manual/future option so a
 * course delete can't accidentally take down a video still linked elsewhere).
 */
const deleteVideo = async (videoId) => {
  const youtube = getYoutubeClient();
  await youtube.videos.delete({ id: videoId });
};

module.exports = { uploadVideo, deleteVideo };
