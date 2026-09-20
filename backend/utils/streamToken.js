const jwt = require('jsonwebtoken');

const ttl = () => Number(process.env.STREAM_TOKEN_TTL_SECONDS || 60);

// Short-lived, single-purpose token: proves this specific user was authorized,
// at issue time, to view this specific lesson. It carries no video URL —
// the actual URL is looked up server-side when the token is redeemed.
const signStreamToken = (userId, courseId, lessonId) =>
  jwt.sign({ uid: userId, courseId, lessonId, purpose: 'stream' }, process.env.STREAM_TOKEN_SECRET, {
    expiresIn: ttl(),
  });

const verifyStreamToken = (token) => {
  const payload = jwt.verify(token, process.env.STREAM_TOKEN_SECRET);
  if (payload.purpose !== 'stream') throw new Error('Invalid token purpose');
  return payload;
};

module.exports = { signStreamToken, verifyStreamToken, ttl };
