const Trip = require('../models/Trip');
const City = require('../models/City');
const Activity = require('../models/Activity');

// @desc    Get all trips for authenticated user
// @route   GET /api/trips
// @access  Protected
const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ startDate: 1 });
    res.status(200).json({ success: true, count: trips.length, trips });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Protected
const createTrip = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, budget } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Name, start date, and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    if (start > end) {
      return res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
    }

    if (budget !== undefined && budget < 0) {
      return res.status(400).json({ success: false, message: 'Budget must be a non-negative value' });
    }

    const trip = await Trip.create({
      userId: req.user._id,
      name: name.trim(),
      description: description?.trim() || '',
      startDate: start,
      endDate: end,
      budget: budget ?? 0,
    });

    res.status(201).json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip by ID (with cities and activities)
// @route   GET /api/trips/:id
// @access  Protected
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Ownership check
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this trip' });
    }

    const cities = await City.find({ tripId: trip._id }).sort({ arrivalDate: 1 });
    const activities = await Activity.find({ tripId: trip._id }).sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, trip, cities, activities });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Protected
const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this trip' });
    }

    const { name, description, startDate, endDate, budget } = req.body;

    const start = startDate ? new Date(startDate) : trip.startDate;
    const end = endDate ? new Date(endDate) : trip.endDate;

    if (start > end) {
      return res.status(400).json({ success: false, message: 'Start date cannot be after end date' });
    }

    if (budget !== undefined && budget < 0) {
      return res.status(400).json({ success: false, message: 'Budget must be a non-negative value' });
    }

    const updated = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.trim() || trip.name,
        description: description !== undefined ? description.trim() : trip.description,
        startDate: start,
        endDate: end,
        budget: budget !== undefined ? budget : trip.budget,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, trip: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a trip (and all its cities and activities)
// @route   DELETE /api/trips/:id
// @access  Protected
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this trip' });
    }

    // Cascade delete activities and cities
    await Activity.deleteMany({ tripId: trip._id });
    await City.deleteMany({ tripId: trip._id });
    await Trip.findByIdAndDelete(trip._id);

    res.status(200).json({ success: true, message: 'Trip and all related data deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTrips, createTrip, getTripById, updateTrip, deleteTrip };
