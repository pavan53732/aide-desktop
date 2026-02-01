import React from 'react';
import { BrainCircuit, Settings, User } from 'lucide-react';
import { ProviderSelector } from '../providers/ProviderSelector';

export const Header = () => {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b h-14">
      <div className="flex items-center space-x-2">
        <BrainCircuit className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">AIDE</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <ProviderSelector />
        <button className="p-2 rounded-full hover:bg-accent">
          <Settings className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-accent">
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};