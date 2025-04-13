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
  referrer: String,
  ipAddress: String,
  country: String,
  city: String,
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
    default: 'unknown'
  },
  browser: String,
  os: String
}, { timestamps: true });

// Indexes for faster queries
clickSchema.index({ shortLink: 1 });
clickSchema.index({ clickedAt: -1 });

export default mongoose.model('Click', clickSchema);