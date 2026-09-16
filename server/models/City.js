const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip reference is required'],
    },
    cityName: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters'],
    },
    arrivalDate: {
      type: Date,
      required: [true, 'Arrival date is required'],
    },
    departureDate: {
      type: Date,
      required: [true, 'Departure date is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Validate arrival is not after departure
citySchema.pre('save', function () {
  if (this.arrivalDate > this.departureDate) {
    throw new Error('Arrival date cannot be after departure date');
  }
});

module.exports = mongoose.model('City', citySchema);
