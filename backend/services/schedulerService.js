import cron from 'node-cron';
import { Post } from '../models/Post.js';
import { simulatedPost } from '../adapters/simulatedAdapter.js';
import { puppeteerPost } from '../adapters/puppeteerAdapter.js';
import { apiAdapter } from '../adapters/apiAdapter.js';

export function startCronJobs() {
  console.log('[Scheduler] Starting cron job (runs every minute)...');
  
  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('[Scheduler] Checking for scheduled posts...');
    try {
      const now = new Date();
      // Find posts that are scheduled, and their time has passed or is now
      const postsToPublish = await Post.find({
        status: 'scheduled',
        scheduledTime: { $lte: now }
      });

      if (postsToPublish.length > 0) {
        console.log(`[Scheduler] Found ${postsToPublish.length} posts to publish.`);
      }

      for (const post of postsToPublish) {
        try {
          console.log(`[Scheduler] Processing post ID: ${post._id}`);
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
            console.log(`[Scheduler] Successfully posted ID: ${post._id}`);
          }
        } catch (postError) {
          console.error(`[Scheduler] Failed to post ID: ${post._id}`, postError);
          post.status = 'failed';
          await post.save();
        }
      }
    } catch (err) {
      console.error('[Scheduler] Error checking posts', err);
    }
  });
}
