const mongoose = require('mongoose');
const { Schema } = mongoose;

const ScheduleSchema = new Schema({
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  weekStart: {
    type: Date,
    required: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  // Department-wide schedule (for managers)
  schedule: {
    monday: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '17:00' },
      breaks: [{ start: String, end: String, name: String }]
    },
    tuesday: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '17:00' },
      breaks: [{ start: String, end: String, name: String }]
    },
    wednesday: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '17:00' },
      breaks: [{ start: String, end: String, name: String }]
    },
    thursday: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '17:00' },
      breaks: [{ start: String, end: String, name: String }]
    },
    friday: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '17:00' },
      breaks: [{ start: String, end: String, name: String }]
    },
    saturday: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '17:00' },
      breaks: [{ start: String, end: String, name: String }]
    },
    sunday: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '17:00' },
      breaks: [{ start: String, end: String, name: String }]
    }
  },
  // Individual employee shifts (for detailed scheduling)
  shifts: [{
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    monday: {
      startTime: String,
      endTime: String,
      isWorking: { type: Boolean, default: true }
    },
    tuesday: {
      startTime: String,
      endTime: String,
      isWorking: { type: Boolean, default: true }
    },
    wednesday: {
      startTime: String,
      endTime: String,
      isWorking: { type: Boolean, default: true }
    },
    thursday: {
      startTime: String,
      endTime: String,
      isWorking: { type: Boolean, default: true }
    },
    friday: {
      startTime: String,
      endTime: String,
      isWorking: { type: Boolean, default: true }
    },
    saturday: {
      startTime: String,
      endTime: String,
      isWorking: { type: Boolean, default: false }
    },
    sunday: {
      startTime: String,
      endTime: String,
      isWorking: { type: Boolean, default: false }
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
ScheduleSchema.index({ department: 1, weekStart: 1 });
ScheduleSchema.index({ weekStart: 1, weekEnd: 1 });

// Virtual for week range
ScheduleSchema.virtual('weekRange').get(function() {
  return `${this.weekStart.toISOString().split('T')[0]} to ${this.weekEnd.toISOString().split('T')[0]}`;
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
