const express = require('express');
const { updateComment, deleteComment } = require('../controllers/commentController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticate);
router.route('/:id').put(updateComment).delete(deleteComment);

module.exports = router;
