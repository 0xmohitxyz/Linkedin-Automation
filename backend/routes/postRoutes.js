import express from 'express';
import axios from 'axios';
import { Post } from '../models/Post.js';
import { generateLinkedInPost } from '../services/aiService.js';
import { simulatedPost } from '../adapters/simulatedAdapter.js';
import { puppeteerPost } from '../adapters/puppeteerAdapter.js';
import { apiAdapter } from '../adapters/apiAdapter.js';

const router = express.Router();

// 1. Generate Post via AI
router.post('/generate-post', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const content = await generateLinkedInPost(topic);
    res.json({ content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate post' });
  }
});

// 2. Schedule or Save Post
router.post('/schedule-post', async (req, res) => {
  try {
    const { topic, content, scheduledTime, mode } = req.body;
    
    const post = new Post({
      topic,
      content,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      status: scheduledTime ? 'scheduled' : 'draft',
      mode: mode || 'simulated'
    });

    await post.save();

    if (scheduledTime) {
      try {
        await axios.post('http://localhost:5678/webhook-test/linkedin-schedule', {
          id: post._id,
          scheduledTime: post.scheduledTime
        });
        console.log('[N8N] Successfully sent scheduled post to n8n webhook');
      } catch (webhookErr) {
        console.log(webhookErr);
        console.log('[N8N] Could not reach n8n webhook. Is n8n running? (Falling back to cron)');
      }
    }

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to schedule post' });
  }
});

// 3. Get all Posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// 4. Trigger Post Manually (e.g., for n8n Webhook)
router.post('/trigger-post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.status === 'posted') return res.status(400).json({ error: 'Already posted' });

    let success = false;
    if (post.mode === 'puppeteer') {
      success = await puppeteerPost(post);
    } else if (post.mode === 'api') {
      success = await apiAdapter(post);
    } else {
      success = await simulatedPost(post);
    }

    if (success) {
      post.status = 'posted';
      await post.save();
      return res.json({ message: 'Posted successfully', post });
    } else {
      return res.status(500).json({ error: 'Failed to post' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error triggering post manually' });
  }
});

export default router;
