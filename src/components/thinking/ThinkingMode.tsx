import React, { useState, useEffect } from 'react';

interface ThinkingModeProps {
  thinking: string;
  onComplete: () => void;
  answer?: string;
}

const ThinkingMode: React.FC<ThinkingModeProps> = ({ thinking, onComplete, answer }) => {
  const [displayedThinking, setDisplayedThinking] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [typingSpeed] = useState(100);
  const [showFull, setShowFull] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (!thinking) return;
    
    let displayText = '';
    let charIndex = 0;
    
    // For very long thinking content, use faster chunk-based processing
    if (thinking.length > 1000) {
      const chunkSize = 5;
      
      const interval = setInterval(() => {
        if (charIndex < thinking.length) {
          const remainingChars = thinking.length - charIndex;
          const charsToAdd = Math.min(chunkSize, remainingChars);
          displayText += thinking.substring(charIndex, charIndex + charsToAdd);
          setDisplayedThinking(displayText);
          charIndex += charsToAdd;
        } else {
          clearInterval(interval);
          setIsComplete(true);
        }
      }, 1000 / typingSpeed);
      
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        if (charIndex < thinking.length) {
          displayText += thinking.charAt(charIndex);
          setDisplayedThinking(displayText);
          charIndex++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
        }
      }, 1000 / typingSpeed);
      
      return () => clearInterval(interval);
    }
  }, [thinking, typingSpeed]);

  const handleSkipAnimation = () => {
    setDisplayedThinking(thinking);
    setIsComplete(true);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    onComplete();
  };

  return (
    <div className="thinking-mode-container bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-400 rounded-lg p-5 my-4 shadow-xl max-w-5xl mx-auto animate-fadeIn">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-purple-500 dark:bg-purple-600 flex items-center justify-center mr-3 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M20.2 8.9V7.5C20.2 5.3 19 3.1 16.8 1.8C14.6 0.5 12 0.5 9.8 1.8C7.6 3.1 6.3 5.3 6.3 7.5V8.9C4.8 9.4 3.7 10.8 3.7 12.3V14.7C3.7 16.7 5.3 18.3 7.3 18.3H9V17.5H7.3C5.8 17.5 4.5 16.2 4.5 14.7V12.3C4.5 10.8 5.8 9.5 7.3 9.5H19.3C20.8 9.5 22.1 10.8 22.1 12.3V14.7C22.1 16.2 20.8 17.5 19.3 17.5H17.7V18.3H19.3C21.3 18.3 22.9 16.7 22.9 14.7V12.3C22.9 10.8 21.8 9.4 20.2 8.9ZM19.3 8.7H7.2V7.5C7.2 5.6 8.3 3.8 10.2 2.7C12.1 1.6 14.3 1.6 16.2 2.7C18.1 3.8 19.2 5.6 19.2 7.5V8.7H19.3Z"/>
              <path d="M13.3 20.3C14.2 20.3 15 19.5 15 18.6V17C15 16.1 14.2 15.3 13.3 15.3C12.4 15.3 11.6 16.1 11.6 17V18.6C11.6 19.5 12.4 20.3 13.3 20.3Z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              AI Thinking Process
              {!isComplete && (
                <div className="ml-3 flex">
                  <span className="animate-bounce delay-100 text-purple-500 dark:text-purple-400 mx-1">●</span>
                  <span className="animate-bounce delay-200 text-purple-500 dark:text-purple-400 mx-1">●</span>
                  <span className="animate-bounce delay-300 text-purple-500 dark:text-purple-400 mx-1">●</span>
                </div>
              )}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Watch how I solve this step by step</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isComplete && (
            <button 
              onClick={handleSkipAnimation}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Skip Animation
            </button>
          )}
          {isComplete && !showAnswer && (
            <button 
              onClick={() => setShowFull(!showFull)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {showFull ? "Show Less" : "Show Full"}
            </button>
          )}
        </div>
      </div>
      
      <div className={`thinking-content font-mono text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700 relative ${
        !showFull && displayedThinking.length > 800 ? "max-h-96 overflow-y-auto" : ""
      }`}>
        {displayedThinking ? (
          <div className="text-gray-800 dark:text-gray-300">
            {displayedThinking}
          </div>
        ) : (
          <div className="text-gray-400 dark:text-gray-500 animate-pulse">
            Organizing thoughts...
          </div>
        )}
        
        {!showFull && displayedThinking.length > 800 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent pointer-events-none"></div>
        )}
      </div>

      {showAnswer && answer && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Final Answer</h4>
          <div className="text-green-700 dark:text-green-300 whitespace-pre-wrap">
            {answer}
          </div>
        </div>
      )}
      
      {isComplete && !showAnswer && (
        <div className="mt-4 flex justify-end gap-3">
          {!showFull && displayedThinking.length > 800 && (
            <button 
              onClick={() => setShowFull(true)}
              className="px-3 py-1.5 text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 transition"
            >
              Show Full Thinking
            </button>
          )}
          <button 
            onClick={handleShowAnswer}
            className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition shadow-sm animate-pulse"
          >
            Show Final Answer
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

export default ThinkingMode; 