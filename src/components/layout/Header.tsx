import { Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUIStore } from "@/stores/ui-store";
import { useProviderStore } from "@/stores/provider-store";
import { useModels } from "@/hooks/use-models";
import { getProviderIcon, getProviderTypeLabel, getCLIAgentIcon } from "@/lib/provider-icons";
import { ConnectionStatusBadge } from "@/components/providers/ConnectionStatusBadge";
import { Loader2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { ProviderSelectorDropdown } from "@/components/providers/ProviderSelectorDropdown";

export function Header() {
  const { toggleSettings } = useUIStore();
  const { activeProvider, activeModel, setActiveModel } = useProviderStore();
  const { data: models, isLoading: modelsLoading } = useModels();
  const [providerSelectorOpen, setProviderSelectorOpen] = useState(false);

  // Get appropriate icon for active provider
  const providerIcon = activeProvider
    ? activeProvider.type === 'cli_agent' && activeProvider.config?.command
      ? getCLIAgentIcon(activeProvider.config.command)
      : getProviderIcon(activeProvider.type)
    : null;

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
      <div className="font-bold text-lg tracking-tight">AIDE</div>
      
      <div className="flex items-center gap-4">
        {activeProvider ? (
          <>
            {/* Provider Info - Clickable to open selector */}
            <button
              onClick={() => setProviderSelectorOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <span className="text-xl">{providerIcon}</span>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{activeProvider.name}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </div>
                {activeProvider.type === "cli_agent" ? (
                  <span className="text-[10px] text-blue-400 font-mono">Local Binary</span>
                ) : (
                  <div className="relative">
                    {modelsLoading ? (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Fetching models...</span>
                      </div>
                    ) : (
                      <select 
                        className="text-[10px] bg-transparent border-none outline-none text-muted-foreground hover:text-foreground cursor-pointer appearance-none pr-4"
                        value={activeModel || activeProvider.selectedModel || ""}
                        onChange={(e) => setActiveModel(e.target.value)}
                        disabled={!models || models.length === 0}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="" disabled>
                          {!activeProvider.selectedModel && !activeModel ? "No model selected" : "Select Model"}
                        </option>
                        {models?.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                        {!models?.length && <option value="" disabled>No models found</option>}
                      </select>
                    )}
                  </div>
                )}
              </div>
            </button>

            {/* Status and Type Badges */}
            <div className="flex items-center gap-2">
              <ConnectionStatusBadge provider={activeProvider} />
              <Badge variant="outline" className="text-xs">
                {getProviderTypeLabel(activeProvider.type)}
              </Badge>
            </div>
          </>
        ) : (
          <button
            onClick={() => setProviderSelectorOpen(true)}
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-accent transition-colors"
          >
            No provider selected - Click to add
          </button>
        )}

        <Button variant="ghost" size="icon" onClick={toggleSettings}>
          <Settings className="h-5 w-5" />
        </Button>

        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-border flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
          JD
        </div>
      </div>

      {/* Provider Selector Dropdown */}
      <ProviderSelectorDropdown 
        open={providerSelectorOpen} 
        onOpenChange={setProviderSelectorOpen} 
      />
    </header>
  );
}
