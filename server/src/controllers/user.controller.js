import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import ApiError from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export async function listUsers(req, res) {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
}

export async function getUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, user });
}

export async function createUser(req, res) {
  const { name, email, password, role, department, rollNumber, designation, phone } =
    req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({
    name,
    email,
    password,
    role,
    department,
    designation,
    phone,
    rollNumber: rollNumber || undefined,
  });
  res.status(201).json({ success: true, user });
}

export async function updateUser(req, res) {
  const allowed = ['name', 'department', 'designation', 'phone', 'isActive', 'rollNumber'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, user });
}

export async function deleteUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === ROLES.STUDENT) {
    await Enrollment.deleteMany({ student: user._id });
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
}
