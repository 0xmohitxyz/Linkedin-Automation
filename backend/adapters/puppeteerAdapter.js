import puppeteer from 'puppeteer';

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

    browser = await puppeteer.launch({ 
      headless: false,
      executablePath: executablePath
    });
    const page = await browser.newPage();

    // Go to LinkedIn Login
    console.log("[PUPPETEER ADAPTER] Navigating to LinkedIn...");
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });

    // Enter Credentials
    console.log("[PUPPETEER ADAPTER] Logging in...");
    
    // Wait for the username field to exist before typing (in case the page is slow or shows a different layout)
    await page.waitForSelector('#username', { timeout: 10000 });
    
    await page.type('#username', email);
    await page.type('#password', password);
    await page.click('[type="submit"]');

    // Wait for feed to load
    await page.waitForSelector('.share-box-feed-entry__trigger', { timeout: 60000 });
    
    console.log("[PUPPETEER ADAPTER] Clicking start post...");
    await page.click('.share-box-feed-entry__trigger');

    // Wait for the text editor
    await page.waitForSelector('.ql-editor', { timeout: 5000 });
    
    console.log("[PUPPETEER ADAPTER] Typing content...");
    await page.evaluate((text) => {
      const editor = document.querySelector('.ql-editor');
      if (editor) {
        editor.innerHTML = text.replace(/\\n/g, '<br>');
        // trigger input event so LinkedIn knows text changed
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, post.content);

    // Wait a bit to ensure the "Post" button becomes active
    await new Promise(r => setTimeout(r, 2000));

    console.log("[PUPPETEER ADAPTER] Clicking post button...");
    const postBtnSelector = '.share-actions__primary-action';
    await page.waitForSelector(postBtnSelector);
    await page.click(postBtnSelector); // Actually clicks the post button now!
    console.log("[PUPPETEER ADAPTER] Post successfully published!");
    
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
