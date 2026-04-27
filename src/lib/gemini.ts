import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function askGemini(prompt: string) {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
