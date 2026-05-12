import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Attempt to load from parent or local .env
dotenv.config({ path: '../src/.env' });
dotenv.config();

async function getTopicContext(topic) {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(topic)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    let context = [];
    $('.result__snippet').each((i, el) => {
      if (i < 3) {
        context.push($(el).text().trim());
      }
    });
    return context.join('\n');
  } catch (error) {
    console.warn("Failed to fetch live context:", error.message);
    return "";
  }
}

// We will export a generic function to generate the post
export async function generateLinkedInPost(topic) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    const liveContext = await getTopicContext(topic);
    console.log(`[AI SERVICE] Live Context length: ${liveContext.length}`);

    // Initialize the new Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert LinkedIn ghostwriter. Create a professional and engaging LinkedIn post about the following topic: "${topic}". 

${liveContext ? `Here is what people are currently saying about this topic (incorporate this context to make the post timely and relevant):\n${liveContext}\n\n` : ''}
Requirements:
- Start with a strong, attention-grabbing hook.
- Length should be around 120-200 words.
- Include appropriate spacing for readability.
- End with a call-to-action (CTA) to encourage comments.
- Include 2-3 relevant hashtags at the bottom.
- Ensure the tone is professional but engaging.

Do not include any intro or outro text, just return the post content directly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', // You can use gemini-2.5-pro or flash
      contents: prompt,
    });

    if (response.text) {
      return response.text;
    } else {
      throw new Error("No text returned from Gemini API");
    }
  } catch (error) {
    console.error("Error generating post:", error);
    throw error;
  }
}
