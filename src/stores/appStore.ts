import { create } from 'zustand';
import { AIProviderConfig, AIControlPlane } from '../lib/ai/AIControlPlane';

interface AppState {
  // AI Provider Management
  aiControlPlane: AIControlPlane;
  providers: AIProviderConfig[];
  currentProviderId: string | null;
  
  // Workspace Management
  workspacePath: string | null;
  selectedFile: string | null;
  
  // UI State
  isGenerating: boolean;
  isSidebarOpen: boolean;
  isActivityLogOpen: boolean;
  
  // Actions
  addProvider: (provider: AIProviderConfig) => void;
  removeProvider: (providerId: string) => void;
  setCurrentProvider: (providerId: string) => void;
  setWorkspacePath: (path: string) => void;
  setSelectedFile: (file: string | null) => void;
  setIsGenerating: (generating: boolean) => void;
  toggleSidebar: () => void;
  toggleActivityLog: () => void;
  initializeProviders: () => void;
}

export const useAppStore = create<AppState>((set, get) => {
  const aiControlPlane = new AIControlPlane();
  
  return {
    aiControlPlane,
    providers: [],
    currentProviderId: null,
    workspacePath: null,
    selectedFile: null,
    isGenerating: false,
    isSidebarOpen: true,
    isActivityLogOpen: true,
    
    addProvider: (provider) => {
      aiControlPlane.addProvider(provider);
      set((state) => ({
        providers: [...state.providers, provider],
      }));
    },
    
    removeProvider: (providerId) => {
      aiControlPlane.removeProvider(providerId);
      set((state) => ({
        providers: state.providers.filter(p => p.id !== providerId),
        currentProviderId: state.currentProviderId === providerId ? null : state.currentProviderId,
      }));
    },
    
    setCurrentProvider: (providerId) => {
      aiControlPlane.setCurrentProvider(providerId);
      set({ currentProviderId: providerId });
    },
    
    setWorkspacePath: (path) => set({ workspacePath: path }),
    
    setSelectedFile: (file) => set({ selectedFile: file }),
    
    setIsGenerating: (generating) => set({ isGenerating: generating }),
    
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    
    toggleActivityLog: () => set((state) => ({ isActivityLogOpen: !state.isActivityLogOpen })),
    
    initializeProviders: () => {
      // Initialize with some default providers based on the specifications
      const defaultProviders: AIProviderConfig[] = [
        {
          id: 'openai',
          type: 'openai',
          config: {
            name: 'OpenAI',
            endpoint: 'https://api.openai.com/v1',
            authType: 'bearer',
            modelsEndpoint: '/models',
            chatEndpoint: '/chat/completions',
            capabilities: {
              chat: true,
              embeddings: true,
              streaming: true,
              functionCalling: true,
              codeGeneration: true,
              largeContext: true
            },
            fallbackModels: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']
          },
          selectedModel: null
        },
        {
          id: 'anthropic',
          type: 'anthropic',
          config: {
            name: 'Anthropic Claude',
            endpoint: 'https://api.anthropic.com/v1',
            authType: 'x-api-key',
            modelsEndpoint: null, // Anthropic doesn't have a models endpoint
            chatEndpoint: '/messages',
            capabilities: {
              chat: true,
              embeddings: false,
              streaming: true,
              functionCalling: true,
              codeGeneration: true,
              largeContext: true
            },
            fallbackModels: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
          },
          selectedModel: null
        },
        {
          id: 'openrouter',
          type: 'openai_compatible',
          config: {
            name: 'OpenRouter',
            endpoint: 'https://openrouter.ai/api/v1',
            authType: 'bearer',
            modelsEndpoint: '/models',
            chatEndpoint: '/chat/completions',
            capabilities: {
              chat: true,
              embeddings: false,
              streaming: true,
              functionCalling: true,
              codeGeneration: true,
              largeContext: true
            },
            extraHeaders: {
              'HTTP-Referer': 'https://aide-app.com',
              'X-Title': 'AIDE Desktop Editor'
            },
            fallbackModels: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro']
          },
          selectedModel: null
        }
      ];
      
      set({ providers: defaultProviders });
      
      // Add providers to the AI control plane
      defaultProviders.forEach(provider => {
        aiControlPlane.addProvider(provider);
      });
    }
  };
});