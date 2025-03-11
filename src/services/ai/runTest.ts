import * as dotenv from 'dotenv';
import { OpenAIService } from './openaiService';

// Load environment variables from .env.local
const result = dotenv.config({ path: '.env.local' });

if (result.error) {
  console.error('Error loading .env.local file:', result.error);
  process.exit(1);
}

console.log('Environment variables loaded. API Key present:', !!process.env.VITE_OPENAI_API_KEY);
console.log('API Key length:', process.env.VITE_OPENAI_API_KEY?.length);

async function runTest() {
  try {
    console.log('Initializing OpenAI service...');
    const openAIService = new OpenAIService();
    
    console.log('Sending test request...');
    const response = await openAIService.generateResponse(
      "You are a helpful AI assistant.",
      "Hello! Can you hear me?"
    );
    
    console.log("Test successful! Response:", response);
    return true;
  } catch (error) {
    console.error("Test failed:", error);
    return false;
  }
}

runTest(); 