import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Paperclip, Square, Send } from 'lucide-react';
import { ChatSkeleton } from '../skeletons/ChatSkeleton';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: 'Hello! I\'m your AI assistant. How can I help you with your code today?',
  timestamp: new Date(Date.now() - 300000),
};

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    WELCOME_MESSAGE,
    {
      id: '2',
      role: 'user',
      content: 'Can you help me review the code in src/App.tsx?',
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: '3',
      role: 'assistant',
      content: 'Sure! I can help you review the code in src/App.tsx. Give me a moment to analyze it.',
      timestamp: new Date(Date.now() - 180000),
    },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsGenerating(true);
    
    // Simulate AI response
    setTimeout(() => {
      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I received your message: "${inputValue}". In a real implementation, I would analyze your code and provide helpful feedback.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
      setIsGenerating(false);
    }, 1500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for new conversation event from keyboard shortcut
  useEffect(() => {
    const handleNewConversation = () => {
      setMessages([WELCOME_MESSAGE]);
      setInputValue('');
    };

    window.addEventListener('aide:new-conversation', handleNewConversation);
    return () => window.removeEventListener('aide:new-conversation', handleNewConversation);
  }, []);
  
  const getMessageClass = (role: string) => {
    switch(role) {
      case 'user':
        return 'ml-auto bg-primary text-primary-foreground rounded-2xl rounded-br-none';
      case 'assistant':
        return 'bg-secondary text-secondary-foreground rounded-2xl rounded-bl-none';
      case 'system':
        return 'text-center text-muted-foreground text-sm italic';
      default:
        return '';
    }
  };
  
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`max-w-[80%] p-4 ${getMessageClass(message.role)}`}
          >
            <div className="flex items-start space-x-2">
              {message.role === 'assistant' ? (
                <Bot className="h-6 w-6 mt-0.5 flex-shrink-0" />
              ) : (
                <User className="h-6 w-6 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-medium mb-1">
                  {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
            <div className="text-xs opacity-70 mt-1 text-right">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="max-w-[80%] p-4 bg-secondary text-secondary-foreground rounded-2xl rounded-bl-none">
            <div className="flex items-start space-x-2">
              <Bot className="h-6 w-6 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium mb-1">AI Assistant</div>
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-current rounded-full animate-bounce delay-75"></div>
                  <div className="h-2 w-2 bg-current rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4" role="region" aria-label="Chat input">
        <div className="flex items-end space-x-2">
          <button
            className="p-2 rounded-full hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Attach file"
            type="button"
          >
            <Paperclip className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message your AI assistant..."
              className="w-full min-h-[60px] max-h-32 p-3 pr-10 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={1}
              aria-label="Message input"
            />
          </div>
          
          {isGenerating ? (
            <button
              className="p-3 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
              onClick={() => setIsGenerating(false)}
              aria-label="Stop generating"
              type="button"
            >
              <Square className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : (
            <button
              className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              onClick={handleSendMessage}
              disabled={inputValue.trim() === ''}
              aria-label="Send message"
              type="button"
            >
              <Send className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};