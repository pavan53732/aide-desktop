import { useWorkspaceStore } from "@/stores/workspace-store";
import { useChatStore } from "@/stores/chat-store";
import { cn } from "@/lib/utils";

export function StatusBar() {
  const { workspacePath } = useWorkspaceStore();
  const { isThinking } = useChatStore();

  return (
    <footer className="h-6 border-t flex items-center justify-between px-3 text-[10px] text-muted-foreground bg-background select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isThinking ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
          )} />
          <span>{isThinking ? "Thinking..." : "Ready"}</span>
        </div>
        {workspacePath && (
          <div className="flex items-center gap-1">
            <span className="opacity-50">|</span>
            <span>{workspacePath}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <span>UTF-8</span>
        <span>TypeScript</span>
      </div>
    </footer>
  );
}
