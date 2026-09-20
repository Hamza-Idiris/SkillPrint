const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { supabase, BUCKET } = require('../config/supabase');

const extFromMime = (mimetype) => {
  const map = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
  };
  return map[mimetype] || 'jpg';
};

const getBaseUrl = () => {
  return process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
};

/**
 * Save file buffer locally to backend/uploads/{folder}
 */
const uploadLocal = (buffer, mimetype, folder) => {
  const filename = `${uuidv4()}.${extFromMime(mimetype)}`;
  const uploadDir = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);

  const baseUrl = getBaseUrl();
  const publicUrl = `${baseUrl}/uploads/${folder}/${filename}`;
  const storagePath = `local::${folder}/${filename}`;
  return { url: publicUrl, path: storagePath };
};

/**
 * Delete a local file saved via local storage fallback
 */
const deleteLocal = (storagePath) => {
  const relativePath = storagePath.replace(/^local::/, '');
  const filePath = path.join(__dirname, '..', 'uploads', relativePath);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn(`Local Storage: failed to delete "${filePath}" — ${err.message}`);
    }
  }
};

/**
 * Upload an in-memory file buffer (from multer.memoryStorage()) to Supabase
 * Storage, or fall back to local disk storage if Supabase is unreachable/fails.
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @param {string} folder - e.g. 'avatars', 'course-covers', 'site-banners'
 */
const uploadImage = async (buffer, mimetype, folder) => {
  if (supabase) {
    try {
      const storagePath = `${folder}/${uuidv4()}.${extFromMime(mimetype)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
        contentType: mimetype,
        upsert: false,
      });

      if (!error) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
        return { url: data.publicUrl, path: storagePath };
      }

      console.warn(`Supabase Storage upload error: ${error.message}. Falling back to local disk storage.`);
    } catch (err) {
      console.warn(`Supabase Storage network/fetch error: ${err.message}. Falling back to local disk storage.`);
    }
  }

  return uploadLocal(buffer, mimetype, folder);
};

/**
 * Delete a previously uploaded image by its storage path. Safe to call with
 * an empty/undefined path (no-op) so callers don't need to guard every call.
 */
const deleteImage = async (storagePath) => {
  if (!storagePath) return;

  if (storagePath.startsWith('local::')) {
    deleteLocal(storagePath);
    return;
  }

  if (supabase) {
    try {
      const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
      if (error) {
        console.warn(`Supabase Storage: failed to delete "${storagePath}" — ${error.message}`);
      }
    } catch (err) {
      console.warn(`Supabase Storage: error during delete operation — ${err.message}`);
    }
  }
};

module.exports = { uploadImage, deleteImage };
