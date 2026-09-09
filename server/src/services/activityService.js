const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

// Create an activity log entry
const logActivity = async ({ actor, project = null, task = null, action, metadata = {} }) => {
  try {
    await Activity.create({ actor, project, task, action, metadata });
  } catch (err) {
    // Non-critical — log but don't throw
    console.error('Activity log error:', err.message);
  }
};

// Create a notification
const createNotification = async ({ recipient, type, message, relatedProject = null, relatedTask = null, actor = null }) => {
  try {
    if (recipient.toString() === actor?.toString()) return; // Don't notify yourself
    await Notification.create({ recipient, type, message, relatedProject, relatedTask, actor });
  } catch (err) {
    console.error('Notification creation error:', err.message);
  }
};

module.exports = { logActivity, createNotification };
