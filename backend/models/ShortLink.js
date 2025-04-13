import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const shortLinkSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    validate: {
      validator: (url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      message: props => `${props.value} is not a valid URL`
    }
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(6)
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiry
  }
}, { timestamps: true });

// Better error handling
shortLinkSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Short code already exists'));
  } else if (error.name === 'ValidationError') {
    next(new Error(Object.values(error.errors).map(err => err.message)));
  } else {
    next(error);
  }
});

export default mongoose.model('ShortLink', shortLinkSchema);