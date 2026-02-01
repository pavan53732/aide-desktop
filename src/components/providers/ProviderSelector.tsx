import React, { useState } from 'react';
import { ChevronDown, BrainCircuit } from 'lucide-react';
import { Button } from '../ui/Button';

interface Provider {
  id: string;
  name: string;
  type: string;
  selectedModel: string | null;
  status: 'connected' | 'configure' | 'error';
}

export const ProviderSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([
    {
      id: 'openai',
      name: 'OpenAI',
      type: 'Cloud',
      selectedModel: 'gpt-4-turbo',
      status: 'connected'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      type: 'Cloud',
      selectedModel: null,
      status: 'configure'
    },
    {
      id: 'ollama',
      name: 'Ollama',
      type: 'Local',
      selectedModel: 'llama3',
      status: 'connected'
    }
  ]);
  
  const currentProvider = providers.find(p => p.status === 'connected');
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <BrainCircuit className="h-4 w-4" />
        <span>
          {currentProvider?.name || 'No provider'} -{' '}
          {currentProvider?.selectedModel || 'No model selected'}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute left-0 top-10 w-80 bg-background border rounded-md shadow-lg z-50">
          <div className="p-2">
            {providers.map((provider) => (
              <div 
                key={provider.id} 
                className="p-3 border rounded mb-2 cursor-pointer hover:bg-accent"
                onClick={() => {
                  // Logic to select provider and fetch models would go here
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BrainCircuit className="h-4 w-4" />
                    <span className="font-medium">{provider.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    provider.status === 'connected' 
                      ? 'bg-green-100 text-green-800' 
                      : provider.status === 'configure' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {provider.status}
                  </span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {provider.selectedModel || 'No model selected'}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {provider.type} Provider
                </div>
              </div>
            ))}
            
            <button className="w-full p-2 text-center text-primary hover:bg-accent rounded">
              + Add New Provider...
            </button>
          </div>
        </div>
      )}
    </div>
  );
};