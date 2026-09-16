const City = require('../models/City');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');

// Helper: verify trip ownership
const verifyTripOwnership = async (tripId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return { error: 'Trip not found', status: 404, trip: null };
  if (trip.userId.toString() !== userId.toString())
    return { error: 'Not authorized to access this trip', status: 403, trip: null };
  return { error: null, status: 200, trip };
};

// @desc    Get all cities for a trip
// @route   GET /api/cities?tripId=
// @access  Protected
const getCities = async (req, res, next) => {
  try {
    const { tripId } = req.query;
    if (!tripId) {
      return res.status(400).json({ success: false, message: 'tripId query parameter is required' });
    }

    const { error, status } = await verifyTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const cities = await City.find({ tripId }).sort({ arrivalDate: 1 });
    res.status(200).json({ success: true, count: cities.length, cities });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a destination/city to a trip
// @route   POST /api/cities/stops
// @access  Protected
const addCity = async (req, res, next) => {
  try {
    const { tripId, cityName, arrivalDate, departureDate, notes } = req.body;

    if (!tripId || !cityName || !arrivalDate || !departureDate) {
      return res.status(400).json({ success: false, message: 'tripId, cityName, arrivalDate, and departureDate are required' });
    }

    const { error, status, trip } = await verifyTripOwnership(tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);

    if (arrival > departure) {
      return res.status(400).json({ success: false, message: 'Arrival date cannot be after departure date' });
    }

    // Validate within trip range
    if (arrival < trip.startDate || departure > trip.endDate) {
      return res.status(400).json({
        success: false,
        message: `Destination dates must fall within the trip period (${trip.startDate.toDateString()} – ${trip.endDate.toDateString()})`,
      });
    }

    const city = await City.create({
      tripId,
      cityName: cityName.trim(),
      arrivalDate: arrival,
      departureDate: departure,
      notes: notes?.trim() || '',
    });

    res.status(201).json({ success: true, city });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a destination/city
// @route   PUT /api/cities/stops/:id
// @access  Protected
const updateCity = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'Destination not found' });

    const { error, status, trip } = await verifyTripOwnership(city.tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    const { cityName, arrivalDate, departureDate, notes } = req.body;

    const arrival = arrivalDate ? new Date(arrivalDate) : city.arrivalDate;
    const departure = departureDate ? new Date(departureDate) : city.departureDate;

    if (arrival > departure) {
      return res.status(400).json({ success: false, message: 'Arrival date cannot be after departure date' });
    }

    if (arrival < trip.startDate || departure > trip.endDate) {
      return res.status(400).json({
        success: false,
        message: `Destination dates must fall within the trip period (${trip.startDate.toDateString()} – ${trip.endDate.toDateString()})`,
      });
    }

    const updated = await City.findByIdAndUpdate(
      req.params.id,
      {
        cityName: cityName?.trim() || city.cityName,
        arrivalDate: arrival,
        departureDate: departure,
        notes: notes !== undefined ? notes.trim() : city.notes,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, city: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a destination (and its activities)
// @route   DELETE /api/cities/stops/:id
// @access  Protected
const deleteCity = async (req, res, next) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ success: false, message: 'Destination not found' });

    const { error, status } = await verifyTripOwnership(city.tripId, req.user._id);
    if (error) return res.status(status).json({ success: false, message: error });

    // Cascade delete activities for this city
    await Activity.deleteMany({ cityId: city._id });
    await City.findByIdAndDelete(city._id);

    res.status(200).json({ success: true, message: 'Destination and its activities deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCities, addCity, updateCity, deleteCity };
