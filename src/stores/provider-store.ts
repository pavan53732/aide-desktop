import { create } from "zustand";
import { persist } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";

export interface ProviderConfig {
  // Additional provider-specific configuration
  monthlyCap?: number;
  sessionCap?: number;
  command?: string;
  args?: string;
  workingDirectory?: string;
  env?: Record<string, string>;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: "openai_compatible" | "openrouter" | "groq" | "anthropic" | "google" | "mistral" | "cohere" | "openai" | "local_inference" | "local" | "cli_agent" | "bedrock" | "vertex" | "replicate" | "huggingface" | "ai21" | "writer" | "reka" | "inflection" | "blackbox" | "opencode";
  endpoint?: string;
  modelsEndpoint?: string | null;
  authType: "bearer" | "x-api-key" | "custom" | "none" | "aws";
  customAuthHeader?: string;
  selectedModel: string | null;
  description?: string;
  fallbackModels?: string[];
  config?: ProviderConfig;
  enabled?: boolean;
  // Add a getter for the API key that fetches from keychain
  getApiKey?: () => Promise<string | undefined>;
}

export interface ModelInfo {
  id: string;
  name: string;
  contextWindow?: number;
  maxTokens?: number;
}

export type ModelState = "null" | "discovered" | "selected" | "invalid" | "reselect_required";

/**
 * Provider Store
 * 
 * Manages the state of AI providers, including their configurations,
 * available models, and the currently active provider/model.
 * Persists state to local storage.
 */
interface ProviderStore {
  /// The currently selected AI provider
  activeProvider: AIProviderConfig | null;
  /// The ID of the currently selected model
  activeModel: string | null;
  /// The state of the model selection (e.g., discovered, selected, invalid)
  modelState: ModelState;
  /// List of all configured providers
  providers: AIProviderConfig[];
  /// List of models available for the active provider
  availableModels: ModelInfo[];
  /// Whether the application is connected to the provider's API
  isConnected: boolean;
  /// Whether models are currently being fetched from the provider
  isFetchingModels: boolean;

  /**
   * Sets the active provider and restores its last selected model.
   */
  setActiveProvider: (provider: AIProviderConfig) => void;
  /**
   * Sets the active model and persists the choice to the provider's config.
   */
  setActiveModel: (modelId: string) => void;
  /**
   * Adds a new provider to the store.
   */
  addProvider: (provider: AIProviderConfig) => Promise<void>;
  /**
   * Removes a provider by ID.
   */
  removeProvider: (id: string) => void;
  /**
   * Updates an existing provider's configuration.
   */
  updateProvider: (id: string, updates: Partial<AIProviderConfig>) => Promise<void>;
  /**
   * Sets the list of available models for the current provider.
   */
  setAvailableModels: (models: ModelInfo[]) => void;
  /**
   * Sets the fetching state for models.
   */
  setIsFetchingModels: (isFetching: boolean) => void;
  /**
   * Loads all API keys from the secure keychain.
   */
  loadAllKeys: () => Promise<void>;
  /**
   * Validates if the current model selection is still valid for the active provider.
   */
  validateModelState: () => void;
}

export const useProviderStore = create<ProviderStore>()(
  persist(
    (set, get) => ({
      activeProvider: null,
      activeModel: null,
      modelState: "null",
      providers: [],
      availableModels: [],
      isConnected: false,
      isFetchingModels: false,

      setActiveProvider: (provider) => {
        set({
          activeProvider: provider,
          // When switching providers, if the provider has a selectedModel stored, restore it
          activeModel: provider.selectedModel,
          // Clear available models until re-fetched
          availableModels: [],
        });
        get().validateModelState();
      },

      setActiveModel: (modelId) => {
        set({ activeModel: modelId });
        // Update the provider's selectedModel in the providers array so it persists
        const { activeProvider, providers } = get();
        if (activeProvider) {
          const updated = providers.map((p) =>
            p.id === activeProvider.id ? { ...p, selectedModel: modelId } : p
          );
          set({ 
            providers: updated,
            activeProvider: { ...activeProvider, selectedModel: modelId },
            modelState: modelId ? "selected" : "null"
          });
        }
      },

      validateModelState: () => {
        const { activeModel, availableModels, activeProvider, isFetchingModels } = get();
        if (isFetchingModels) return;
        
        if (!activeProvider) {
          set({ modelState: "null" });
          return;
        }

        if (!activeModel) {
          set({ modelState: availableModels.length > 0 ? "reselect_required" : "null" });
          return;
        }

        const exists = availableModels.some(m => m.id === activeModel);
        if (availableModels.length > 0 && !exists) {
          set({ modelState: "invalid" });
        } else if (exists) {
          set({ modelState: "selected" });
        } else {
          set({ modelState: "discovered" }); // We have a selection but models not yet loaded
        }
      },

      addProvider: async (provider) => {
        // Ensure selectedModel is initialized with null if not provided
        const providerWithSelectedModel = provider.selectedModel !== undefined 
          ? provider 
          : { ...provider, selectedModel: null };
          
        // Add a function to get API key when needed
        const providerWithApiKeyGetter = {
          ...providerWithSelectedModel,
          getApiKey: async () => {
            if (provider.apiKey) {
              // For migration purposes, if we have an apiKey in the provider object
              // Save it to keychain and remove it from the provider
              await get().setApiKey(provider.id, provider.apiKey!);
              return provider.apiKey;
            }
            return get().getApiKey(provider.id);
          }
        };
        
        set({ providers: [...get().providers, providerWithApiKeyGetter] });
      },

      removeProvider: (id) => {
        const { providers, activeProvider } = get();
        const filtered = providers.filter((p) => p.id !== id);
        set({ providers: filtered });
        if (activeProvider?.id === id) {
          set({ activeProvider: null, activeModel: null, availableModels: [] });
        }
      },

      updateProvider: async (id, updates) => {
        // If we're updating the apiKey, store it in keychain
        if (updates.apiKey) {
          await get().setApiKey(id, updates.apiKey as string);
          // Remove apiKey from the updates since we don't store it in the provider object
          const { apiKey, ...rest } = updates;
          updates = rest;
        }

        // Ensure selectedModel is not set to undefined
        const updatesWithSelectedModel = updates.selectedModel === undefined
          ? { ...updates, selectedModel: null }
          : updates;

        set({
          providers: get().providers.map((p) =>
            p.id === id ? { ...p, ...updatesWithSelectedModel } : p
          ),
        });
        // If updating the active provider, update it too
        const { activeProvider } = get();
        if (activeProvider?.id === id) {
          set({ activeProvider: { ...activeProvider, ...updatesWithSelectedModel } });
        }
      },

      setAvailableModels: (models) => {
        set({ availableModels: models });
        get().validateModelState();
      },
      
      setIsFetchingModels: (isFetching) => {
        set({ isFetchingModels: isFetching });
        if (!isFetching) get().validateModelState();
      },


      setApiKey: async (providerId, key) => {
        // Store the key in the OS keychain via Tauri command
        await invoke("set_api_key", {
          key,
          service: `aide-desktop-${providerId}`,
          account: providerId
        });
      },
      
      getApiKey: async (providerId) => {
        try {
          // Retrieve the key from the OS keychain via Tauri command
          const key = await invoke<string>("get_api_key", {
            service: `aide-desktop-${providerId}`,
            account: providerId
          });
          return key;
        } catch (error) {
          console.warn(`Could not retrieve API key for provider ${providerId}:`, error);
          return undefined;
        }
      }
    }),
    {
      name: "aide-providers",
      // Don't persist API keys or sensitive session state
      partialize: (state) => ({
        ...state,
        activeProviderId: state.activeProviderId,
        activeProvider: undefined, // Don't persist active provider object
        // Don't persist API keys in frontend storage
        providers: state.providers.map(({ apiKey, ...rest }) => ({
          ...rest,
          // Keep all other provider properties but not apiKey
          getApiKey: undefined // Don't persist the getApiKey function
        }))
      })
    }
  )
);
