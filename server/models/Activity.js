const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip reference is required'],
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'City reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
      maxlength: [150, 'Activity name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Activity date is required'],
    },
    time: {
      type: String,
      trim: true,
      default: '',
      match: [/^([01]?\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
      default: '',
    },
    cost: {
      type: Number,
      min: [0, 'Cost must be a non-negative value'],
      default: 0,
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

module.exports = mongoose.model('Activity', activitySchema);
