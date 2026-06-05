import config from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { signToken } from '../utils/token.js';

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function issueToken(res, user) {
  const token = signToken({ sub: user._id.toString(), role: user.role });
  res.cookie('token', token, cookieOptions);
  return token;
}

export async function register(req, res) {
  const { name, email, password, role, department, rollNumber } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    department,
    rollNumber: rollNumber || undefined,
  });

  const token = issueToken(res, user);
  res.status(201).json({ success: true, token, user });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated');
  }

  const token = issueToken(res, user);
  res.json({ success: true, token, user });
}

export async function me(req, res) {
  res.json({ success: true, user: req.user });
}

export async function logout(_req, res) {
  res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
  res.json({ success: true, message: 'Logged out' });
}
