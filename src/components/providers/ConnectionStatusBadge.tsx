import { Badge } from "@/components/ui/Badge";
import { AIProviderConfig } from "@/stores/provider-store";

interface Props {
  provider: AIProviderConfig;
  status?: 'connected' | 'configure' | 'error' | 'available';
}

export function ConnectionStatusBadge({ provider, status }: Props) {
  // Determine status if not provided
  const connectionStatus = status || getDefaultStatus(provider);

  const statusConfig = {
    connected: {
      icon: '●',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: 'Connected',
    },
    configure: {
      icon: '○',
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
      label: 'Configure',
    },
    error: {
      icon: '✗',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      label: 'Error',
    },
    available: {
      icon: '●',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      label: 'Available',
    },
  };

  const config = statusConfig[connectionStatus];

  return (
    <Badge variant="outline" className={`gap-1 ${config.bgColor}`}>
      <span className={config.color}>{config.icon}</span>
      <span>{config.label}</span>
    </Badge>
  );
}

function getDefaultStatus(provider: AIProviderConfig): 'connected' | 'configure' | 'available' {
  // CLI agents are "available" if they have a command
  if (provider.type === 'cli_agent') {
    return provider.config?.command ? 'available' : 'configure';
  }

  // Cloud/local providers are "connected" if they have an API key
  return provider.apiKey ? 'connected' : 'configure';
}
