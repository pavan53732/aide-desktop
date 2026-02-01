import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, FileText, Settings, FolderOpen, Brain, MessageSquare, Code, FilePlus } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    selectedWorkspace, 
    setSelectedWorkspace, 
    aiProviders, 
    setSelectedProvider,
    setShowSettings 
  } = useAppStore();

  // Mock workspaces for demonstration
  const workspaces = [
    { id: '1', name: 'Personal Projects', path: '/home/user/projects/personal' },
    { id: '2', name: 'Client Work', path: '/home/user/projects/client' },
    { id: '3', name: 'Open Source', path: '/home/user/projects/oss' }
  ];

  // Mock providers for demonstration
  const providers = Object.keys(aiProviders);

  const handleSelectWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setSelectedWorkspace(workspace);
      onClose();
    }
  };

  const handleSelectProvider = (provider: string) => {
    setSelectedProvider(provider);
    onClose();
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Prevent body scroll when palette is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-32 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
          <Command
            value={searchQuery}
            onValueChange={setSearchQuery}
            label="Command Palette"
            className="overflow-visible bg-transparent"
          >
            <div className="flex items-center border-b border-slate-700 px-4 py-3">
              <Command.Input
                placeholder="Type a command or search..."
                className="flex h-10 w-full rounded-md bg-transparent py-3 pl-10 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                autoFocus
              />
            </div>
            <Command.List className="max-h-96 overflow-y-auto overscroll-contain">
              <Command.Empty className="py-6 text-center text-slate-500 text-sm">
                No results found
              </Command.Empty>

              <Command.Group heading="AI Providers" className="px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                AI Providers
              </Command.Group>
              {providers.map((provider) => (
                <Command.Item
                  key={provider}
                  onSelect={() => handleSelectProvider(provider)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 cursor-pointer data-[disabled]:pointer-events-none data-[selected]:bg-slate-800 data-[selected]:text-white"
                >
                  <Brain className="h-5 w-5 text-blue-400" />
                  <span>Use {provider}</span>
                </Command.Item>
              ))}

              <Command.Group heading="Workspaces" className="px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Workspaces
              </Command.Group>
              {workspaces.map((workspace) => (
                <Command.Item
                  key={workspace.id}
                  onSelect={() => handleSelectWorkspace(workspace.id)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 cursor-pointer data-[disabled]:pointer-events-none data-[selected]:bg-slate-800 data-[selected]:text-white"
                >
                  <FolderOpen className="h-5 w-5 text-blue-400" />
                  <div className="flex flex-col">
                    <span>{workspace.name}</span>
                    <span className="text-xs text-slate-500">{workspace.path}</span>
                  </div>
                </Command.Item>
              ))}

              <Command.Group heading="Files" className="px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Files
              </Command.Group>
              <Command.Item
                onSelect={() => {}}
                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 cursor-pointer data-[disabled]:pointer-events-none data-[selected]:bg-slate-800 data-[selected]:text-white"
              >
                <FileText className="h-5 w-5 text-blue-400" />
                <span>New File</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {}}
                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 cursor-pointer data-[disabled]:pointer-events-none data-[selected]:bg-slate-800 data-[selected]:text-white"
              >
                <FilePlus className="h-5 w-5 text-blue-400" />
                <span>Open File</span>
              </Command.Item>

              <Command.Group heading="Tools" className="px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Tools
              </Command.Group>
              <Command.Item
                onSelect={handleOpenSettings}
                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 cursor-pointer data-[disabled]:pointer-events-none data-[selected]:bg-slate-800 data-[selected]:text-white"
              >
                <Settings className="h-5 w-5 text-blue-400" />
                <span>Settings</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {}}
                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 cursor-pointer data-[disabled]:pointer-events-none data-[selected]:bg-slate-800 data-[selected]:text-white"
              >
                <MessageSquare className="h-5 w-5 text-blue-400" />
                <span>Chat with AI</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {}}
                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 cursor-pointer data-[disabled]:pointer-events-none data-[selected]:bg-slate-800 data-[selected]:text-white"
              >
                <Code className="h-5 w-5 text-blue-400" />
                <span>Code Assistant</span>
              </Command.Item>
            </Command.List>
          </Command>
        </div>
        
        <div className="border-t border-slate-700 p-3 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            AIDE Command Palette
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span>Type to search</span>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
