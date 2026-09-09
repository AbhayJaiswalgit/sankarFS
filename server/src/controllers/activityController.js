const Activity = require('../models/Activity');
const ProjectMember = require('../models/ProjectMember');

// @desc  Get activities (optionally for a project)
// @route GET /api/activities
// @access Private
const getActivities = async (req, res) => {
  const { project, page = 1, limit = 20 } = req.query;

  let query = {};
  if (project) {
    query.project = project;
  } else {
    const memberships = await ProjectMember.find({ user: req.user._id }).select('project');
    query.project = { $in: memberships.map((m) => m.project) };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [activities, total] = await Promise.all([
    Activity.find(query)
      .populate('actor', 'name email avatar avatarUrl')
      .populate('project', 'name color')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Activity.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      activities,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    },
  });
};

module.exports = { getActivities };
