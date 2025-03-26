import { GoogleGenerativeAI } from '@google/generative-ai';
import { useModelStore } from '../stores/model/modelStore';

// Get API key from environment variable first
let API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Try to get the API key from other environment variables if needed
if (!API_KEY) {
  const otherKeys = [
    import.meta.env.VITE_GOOGLE_API_KEY,
    import.meta.env.VITE_GOOGLE_AI_API_KEY
  ];
  
  for (const key of otherKeys) {
    if (key) {
      console.log('Using alternative API key');
      API_KEY = key;
      break;
    }
  }
}

// Log available info for debugging
console.log('Thinking mode: Environment variables available:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
console.log('Thinking mode: API_KEY found?', !!API_KEY);

// Interface for the thinking response
export interface ThinkingResponse {
  success: boolean;
  thinking: string;
  answer: string;
  error?: string;
}

/**
 * Generates a response with visible thinking process
 * @param query The user's query
 * @returns A response with thinking process and final answer
 */
export async function generateWithThinking(query: string): Promise<ThinkingResponse> {
  console.log('generateWithThinking called with query:', query);
  
  try {
    // Try to get the API key from the model store if not available from env
    if (!API_KEY) {
      try {
        // Access the model store to get the current API key
        const modelStore = useModelStore.getState();
        const modelConfig = modelStore.modelConfigs.gemini;
        if (modelConfig?.apiKey) {
          API_KEY = modelConfig.apiKey;
          console.log('Retrieved API key from model store');
        }
      } catch (storeError) {
        console.error('Error accessing model store:', storeError);
      }
    }
    
    // Check if API key is available after all attempts
    if (!API_KEY) {
      console.error('Gemini API key is not set');
      
      // Return a simulated thinking response for testing when API key is missing
      if (import.meta.env.DEV) {
        console.log('DEV mode detected - returning simulated thinking response');
        return simulateThinking(query);
      }
      
      return {
        success: false,
        thinking: '',
        answer: '',
        error: 'API key not configured'
      };
    }

    console.log('Initializing Gemini with API key length:', API_KEY.length);
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      }
    });

    // Create system prompt that instructs the model to think step by step
    const systemPrompt = `You are a helpful AI assistant that thinks through problems step by step.

I need you to follow these EXACT instructions about your response format:

1. FIRST, provide your reasoning process inside XML tags like this: <thinking>your step-by-step reasoning</thinking>
2. THEN, provide your final answer inside XML tags like this: <answer>your concise final answer</answer>

Example format:
<thinking>
Step 1: Analyze the question
Step 2: Research relevant facts
Step 3: Consider implications
Step 4: Form a conclusion
</thinking>
<answer>
This is the final answer based on my reasoning.
</answer>

Remember to ALWAYS use these exact XML tags and this exact format.`;

    console.log('Sending request to Gemini API');
    
    // Make request to Gemini API
    const result = await model.generateContent([
      systemPrompt,
      query
    ]);
    
    console.log('Received response from Gemini API');
    const content = result.response.text();
    console.log('Raw response:', content);
    
    // Extract thinking and answer sections using regex
    const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
    const answerMatch = content.match(/<answer>([\s\S]*?)<\/answer>/);
    
    let thinking = '';
    let answer = '';
    
    if (thinkingMatch && answerMatch) {
      thinking = thinkingMatch[1].trim();
      answer = answerMatch[1].trim();
    } else {
      // Fallback: try to intelligently split the response if tags aren't found
      console.log('Tags not found, using fallback parsing');
      
      // Look for natural language markers that might indicate reasoning vs conclusion
      const contentParts = content.split(/\n\n|(?:In conclusion:|To summarize:|Therefore,|In summary:|My answer is:|So,)/i);
      
      if (contentParts.length >= 2) {
        // Use first part as thinking, rest as answer
        thinking = contentParts[0].trim();
        answer = contentParts.slice(1).join('\n\n').trim();
      } else {
        // If we can't split naturally, use the first half as thinking, second half as answer
        const midpoint = Math.floor(content.length / 2);
        thinking = content.substring(0, midpoint).trim();
        answer = content.substring(midpoint).trim();
      }
    }
    
    console.log('Parsed thinking and answer:', { 
      thinkingFound: !!thinkingMatch, 
      answerFound: !!answerMatch,
      thinkingLength: thinking.length,
      answerLength: answer.length
    });

    return {
      success: true,
      thinking,
      answer
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Return simulated response in dev mode in case of API error
    if (import.meta.env.DEV) {
      console.log('DEV mode detected - returning simulated thinking response after error');
      return simulateThinking(query);
    }
    
    return {
      success: false,
      thinking: '',
      answer: '',
      error: 'Failed to generate response'
    };
  }
}

/**
 * Simulates a thinking response when API key is missing (for development testing)
 */
function simulateThinking(query: string): ThinkingResponse {
  const thinking = `Let me think about "${query}" step by step:

Step 1: First, I need to understand what is being asked.
This question is about ${query}, which requires me to provide an explanation or analysis.

Step 2: I'll break down the key components of this question.
- The main topic is ${query.split(' ').slice(0, 3).join(' ')}
- I need to consider various perspectives and facts about this topic
- The question seems to be seeking a comprehensive understanding

Step 3: Let me gather relevant information from my knowledge.
- ${query.split(' ').slice(0, 2).join(' ')} relates to ${query.split(' ').slice(-2).join(' ')}
- Key historical developments include early theories and modern understanding
- Important factors to consider: scientific principles, practical applications, and common misconceptions

Step 4: Now I'll analyze this information more deeply.
- There are multiple theories that explain different aspects of this topic
- Recent research has provided additional insights that should be included
- I need to make sure my answer is accessible while remaining accurate

Step 5: I'll formulate a comprehensive answer based on this analysis.
- I'll start with a clear definition
- Include the most important aspects and developments
- Conclude with practical implications or significance`;

  const answer = `Based on careful analysis, here's what you should know about ${query}:

${query} refers to a significant concept that has evolved over time through scientific investigation and theoretical development.

The key points to understand are:
1. It originated from early observations and experiments that led to fundamental insights
2. The modern understanding incorporates several important principles and mathematical models
3. It has practical applications in various fields including technology, medicine, and environmental science

This concept continues to be an active area of research, with new discoveries expanding our understanding regularly. Both experts and non-specialists can appreciate its significance in advancing our knowledge of the world.`;

  return {
    success: true,
    thinking,
    answer
  };
} 