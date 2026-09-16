const Activity = require('../models/Activity');
const City = require('../models/City');
const Trip = require('../models/Trip');

// Helper: verify trip ownership
const verifyTripOwnership = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return { error: 'Trip not found', status: 404, trip: null };
  if (trip.userId.toString() !== userId.toString())
    return { error: 'Not authorized to access this trip', status: 403, trip: null };
  return { error: null, status: 200, trip };
};

// @desc    Get activities (filtered by tripId and/or cityId)
// @route   GET /api/activities?tripId=&cityId=
// @access  Protected
const getActivities = async (req, res, next) => {
  try {
    const { tripId, cityId } = req.query;
    if (!tripId) {
      return res.status(400).json({ success: false, message: 'tripId query parameter is required' });
    }

    const { error, status } = await verifyTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const filter = { tripId };
    if (cityId) filter.cityId = cityId;

    const activities = await Activity.find(filter).sort({ date: 1, time: 1 });
    res.status(200).json({ success: true, count: activities.length, activities });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an activity
// @route   POST /api/activities
// @access  Protected
const createActivity = async (req, res, next) => {
  try {
    const { tripId, cityId, name, description, date, time, location, cost, notes } = req.body;

    if (!tripId || !cityId || !name || !date) {
      return res.status(400).json({ success: false, message: 'tripId, cityId, name, and date are required' });
    }

    const { error, status } = await verifyTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    // Verify city belongs to trip
    const city = await City.findOne({ _id: cityId, tripId });
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found in this trip' });
    }

    const activityDate = new Date(date);
    if (isNaN(activityDate)) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    // Validate activity date within city date range
    if (activityDate < city.arrivalDate || activityDate > city.departureDate) {
      return res.status(400).json({
        success: false,
        message: `Activity date must be within the destination's period (${city.arrivalDate.toDateString()} – ${city.departureDate.toDateString()})`,
      });
    }

    if (cost !== undefined && cost < 0) {
      return res.status(400).json({ success: false, message: 'Activity cost must be a non-negative value' });
    }

    const activity = await Activity.create({
      tripId,
      cityId,
      name: name.trim(),
      description: description?.trim() || '',
      date: activityDate,
      time: time?.trim() || '',
      location: location?.trim() || '',
      cost: cost ?? 0,
      notes: notes?.trim() || '',
    });

    res.status(201).json({ success: true, activity });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an activity
// @route   PUT /api/activities/:id
// @access  Protected
const updateActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });

    const { error, status } = await verifyTripOwnership(activity.tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const { name, description, date, time, location, cost, notes, cityId } = req.body;

    // If cityId is being updated, verify the new city belongs to the same trip
    let city;
    const targetCityId = cityId || activity.cityId;
    city = await City.findOne({ _id: targetCityId, tripId: activity.tripId });
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found in this trip' });
    }

    const activityDate = date ? new Date(date) : activity.date;

    if (activityDate < city.arrivalDate || activityDate > city.departureDate) {
      return res.status(400).json({
        success: false,
        message: `Activity date must be within the destination's period (${city.arrivalDate.toDateString()} – ${city.departureDate.toDateString()})`,
      });
    }

    if (cost !== undefined && cost < 0) {
      return res.status(400).json({ success: false, message: 'Activity cost must be a non-negative value' });
    }

    const updated = await Activity.findByIdAndUpdate(
      req.params.id,
      {
        cityId: targetCityId,
        name: name?.trim() || activity.name,
        description: description !== undefined ? description.trim() : activity.description,
        date: activityDate,
        time: time !== undefined ? time.trim() : activity.time,
        location: location !== undefined ? location.trim() : activity.location,
        cost: cost !== undefined ? cost : activity.cost,
        notes: notes !== undefined ? notes.trim() : activity.notes,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, activity: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Protected
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });

    const { error, status } = await verifyTripOwnership(activity.tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    await Activity.findByIdAndDelete(activity._id);
    res.status(200).json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget summary for a trip
// @route   GET /api/activities/budget/:tripId
// @access  Protected
const getBudgetInfo = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const { error, status, trip } = await verifyTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const result = await Activity.aggregate([
      { $match: { tripId: trip._id } },
      {
        $group: {
          _id: '$cityId',
          totalCost: { $sum: '$cost' },
          activityCount: { $sum: 1 },
        },
      },
    ]);

    const totalSpent = result.reduce((acc, r) => acc + r.totalCost, 0);
    const totalBudget = trip.budget;
    const remaining = totalBudget - totalSpent;

    // Per-city breakdown with city name
    const cityIds = result.map((r) => r._id);
    const cities = await City.find({ _id: { $in: cityIds } });
    const cityMap = {};
    cities.forEach((c) => { cityMap[c._id.toString()] = c.cityName; });

    const breakdown = result.map((r) => ({
      cityId: r._id,
      cityName: cityMap[r._id?.toString()] || 'Unknown',
      totalCost: r.totalCost,
      activityCount: r.activityCount,
    }));

    res.status(200).json({
      success: true,
      budget: {
        total: totalBudget,
        spent: totalSpent,
        remaining,
        isOverBudget: remaining < 0,
        percentUsed: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities, createActivity, updateActivity, deleteActivity, getBudgetInfo };
