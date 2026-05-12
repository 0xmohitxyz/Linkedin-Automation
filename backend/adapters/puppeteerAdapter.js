import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import path from 'path';

puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function puppeteerPost(post) {
  console.log(`[PUPPETEER ADAPTER] Attempting to post to LinkedIn...`);
  const email = process.env.LINKEDIN_EMAIL;
  const password = process.env.LINKEDIN_PASSWORD;

  if (!email || !password) {
    console.warn("[PUPPETEER ADAPTER] LINKEDIN_EMAIL or LINKEDIN_PASSWORD not set. Failing.");
    throw new Error("Missing LinkedIn credentials in .env");
  }

  let browser;
  try {
    const executablePath = process.env.BROWSER_EXECUTABLE_PATH || undefined;

    // Additional args for Render deployment
    browser = await puppeteer.launch({ 
      headless: process.env.NODE_ENV === 'production' ? true : false,
      executablePath: executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    const page = await browser.newPage();

    // Set a realistic viewport
    await page.setViewport({ width: 1280, height: 800 });

    console.log("[PUPPETEER ADAPTER] Navigating to LinkedIn...");
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });

    console.log("[PUPPETEER ADAPTER] Logging in...");
    await page.waitForSelector('#username', { timeout: 10000 });
    
    // Type like a human
    await page.type('#username', email, { delay: 50 });
    await page.type('#password', password, { delay: 50 });
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('[type="submit"]')
    ]);

    // Check if login was successful
    if (page.url().includes('login') || page.url().includes('checkpoint')) {
       throw new Error("Login failed or requires verification challenge.");
    }

    await page.waitForSelector('.share-box-feed-entry__trigger', { timeout: 60000 });
    console.log("[PUPPETEER ADAPTER] Clicking start post...");
    
    await delay(1000);
    await page.click('.share-box-feed-entry__trigger');

    // Handle Image Upload if imagePath exists
    if (post.imagePath) {
       console.log("[PUPPETEER ADAPTER] Uploading image...");
       // Wait for the media button to be available. Button to add photo
       await page.waitForSelector('button[aria-label="Add media"]', { timeout: 5000 }).catch(() => null);
       
       const [fileChooser] = await Promise.all([
         page.waitForFileChooser(),
         page.click('button[aria-label="Add media"]')
       ]);
       
       const absoluteImagePath = path.resolve(post.imagePath);
       await fileChooser.accept([absoluteImagePath]);
       
       // Wait for Next/Done button after uploading image
       await delay(2000);
       const nextButtonSelector = 'button.share-box-footer__primary-btn'; // Might be different
       const nextButtons = await page.$x("//button[contains(., 'Next') or contains(., 'Done')]");
       if (nextButtons.length > 0) {
         await nextButtons[0].click();
       } else {
         // Try generic class
         await page.click('.share-box-footer__primary-btn').catch(() => null);
       }
       await delay(1000);
    }

    await page.waitForSelector('.ql-editor', { timeout: 5000 });
    console.log("[PUPPETEER ADAPTER] Typing content...");
    
    await page.evaluate((text) => {
      const editor = document.querySelector('.ql-editor');
      if (editor) {
        editor.innerHTML = text.replace(/\n/g, '<br>');
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, post.content);

    await delay(2000);

    console.log("[PUPPETEER ADAPTER] Clicking post button...");
    const postBtnSelector = '.share-actions__primary-action';
    await page.waitForSelector(postBtnSelector);
    await page.click(postBtnSelector);
    
    console.log("[PUPPETEER ADAPTER] Waiting for post to process...");
    await delay(5000); // Give it time to actually process the post

    console.log("[PUPPETEER ADAPTER] Success!");
    return true;
  } catch (err) {
    console.error("[PUPPETEER ADAPTER] Error during automation:", err);
    throw err;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
