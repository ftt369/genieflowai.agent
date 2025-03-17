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

    // Build a system prompt to generate suggestions
    let systemPrompt = `Based on the current conversation, generate 5-7 educational suggestions that would help deepen the user's understanding and promote further learning.

Your suggestions should:
1. Cover different aspects of the topic (fundamentals, applications, controversies, etc.)
2. Include specific, actionable prompts for exploration
3. Progress from introductory to more advanced concepts
4. Encourage critical thinking and analysis
5. Connect to real-world applications or practical use cases

Format each suggestion to be clear, specific, and phrased as an actionable request.
For example: "**Explore the relationship between X and Y to understand how they influence each other in different contexts**"

Make these suggestions intellectually stimulating and designed to foster deeper understanding.`;
    
    if (document) {
      systemPrompt = `You are analyzing a document titled "${document.fileName}" along with the current conversation.

Generate 5-7 specific educational suggestions that would help the user better understand or work with this document's content. 

Your suggestions should:
1. Address key concepts, methodologies, findings, and implications in the document
2. Progress from basic understanding to critical analysis
3. Include prompts for comparing information in the document with other sources or perspectives
4. Suggest practical applications of the document's content
5. Identify areas where the document's approach could be expanded or improved

Format each suggestion as a clear, specific, and actionable prompt that the user can click on.
For example: "**Analyze the methodology described in section X to evaluate its strengths and limitations**"

These should be concrete, educational prompts that foster deeper engagement with the document.`;
    }
    
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
        return [
          "**What foundational concepts would you like to explore in this topic?**",
          "**How would you like to apply this knowledge in practical scenarios?**",
          "**What specific aspects of this subject interest you most for deeper analysis?**",
          "**Would you like to examine the historical development of these ideas?**",
          "**How about exploring the current debates or controversies in this field?**"
        ];
      }
      
      // Add a default minimal message if somehow we have empty messages
      if (validMessages.length < messages.length) {
        console.warn(`Filtered out ${messages.length - validMessages.length} empty messages before API call`);
      }
      
      // Generate suggestions
      const suggestionsResponse = await this.modelService.generateChat([...validMessages, suggestionPrompt]);
      
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
      return [
        "**What foundational concepts would you like to explore in this topic?**",
        "**How would you like to apply this knowledge in practical scenarios?**",
        "**What specific aspects of this subject interest you most for deeper analysis?**",
        "**Would you like to examine the historical development of these ideas?**",
        "**How about exploring the current debates or controversies in this field?**"
      ];
    }
  }
} 