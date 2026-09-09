const Task = require('../models/Task');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Activity = require('../models/Activity');

// @desc  Dashboard analytics
// @route GET /api/analytics/dashboard
// @access Private
const getDashboardAnalytics = async (req, res) => {
  const userId = req.user._id;

  // Projects user is a member of
  const memberships = await ProjectMember.find({ user: userId }).select('project');
  const projectIds = memberships.map((m) => m.project);

  const [
    totalProjects,
    activeProjects,
    myTasksCount,
    completedTasksCount,
    taskStatusDist,
    taskPriorityDist,
    recentActivity,
    tasksOverTime,
    projectProgress,
  ] = await Promise.all([
    Project.countDocuments({ _id: { $in: projectIds }, isArchived: false }),
    Project.countDocuments({ _id: { $in: projectIds }, status: 'active', isArchived: false }),
    Task.countDocuments({ project: { $in: projectIds }, assignee: userId, status: { $ne: 'done' } }),
    Task.countDocuments({ project: { $in: projectIds }, assignee: userId, status: 'done' }),

    // Task status distribution across user's projects
    Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Task priority distribution
    Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),

    // Recent activity (last 20 across user's projects)
    Activity.find({ project: { $in: projectIds } })
      .populate('actor', 'name avatar avatarUrl')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(20),

    // Tasks completed per day over last 7 days
    Task.aggregate([
      {
        $match: {
          project: { $in: projectIds },
          status: 'done',
          completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Project progress for active projects
    Project.find({ _id: { $in: projectIds }, status: { $in: ['active', 'planning'] }, isArchived: false })
      .populate('owner', 'name avatar avatarUrl')
      .sort({ dueDate: 1 })
      .limit(5),
  ]);

  // Enrich project progress with task stats
  const enrichedProjects = await Promise.all(
    projectProgress.map(async (p) => {
      const taskStats = await Task.aggregate([
        { $match: { project: p._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      const stats = { todo: 0, in_progress: 0, review: 0, done: 0, total: 0 };
      taskStats.forEach((s) => { stats[s._id] = s.count; stats.total += s.count; });
      return {
        _id: p._id,
        name: p.name,
        status: p.status,
        dueDate: p.dueDate,
        color: p.color,
        owner: p.owner,
        progress: stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0,
        taskStats: stats,
      };
    })
  );

  // Build last 7 days labels
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }
  const tasksCompletedMap = {};
  tasksOverTime.forEach((t) => { tasksCompletedMap[t._id] = t.count; });
  const productivityData = last7Days.map((day) => ({
    date: day,
    completed: tasksCompletedMap[day] || 0,
  }));

  // Normalize status distribution
  const statusMap = { todo: 0, in_progress: 0, review: 0, done: 0 };
  taskStatusDist.forEach((s) => { statusMap[s._id] = s.count; });

  const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
  taskPriorityDist.forEach((s) => { priorityMap[s._id] = s.count; });

  res.json({
    success: true,
    data: {
      summary: { totalProjects, activeProjects, myTasksCount, completedTasksCount },
      statusDistribution: statusMap,
      priorityDistribution: priorityMap,
      recentActivity,
      productivityData,
      projectProgress: enrichedProjects,
    },
  });
};

// @desc  Project-level analytics
// @route GET /api/analytics/projects/:id
// @access Private
const getProjectAnalytics = async (req, res) => {
  const { id } = req.params;

  const [statusDist, priorityDist, completionOverTime, memberTaskCounts] = await Promise.all([
    Task.aggregate([
      { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(id) } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      {
        $match: {
          project: require('mongoose').Types.ObjectId.createFromHexString(id),
          status: 'done',
          completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Task.aggregate([
      { $match: { project: require('mongoose').Types.ObjectId.createFromHexString(id), assignee: { $ne: null } } },
      { $group: { _id: '$assignee', total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', avatar: '$user.avatar', total: 1, done: 1 } },
    ]),
  ]);

  const statusMap = { todo: 0, in_progress: 0, review: 0, done: 0 };
  statusDist.forEach((s) => { statusMap[s._id] = s.count; });

  const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
  priorityDist.forEach((s) => { priorityMap[s._id] = s.count; });

  res.json({
    success: true,
    data: { statusDistribution: statusMap, priorityDistribution: priorityMap, completionOverTime, memberTaskCounts },
  });
};

module.exports = { getDashboardAnalytics, getProjectAnalytics };
