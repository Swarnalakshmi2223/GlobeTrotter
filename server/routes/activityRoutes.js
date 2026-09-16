const express = require('express');
const router = express.Router();
const {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getBudgetInfo,
} = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

// IMPORTANT: /budget/:tripId must come before /:id to avoid route conflict
router.get('/budget/:tripId', protect, getBudgetInfo);

router.route('/').get(protect, getActivities).post(protect, createActivity);
router.route('/:id').put(protect, updateActivity).delete(protect, deleteActivity);

module.exports = router;
