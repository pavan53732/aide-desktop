import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/stores/appStore';
import { AIControlPlane } from '@/lib/ai/AIControlPlane';
import { Check, Save, X, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isOpen, onClose }) => {
  const { aiProviders, setAiProviders, selectedProvider, setSelectedProvider } = useAppStore();
  const [tempProviders, setTempProviders] = useState(aiProviders);
  const [activeTab, setActiveTab] = useState('providers');
  const [showApiKey, setShowApiKey] = useState<{[key: string]: boolean}>({});

  const toggleApiKeyVisibility = (providerKey: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [providerKey]: !prev[providerKey]
    }));
  };

  const addProvider = (providerType: string) => {
    const newProviderKey = `${providerType.toLowerCase()}_${Date.now()}`;
    setTempProviders(prev => ({
      ...prev,
      [newProviderKey]: {
        type: providerType,
        apiKey: '',
        baseUrl: providerType === 'Ollama' ? 'http://localhost:11434' : '',
        enabled: true,
        models: []
      }
    }));
  };

  const updateProvider = (providerKey: string, field: string, value: any) => {
    setTempProviders(prev => ({
      ...prev,
      [providerKey]: {
        ...prev[providerKey],
        [field]: value
      }
    }));
  };

  const removeProvider = (providerKey: string) => {
    setTempProviders(prev => {
      const newProviders = { ...prev };
      delete newProviders[providerKey];
      return newProviders;
    });
  };

  const saveSettings = async () => {
    try {
      // Validate providers before saving
      for (const [key, provider] of Object.entries(tempProviders)) {
        if (provider.enabled && provider.apiKey && provider.apiKey.trim() !== '') {
          // Test the provider configuration by fetching models
          await AIControlPlane.fetchModels(provider.type, provider.apiKey, provider.baseUrl);
        }
      }
      
      // If all validations pass, update the store
      setAiProviders(tempProviders);
      if (selectedProvider && !tempProviders[selectedProvider]) {
        // If the selected provider was removed, select the first available one
        const firstProvider = Object.keys(tempProviders)[0];
        if (firstProvider) {
          setSelectedProvider(firstProvider);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error validating providers:', error);
      alert(`Failed to validate provider configuration: ${error.message}`);
    }
  };

  const cancelSettings = () => {
    setTempProviders(aiProviders);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Check className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Settings</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={cancelSettings}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'providers'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            onClick={() => setActiveTab('providers')}
          >
            AI Providers
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'general'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">AI Provider Configuration</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => addProvider('OpenAI')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    OpenAI
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addProvider('Anthropic')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Anthropic
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addProvider('Ollama')}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ollama
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(tempProviders).map(([key, provider]) => (
                  <Card key={key} className="p-4 bg-slate-800/50 border-slate-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <input
                            type="checkbox"
                            checked={provider.enabled}
                            onChange={(e) => updateProvider(key, 'enabled', e.target.checked)}
                            className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                          />
                          <h4 className="font-medium text-white capitalize">
                            {provider.type} {key.includes('_') ? `(${key.split('_')[1].substring(0, 4)})` : ''}
                          </h4>
                          {selectedProvider === key && (
                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                              {provider.type === 'Ollama' ? 'Base URL' : 'API Key'}
                            </label>
                            <div className="flex">
                              <input
                                type={showApiKey[key] ? "text" : "password"}
                                value={provider.type === 'Ollama' ? provider.baseUrl : provider.apiKey}
                                onChange={(e) => 
                                  updateProvider(
                                    key, 
                                    provider.type === 'Ollama' ? 'baseUrl' : 'apiKey', 
                                    e.target.value
                                  )
                                }
                                className="flex-1 rounded-l-md border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={
                                  provider.type === 'Ollama' 
                                    ? 'http://localhost:11434' 
                                    : 'Enter your API key'
                                }
                              />
                              <Button
                                variant="secondary"
                                onClick={() => toggleApiKeyVisibility(key)}
                                className="rounded-l-none border border-l-0 border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
                              >
                                {showApiKey[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                              Status
                            </label>
                            <div className="flex items-center">
                              <div className={`h-3 w-3 rounded-full mr-2 ${
                                provider.enabled ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className="text-sm text-slate-400">
                                {provider.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProvider(key)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 ml-4"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {Object.keys(tempProviders).length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <p>No AI providers configured. Add a provider to get started.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">General Settings</h3>
              <Card className="p-4 bg-slate-800/50 border-slate-700">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Theme
                    </label>
                    <select className="w-full rounded-md border border-slate-600 bg-slate-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="dark">Dark (Default)</option>
                      <option value="light">Light</option>
                      <option value="blue">Blue Accent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Editor Font Size
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      defaultValue="14"
                      className="w-full"
                    />
                    <div className="text-right text-sm text-slate-400 mt-1">
                      14px
                    </div>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-slate-300">
                        Enable AI Suggestions
                      </span>
                    </label>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/30 flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={cancelSettings}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={saveSettings}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
