import { EventEmitter } from 'events';

// Define types based on the specifications
interface AIProviderConfig {
  id: string;
  type: string; // openai, anthropic, google, openai_compatible, local, etc.
  config: {
    name: string;
    endpoint: string;
    authType: string;
    modelsEndpoint?: string | null;
    chatEndpoint: string;
    capabilities?: ProviderCapabilities;
    extraHeaders?: Record<string, string>;
    fallbackModels?: string[];
  };
  selectedModel: string | null;
}

interface ProviderCapabilities {
  chat: boolean;
  embeddings: boolean;
  streaming: boolean;
  functionCalling: boolean;
  codeGeneration: boolean;
  largeContext: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

interface ChatResponse {
  content: string;
  model: string;
  finishReason?: string;
}

interface EmbeddingResponse {
  embedding: number[];
  model: string;
}

class AIControlPlane extends EventEmitter {
  private providers: AIProviderConfig[] = [];
  private currentProviderId: string | null = null;

  constructor() {
    super();
  }

  // Add a new provider to the system
  addProvider(provider: AIProviderConfig): void {
    this.providers.push(provider);
    this.emit('providerAdded', provider);
  }

  // Remove a provider from the system
  removeProvider(providerId: string): void {
    this.providers = this.providers.filter(p => p.id !== providerId);
    if (this.currentProviderId === providerId) {
      this.currentProviderId = null;
    }
    this.emit('providerRemoved', providerId);
  }

  // Get all configured providers
  getProviders(): AIProviderConfig[] {
    return this.providers;
  }

  // Set the current active provider
  setCurrentProvider(providerId: string): void {
    const providerExists = this.providers.some(p => p.id === providerId);
    if (!providerExists) {
      throw new Error(`Provider with ID ${providerId} does not exist`);
    }
    this.currentProviderId = providerId;
    this.emit('currentProviderChanged', providerId);
  }

  // Get the current provider
  getCurrentProvider(): AIProviderConfig | null {
    if (!this.currentProviderId) return null;
    return this.providers.find(p => p.id === this.currentProviderId) || null;
  }

  // Get the current model
  getCurrentModel(): string | null {
    const provider = this.getCurrentProvider();
    return provider ? provider.selectedModel : null;
  }

  // Fetch models from a provider's API
  async fetchModels(providerId: string): Promise<string[]> {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) {
      throw new Error(`Provider with ID ${providerId} does not exist`);
    }

    const { config } = provider;
    if (!config.modelsEndpoint) {
      // If no models endpoint exists, return fallback models
      return config.fallbackModels || [];
    }

    try {
      const response = await fetch(`${config.endpoint}${config.modelsEndpoint}`, {
        headers: {
          'Authorization': `Bearer ${await this.getApiKey(providerId)}`,
          'Content-Type': 'application/json',
          ...config.extraHeaders,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract model names from the response (structure varies by provider)
      if (Array.isArray(data.data)) {
        // OpenAI-style response
        return data.data.map((model: any) => model.id);
      } else if (Array.isArray(data)) {
        // Direct array response
        return data.map((model: any) => typeof model === 'string' ? model : model.id);
      } else if (data.models) {
        // Alternative structure
        return Array.isArray(data.models) ? data.models.map((m: any) => m.id) : [];
      } else {
        // Fallback to fallback models
        return config.fallbackModels || [];
      }
    } catch (error) {
      console.warn(`Failed to fetch models from provider ${providerId}, using fallbacks:`, error);
      return config.fallbackModels || [];
    }
  }

  // Test connection to a provider
  async testConnection(providerId: string): Promise<boolean> {
    try {
      // Try to fetch models as a connectivity test
      const models = await this.fetchModels(providerId);
      return models.length > 0;
    } catch (error) {
      console.error(`Connection test failed for provider ${providerId}:`, error);
      return false;
    }
  }

  // Get API key from secure storage (simulated)
  private async getApiKey(providerId: string): Promise<string> {
    // In a real implementation, this would retrieve the key from OS keychain
    // For simulation, we'll return a dummy key
    return 'dummy-api-key-for-simulation';
  }

  // Main chat method that routes to the appropriate provider
  async chat(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    const provider = this.getCurrentProvider();
    if (!provider) {
      throw new Error('No provider selected');
    }

    if (!provider.selectedModel && !options.model) {
      throw new Error('No model selected for the current provider');
    }

    const model = options.model || provider.selectedModel;
    if (!model) {
      throw new Error('No model specified');
    }

    // Check if provider has chat capability
    if (!this.checkCapability('chat')) {
      throw new Error('Current provider does not support chat');
    }

    // Route to the appropriate provider implementation
    switch (provider.type) {
      case 'openai':
      case 'openai_compatible':
        return this.callOpenAICompatible(provider, messages, { ...options, model });
      case 'anthropic':
        return this.callAnthropic(provider, messages, { ...options, model });
      case 'google':
        return this.callGoogle(provider, messages, { ...options, model });
      case 'local':
        return this.callLocal(provider, messages, { ...options, model });
      default:
        return this.callOpenAICompatible(provider, messages, { ...options, model });
    }
  }

  // Generate embeddings (if supported)
  async generateEmbedding(text: string): Promise<EmbeddingResponse> {
    const provider = this.getCurrentProvider();
    if (!provider) {
      throw new Error('No provider selected');
    }

    if (!this.checkCapability('embeddings')) {
      throw new Error('Current provider does not support embeddings');
    }

    // Implementation would depend on the specific provider
    // For now, returning a simulated response
    return {
      embedding: Array(1536).fill(0).map(() => Math.random()),
      model: provider.selectedModel || 'unknown'
    };
  }

  // Check if the current provider has a specific capability
  checkCapability(capability: keyof ProviderCapabilities): boolean {
    const provider = this.getCurrentProvider();
    if (!provider || !provider.config.capabilities) {
      return false;
    }
    return !!provider.config.capabilities[capability];
  }

  // Require a specific capability (throws error if not available)
  requireCapability(capability: keyof ProviderCapabilities): void {
    if (!this.checkCapability(capability)) {
      throw new Error(`Current provider does not support ${capability}`);
    }
  }

  // Resolve model for a specific capability
  resolveModelFor(capability: string): string {
    const model = this.getCurrentModel();
    if (!model) {
      throw new Error(`No model available for capability: ${capability}`);
    }
    return model;
  }

  // Provider-specific implementations
  private async callOpenAICompatible(
    provider: AIProviderConfig,
    messages: ChatMessage[],
    options: ChatOptions & { model: string }
  ): Promise<ChatResponse> {
    const { endpoint, chatEndpoint, extraHeaders } = provider.config;
    
    const response = await fetch(`${endpoint}${chatEndpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getApiKey(provider.id)}`,
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: JSON.stringify({
        model: options.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        stream: options.stream ?? false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      finishReason: data.choices[0].finish_reason,
    };
  }

  private async callAnthropic(
    provider: AIProviderConfig,
    messages: ChatMessage[],
    options: ChatOptions & { model: string }
  ): Promise<ChatResponse> {
    // Anthropic has a different API structure
    // Convert our messages to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${provider.config.endpoint}${provider.config.chatEndpoint}`, {
      method: 'POST',
      headers: {
        'x-api-key': await this.getApiKey(provider.id),
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        ...provider.config.extraHeaders,
      },
      body: JSON.stringify({
        model: options.model,
        system: systemMessage,
        messages: nonSystemMessages,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      model: options.model,
      finishReason: data.stop_reason,
    };
  }

  private async callGoogle(
    provider: AIProviderConfig,
    messages: ChatMessage[],
    options: ChatOptions & { model: string }
  ): Promise<ChatResponse> {
    // Google Gemini API format
    const formattedMessages = messages
      .filter(m => m.role !== 'system') // Google Gemini doesn't support system messages in the same way
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    const response = await fetch(
      `${provider.config.endpoint}/${options.model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: formattedMessages,
          generationConfig: {
            temperature: options.temperature,
            maxOutputTokens: options.maxTokens,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Google API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      model: options.model,
      finishReason: data.candidates[0].finishReason,
    };
  }

  private async callLocal(
    provider: AIProviderConfig,
    messages: ChatMessage[],
    options: ChatOptions & { model: string }
  ): Promise<ChatResponse> {
    // For local providers like Ollama
    const response = await fetch(`${provider.config.endpoint}${provider.config.chatEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages,
        options: {
          temperature: options.temperature ?? 0.7,
        },
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Local API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.message.content,
      model: options.model,
      finishReason: 'stop',
    };
  }
}

export { AIControlPlane, type AIProviderConfig, type ChatMessage, type ChatOptions, type ChatResponse };