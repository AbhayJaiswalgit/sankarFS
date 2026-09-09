const Comment = require('../models/Comment');
const Task = require('../models/Task');
const ProjectMember = require('../models/ProjectMember');
const { logActivity, createNotification } = require('../services/activityService');

// @desc  Get task comments
// @route GET /api/tasks/:taskId/comments
// @access Private
const getComments = async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

  const comments = await Comment.find({ task: taskId })
    .populate('user', 'name email avatar avatarUrl')
    .sort({ createdAt: 1 });

  res.json({ success: true, data: { comments } });
};

// @desc  Add comment to task
// @route POST /api/tasks/:taskId/comments
// @access Private
const addComment = async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) return res.status(400).json({ success: false, message: 'Comment content is required.' });

  const task = await Task.findById(taskId).populate('assignee', '_id');
  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

  const membership = await ProjectMember.findOne({ project: task.project, user: req.user._id });
  if (!membership && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
  }

  const comment = await Comment.create({ task: taskId, user: req.user._id, content: content.trim() });
  await comment.populate('user', 'name email avatar avatarUrl');

  await logActivity({ actor: req.user._id, project: task.project, task: task._id, action: 'comment_added', metadata: { taskTitle: task.title } });

  // Notify task assignee
  if (task.assignee && task.assignee._id.toString() !== req.user._id.toString()) {
    await createNotification({
      recipient: task.assignee._id, type: 'task_commented',
      message: `${req.user.name} commented on task: "${task.title}"`,
      relatedProject: task.project, relatedTask: task._id, actor: req.user._id,
    });
  }

  res.status(201).json({ success: true, message: 'Comment added.', data: { comment } });
};

// @desc  Update comment
// @route PUT /api/comments/:id
// @access Private
const updateComment = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content is required.' });

  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

  if (comment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'You can only edit your own comments.' });
  }

  comment.content = content.trim();
  comment.isEdited = true;
  await comment.save();
  await comment.populate('user', 'name email avatar avatarUrl');

  res.json({ success: true, message: 'Comment updated.', data: { comment } });
};

// @desc  Delete comment
// @route DELETE /api/comments/:id
// @access Private
const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You can only delete your own comments.' });
  }

  await logActivity({ actor: req.user._id, task: comment.task, action: 'comment_deleted', metadata: {} });
  await Comment.findByIdAndDelete(comment._id);

  res.json({ success: true, message: 'Comment deleted.' });
};

module.exports = { getComments, addComment, updateComment, deleteComment };
