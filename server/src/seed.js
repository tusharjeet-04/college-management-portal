/* Seeds the database with demo admin, faculty, students, courses and enrollments.
 * Usage: npm run seed   (drops and recreates demo data)
 */
import mongoose from 'mongoose';
import config from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import logger from './utils/logger.js';
import { ROLES } from './constants/roles.js';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';
import Announcement from './models/Announcement.js';

async function seed() {
  await connectDB();
  logger.info('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Enrollment.deleteMany({}),
    Announcement.deleteMany({}),
  ]);

  logger.info('Creating users...');
  const admin = await User.create({
    name: 'College Admin',
    email: config.seedAdminEmail,
    password: config.seedAdminPassword,
    role: ROLES.ADMIN,
    department: 'Administration',
  });

  const faculty = await User.create([
    {
      name: 'Dr. Alan Turing',
      email: 'alan.turing@college.edu',
      password: 'Faculty@123',
      role: ROLES.FACULTY,
      department: 'Computer Science',
      designation: 'Professor',
    },
    {
      name: 'Dr. Marie Curie',
      email: 'marie.curie@college.edu',
      password: 'Faculty@123',
      role: ROLES.FACULTY,
      department: 'Physics',
      designation: 'Associate Professor',
    },
  ]);

  const students = await User.create([
    {
      name: 'Asha Verma',
      email: 'asha.verma@college.edu',
      password: 'Student@123',
      role: ROLES.STUDENT,
      department: 'Computer Science',
      rollNumber: 'CS2025001',
    },
    {
      name: 'Rahul Nair',
      email: 'rahul.nair@college.edu',
      password: 'Student@123',
      role: ROLES.STUDENT,
      department: 'Computer Science',
      rollNumber: 'CS2025002',
    },
    {
      name: 'Sara Khan',
      email: 'sara.khan@college.edu',
      password: 'Student@123',
      role: ROLES.STUDENT,
      department: 'Physics',
      rollNumber: 'PH2025001',
    },
  ]);

  logger.info('Creating courses...');
  const courses = await Course.create([
    {
      code: 'CS101',
      title: 'Introduction to Programming',
      description: 'Fundamentals of programming using JavaScript.',
      department: 'Computer Science',
      credits: 4,
      semester: 'Fall 2025',
      faculty: faculty[0]._id,
    },
    {
      code: 'CS201',
      title: 'Data Structures',
      description: 'Core data structures and algorithms.',
      department: 'Computer Science',
      credits: 4,
      semester: 'Fall 2025',
      faculty: faculty[0]._id,
    },
    {
      code: 'PH101',
      title: 'Classical Mechanics',
      description: 'Newtonian mechanics and applications.',
      department: 'Physics',
      credits: 3,
      semester: 'Fall 2025',
      faculty: faculty[1]._id,
    },
  ]);

  logger.info('Enrolling students...');
  await Enrollment.create([
    { student: students[0]._id, course: courses[0]._id, grade: 'A', marks: 91 },
    { student: students[0]._id, course: courses[1]._id },
    { student: students[1]._id, course: courses[0]._id, grade: 'B', marks: 78 },
    { student: students[2]._id, course: courses[2]._id },
  ]);

  logger.info('Creating announcements...');
  await Announcement.create([
    {
      title: 'Welcome to Fall 2025',
      body: 'Classes begin next Monday. Please check your enrolled courses.',
      audience: 'all',
      author: admin._id,
    },
    {
      title: 'CS101 Lab Schedule',
      body: 'Lab sessions for CS101 will be held every Wednesday at 2 PM.',
      audience: 'course',
      course: courses[0]._id,
      author: faculty[0]._id,
    },
  ]);

  logger.info('Seed complete!');
  logger.info(`Admin login:   ${admin.email} / ${config.seedAdminPassword}`);
  logger.info('Faculty login: alan.turing@college.edu / Faculty@123');
  logger.info('Student login: asha.verma@college.edu / Student@123');

  await disconnectDB();
}

seed()
  .then(() => process.exit(0))
  .catch(async (err) => {
    logger.error(`Seed failed: ${err.message}`);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
