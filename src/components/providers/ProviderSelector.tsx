import React, { useState, useEffect } from 'react';
import { ChevronDown, BrainCircuit, Plus, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppStore } from '../../stores/appStore';
import { AIControlPlane } from '../../lib/ai/AIControlPlane';

export const ProviderSelector = () => {
  const { 
    aiProviders, 
    selectedProvider, 
    selectedModel, 
    setSelectedProvider, 
    setSelectedModel,
    showSettings,
    setShowSettings,
    addNotification
  } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingModels, setLoadingModels] = useState<Record<string, boolean>>({});

  const currentProvider = selectedProvider ? aiProviders[selectedProvider] : null;
  const currentProviderName = currentProvider ? currentProvider.config.name : 'No provider';
  
  // Fetch models for a provider
  const fetchProviderModels = async (providerKey: string) => {
    const provider = aiProviders[providerKey];
    if (!provider) return;

    setLoadingModels(prev => ({ ...prev, [providerKey]: true }));

    try {
      const models = await AIControlPlane.fetchModels(
        provider.type, 
        provider.config.authCredentials?.apiKey || '', 
        provider.config.endpoint
      );
      
      // Update the provider with fetched models
      const updatedProviders = { ...aiProviders };
      updatedProviders[providerKey] = {
        ...updatedProviders[providerKey],
        models: models.map(model => ({
          id: model.id,
          name: model.id,
          capabilities: model.capabilities || {}
        }))
      };
      
      // Update the store
      useAppStore.getState().setAiProviders(updatedProviders);
      
      // Show success notification
      addNotification({
        title: 'Models Loaded',
        message: `Loaded ${models.length} models from ${provider.config.name}`,
        type: 'success'
      });
    } catch (error) {
      console.error(`Error fetching models for provider ${providerKey}:`, error);
      addNotification({
        title: 'Error Loading Models',
        message: `Could not load models from ${provider.config.name}: ${(error as Error).message}`,
        type: 'error'
      });
    } finally {
      setLoadingModels(prev => ({ ...prev, [providerKey]: false }));
    }
  };

  // Handle provider selection
  const handleSelectProvider = async (providerKey: string) => {
    setSelectedProvider(providerKey);
    
    // Fetch models for the selected provider if they haven't been loaded yet
    const provider = aiProviders[providerKey];
    if (provider && (!provider.models || provider.models.length === 0)) {
      await fetchProviderModels(providerKey);
    }
    
    setIsOpen(false);
  };

  // Get available models for the selected provider
  const availableModels = selectedProvider && aiProviders[selectedProvider]?.models 
    ? aiProviders[selectedProvider].models 
    : [];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <BrainCircuit className="h-4 w-4" />
        <span>
          {currentProviderName} - {selectedModel || 'No model selected'}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute left-0 top-10 w-80 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50">
          <div className="p-2">
            {Object.entries(aiProviders).map(([providerKey, provider]) => {
              const isSelected = selectedProvider === providerKey;
              const hasModels = provider.models && provider.models.length > 0;
              const isLoading = loadingModels[providerKey];

              return (
                <div 
                  key={providerKey} 
                  className={`p-3 border border-slate-700 rounded mb-2 cursor-pointer hover:bg-slate-700 ${
                    isSelected ? 'bg-slate-700 border-blue-500' : ''
                  }`}
                  onClick={() => handleSelectProvider(providerKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BrainCircuit className="h-4 w-4" />
                      <span className="font-medium">{provider.config.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      hasModels 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {hasModels ? 'Connected' : 'Configure'}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    {selectedProvider === providerKey && selectedModel 
                      ? selectedModel 
                      : hasModels 
                        ? `${provider.models.length} models available` 
                        : 'Click to configure'}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {provider.type.charAt(0).toUpperCase() + provider.type.slice(1)} Provider
                  </div>
                  
                  {/* Model selector for selected provider */}
                  {isSelected && hasModels && (
                    <div className="mt-2">
                      <select
                        value={selectedModel || ''}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-slate-700 text-white text-sm rounded border border-slate-600 p-1"
                      >
                        <option value="">Select a model...</option>
                        {availableModels.map(model => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Load models button if not loaded yet */}
                  {isSelected && !hasModels && !isLoading && (
                    <div className="mt-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchProviderModels(providerKey);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs border-slate-600 text-slate-300 hover:bg-slate-600"
                      >
                        {isLoading ? 'Loading...' : 'Load Models'}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="flex space-x-2 mt-2">
              <button 
                className="flex-1 p-2 text-center text-blue-400 hover:bg-slate-700 rounded flex items-center justify-center space-x-1"
                onClick={() => {
                  setShowSettings(true);
                  setIsOpen(false);
                }}
              >
                <Plus className="h-4 w-4" />
                <span>Add Provider</span>
              </button>
              <button 
                className="p-2 text-blue-400 hover:bg-slate-700 rounded flex items-center"
                onClick={() => {
                  setShowSettings(true);
                  setIsOpen(false);
                }}
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};