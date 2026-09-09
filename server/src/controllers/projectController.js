const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Task = require('../models/Task');
const { logActivity, createNotification } = require('../services/activityService');

// @desc  Get all projects (for current user)
// @route GET /api/projects
// @access Private
const getProjects = async (req, res) => {
  const { status, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

  // Get projects the user is a member of
  const memberships = await ProjectMember.find({ user: req.user._id }).select('project');
  const projectIds = memberships.map((m) => m.project);

  const query = { _id: { $in: projectIds }, isArchived: false };
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate('owner', 'name email avatar avatarUrl')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Project.countDocuments(query),
  ]);

  // Enrich with member count + task stats
  const enriched = await Promise.all(
    projects.map(async (p) => {
      const [memberCount, taskStats] = await Promise.all([
        ProjectMember.countDocuments({ project: p._id }),
        Task.aggregate([
          { $match: { project: p._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
      ]);

      const members = await ProjectMember.find({ project: p._id })
        .populate('user', 'name email avatar avatarUrl')
        .limit(5);

      const stats = { todo: 0, in_progress: 0, review: 0, done: 0, total: 0 };
      taskStats.forEach((s) => {
        stats[s._id] = s.count;
        stats.total += s.count;
      });
      const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

      return {
        ...p.toObject(),
        memberCount,
        members: members.map((m) => ({ ...m.user.toObject(), memberRole: m.role })),
        taskStats: stats,
        progress,
      };
    })
  );

  res.json({
    success: true,
    data: {
      projects: enriched,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    },
  });
};

// @desc  Create a project
// @route POST /api/projects
// @access Private
const createProject = async (req, res) => {
  const { name, description, status, startDate, dueDate, color, priority } = req.body;

  if (!name) return res.status(400).json({ success: false, message: 'Project name is required.' });

  const project = await Project.create({
    name,
    description,
    status: status || 'planning',
    startDate,
    dueDate,
    color: color || '#6366f1',
    priority: priority || 'medium',
    owner: req.user._id,
  });

  // Add owner as member
  await ProjectMember.create({ project: project._id, user: req.user._id, role: 'owner' });

  await logActivity({ actor: req.user._id, project: project._id, action: 'project_created', metadata: { projectName: project.name } });

  const populated = await Project.findById(project._id).populate('owner', 'name email avatar avatarUrl');

  res.status(201).json({
    success: true,
    message: 'Project created successfully.',
    data: { project: { ...populated.toObject(), memberCount: 1, members: [], taskStats: { total: 0, todo: 0, in_progress: 0, review: 0, done: 0 }, progress: 0 } },
  });
};

// @desc  Get project by ID
// @route GET /api/projects/:id
// @access Private
const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id).populate('owner', 'name email avatar avatarUrl');
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

  // Check membership
  const membership = await ProjectMember.findOne({ project: project._id, user: req.user._id });
  if (!membership && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not a member of this project.' });
  }

  const [members, taskStats] = await Promise.all([
    ProjectMember.find({ project: project._id }).populate('user', 'name email avatar avatarUrl'),
    Task.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const stats = { todo: 0, in_progress: 0, review: 0, done: 0, total: 0 };
  taskStats.forEach((s) => { stats[s._id] = s.count; stats.total += s.count; });
  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  res.json({
    success: true,
    data: {
      project: {
        ...project.toObject(),
        members: members.map((m) => ({ ...m.user.toObject(), memberRole: m.role, membershipId: m._id })),
        memberCount: members.length,
        taskStats: stats,
        progress,
        userRole: membership?.role || 'viewer',
      },
    },
  });
};

// @desc  Update a project
// @route PUT /api/projects/:id
// @access Private
const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

  const membership = await ProjectMember.findOne({ project: project._id, user: req.user._id });
  if (!membership || (membership.role === 'member' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'You do not have permission to update this project.' });
  }

  const { name, description, status, startDate, dueDate, color, priority } = req.body;

  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (status !== undefined) project.status = status;
  if (startDate !== undefined) project.startDate = startDate;
  if (dueDate !== undefined) project.dueDate = dueDate;
  if (color !== undefined) project.color = color;
  if (priority !== undefined) project.priority = priority;

  await project.save();
  await logActivity({ actor: req.user._id, project: project._id, action: 'project_updated', metadata: { projectName: project.name } });

  const populated = await Project.findById(project._id).populate('owner', 'name email avatar avatarUrl');
  res.json({ success: true, message: 'Project updated successfully.', data: { project: populated } });
};

// @desc  Delete a project
// @route DELETE /api/projects/:id
// @access Private
const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

  const membership = await ProjectMember.findOne({ project: project._id, user: req.user._id });
  if (!membership || (membership.role !== 'owner' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Only the project owner can delete a project.' });
  }

  await Promise.all([
    Project.findByIdAndDelete(project._id),
    ProjectMember.deleteMany({ project: project._id }),
    Task.deleteMany({ project: project._id }),
  ]);

  res.json({ success: true, message: 'Project deleted successfully.' });
};

// @desc  Get project members
// @route GET /api/projects/:id/members
// @access Private
const getProjectMembers = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

  const members = await ProjectMember.find({ project: project._id }).populate('user', 'name email avatar avatarUrl bio role');

  res.json({
    success: true,
    data: {
      members: members.map((m) => ({ ...m.user.toObject(), memberRole: m.role, membershipId: m._id, joinedAt: m.createdAt })),
    },
  });
};

// @desc  Add member to project
// @route POST /api/projects/:id/members
// @access Private
const addProjectMember = async (req, res) => {
  const { userId, role = 'member' } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'User ID is required.' });

  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

  const requesterMembership = await ProjectMember.findOne({ project: project._id, user: req.user._id });
  if (!requesterMembership || requesterMembership.role === 'member') {
    return res.status(403).json({ success: false, message: 'Only owners or managers can add members.' });
  }

  const existing = await ProjectMember.findOne({ project: project._id, user: userId });
  if (existing) return res.status(409).json({ success: false, message: 'User is already a member of this project.' });

  const newMember = await ProjectMember.create({ project: project._id, user: userId, role });
  await newMember.populate('user', 'name email avatar avatarUrl');

  await Promise.all([
    logActivity({ actor: req.user._id, project: project._id, action: 'member_added', metadata: { userId, projectName: project.name } }),
    createNotification({ recipient: userId, type: 'project_invitation', message: `You were added to project "${project.name}"`, relatedProject: project._id, actor: req.user._id }),
  ]);

  res.status(201).json({
    success: true,
    message: 'Member added successfully.',
    data: { member: { ...newMember.user.toObject(), memberRole: newMember.role, membershipId: newMember._id } },
  });
};

// @desc  Remove member from project
// @route DELETE /api/projects/:id/members/:userId
// @access Private
const removeProjectMember = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

  const requesterMembership = await ProjectMember.findOne({ project: project._id, user: req.user._id });
  if (!requesterMembership || requesterMembership.role === 'member') {
    return res.status(403).json({ success: false, message: 'Only owners or managers can remove members.' });
  }

  const targetMembership = await ProjectMember.findOne({ project: project._id, user: req.params.userId });
  if (!targetMembership) return res.status(404).json({ success: false, message: 'Member not found.' });

  if (targetMembership.role === 'owner') {
    return res.status(403).json({ success: false, message: 'Cannot remove the project owner.' });
  }

  await ProjectMember.findByIdAndDelete(targetMembership._id);
  await logActivity({ actor: req.user._id, project: project._id, action: 'member_removed', metadata: { userId: req.params.userId } });

  res.json({ success: true, message: 'Member removed successfully.' });
};

module.exports = { getProjects, createProject, getProjectById, updateProject, deleteProject, getProjectMembers, addProjectMember, removeProjectMember };
