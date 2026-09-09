const express = require('express');
const { getUsers, getUserById, updateProfile, changePassword } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
