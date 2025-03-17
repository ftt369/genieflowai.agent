import React, { useEffect, useState } from 'react';
import { useAiAssistant } from '../services/aiAssistantService';
import { useDocumentStore } from '../stores/documentStore';
import { Message } from '../services/modelService';

interface ResearchAssistantProps {
  messages: Message[];
  onSuggestionClick: (suggestion: string) => void;
}

const ResearchAssistant: React.FC<ResearchAssistantProps> = ({ 
  messages, 
  onSuggestionClick 
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [researchFlows, setResearchFlows] = useState<string[]>([]);
  const [proactiveQuestions, setProactiveQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'flows' | 'questions'>('suggestions');
  const aiAssistant = useAiAssistant();
  const currentDocument = useDocumentStore(state => state.getCurrentDocument());
  
  // Generate research content automatically when messages change or document changes
  useEffect(() => {
    console.log("ResearchAssistant: Component mounted or messages/document changed");
    
    // Only proceed if we have messages to analyze (document is optional)
    if (messages.length === 0) return;
    
    if (currentDocument) {
      console.log("ResearchAssistant: Document loaded, analyzing conversation with document:", currentDocument.fileName);
    } else {
      console.log("ResearchAssistant: No document loaded, analyzing conversation only");
    }
    
    const generateResearchContent = async () => {
      setLoading(true);
      
      try {
        // Generate different types of research content
        const generateAll = async () => {
          console.log("ResearchAssistant: Generating suggestions, flows, and questions");
          
          // 1. Generate suggestions based on conversation and document if available
          let newSuggestions: string[] = [];
          try {
            if (currentDocument) {
              // With document
              newSuggestions = await aiAssistant.generateProactiveSuggestions(
                messages,
                currentDocument
              );
            } else {
              // Without document - generate from conversation only
              const filteredMessages = messages.filter(msg => msg.content && msg.content.trim() !== '');
              if (filteredMessages.length > 0) {
                const suggestionPrompt: Message = {
                  role: 'system',
                  content: `Based on the current conversation about "${getConversationTopic(filteredMessages)}", generate 3-5 follow-up questions or suggestions that would help deepen the research and understanding. Format as simple, actionable prompts.`
                };
                const suggestionsResponse = await aiAssistant.getModelService().generateChat([...filteredMessages, suggestionPrompt]);
                newSuggestions = suggestionsResponse
                  .split(/\d+\./)
                  .filter(line => line.trim().length > 0)
                  .map(line => line.trim());
              } else {
                newSuggestions = [
                  "What would you like to know more about?",
                  "Do you have any specific questions I can help with?",
                  "Would you like some general research suggestions?"
                ];
              }
            }
          } catch (error) {
            console.error("Error generating suggestions:", error);
            newSuggestions = [
              "What would you like to know more about?",
              "Do you have any specific questions I can help with?",
              "Would you like some general research suggestions?"
            ];
          }
          console.log("ResearchAssistant: Generated suggestions:", newSuggestions);
          setSuggestions(newSuggestions);
          
          // 2. Generate research flows
          try {
            const filteredMessages = messages.filter(msg => msg.content && msg.content.trim() !== '');
            if (filteredMessages.length > 0) {
              const flowPrompt: Message = {
                role: 'system',
                content: `Based on the conversation about "${getConversationTopic(filteredMessages)}"${currentDocument ? ` and the document "${currentDocument.fileName}"` : ''}, create 3-5 educational research flows that would help deepen understanding through progressive learning.

Each research flow should:
1. Start with a foundational concept or question
2. Build to intermediate understanding with 2-3 progressive steps
3. End with an advanced question or exploration that challenges assumptions

Format as multi-line structured flows with clear titles and educational progression. For example:
"**Research Flow: [Title]**
- Step 1: [Basic concept/question]
- Step 2: [Deeper exploration]
- Step 3: [Advanced application/critical thinking]"

Make these flows highly educational and designed to promote deeper learning.`
              };
              const flowsResponse = await aiAssistant.getModelService().generateChat([...filteredMessages, flowPrompt]);
              const extractedFlows = flowsResponse
                .split(/\*\*Research Flow:|Flow \d+:/)
                .filter(line => line.trim().length > 0)
                .map(line => {
                  // Format as a complete research flow with proper formatting
                  const formattedFlow = line.trim().startsWith('**') ? line.trim() : `**Research Flow: ${line.trim()}`;
                  return formattedFlow;
                });
              console.log("ResearchAssistant: Generated research flows:", extractedFlows);  
              setResearchFlows(extractedFlows);
            } else {
              setResearchFlows([
                "**Research Flow: Foundational Understanding**\n- Step 1: Explore basic principles and terminology\n- Step 2: Study key components and relationships\n- Step 3: Analyze how these foundations apply in different contexts",
                "**Research Flow: Critical Analysis**\n- Step 1: Identify main arguments and evidence\n- Step 2: Evaluate strengths and limitations\n- Step 3: Formulate your own perspective based on evidence",
                "**Research Flow: Practical Applications**\n- Step 1: Discover real-world examples\n- Step 2: Examine implementation methods\n- Step 3: Consider how to adapt concepts to new situations"
              ]);
            }
          } catch (error) {
            console.error("Error generating research flows:", error);
            setResearchFlows([
              "**Research Flow: Foundational Understanding**\n- Step 1: Explore basic principles and terminology\n- Step 2: Study key components and relationships\n- Step 3: Analyze how these foundations apply in different contexts",
              "**Research Flow: Critical Analysis**\n- Step 1: Identify main arguments and evidence\n- Step 2: Evaluate strengths and limitations\n- Step 3: Formulate your own perspective based on evidence",
              "**Research Flow: Practical Applications**\n- Step 1: Discover real-world examples\n- Step 2: Examine implementation methods\n- Step 3: Consider how to adapt concepts to new situations"
            ]);
          }
          
          // 3. Generate proactive questions
          try {
            const filteredMessages = messages.filter(msg => msg.content && msg.content.trim() !== '');
            if (filteredMessages.length > 0) {
              const questionPrompt: Message = {
                role: 'system',
                content: `Based on the conversation about "${getConversationTopic(filteredMessages)}"${currentDocument ? ` and the document "${currentDocument.fileName}"` : ''}, generate 5-7 thought-provoking questions that promote deeper learning and critical thinking.

Your questions should:
1. Challenge existing assumptions and encourage new perspectives
2. Span different cognitive levels (from understanding to analysis to synthesis)
3. Connect this topic to broader contexts, related fields, or real-world applications
4. Include questions that address theoretical foundations and practical implications
5. Encourage exploration of evidence, counterarguments, and limitations

Format each question with a brief context explaining why it's valuable to explore (1-2 sentences).
For example: "**[Question]** (This explores the underlying mechanisms and challenges conventional wisdom about X)"

Make these questions intellectually stimulating and designed to promote further independent research.`
              };
              const questionsResponse = await aiAssistant.getModelService().generateChat([...filteredMessages, questionPrompt]);
              const extractedQuestions = questionsResponse
                .split(/\d+[\.\)]\s+|\n\n/)
                .filter(line => line.trim().length > 0 && (line.includes('?') || line.startsWith('**')))
                .map(line => line.trim());
              console.log("ResearchAssistant: Generated questions:", extractedQuestions);
              setProactiveQuestions(extractedQuestions);
            } else {
              setProactiveQuestions([
                "**What are the fundamental principles that underlie this topic?** (Understanding the core concepts will help build a solid foundation for more advanced exploration)",
                "**How has our understanding of this subject evolved over time?** (This explores the historical context and how knowledge development shapes current perspectives)",
                "**What are the most significant criticisms or limitations of the current approaches?** (Examining limitations helps identify areas for improvement and deeper analysis)",
                "**How might this knowledge be applied in different contexts or disciplines?** (Exploring applications encourages creative thinking and interdisciplinary connections)",
                "**What ethical considerations or societal implications should be considered?** (This promotes thinking about broader impacts beyond the technical aspects)"
              ]);
            }
          } catch (error) {
            console.error("Error generating proactive questions:", error);
            setProactiveQuestions([
                "**What are the fundamental principles that underlie this topic?** (Understanding the core concepts will help build a solid foundation for more advanced exploration)",
                "**How has our understanding of this subject evolved over time?** (This explores the historical context and how knowledge development shapes current perspectives)",
                "**What are the most significant criticisms or limitations of the current approaches?** (Examining limitations helps identify areas for improvement and deeper analysis)",
                "**How might this knowledge be applied in different contexts or disciplines?** (Exploring applications encourages creative thinking and interdisciplinary connections)",
                "**What ethical considerations or societal implications should be considered?** (This promotes thinking about broader impacts beyond the technical aspects)"
            ]);
          }
        };
        
        generateAll();
      } catch (error) {
        console.error('Failed to generate research content:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Always generate content when there are enough messages (regardless of document)
    if (messages.length >= 1) {
      generateResearchContent();
    }
  }, [messages, currentDocument, aiAssistant]);
  
  // Helper to extract conversation topic from messages
  const getConversationTopic = (msgs: Message[]): string => {
    // Get the first user message or a default topic
    const firstUserMessage = msgs.find(m => m.role === 'user');
    return firstUserMessage?.content.substring(0, 40) + '...' || 'the current topic';
  };
  
  // Handle when user clicks a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick(suggestion);
  };
  
  // Always render something useful, even without messages or documents
  return (
    <div className="research-assistant bg-card rounded-lg p-4 shadow-sm border border-border">
      <div className="flex items-center space-x-2 mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h3 className="font-semibold text-sm">Research Assistant</h3>
      </div>
      
      {currentDocument && (
        <div className="mb-3">
          <h4 className="text-xs text-muted-foreground mb-2">Analyzing: {currentDocument.fileName}</h4>
        </div>
      )}
      
      {/* Check if we have messages to analyze */}
      {messages.length === 0 ? (
        // Empty state when no conversation is happening
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Start a conversation to get research insights and suggestions.
          </p>
          <div className="grid grid-cols-2 gap-2 w-full max-w-xs mx-auto">
            <button
              className="text-xs p-2 bg-primary/5 hover:bg-primary/10 rounded text-center"
              onClick={() => onSuggestionClick("Tell me about black holes")}
            >
              Black Holes
            </button>
            <button
              className="text-xs p-2 bg-primary/5 hover:bg-primary/10 rounded text-center"
              onClick={() => onSuggestionClick("Explain quantum computing")}
            >
              Quantum Computing
            </button>
            <button
              className="text-xs p-2 bg-primary/5 hover:bg-primary/10 rounded text-center"
              onClick={() => onSuggestionClick("Latest AI developments")}
            >
              AI Developments
            </button>
            <button
              className="text-xs p-2 bg-primary/5 hover:bg-primary/10 rounded text-center"
              onClick={() => onSuggestionClick("Climate change research")}
            >
              Climate Research
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tab navigation */}
          <div className="flex border-b border-border mb-3">
            <button
              className={`text-xs px-3 py-2 ${activeTab === 'suggestions' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('suggestions')}
            >
              Suggestions
            </button>
            <button
              className={`text-xs px-3 py-2 ${activeTab === 'flows' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('flows')}
            >
              Research Flows
            </button>
            <button
              className={`text-xs px-3 py-2 ${activeTab === 'questions' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('questions')}
            >
              Questions
            </button>
          </div>
          
          {/* Content based on active tab */}
          <div className="tab-content">
            {loading ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="ml-2 text-xs text-muted-foreground">Analyzing conversation...</span>
              </div>
            ) : (
              <>
                {/* Suggestions Tab */}
                {activeTab === 'suggestions' && (
                  <div className="suggestions space-y-2">
                    <h4 className="text-xs font-medium">Learning pathways:</h4>
                    {suggestions.length > 0 ? (
                      <ul className="space-y-1.5">
                        {suggestions.map((suggestion, index) => (
                          <li key={index}>
                            <button
                              className="text-xs text-left w-full px-2 py-1.5 rounded-md hover:bg-accent transition-colors duration-200 flex items-start"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <span className="text-primary mr-1.5">•</span>
                              <span dangerouslySetInnerHTML={{ __html: suggestion.replace(/\*\*/g, '<strong>').replace(/\*\*/g, '</strong>') }} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No learning pathways available yet. Try asking a specific question to generate suggestions.
                      </p>
                    )}
                  </div>
                )}
                
                {/* Research Flows Tab */}
                {activeTab === 'flows' && (
                  <div className="research-flows space-y-2">
                    <h4 className="text-xs font-medium">Educational research flows:</h4>
                    {researchFlows.length > 0 ? (
                      <ul className="space-y-3">
                        {researchFlows.map((flow, index) => (
                          <li key={index} className="bg-muted/20 rounded-md p-2.5">
                            <button
                              className="text-xs text-left w-full"
                              onClick={() => handleSuggestionClick(flow)}
                            >
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: flow
                                    .replace(/\*\*/g, '<strong>')
                                    .replace(/\*\*/g, '</strong>')
                                    .replace(/\n- /g, '<br/>• ')
                                    .replace(/\n/g, '<br/>') 
                                }} 
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No research flows available yet. Continue your conversation to generate learning pathways.
                      </p>
                    )}
                  </div>
                )}
                
                {/* Questions Tab */}
                {activeTab === 'questions' && (
                  <div className="proactive-questions space-y-2">
                    <h4 className="text-xs font-medium">Deeper learning questions:</h4>
                    {proactiveQuestions.length > 0 ? (
                      <ul className="space-y-2">
                        {proactiveQuestions.map((question, index) => (
                          <li key={index}>
                            <button
                              className="text-xs text-left w-full px-2 py-1.5 rounded-md hover:bg-accent transition-colors duration-200"
                              onClick={() => handleSuggestionClick(question)}
                            >
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: question
                                    .replace(/\*\*/g, '<strong>')
                                    .replace(/\*\*/g, '</strong>')
                                    .replace(/\(([^)]+)\)/g, '<span class="text-muted-foreground">($1)</span>')
                                }} 
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No questions available yet. Continue your conversation to generate thought-provoking questions.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="research-tools mt-4 pt-3 border-t border-border">
            <h4 className="text-xs font-medium mb-2">Learning Tools:</h4>
            <div className="grid grid-cols-2 gap-2">
              <button 
                className="text-xs p-2 bg-primary/5 hover:bg-primary/10 rounded flex items-center justify-center"
                onClick={() => onSuggestionClick(currentDocument 
                  ? "Summarize this document and highlight the key learning points" 
                  : "Create a structured learning outline based on what we've discussed so far")}
              >
                <span>Learning Outline</span>
              </button>
              <button 
                className="text-xs p-2 bg-primary/5 hover:bg-primary/10 rounded flex items-center justify-center"
                onClick={() => onSuggestionClick(currentDocument
                  ? "Extract the key concepts and explain how they relate to each other" 
                  : "What are the most important concepts we've covered and how do they connect?")}
              >
                <span>Key Concepts</span>
              </button>
              <button 
                className="text-xs p-2 bg-primary/5 hover:bg-primary/10 rounded flex items-center justify-center"
                onClick={() => onSuggestionClick(currentDocument
                  ? "Develop a step-by-step learning pathway to master this content" 
                  : "Help me create a structured learning plan for this topic")}
              >
                <span>Learning Plan</span>
              </button>
              <button 
                className="text-xs p-2 bg-primary/5 hover:bg-primary/10 rounded flex items-center justify-center"
                onClick={() => onSuggestionClick(currentDocument
                  ? "What questions should I ask to critically evaluate this content?"
                  : "Help me develop critical thinking questions about this topic")}
              >
                <span>Critical Thinking</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResearchAssistant; 