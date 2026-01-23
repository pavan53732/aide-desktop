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

function App() {
  const { loadAllKeys } = useProviderStore();
  const { terminalOpen, toggleTerminal } = useUIStore();

  useEffect(() => {
    initDatabase().catch(console.error);
    loadAllKeys().catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex flex-col relative min-w-0">
            <div className={`flex-1 relative ${terminalOpen ? 'border-b border-border' : ''}`}>
               <CodeEditor />
            </div>
            
            {terminalOpen && (
                <div className="h-64 min-h-[200px] border-t border-border">
                    <TerminalPanel onClose={toggleTerminal} />
                </div>
            )}
        </main>
        
        <ChatPanel />
      </div>

      <SettingsModal />
      <DiffModal />
      <StatusBar />
      <CommandPalette />
    </div>
  );
}

export default App;
