import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { FolderOpen } from 'lucide-react';

type StatusType = 'ready' | 'thinking' | 'offline' | 'error';

interface StatusConfig {
  label: string;
  dotColor: string;
  animate?: boolean;
}

const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  ready: {
    label: 'Ready',
    dotColor: 'bg-emerald-500',
    animate: false,
  },
  thinking: {
    label: 'Thinking...',
    dotColor: 'bg-blue-500',
    animate: true,
  },
  offline: {
    label: 'Offline',
    dotColor: 'bg-red-500',
    animate: false,
  },
  error: {
    label: 'Error',
    dotColor: 'bg-red-500',
    animate: false,
  },
};

export const StatusBar = () => {
  const {
    selectedWorkspace,
    isGenerating,
    selectedProvider,
    aiProviders,
  } = useAppStore();

  // Determine status based on state
  const getStatus = (): StatusType => {
    if (isGenerating) return 'thinking';
    
    // Check if provider is available and connected
    if (selectedProvider) {
      const provider = aiProviders[selectedProvider];
      if (!provider) return 'offline';
      // Provider exists, check if it's configured
      if (!provider.apiKey && provider.type !== 'local') {
        return 'offline';
      }
    } else {
      // No provider selected
      return 'offline';
    }
    
    return 'ready';
  };

  const status = getStatus();
  const config = STATUS_CONFIG[status];

  return (
    <div className="h-7 min-h-[28px] px-4 flex items-center justify-between border-t border-border bg-card text-xs select-none">
      {/* Workspace Path */}
      <div className="flex items-center gap-2 text-muted-foreground overflow-hidden">
        <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="font-mono truncate">
          {selectedWorkspace?.path || 'No workspace selected'}
        </span>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
        <span
          className={`w-2 h-2 rounded-full ${config.dotColor} ${
            config.animate ? 'animate-pulse' : ''
          }`}
          aria-hidden="true"
        />
        <span className="text-muted-foreground">{config.label}</span>
      </div>
    </div>
  );
};
