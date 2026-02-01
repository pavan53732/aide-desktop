import { create } from 'zustand';
import { AIProviderConfig, AIControlPlane } from '../lib/ai/AIControlPlane';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface AppState {
  // AI Provider Management
  aiProviders: Record<string, AIProviderConfig>;
  selectedProvider: string | null;
  selectedModel: string | null;
  
  // Workspace Management
  selectedWorkspace: { id: string; name: string; path: string } | null;
  selectedFile: string | null;
  
  // UI State
  isGenerating: boolean;
  isSidebarOpen: boolean;
  isActivityLogOpen: boolean;
  showSettings: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // Actions
  setAiProviders: (providers: Record<string, AIProviderConfig>) => void;
  setSelectedProvider: (provider: string | null) => void;
  setSelectedModel: (model: string | null) => void;
  setSelectedWorkspace: (workspace: { id: string; name: string; path: string } | null) => void;
  setSelectedFile: (file: string | null) => void;
  setIsGenerating: (generating: boolean) => void;
  toggleSidebar: () => void;
  toggleActivityLog: () => void;
  setShowSettings: (show: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Initialize default providers
  initializeDefaultProviders: () => void;
}

export const useAppStore = create<AppState>((set, get) => {
  return {
    aiProviders: {},
    selectedProvider: null,
    selectedModel: null,
    selectedWorkspace: null,
    selectedFile: null,
    isGenerating: false,
    isSidebarOpen: true,
    isActivityLogOpen: true,
    showSettings: false,
    notifications: [],
    
    setAiProviders: (providers) => set({ aiProviders: providers }),
    setSelectedProvider: (provider) => set({ selectedProvider: provider }),
    setSelectedModel: (model) => set({ selectedModel: model }),
    setSelectedWorkspace: (workspace) => set({ selectedWorkspace: workspace }),
    setSelectedFile: (file) => set({ selectedFile: file }),
    setIsGenerating: (generating) => set({ isGenerating: generating }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    toggleActivityLog: () => set((state) => ({ isActivityLogOpen: !state.isActivityLogOpen })),
    setShowSettings: (show) => set({ showSettings: show }),
    
    addNotification: (notificationData) => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        ...notificationData,
        timestamp: new Date(),
        read: false
      };
      
      set((state) => ({
        notifications: [newNotification, ...state.notifications.slice(0, 19)] // Keep only last 20 notifications
      }));
    },
    
    removeNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter(notif => notif.id !== id)
      }));
    },
    
    markAsRead: (id) => {
      set((state) => ({
        notifications: state.notifications.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      }));
    },
    
    clearAllNotifications: () => set({ notifications: [] }),
    
    initializeDefaultProviders: () => {
      const defaultProviders: Record<string, AIProviderConfig> = {
        openai: {
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
            fallbackModels: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
            authCredentials: {
              apiKey: ''
            }
          },
          selectedModel: null
        },
        anthropic: {
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
            fallbackModels: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
            authCredentials: {
              apiKey: ''
            }
          },
          selectedModel: null
        },
        ollama: {
          id: 'ollama',
          type: 'local',
          config: {
            name: 'Ollama',
            endpoint: 'http://localhost:11434/api',
            authType: 'none',
            modelsEndpoint: '/tags',
            chatEndpoint: '/chat',
            capabilities: {
              chat: true,
              embeddings: false,
              streaming: true,
              functionCalling: false,
              codeGeneration: true,
              largeContext: true
            },
            fallbackModels: ['llama3', 'mistral', 'phi3'],
            authCredentials: {
              apiKey: ''
            }
          },
          selectedModel: null
        }
      };
      
      set({ aiProviders: defaultProviders });
    }
  };
});