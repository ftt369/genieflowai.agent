import { useDocumentStore, Document } from '../stores/documentStore';
import { useModeStore, AssistantMode } from '../stores/model/modeStore';
import { useModelStore } from '../stores/model/modelStore';
import { ModelService, Message } from './modelService';
import { useRef, useEffect } from 'react';
import { formatFileSize } from '../utils/fileUtils';

export interface KnowledgeSearchResult {
  title: string;
  content: string;
  source: string;
  relevance: number;
}

export function useAiAssistant() {
  const modelService = useModelStore(state => state.modelService);
  const aiAssistantRef = useRef<AiAssistantService | null>(null);
  
  // Create or reuse the AI assistant instance
  useEffect(() => {
    if (!aiAssistantRef.current && modelService) {
      aiAssistantRef.current = new AiAssistantService(modelService);
    }
  }, [modelService]);
  
  return aiAssistantRef.current || new AiAssistantService(modelService);
}

// Global instance for non-hook access
let globalAiAssistantInstance: AiAssistantService | null = null;

export function getGlobalAiAssistant(): AiAssistantService | null {
  return globalAiAssistantInstance;
}

export class AiAssistantService {
  private modelService: ModelService;
  private activeMode: AssistantMode | null = null;
  private knowledgeBases: any[] = [];

  constructor(modelService: ModelService) {
    this.modelService = modelService;
    // Initialize active mode from store
    this.updateActiveMode();
    
    // Listen for mode changes
    useModeStore.subscribe(this.updateActiveMode.bind(this));
    
    // Set global instance
    globalAiAssistantInstance = this;
  }

  /**
   * Initialize the assistant with the current mode and knowledge bases
   */
  public initialize(mode: AssistantMode, knowledgeBases: any[]) {
    this.activeMode = mode;
    this.knowledgeBases = knowledgeBases;
  }

  /**
   * Search knowledge bases for relevant information based on a query
   */
  public async searchKnowledgeBases(query: string): Promise<KnowledgeSearchResult[]> {
    if (!this.activeMode) {
      return [];
    }

    // IMPLEMENTATION TO BE ADDED
    return [];
  }

  /**
   * Update the active mode from the store
   */
  private updateActiveMode() {
    const modeState = useModeStore.getState();
    // Make sure we get the correct type by using proper type checking
    if (modeState && typeof modeState.activeMode === 'object' && modeState.activeMode !== null) {
      this.activeMode = modeState.activeMode as AssistantMode;
    } else {
      this.activeMode = null;
    }
  }

  // Get the model service instance
  public getModelService(): ModelService {
    return this.modelService;
  }

  /**
   * Safely generate text using the model service with proper error handling and fallbacks
   * @param messages Array of messages to send to the model
   * @param defaultResponses Fallback responses if generation fails
   * @returns Generated text or a fallback response
   */
  public async safeGenerateText(messages: Message[], defaultResponses: string[] = []): Promise<string> {
    if (!messages || messages.length === 0) {
      return defaultResponses[0] || "No valid input provided.";
    }
    
    try {
      const validMessages = messages.filter(msg => 
        msg && msg.content && typeof msg.content === 'string' && msg.content.trim() !== ''
      );
      
      if (validMessages.length === 0) {
        return defaultResponses[0] || "No valid messages to process.";
      }
      
      // Use the modelService to generate a response
      return await this.modelService.generateChat(validMessages);
    } catch (error) {
      console.error("Error generating text with model:", error);
      // Return a default response if available
      return defaultResponses[0] || "I couldn't generate a response at this time. Please try again later.";
    }
  }

  /**
   * Generate a streaming response from the AI assistant
   * @param messages - The messages to send to the AI
   * @param query - The current query for knowledge base lookup
   * @returns AsyncGenerator that yields response chunks
   */
  public async *generateResponseStream(messages: Message[], query: string): AsyncGenerator<string, void, unknown> {
    // System message with custom instructions
    const modeState = useModeStore.getState();
    let modeInstructions = '';
    
    // Type guard to ensure activeMode is an object with the expected properties
    if (modeState && typeof modeState.activeMode === 'object' && modeState.activeMode !== null) {
      const activeMode = modeState.activeMode as AssistantMode;
      modeInstructions = `\n\nActively use this mode in your responses:\n- ${activeMode.name}: ${activeMode.description}`;
    }
    
    // Format context for the AI
    const formattedMessages = [...messages];
    
    // Special case for displaying raw document content
    const docCommand = query.toLowerCase().trim();
    if (docCommand.includes("show raw document") || docCommand.includes("display raw document") || docCommand.includes("view document content") || docCommand.includes("show document text")) {
      const documentStore = useDocumentStore.getState();
      const currentDocument = documentStore.getCurrentDocument();
      
      if (currentDocument) {
        let docContent = `# Document: ${currentDocument.fileName}\n\n`;
        docContent += `## Metadata\n`;
        docContent += `- File name: ${currentDocument.fileName}\n`;
        docContent += `- File type: ${currentDocument.fileType}\n`;
        
        // Use safe property access for file size
        const fileSize = (currentDocument as any).size || currentDocument.content.length;
        docContent += `- Size: ${formatFileSize(fileSize)}\n\n`;
        
        docContent += `## Content\n\`\`\`\n${currentDocument.content.substring(0, 100000)}\n\`\`\``;
        
        if (currentDocument.content.length > 100000) {
          docContent += `\n\n(Content truncated - showing first 100,000 characters of ${currentDocument.content.length} total)`;
        }
        
        yield docContent;
        return;
      } else {
        yield "No document is currently loaded.";
        return;
      }
    }
    
    // Add system message with instructions if we have any
    if (modeInstructions) {
      formattedMessages.unshift({
        role: 'system',
        content: `You are an AI assistant helping with document analysis and research.${modeInstructions}`
      });
    }
    
    // Generate the response using streaming
    const stream = await this.modelService.generateChatStream(formattedMessages);
    
    for await (const chunk of stream) {
      yield chunk;
    }
  }

  /**
   * Generate a response from the AI assistant
   * @param messages - The messages to send to the AI
   * @param query - The current query for knowledge base lookup
   * @returns A promise resolving to the AI's response
   */
  public async generateResponse(messages: Message[], query: string): Promise<string> {
    // System message with custom instructions
    const modeState = useModeStore.getState();
    let modeInstructions = '';
    
    // Type guard to ensure activeMode is an object with the expected properties
    if (modeState && typeof modeState.activeMode === 'object' && modeState.activeMode !== null) {
      const activeMode = modeState.activeMode as AssistantMode;
      modeInstructions = `\n\nActively use this mode in your responses:\n- ${activeMode.name}: ${activeMode.description}`;
    }
    
    // Format context for the AI
    const formattedMessages = [...messages];
    
    // Special case for displaying raw document content
    const docCommand = query.toLowerCase().trim();
    if (docCommand.includes("show raw document") || docCommand.includes("display raw document") || docCommand.includes("view document content") || docCommand.includes("show document text")) {
      const documentStore = useDocumentStore.getState();
      const currentDocument = documentStore.getCurrentDocument();
      
      if (currentDocument) {
        let docContent = `# Document: ${currentDocument.fileName}\n\n`;
        docContent += `## Metadata\n`;
        docContent += `- File name: ${currentDocument.fileName}\n`;
        docContent += `- File type: ${currentDocument.fileType}\n`;
        
        // Use safe property access for file size
        const fileSize = (currentDocument as any).size || currentDocument.content.length;
        docContent += `- Size: ${formatFileSize(fileSize)}\n\n`;
        
        docContent += `## Content\n\`\`\`\n${currentDocument.content.substring(0, 100000)}\n\`\`\``;
        
        if (currentDocument.content.length > 100000) {
          docContent += `\n\n(Content truncated - showing first 100,000 characters of ${currentDocument.content.length} total)`;
        }
        
        return docContent;
      } else {
        return "No document is currently loaded.";
      }
    }
    
    // Add system message with instructions if we have any
    if (modeInstructions) {
      formattedMessages.unshift({
        role: 'system',
        content: `You are an AI assistant helping with document analysis and research.${modeInstructions}`
      });
    }
    
    // Generate the response
    return await this.modelService.generateChat(formattedMessages);
  }

  /**
   * Generate proactive suggestions based on the current chat and document content
   * @param messages - The current chat messages
   * @param document - The current document (optional)
   * @returns A promise resolving to an array of suggestion strings
   */
  public async generateProactiveSuggestions(messages: Message[], document?: any): Promise<string[]> {
    if (messages.length === 0) {
      return [];
    }

    // Determine the conversation stage
    const conversationStage = this.analyzeConversationStage(messages);
    
    // Build a system prompt based on the conversation stage and document
    let systemPrompt = this.buildSuggestionPrompt(messages, conversationStage, document);
    
    // Create a system message
    const suggestionPrompt: Message = {
      role: 'system',
      content: systemPrompt
    };
    
    try {
      // Ensure messages have content to prevent API errors 
      const validMessages = messages.filter(msg => msg.content && msg.content.trim() !== '');
      
      // If no valid messages, return default suggestions
      if (validMessages.length === 0) {
        return this.getDefaultSuggestions(conversationStage);
      }
      
      // Add a default minimal message if somehow we have empty messages
      if (validMessages.length < messages.length) {
        console.warn(`Filtered out ${messages.length - validMessages.length} empty messages before API call`);
      }
      
      // Generate suggestions
      const suggestionsResponse = await this.safeGenerateText(
        [...validMessages, suggestionPrompt], 
        this.getDefaultSuggestions(conversationStage)
      );
      
      // Parse the response into individual suggestions
      return suggestionsResponse
        .split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          // Format suggestions with bold for better visibility
          if (!line.startsWith('**') && !line.includes('**')) {
            return `**${line.replace(/^[-•*\d]+\.\s*/, '')}**`;
          }
          return line.replace(/^[-•*\d]+\.\s*/, '');
        }); 
    } catch (error) {
      console.error('Error generating proactive suggestions:', error);
      return this.getDefaultSuggestions(conversationStage);
    }
  }

  /**
   * Analyze the conversation stage based on message patterns
   * @param messages - The current chat messages
   * @returns The current conversation stage
   */
  private analyzeConversationStage(messages: Message[]): 'initial' | 'exploring' | 'focused' | 'detailed' {
    if (!messages || messages.length < 3) return 'initial';
    if (messages.length < 8) return 'exploring';
    
    // Count question marks to determine if we're in inquiry mode
    const questionCount = messages
      .filter(msg => msg.role === 'user')
      .map(msg => (msg.content.match(/\?/g) || []).length)
      .reduce((sum, count) => sum + count, 0);
      
    if (questionCount > messages.length / 2) return 'detailed';
    return 'focused';
  }

  /**
   * Build the prompt for suggestion generation based on conversation stage
   * @param messages - The current chat messages
   * @param stage - The current conversation stage
   * @param document - The current document (optional)
   * @returns The suggestion prompt
   */
  private buildSuggestionPrompt(messages: Message[], stage: string, document?: any): string {
    // Extract conversation topic from messages
    const topic = this.extractConversationTopic(messages);
    
    // Base prompts for different conversation stages
    const stagePrompts = {
      initial: `Based on the initial conversation about "${topic}", generate 5-7 foundational suggestions to help the user explore this topic more broadly.
      
Your suggestions should:
1. Cover the fundamental concepts and terminology
2. Include different aspects or dimensions of the topic
3. Provide entry points for deeper exploration
4. Include basic questions that clarify the user's specific interests
5. Offer a mix of theoretical and practical exploration paths

Format each suggestion to be clear, specific, and actionable.`,

      exploring: `Based on the ongoing exploration of "${topic}", generate 5-7 suggestions that help deepen the user's understanding.

Your suggestions should:
1. Build upon concepts already discussed in the conversation
2. Make connections between different aspects of the topic
3. Suggest more specific areas to focus on
4. Introduce related concepts that haven't been mentioned yet
5. Include both analytical and practical exploration paths

Format each suggestion to be specific and actionable, encouraging deeper engagement.`,

      focused: `Based on the focused discussion about "${topic}", generate 5-7 suggestions that help develop expertise and critical thinking.

Your suggestions should:
1. Address nuances and complexities in the specific focus area
2. Suggest comparisons, contrasts, and evaluations
3. Introduce advanced concepts related to the current focus
4. Challenge assumptions and encourage critical analysis
5. Connect to practical applications or implications

Format suggestions to promote sophisticated understanding and analysis.`,

      detailed: `Based on the detailed inquiry into "${topic}", generate 5-7 suggestions for expert-level exploration and synthesis.

Your suggestions should:
1. Address very specific aspects at an advanced level
2. Suggest synthesis of multiple concepts or perspectives
3. Propose theoretical frameworks or models for evaluation
4. Connect to cutting-edge research or developments
5. Encourage creative application or innovation

Format suggestions for comprehensive mastery and original thinking.`
    };
    
    // Select base prompt based on stage
    let basePrompt = stagePrompts[stage as keyof typeof stagePrompts] || stagePrompts.exploring;
    
    // Modify prompt if document is present
    if (document) {
      basePrompt += `\n\nYou are analyzing a document titled "${document.fileName}" along with this conversation.
      
Additionally, your suggestions should:
1. Address key concepts, methodologies, findings, and implications in the document
2. Connect the document content to the conversation context
3. Include prompts for analyzing specific sections or claims in the document
4. Suggest ways to apply or extend the document's content
5. Identify gaps or limitations that could be explored further

These should be concrete, educational prompts that foster deeper engagement with both the conversation topic and the document.`;
    }
    
    // Add formatting instructions
    basePrompt += `\n\nFormat each suggestion as a clear, specific, and actionable prompt that the user can click on.
For example: "**Analyze how [specific concept] relates to [another concept] in the context of [topic]**"

Make these suggestions intellectually stimulating and designed to foster deeper understanding.`;
    
    return basePrompt;
  }

  /**
   * Extract the main topic from conversation messages
   * @param messages - The conversation messages
   * @returns The extracted topic
   */
  private extractConversationTopic(messages: Message[]): string {
    if (!messages || messages.length === 0) return "the current topic";
    
    // Get the most recent user message with significant content
    const userMessages = messages
      .filter(msg => msg.role === 'user' && msg.content && msg.content.trim().length > 5)
      .map(msg => msg.content);
    
    if (userMessages.length === 0) return "the current topic";
    
    // Use the latest user message as topic if it's reasonably short
    const latestMessage = userMessages[userMessages.length - 1];
    if (latestMessage.length < 50) return latestMessage;
    
    // Extract key phrases from the latest user message
    const words = latestMessage.split(' ').filter(w => w.length > 3);
    const keyWords = words.filter(w => !['what', 'when', 'where', 'which', 'who', 'why', 'how', 'could', 'would', 'should', 'about', 'with'].includes(w.toLowerCase()));
    
    // If we have enough keywords, use the first few
    if (keyWords.length >= 3) {
      return keyWords.slice(0, 5).join(' ');
    }
    
    return "the current topic";
  }

  /**
   * Get default suggestions based on conversation stage
   * @param stage - The conversation stage
   * @returns Array of default suggestions
   */
  private getDefaultSuggestions(stage: string): string[] {
    const defaultSuggestions = {
      initial: [
        "**What foundational concepts would you like to explore in this topic?**",
        "**Could you share what specific aspects of this subject interest you most?**",
        "**Would you like an overview of the key terminology and principles?**",
        "**Are you interested in theoretical foundations or practical applications?**",
        "**How would you like to approach learning about this topic?**"
      ],
      
      exploring: [
        "**How do the concepts we've discussed relate to each other?**",
        "**Would you like to explore any specific aspect in more depth?**",
        "**How would you like to apply this knowledge in practical scenarios?**",
        "**What related areas might be worth investigating?**",
        "**Are there specific examples or case studies you'd like to examine?**"
      ],
      
      focused: [
        "**What are the implications of these ideas in different contexts?**",
        "**How might we critically evaluate the approaches we've discussed?**",
        "**What counterarguments or alternative perspectives should be considered?**",
        "**How does this connect to broader themes or disciplines?**",
        "**What specific applications are most relevant to your interests?**"
      ],
      
      detailed: [
        "**How might we synthesize these complex ideas into a coherent framework?**",
        "**What innovative approaches could address the limitations we've identified?**",
        "**How do these specific details connect to the broader theoretical landscape?**",
        "**What methodology would be most appropriate for further investigation?**",
        "**How might these concepts be extended or applied in novel ways?**"
      ]
    };
    
    return defaultSuggestions[stage as keyof typeof defaultSuggestions] || defaultSuggestions.exploring;
  }

  /**
   * Fetch search results for a query to use as citations
   * @param query The user's query to search for
   * @returns Promise resolving to an array of search results with citation information
   */
  public async fetchWebSearchResults(query: string): Promise<any[]> {
    try {
      // In a real implementation, this would call an external search API
      // For demo purposes, we're returning mock data
      
      // Delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate some realistic-looking mock results
      return [
        {
          id: Math.random().toString(36).substring(2, 15),
          title: `Understanding ${query} - A Comprehensive Guide`,
          url: `https://example.com/guide/${query.toLowerCase().replace(/\s+/g, '-')}`,
          source: 'Example Knowledge Base',
          snippet: `This comprehensive guide covers everything you need to know about ${query}, including key concepts, applications, and best practices.`
        },
        {
          id: Math.random().toString(36).substring(2, 15),
          title: `${query} Explained: Key Insights and Analysis`,
          url: `https://research.example.org/insights/${query.toLowerCase().replace(/\s+/g, '-')}`,
          source: 'Research Journal',
          snippet: `Our research team provides an in-depth analysis of ${query}, exploring its implications and future developments.`
        },
        {
          id: Math.random().toString(36).substring(2, 15),
          title: `The Latest Developments in ${query}`,
          url: `https://news.example.com/technology/${query.toLowerCase().replace(/\s+/g, '-')}`,
          source: 'Technology News',
          snippet: `Stay up-to-date with the most recent advancements in ${query} and how they're shaping the industry landscape.`
        }
      ];
    } catch (error) {
      console.error('Error fetching web search results:', error);
      return [];
    }
  }
} 