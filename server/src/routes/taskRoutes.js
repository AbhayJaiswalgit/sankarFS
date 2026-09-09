const express = require('express');
const { getTasks, createTask, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');
const { getComments, addComment } = require('../controllers/commentController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);
router.route('/:taskId/comments').get(getComments).post(addComment);

module.exports = router;
