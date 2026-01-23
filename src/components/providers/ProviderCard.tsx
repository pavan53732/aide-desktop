import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AIProviderConfig } from "@/stores/provider-store";
import { getProviderIcon, getProviderTypeLabel, getCLIAgentIcon } from "@/lib/provider-icons";
import { ConnectionStatusBadge } from "./ConnectionStatusBadge";
import { Trash2, Edit, CheckCircle } from "lucide-react";

interface Props {
  provider: AIProviderConfig;
  isActive?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function ProviderCard({ 
  provider, 
  isActive, 
  onSelect, 
  onEdit, 
  onDelete,
  showActions = true 
}: Props) {
  // Get appropriate icon
  const icon = provider.type === 'cli_agent' && provider.config?.command
    ? getCLIAgentIcon(provider.config.command)
    : getProviderIcon(provider.type);

  const typeLabel = getProviderTypeLabel(provider.type);

  return (
    <Card 
      className={`cursor-pointer hover:border-primary transition-colors ${
        isActive ? 'border-primary bg-primary/5' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{provider.name}</h3>
              {isActive && <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />}
            </div>
            {provider.type === 'cli_agent' ? (
              <p className="text-xs text-muted-foreground font-mono">
                Command: {provider.config?.command || 'Not configured'}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Model: {provider.selectedModel || "No model selected"}
              </p>
            )}
          </div>
          <ConnectionStatusBadge provider={provider} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{typeLabel}</Badge>
            {provider.type === 'cli_agent' && (
              <span className="text-[10px] text-blue-400 font-mono">Local Binary</span>
            )}
          </div>
          {showActions && (
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onEdit(); 
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onDelete(); 
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
