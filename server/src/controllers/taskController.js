const Task = require('../models/Task');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const { logActivity, createNotification } = require('../services/activityService');

// @desc  Get tasks (with filters)
// @route GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
  const { project, status, priority, assignee, search, page = 1, limit = 20, sort = '-createdAt', myTasks } = req.query;

  const query = {};

  if (project) {
    query.project = project;
  } else {
    // If no project specified, limit to projects the user is a member of
    const memberships = await ProjectMember.find({ user: req.user._id }).select('project');
    query.project = { $in: memberships.map((m) => m.project) };
  }

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignee) query.assignee = assignee;
  if (myTasks === 'true') query.assignee = req.user._id;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('assignee', 'name email avatar avatarUrl')
      .populate('createdBy', 'name email avatar avatarUrl')
      .populate('project', 'name color')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Task.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      tasks,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    },
  });
};

// @desc  Create task
// @route POST /api/tasks
// @access Private
const createTask = async (req, res) => {
  const { title, description, project, assignee, status, priority, dueDate, tags } = req.body;

  if (!title) return res.status(400).json({ success: false, message: 'Task title is required.' });
  if (!project) return res.status(400).json({ success: false, message: 'Project is required.' });

  // Verify project membership
  const membership = await ProjectMember.findOne({ project, user: req.user._id });
  const projectDoc = await Project.findById(project);
  if (!projectDoc) return res.status(404).json({ success: false, message: 'Project not found.' });
  if (!membership && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
  }

  const task = await Task.create({
    title, description, project, assignee: assignee || null, createdBy: req.user._id,
    status: status || 'todo', priority: priority || 'medium', dueDate: dueDate || null, tags: tags || [],
  });

  await task.populate(['assignee', 'createdBy', 'project'].map((path) => {
    const selects = { assignee: 'name email avatar avatarUrl', createdBy: 'name email avatar avatarUrl', project: 'name color' };
    return { path, select: selects[path] };
  }));

  await logActivity({ actor: req.user._id, project, task: task._id, action: 'task_created', metadata: { taskTitle: task.title } });

  if (assignee && assignee !== req.user._id.toString()) {
    await createNotification({
      recipient: assignee, type: 'task_assigned',
      message: `${req.user.name} assigned you a task: "${task.title}"`,
      relatedProject: project, relatedTask: task._id, actor: req.user._id,
    });
  }

  res.status(201).json({ success: true, message: 'Task created successfully.', data: { task } });
};

// @desc  Get task by ID
// @route GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignee', 'name email avatar avatarUrl')
    .populate('createdBy', 'name email avatar avatarUrl')
    .populate('project', 'name color status');

  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

  const membership = await ProjectMember.findOne({ project: task.project._id, user: req.user._id });
  if (!membership && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  res.json({ success: true, data: { task } });
};

// @desc  Update task
// @route PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

  const membership = await ProjectMember.findOne({ project: task.project, user: req.user._id });
  if (!membership && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const prevStatus = task.status;
  const prevAssignee = task.assignee;
  const { title, description, assignee, status, priority, dueDate, tags } = req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (assignee !== undefined) task.assignee = assignee || null;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  if (tags !== undefined) task.tags = tags;

  await task.save();

  // Log status change
  if (status && status !== prevStatus) {
    await logActivity({
      actor: req.user._id, project: task.project, task: task._id,
      action: status === 'done' ? 'task_completed' : 'task_status_changed',
      metadata: { taskTitle: task.title, from: prevStatus, to: status },
    });
  } else {
    await logActivity({ actor: req.user._id, project: task.project, task: task._id, action: 'task_updated', metadata: { taskTitle: task.title } });
  }

  // Notify new assignee
  if (assignee && assignee !== prevAssignee?.toString() && assignee !== req.user._id.toString()) {
    await createNotification({
      recipient: assignee, type: 'task_assigned',
      message: `${req.user.name} assigned you task: "${task.title}"`,
      relatedProject: task.project, relatedTask: task._id, actor: req.user._id,
    });
  }

  await task.populate([
    { path: 'assignee', select: 'name email avatar avatarUrl' },
    { path: 'createdBy', select: 'name email avatar avatarUrl' },
    { path: 'project', select: 'name color' },
  ]);

  res.json({ success: true, message: 'Task updated successfully.', data: { task } });
};

// @desc  Delete task
// @route DELETE /api/tasks/:id
// @access Private
const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

  const membership = await ProjectMember.findOne({ project: task.project, user: req.user._id });
  if (!membership && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  if (membership?.role === 'member' && task.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'You can only delete tasks you created.' });
  }

  await logActivity({ actor: req.user._id, project: task.project, action: 'task_deleted', metadata: { taskTitle: task.title } });
  await Task.findByIdAndDelete(task._id);

  res.json({ success: true, message: 'Task deleted successfully.' });
};

module.exports = { getTasks, createTask, getTaskById, updateTask, deleteTask };
