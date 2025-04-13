// models/Click.js
import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
  shortLink: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShortLink',
    required: true
  },
  clickedAt: {
    type: Date,
    default: Date.now
  },
  userAgent: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: false
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
    default: 'unknown'
  }
}, { timestamps: true });

// Index for faster querying
clickSchema.index({ shortLink: 1, clickedAt: -1 });

export default mongoose.model('Click', clickSchema);