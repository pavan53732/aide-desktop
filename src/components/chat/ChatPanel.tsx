import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Send, StopCircle, Eraser, Copy, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDiffStore } from "@/stores/diff-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useEditorStore } from "@/stores/editor-store";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeBlock({ node, inline, className, children, ...props }: any) {
  const match = /language-(\w+)/.exec(className || '');
  const content = String(children).replace(/\n$/, '');
  const { openDiff } = useDiffStore();
  const { selectedFile } = useWorkspaceStore();
  const { activeFileContent } = useEditorStore();

  const handleCopy = async () => {
    await writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleApply = () => {
    if (!selectedFile) {
        toast.error("No active file selected. Open a file to apply changes.");
        return;
    }
    // Simple MVP strategy: Apply entire block to entire active file
    // Ideally we'd parse the diff, but for now we treat the block as the 'new content'
    openDiff({
        filePath: selectedFile,
        originalContent: activeFileContent || "",
        newContent: content
    });
  };

  if (!inline && match) {
    return (
      <div className="relative my-4 rounded-md overflow-hidden border">
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
            <span className="text-xs text-muted-foreground font-mono">{match[1]}</span>
            <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleCopy}>
                    <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
                <Button variant="secondary" size="sm" className="h-6 text-xs bg-primary/10 hover:bg-primary/20 text-primary" onClick={handleApply}>
                    <Check className="h-3 w-3 mr-1" /> Apply
                </Button>
            </div>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    );
  }

  return <code className={className} {...props}>{children}</code>;
}

/**
 * Chat Panel Component
 * 
 * Provides the interface for interacting with AI models.
 * Features include:
 * - Message history with Markdown rendering
 * - Code block highlighting with copy and "Apply" functionality
 * - Integration with the Diff store for applying AI-generated code changes
 * - Auto-scrolling to the latest message
 */
export function ChatPanel() {
  const { messages, isLoading, sendMessage, stopGeneration, clearChat } = useChatStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full border-l bg-accent/5 w-[400px]">
      <div className="p-3 border-b flex justify-between items-center bg-background/50">
        <span className="font-semibold text-sm">AI Assist</span>
        <Button variant="ghost" size="icon" onClick={clearChat} title="Clear Chat">
            <Eraser className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-10">
                <p>Select a provider and model in Settings.</p>
                <p>Then ask a question here.</p>
            </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[90%] rounded-lg p-3 text-sm",
              msg.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}
          >
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    code: CodeBlock
                }}
            >
                {msg.content}
            </ReactMarkdown>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-center">
                 <span className="animate-pulse text-xs text-muted-foreground">Thinking...</span>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI..."
                disabled={isLoading}
                className="flex-1"
                autoFocus
            />
            {isLoading ? (
                <Button type="button" variant="destructive" size="icon" onClick={stopGeneration}>
                    <StopCircle className="h-4 w-4" />
                </Button>
            ) : (
                <Button type="submit" size="icon" disabled={!input.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            )}
        </form>
      </div>
    </div>
  );
}
