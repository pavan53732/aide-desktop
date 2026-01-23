import Editor, { Monaco } from "@monaco-editor/react";
import { useEditorStore } from "@/stores/editor-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useEffect, useState, useRef } from "react";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { Loader2 } from "lucide-react";
import { createLSPClient } from "@/lib/lsp/client";
import { invoke } from "@tauri-apps/api/core";
// ... imports

export function CodeEditor() {
  const { selectedFile, workspacePath } = useWorkspaceStore();
  const { activeFileContent, setFileContent } = useEditorStore();
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("typescript");
  
  // Ref to track active client to avoid re-creation
  const clientRef = useRef<any>(null);
  const lspIdRef = useRef<number | null>(null);

  // Determine language from file extension
  useEffect(() => {
    if (!selectedFile) return;
    const ext = selectedFile.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'ts': case 'tsx': setLanguage('typescript'); break;
        case 'js': case 'jsx': setLanguage('javascript'); break;
        case 'py': setLanguage('python'); break;
        case 'rs': setLanguage('rust'); break;
        default: setLanguage('plaintext');
    }
  }, [selectedFile]);

  // Load file content
  useEffect(() => {
    const loadFile = async () => {
      if (!selectedFile) return;
      
      setLoading(true);
      try {
        const content = await readTextFile(selectedFile);
        setFileContent(content);
      } catch (err) {
        console.error("Failed to read file:", err);
        setFileContent("// Failed to load file");
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [selectedFile, setFileContent]);

  // Setup LSP
  useEffect(() => {
    if (!selectedFile || !workspacePath) return;
    if (language === 'plaintext') return;

    // If client already exists for this language, do nothing (assume shared)
    // But for MVP we only maintain one active client.
    // If language changed, restart.
    
    // Note: In a real app we'd keep them alive in a background store.
    // Here we restart on language change.
    
    const startLSP = async () => {
        // Cleanup old
        if (clientRef.current) {
            console.log("Stopping old LSP...");
            await clientRef.current.stop();
            if (lspIdRef.current) {
                await invoke("kill_lsp", { id: lspIdRef.current });
            }
            clientRef.current = null;
        }

        try {
            console.log("Creating LSP for", language);
            const { client, lspId, connection } = await createLSPClient(language, workspacePath);
            await client.start();
            clientRef.current = client;
            lspIdRef.current = lspId;
            
            // Connection is managed by client start() which calls connectionProvider
        } catch (e) {
            console.error("Failed to start LSP:", e);
        }
    };

    // Debounce or just run?
    startLSP();

    return () => {
        // Cleanup Effect
        // We probably don't want to kill LSP on every file switch if language is same?
        // But this Effect depends on `language`.
        // If file changes but language is same, `language` state doesn't change?
        // Actually `useEffect` dependencies: `language`, `workspacePath`.
        // So it persists across file changes of same language. Good.
    };
  }, [language, workspacePath]);

  // Cleanup on Unmount
  useEffect(() => {
      return () => {
          if (clientRef.current) {
              clientRef.current.stop();
          }
          if (lspIdRef.current) {
              invoke("kill_lsp", { id: lspIdRef.current }).catch(console.error);
          }
      };
  }, []);

  const handleEditorDidMount = async (editor: any, monaco: Monaco) => {
      try {
          // monaco-languageclient services initialization would go here.
          // Currently skipped to avoid version conflicts.
      } catch (e) {
          // Ignore
      }
  };

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-slate-950">
        <p>Select a file to edit</p>
      </div>
    );
  }

  if (loading) {
     return (
        <div className="h-full flex items-center justify-center bg-slate-950 text-primary">
            <Loader2 className="animate-spin h-8 w-8" />
        </div>
     );
  }

  return (
    <div className="h-full w-full bg-slate-950">
      <Editor
        height="100%"
        language={language}
        path={selectedFile}
        theme="vs-dark"
        value={activeFileContent || ""}
        onMount={handleEditorDidMount}
        onChange={(val) => {
            // Update store?
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          padding: { top: 16 },
        }}
      />
    </div>
  );
}
