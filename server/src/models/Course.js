import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    credits: { type: Number, default: 3, min: 0, max: 12 },
    semester: { type: String, trim: true, default: '' },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
