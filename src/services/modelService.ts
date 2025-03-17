import { ModelType } from '@stores/model/modelStore';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { generateOpenAIResponse } from '../api/openai';
import { usePromptStore } from '../stores/promptStore';
import { useDocumentStore } from '../stores/documentStore';

// Get environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelConfig {
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface ModelService {
  generateChat(messages: Message[]): Promise<string>;
  generateChatStream(messages: Message[]): AsyncGenerator<string, void, unknown>;
  updateConfig(config: ModelConfig): void;
  getCurrentModel(): string;
}

export class OpenAIService implements ModelService {
  private config: ModelConfig = {};

  async generateChat(messages: Message[]): Promise<string> {
    try {
      // Get proprietary prompt
      const { proprietaryPrompt } = usePromptStore.getState();
      
      // Add proprietary prompts to the messages
      const enhancedMessages: Message[] = [
        { role: 'system', content: proprietaryPrompt.systemPrompt },
        { role: 'system', content: proprietaryPrompt.contextPrompt },
        ...messages
      ];

      const response = await generateOpenAIResponse(enhancedMessages);
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate response');
      }

      // Format response according to proprietary format if specified
      if (proprietaryPrompt.responseFormat) {
        return this.formatResponse(response.content, proprietaryPrompt.responseFormat);
      }

      return response.content;
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      throw error;
    }
  }

  async *generateChatStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
    try {
      // Get proprietary prompt
      const { proprietaryPrompt } = usePromptStore.getState();
      
      // Add proprietary prompts to the messages
      const enhancedMessages: Message[] = [
        { role: 'system', content: proprietaryPrompt.systemPrompt },
        { role: 'system', content: proprietaryPrompt.contextPrompt },
        ...messages
      ];

      const stream = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey || import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: enhancedMessages,
          stream: true
        })
      });

      const reader = stream.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to create stream reader');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.warn('Failed to parse streaming response:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenAI Streaming Error:', error);
      throw error;
    }
  }

  private formatResponse(content: string, format: string): string {
    // Apply response formatting based on the proprietary format
    // This is a placeholder - implement your formatting logic here
    return content;
  }

  updateConfig(config: ModelConfig) {
    this.config = { ...this.config, ...config };
  }

  getCurrentModel(): string {
    return 'gpt4';
  }
}

export class GeminiService implements ModelService {
  private config: ModelConfig = {};
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  
  constructor(initialConfig?: ModelConfig) {
    if (initialConfig) {
      this.config = initialConfig;
    }
    this.initModel();
  }

  private initModel() {
    const apiKey = this.config.apiKey || GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: this.config.temperature || 0.7,
          maxOutputTokens: this.config.maxTokens || 8192,
          topK: 40,
          topP: 0.95,
        }
      });
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
      throw new Error('Failed to initialize Gemini model');
    }
  }

  /**
   * Generate a chat response from the model
   */
  async generateChat(messages: Message[]): Promise<string> {
    try {
      // Validate messages to prevent API errors
      if (!messages || messages.length === 0) {
        console.warn('generateChat called with empty messages array');
        return "I didn't receive any messages to respond to. Please provide some content.";
      }
      
      // Filter out empty messages
      const validMessages = messages.filter(msg => 
        msg && msg.content && typeof msg.content === 'string' && msg.content.trim() !== ''
      );
      
      if (validMessages.length === 0) {
        console.warn('generateChat: All messages were empty or invalid');
        return "I didn't receive any valid content to respond to. Please provide some content.";
      }
      
      if (validMessages.length < messages.length) {
        console.warn(`Filtered out ${messages.length - validMessages.length} empty messages before API call`);
      }

      // Check for documents to include in the context
      const documentStore = useDocumentStore.getState();
      const currentDocument = documentStore.getCurrentDocument();
      
      if (currentDocument) {
        console.log(`Including document in context: ${currentDocument.fileName}, content length: ${currentDocument.content.length}`);
        
        // If document is too large, summarize or truncate
        if (currentDocument.content.length > 10000) {
          console.log(`Document content too large (${currentDocument.content.length} chars), using smart truncation`);
          // Implement smart truncation here
        }
      }

      // Format messages for the API and make the call
      return await this.model.generateChat(validMessages);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async *generateChatStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
    if (!this.model) {
      this.initModel();
    }

    const MAX_RETRIES = 3;
    let retryCount = 0;
    let success = false;

    while (!success && retryCount < MAX_RETRIES) {
      try {
        // Validate messages to prevent API errors
        if (!messages || messages.length === 0) {
          console.warn('generateChatStream called with empty messages array');
          yield "I didn't receive any messages to respond to. Please provide some content.";
          return;
        }
        
        // Get the current document from the document store
        const currentDoc = useDocumentStore.getState().getCurrentDocument();
        
        // Format messages for better continuity and filter empty messages
        const validMessages = messages.filter(msg => msg && msg.content && typeof msg.content === 'string' && msg.content.trim() !== '');
        
        if (validMessages.length === 0) {
          console.warn('generateChatStream: All messages were empty or invalid');
          yield "I didn't receive any valid content to respond to. Please provide some content.";
          return;
        }
        
        if (validMessages.length < messages.length) {
          console.warn(`Filtered out ${messages.length - validMessages.length} empty messages before streaming API call`);
        }
        
        const enhancedMessages = validMessages.map(msg => {
          if (msg.role === 'system') {
            return {
              role: 'user',
              content: `[System Instruction] ${msg.content}`
            };
          }
          return msg;
        });

        // If there's a current document, prepend it to the messages
        let messageHistory = [...enhancedMessages];
        if (currentDoc) {
          console.log(`Including document in context: ${currentDoc.fileName}, content length: ${currentDoc.content.length}`);
          
          // Truncate document content if it's too large to avoid token limits
          let docContent = currentDoc.content;
          if (docContent.length > 15000) {
            console.log(`Document content too large (${docContent.length} chars), using smart truncation`);
            
            // Smarter truncation approach - keep beginning, end, and try to extract key sections
            const firstPart = docContent.substring(0, 5000); // Keep first 5000 chars (likely abstract, intro)
            const lastPart = docContent.substring(docContent.length - 5000); // Keep last 5000 chars (likely conclusion)
            
            // Try to extract sections that seem important based on keywords in the query
            // Get the last message content (the query)
            const lastMessageContent = enhancedMessages[enhancedMessages.length - 1]?.content || '';
            const keywords = this.extractKeywords(lastMessageContent);
            
            // Find middle sections that contain these keywords (up to 5000 chars)
            let middlePart = '';
            let middleCharsUsed = 0;
            const maxMiddleChars = 5000;
            
            if (keywords.length > 0) {
              // Split the middle section into paragraphs
              const middleContent = docContent.substring(5000, docContent.length - 5000);
              const paragraphs = middleContent.split(/\n\n+/);
              
              // Score each paragraph based on keyword matches
              const scoredParagraphs = paragraphs.map(p => {
                let score = 0;
                keywords.forEach(keyword => {
                  if (p.toLowerCase().includes(keyword.toLowerCase())) {
                    score += 1;
                  }
                });
                return { text: p, score };
              });
              
              // Sort by score and take paragraphs until we hit the middle char limit
              scoredParagraphs.sort((a, b) => b.score - a.score);
              
              for (const para of scoredParagraphs) {
                if (para.score > 0 && middleCharsUsed + para.text.length <= maxMiddleChars) {
                  middlePart += para.text + '\n\n';
                  middleCharsUsed += para.text.length + 2;
                }
              }
              
              if (middlePart) {
                middlePart = '\n\n[... Selected relevant sections from middle part ...]\n\n' + middlePart;
              }
            }
            
            // Combine the parts
            docContent = firstPart + 
              '\n\n[... Some content omitted due to length ...]\n\n' + 
              (middlePart || '') +
              (middlePart ? '\n\n[... Additional content omitted ...]\n\n' : '') +
              lastPart +
              '\n\n[Note: Document was selectively truncated. Use "show raw document" to view full content]';
          }
          
          // Create a system message that contains the document content with better instructions
          const docContext = {
            role: 'user' as const,
            content: `[DOCUMENT CONTEXT]
Document name: ${currentDoc.fileName}
Document content:
${docContent}
[END DOCUMENT CONTEXT]

IMPORTANT INSTRUCTIONS:
1. Use ONLY the information from this document to answer questions.
2. If the answer isn't in the document, say "I don't see that information in the document."
3. Don't use your general knowledge unless specifically asked.
4. When possible, quote specific parts of the document to support your answers.
5. If you need to see more content, suggest the user try 'show raw document'.`
          };
          
          // Insert at beginning for context
          messageHistory.unshift(docContext);
        }
        
        // Construct chat history for Gemini (excluding the last message)
        const chatHistory = messageHistory.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        // For conversations, use chat
        const chat = this.model.startChat({
          history: chatHistory
        });
        
        // Send the last message and get the streaming response
        const lastMessage = messageHistory[messageHistory.length - 1];
        if (!lastMessage || !lastMessage.content.trim()) {
          throw new Error('No valid message content to process');
        }

        console.log(`Sending message to Gemini: ${lastMessage.content.substring(0, 150)}...`);
        const streamingResponse = await chat.sendMessageStream(lastMessage.content);
        
        let fullResponse = '';
        try {
          for await (const chunk of streamingResponse.stream) {
            if (chunk.text) {
              const text = chunk.text();
              fullResponse += text;
              yield text;
            }
          }
          
          // Check if response was cut off and continue if needed
          if (fullResponse.endsWith('...') || fullResponse.endsWith('…') || !fullResponse.trim().endsWith('.')) {
            console.log('Response appears to be cut off, attempting to continue...');
            try {
              const continuationResponse = await chat.sendMessageStream('Please continue your previous response.');
              for await (const chunk of continuationResponse.stream) {
                if (chunk.text) {
                  const text = chunk.text();
                  yield text;
                }
              }
            } catch (continuationError) {
              console.warn('Failed to get continuation, but returning partial response:', continuationError);
            }
          }
          
          success = true; // Mark as successful if we get here
        } catch (streamError) {
          console.error('Stream processing error:', streamError);
          if (fullResponse.length > 0) {
            console.log('Returning partial response despite stream error');
            success = true; // Consider it a success if we got some response
            return;
          }
          throw streamError; // Re-throw if we got no response at all
        }
      } catch (error) {
        retryCount++;
        console.error(`Gemini API Error (attempt ${retryCount}/${MAX_RETRIES}):`, error);
        
        if (retryCount >= MAX_RETRIES) {
          // If this was our last retry, throw the error
          throw new Error(error instanceof Error ? error.message : 'Failed to generate response after multiple attempts');
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  updateConfig(config: ModelConfig) {
    this.config = { ...this.config, ...config };
    // Reset model instance when config changes
    this.genAI = null;
    this.model = null;
  }

  getCurrentModel(): string {
    return 'gemini-2.0-flash';
  }

  private extractKeywords(message: string): string[] {
    // Remove common words and punctuation
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 
                       'through', 'over', 'before', 'between', 'after', 'since', 'without', 'under', 'within', 'along', 'following',
                       'across', 'behind', 'beyond', 'plus', 'except', 'but', 'up', 'out', 'around', 'down', 'off', 'above', 'near'];
    
    const cleaned = message.toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
      .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
      .trim();
    
    // Split into words and filter out short words and stop words
    const words = cleaned.split(' ').filter(word => 
      word.length > 3 && !stopWords.includes(word)
    );
    
    // Count word frequency
    const wordCounts: {[key: string]: number} = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // Sort by frequency and return top 5-10 keywords
    const sortedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    return sortedWords.slice(0, 10);
  }
}

class ModelServiceFactory {
  private static instance: ModelServiceFactory;
  private services: Map<ModelType, ModelService> = new Map();

  private constructor() {}

  static getInstance(): ModelServiceFactory {
    if (!ModelServiceFactory.instance) {
      ModelServiceFactory.instance = new ModelServiceFactory();
    }
    return ModelServiceFactory.instance;
  }

  getService(model: ModelType): ModelService {
    let service = this.services.get(model);
    if (!service) {
      service = this.createService(model);
      this.services.set(model, service);
    }
    return service;
  }

  private createService(model: ModelType): ModelService {
    switch (model) {
      case 'gemini':
        return new GeminiService();
      case 'gpt4':
        return new OpenAIService();
      default:
        throw new Error(`Model ${model} not implemented`);
    }
  }

  updateConfig(model: ModelType, config: ModelConfig) {
    const service = this.getService(model);
    service.updateConfig(config);
  }
}

export const modelServiceFactory = ModelServiceFactory.getInstance(); 