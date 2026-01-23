import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CodeEditor } from "@/components/editor/Editor";
import { SettingsModal } from "@/components/settings/settings-modal";
import { ChatPanel } from "@/components/chat/ChatPanel";
import "@/styles/globals.css";
import { DiffModal } from "@/components/diff/DiffModal";
import { useEffect } from "react";
import { initDatabase } from "@/lib/db";
import { useProviderStore } from "@/stores/provider-store";

import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { useUIStore } from "@/stores/ui-store";
import { StatusBar } from "@/components/layout/StatusBar";
import { CommandPalette } from "@/components/layout/CommandPalette";

/**
 * Main Application Component
 * 
 * This is the root component of the AIDE Desktop application.
 * It manages the overall layout, initializes core services (database, providers),
 * and handles the conditional rendering of the terminal and other modals.
 */
function App() {
  // Access provider store to load API keys and configurations
  const { loadAllKeys } = useProviderStore();
  // Access UI store to manage terminal visibility and other UI states
  const { terminalOpen, toggleTerminal } = useUIStore();

  /**
   * Initialization effect
   * Runs once on mount to set up the local database and load provider keys.
   */
  useEffect(() => {
    initDatabase().catch(console.error);
    loadAllKeys().catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top navigation and action bar */}
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar for file navigation and tools */}
        <Sidebar />
        
        {/* Main content area containing the editor and terminal */}
        <main className="flex-1 flex flex-col relative min-w-0">
            <div className={`flex-1 relative ${terminalOpen ? 'border-b border-border' : ''}`}>
               <CodeEditor />
            </div>
            
            {/* Collapsible terminal panel at the bottom */}
            {terminalOpen && (
                <div className="h-64 min-h-[200px] border-t border-border">
                    <TerminalPanel onClose={toggleTerminal} />
                </div>
            )}
        </main>
        
        {/* Right panel for AI chat interactions */}
        <ChatPanel />
      </div>

      {/* Global modals and status indicators */}
      <SettingsModal />
      <DiffModal />
      <StatusBar />
      <CommandPalette />
    </div>
  );
}

export default App;
