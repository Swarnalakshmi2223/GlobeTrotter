const express = require('express');
const router = express.Router();
const { updateProfile, changePassword } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.put('/', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
