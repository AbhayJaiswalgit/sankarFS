const User = require('../models/User');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/tokenUtils');

// @desc  Register a new user
// @route POST /api/auth/register
// @access Public
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email and password.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email is already registered.' });
  }

  const user = await User.create({ name, email, password });

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      token,
    },
  });
};

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
  }

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.json({
    success: true,
    message: 'Logged in successfully.',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      token,
    },
  });
};

// @desc  Logout user
// @route POST /api/auth/logout
// @access Private
const logout = async (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
};

// @desc  Get current user
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
};

module.exports = { register, login, logout, getMe };
