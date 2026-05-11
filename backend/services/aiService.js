import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Attempt to load from parent or local .env
dotenv.config({ path: '../src/.env' });
dotenv.config();

// We will export a generic function to generate the post
export async function generateLinkedInPost(topic) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    // Initialize the new Google Gen AI SDK
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert LinkedIn ghostwriter. Create a professional and engaging LinkedIn post about the following topic: "${topic}". 
    
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
