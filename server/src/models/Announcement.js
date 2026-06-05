import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
      index: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    audience: {
      type: String,
      enum: ['all', 'students', 'faculty', 'course'],
      default: 'all',
    },
  },
  { timestamps: true },
);

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
