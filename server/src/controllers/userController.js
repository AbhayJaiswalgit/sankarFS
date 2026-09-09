const User = require('../models/User');

// @desc  Get all users (team members, searchable)
// @route GET /api/users
// @access Private
const getUsers = async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const query = { isActive: true };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ name: 1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      users: users.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        createdAt: u.createdAt,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
};

// @desc  Get user by ID
// @route GET /api/users/:id
// @access Private
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

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
      },
    },
  });
};

// @desc  Update current user profile
// @route PUT /api/users/profile
// @access Private
const updateProfile = async (req, res) => {
  const { name, bio, avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        updatedAt: user.updatedAt,
      },
    },
  });
};

// @desc  Change password
// @route PUT /api/users/change-password
// @access Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please provide current and new password.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully.' });
};

module.exports = { getUsers, getUserById, updateProfile, changePassword };
