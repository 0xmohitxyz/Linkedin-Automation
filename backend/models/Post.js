import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'posted', 'failed'],
    default: 'draft',
  },
  scheduledTime: {
    type: Date,
    required: false,
  },
  mode: {
    type: String,
    enum: ['simulated', 'puppeteer'],
    default: 'simulated',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

export const Post = mongoose.model('Post', postSchema);
