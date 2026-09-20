const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: String, required: true, index: true }, // lesson subdoc _id stored as string
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 2000, trim: true },
    // For replies: parentId points to the top-level comment; replies are flat (one level deep)
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    isAdminReply: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.index({ courseId: 1, lessonId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
