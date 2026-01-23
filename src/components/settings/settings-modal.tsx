import { useState } from "react";
import { useProviderStore, AIProviderConfig } from "@/stores/provider-store";
import { useUIStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Trash2, CheckCircle, Edit } from "lucide-react";
import { ProviderCard } from "@/components/providers/ProviderCard";
import { PROVIDER_TEMPLATES, CLI_TEMPLATES } from "@/lib/provider-templates";

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen } = useUIStore();
  const { providers, addProvider, removeProvider, activeProvider, setActiveProvider } = useProviderStore();
  const [view, setView] = useState<"general" | "providers">("providers");
  
  // New Provider Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newProvider, setNewProvider] = useState<Partial<AIProviderConfig>>({
    type: "openai_compatible",
    name: "",
    endpoint: "",
    apiKey: "",
  });

  const handleSaveProvider = () => {
    if (!newProvider.name) return;
    if (newProvider.type !== "cli_agent" && !newProvider.endpoint) return;

    const provider: AIProviderConfig = {
      id: crypto.randomUUID(),
      type: newProvider.type as any,
      name: newProvider.name,
      endpoint: newProvider.endpoint,
      apiKey: newProvider.apiKey,
      authType: "bearer",
      modelsEndpoint: "/models",
      chatEndpoint: newProvider.chatEndpoint || "/chat/completions",
      selectedModel: null,
      fallbackModels: newProvider.fallbackModels,
      ...newProvider.config
    };

    addProvider(provider);
    setIsAdding(false);
    setNewProvider({ type: "openai_compatible", name: "", endpoint: "", apiKey: "" });
    
    // Auto specific if first one
    if (providers.length === 0) {
        setActiveProvider(provider);
    }
  };

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure your AI providers and workspace.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mt-4">
          <aside className="w-48 space-y-2">
            <Button 
              variant={view === "general" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setView("general")}
            >
              General
            </Button>
            <Button 
              variant={view === "providers" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setView("providers")}
            >
              AI Providers
            </Button>
          </aside>

          <div className="flex-1 border-l pl-4">
            {view === "providers" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Configured Providers</h3>
                  <Button size="sm" onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "destructive" : "default"}>
                    {isAdding ? "Cancel" : "Add Provider"}
                  </Button>
                </div>

                {isAdding && (
                  <div className="p-4 border rounded-md bg-muted/50 space-y-3">
                    
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Load Template (Optional)</label>
                        <select 
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            onChange={(e) => {
                                const idx = parseInt(e.target.value);
                                if (idx >= 0) {
                                    const t = PROVIDER_TEMPLATES[idx];
                                    setNewProvider({
                                        ...newProvider,
                                        type: t.type,
                                        name: t.name,
                                        endpoint: t.endpoint,
                                        authType: t.authType,
                                        modelsEndpoint: t.modelsEndpoint,
                                        chatEndpoint: t.chatEndpoint,
                                        fallbackModels: t.fallbackModels,
                                        config: t.config
                                    });
                                }
                            }}
                            defaultValue={-1}
                        >
                            <option value={-1}>Select a provider...</option>
                            {PROVIDER_TEMPLATES.map((t, i) => (
                                <option key={i} value={i}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-muted px-2 text-muted-foreground">Or Configure Manually</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">Type</label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={newProvider.type}
                        onChange={(e) => setNewProvider({...newProvider, type: e.target.value as any})}
                      >
                        <option value="openai_compatible">OpenAI Compatible (Cloud)</option>
                        <option value="openrouter">OpenRouter</option>
                        <option value="groq">Groq</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="google">Google Gemini</option>
                        <option value="mistral">Mistral</option>
                        <option value="cohere">Cohere</option>
                        <option value="openai">OpenAI (Direct)</option>
                        <option value="bedrock">Amazon Bedrock</option>
                        <option value="vertex">Google Vertex AI</option>
                        <option value="replicate">Replicate</option>
                        <option value="huggingface">HuggingFace</option>
                        <option value="ai21">AI21 Labs</option>
                        <option value="writer">Writer</option>
                        <option value="reka">Reka AI</option>
                        <option value="inflection">Inflection AI</option>
                        <option value="blackbox">Blackbox AI</option>
                        <option value="opencode">OpenCode Zen</option>
                        <option value="local">Local (Ollama/LM Studio)</option>
                        <option value="cli_agent">CLI Agent (Local Binary)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">Name</label>
                      <Input 
                        placeholder="e.g. My Provider" 
                        value={newProvider.name} 
                        onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                      />
                    </div>

                    {newProvider.type === "cli_agent" ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Command</label>
                          <Input 
                            placeholder="e.g. python" 
                            value={newProvider.config?.command || ""} 
                            onChange={(e) => setNewProvider({...newProvider, config: { ...newProvider.config, command: e.target.value } })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Arguments</label>
                          <Input 
                            placeholder="e.g. agent.py" 
                            value={newProvider.config?.args || ""} 
                            onChange={(e) => setNewProvider({...newProvider, config: { ...newProvider.config, args: e.target.value } })}
                          />
                           <p className="text-[10px] text-muted-foreground">Presets: 
                                {CLI_TEMPLATES.map(c => (
                                    <button 
                                        key={c.name} 
                                        className="ml-1 underline hover:text-primary"
                                        onClick={() => setNewProvider({
                                            ...newProvider, 
                                            name: c.name,
                                            config: { command: c.command, args: c.args }
                                        })}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">Endpoint</label>
                          <Input 
                            placeholder="https://api.example.com/v1" 
                            value={newProvider.endpoint} 
                            onChange={(e) => setNewProvider({...newProvider, endpoint: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium">API Key</label>
                          <Input 
                            type="password" 
                            placeholder="sk-..." 
                            value={newProvider.apiKey} 
                            onChange={(e) => setNewProvider({...newProvider, apiKey: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                    <Button onClick={handleSaveProvider} className="w-full mt-2">Save Provider</Button>
                  </div>
                )}

                <div className="space-y-3">
                  {providers.length === 0 && !isAdding && (
                    <div className="text-center py-8 text-muted-foreground">
                      No providers configured. Click "Add Provider" to start.
                    </div>
                  )}
                  
                  {providers.map((p) => (
                    <ProviderCard
                      key={p.id}
                      provider={p}
                      isActive={activeProvider?.id === p.id}
                      onSelect={() => setActiveProvider(p)}
                      onDelete={() => removeProvider(p.id)}
                      showActions={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {view === "general" && (
                <div className="text-muted-foreground text-sm">
                    Workspace settings will appear here in Stage 2.
                </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
