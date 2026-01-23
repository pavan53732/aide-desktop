import { DiffEditor } from "@monaco-editor/react";
import { useDiffStore } from "@/stores/diff-store";

import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/Button";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { X, Check } from "lucide-react";

export function DiffModal() {
  const { isOpen, pendingDiff, closeDiff } = useDiffStore();
  
  if (!isOpen || !pendingDiff) return null;

  const handleAccept = async () => {
    try {
      if (!pendingDiff.filePath) throw new Error("No file path specified");
      
      await invoke("write_file", { path: pendingDiff.filePath, content: pendingDiff.newContent });
      toast.success(`Changes applied to ${pendingDiff.filePath}`);
      
      // Notify chat
      useChatStore.getState().addMessage("system", `✓ Application successful: ${pendingDiff.filePath}`);
      
      // await refreshFileTree();
      closeDiff();
    } catch (err: any) {
      console.error("Failed to write file", err);
      toast.error(`Failed to apply changes: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95"> {/* Made overlay opaque with high contrast - removed backdrop-blur-sm */}
      <div className="flex flex-col w-full h-full max-w-6xl bg-card border rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/20">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">Review Changes</h2>
            <code className="text-xs text-muted-foreground">{pendingDiff.filePath}</code>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={closeDiff}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Diff Editor */}
        <div className="flex-1 min-h-0">
          <DiffEditor
            height="100%"
            language="typescript" // Simplified: auto-detect later
            original={pendingDiff.originalContent}
            modified={pendingDiff.newContent}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              renderSideBySide: true,
            }}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end p-4 border-t gap-3 bg-background">
          <Button variant="secondary" onClick={closeDiff}>
            Reject
          </Button>
          <Button onClick={handleAccept} className="bg-green-600 hover:bg-green-700 text-white">
            <Check className="h-4 w-4 mr-2" />
            Accept & Apply
          </Button>
        </div>
      </div>
    </div>
  );
}