const Notification = require('../models/Notification');

// @desc  Get notifications for current user
// @route GET /api/notifications
// @access Private
const getNotifications = async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const query = { recipient: req.user._id };
  if (unreadOnly === 'true') query.read = false;

  const skip = (Number(page) - 1) * Number(limit);
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate('actor', 'name avatar avatarUrl')
      .populate('relatedProject', 'name')
      .populate('relatedTask', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: req.user._id, read: false }),
  ]);

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    },
  });
};

// @desc  Mark notification as read
// @route PATCH /api/notifications/:id/read
// @access Private
const markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });

  res.json({ success: true, message: 'Marked as read.', data: { notification } });
};

// @desc  Mark all notifications as read
// @route PATCH /api/notifications/read-all
// @access Private
const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: 'All notifications marked as read.' });
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
