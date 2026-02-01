import React from 'react';
import { Header } from './Header';
import { Sidebar } from '../sidebar/Sidebar';
import { ChatPanel } from '../chat/ChatPanel';
import { ActivityLog } from '../sidebar/ActivityLog';

export const AppLayout = () => {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ChatPanel />
        <ActivityLog />
      </div>
    </div>
  );
};