const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    // Raw YouTube unlisted URL/ID. NEVER returned directly by course read routes —
    // only resolved server-side by the protected /api/stream flow (see videoController.js).
    videoUrl: { type: String, required: true, select: false },
    duration: { type: String, default: '10:00 mins' },
    order: { type: Number, default: 0 },
    isPreviewFree: { type: Boolean, default: false },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },

    // Admin-set base price ("course salary")
    price: { type: Number, required: true, min: 0 },

    // Per-course discount. If discountActive, this overrides any global discount.
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    discountActive: { type: Boolean, default: false },

    coverImage: {
      url: { type: String, required: true },
      public_id: { type: String, default: '' },
    },

    lessons: [lessonSchema],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Effective price after applying course-level or global discount.
// globalDiscount is passed in from the caller (fetched once from Settings) to avoid
// an extra DB round-trip per course in list views.
courseSchema.methods.getEffectivePrice = function getEffectivePrice(globalDiscount) {
  let pct = 0;
  if (this.discountActive) {
    pct = this.discountPercent;
  } else if (globalDiscount && globalDiscount.active) {
    pct = globalDiscount.percent;
  }
  const price = this.price * (1 - pct / 100);
  return Math.round(price * 100) / 100;
};

module.exports = mongoose.model('Course', courseSchema);
