import React, { useState } from 'react';
import { BrainCircuit, Settings, User, Command } from 'lucide-react';
import { ProviderSelector } from '../providers/ProviderSelector';
import { NotificationCenter } from '../../components/ui/NotificationCenter';
import { CommandPalette } from '../../components/ui/CommandPalette';
import { SettingsPage } from '../../components/settings/SettingsPage';
import { useAppStore } from '../../stores/appStore';

export const Header = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { showSettings, setShowSettings } = useAppStore();

  // Handle keyboard shortcut for command palette
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-4 py-2 border-b h-14 bg-slate-900/80 backdrop-blur-sm border-slate-700"
      role="banner"
    >
      <div className="flex items-center space-x-2">
        <BrainCircuit className="h-6 w-6 text-blue-400" aria-hidden="true" />
        <span className="text-lg font-semibold text-white">AIDE</span>
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="ml-4 px-3 py-1 text-xs bg-slate-800 text-slate-400 rounded-md border border-slate-600 hover:bg-slate-700 hover:text-slate-300 flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Open command palette"
          type="button"
        >
          <Command className="h-3 w-3" aria-hidden="true" />
          <span>Press Ctrl+K</span>
        </button>
      </div>
      
      <nav className="flex items-center space-x-4" aria-label="Main navigation">
        <ProviderSelector />
        <NotificationCenter />
        <button
          className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => setShowSettings(true)}
          aria-label="Open settings"
          type="button"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="User profile"
          type="button"
        >
          <User className="h-5 w-5" aria-hidden="true" />
        </button>
      </nav>
      
      {/* Command Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
      
      {/* Settings Page */}
      <SettingsPage 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </header>
  );
};