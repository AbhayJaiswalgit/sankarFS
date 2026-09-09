const express = require('express');
const {
  getProjects, createProject, getProjectById, updateProject, deleteProject,
  getProjectMembers, addProjectMember, removeProjectMember,
} = require('../controllers/projectController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProjectById).put(updateProject).delete(deleteProject);
router.route('/:id/members').get(getProjectMembers).post(addProjectMember);
router.delete('/:id/members/:userId', removeProjectMember);

module.exports = router;
