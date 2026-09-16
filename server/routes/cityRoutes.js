const express = require('express');
const router = express.Router();
const { getCities, addCity, updateCity, deleteCity } = require('../controllers/cityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCities);
router.post('/stops', protect, addCity);
router.route('/stops/:id').put(protect, updateCity).delete(protect, deleteCity);

module.exports = router;
