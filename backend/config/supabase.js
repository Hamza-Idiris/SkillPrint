const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (url && /^https?:\/\//i.test(url) && serviceKey) {
  try {
    supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  } catch (e) {
    console.warn('Supabase Storage: failed to initialize client —', e.message);
  }
} else {
  console.warn('Supabase Storage is not configured (or missing keys in .env). Falling back to local disk storage.');
}

const BUCKET = process.env.SUPABASE_BUCKET || 'skillsprint';

// Creates the storage bucket on first boot if it doesn't already exist, so
// there's no manual dashboard step beyond creating the Supabase project itself.
const ensureBucket = async () => {
  if (!supabase) return;
  try {
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
    if (listErr) throw listErr;

    const exists = buckets?.some((b) => b.name === BUCKET);
    if (!exists) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
        public: true, // images need to be publicly viewable (avatars, covers, banners)
        fileSizeLimit: '8MB',
      });
      if (createErr) throw createErr;
      console.log(`Supabase Storage: created public bucket "${BUCKET}"`);
    }
  } catch (err) {
    console.warn(`Supabase Storage: could not verify/create bucket "${BUCKET}" — ${err.message}`);
    console.warn('If this persists, create a public bucket manually in the Supabase dashboard.');
  }
};

module.exports = { supabase, BUCKET, ensureBucket };
