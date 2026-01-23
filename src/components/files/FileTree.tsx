import { FileNode } from "@/stores/workspace-store";
import { Folder, FolderOpen, File, FileCode, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  nodes: FileNode[];
  onSelect: (path: string) => void;
  selectedPath: string | null;
  level?: number;
  gitStatus?: Map<string, string>;
}

export function FileTree({ nodes, onSelect, selectedPath, level = 0, gitStatus }: FileTreeProps) {
  // Simple sort: folders first, then files, both alphabetical
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.kind === b.kind) return a.name.localeCompare(b.name);
    return a.kind === "directory" ? -1 : 1;
  });

  return (
    <div className="text-sm select-none">
      {sortedNodes.map((node) => (
        <FileTreeNode 
          key={node.path} 
          node={node} 
          onSelect={onSelect} 
          selectedPath={selectedPath} 
          level={level} 
          gitStatus={gitStatus}
        />
      ))}
    </div>
  );
}

function FileTreeNode({ node, onSelect, selectedPath, level, gitStatus }: { 
  node: FileNode; 
  onSelect: (path: string) => void; 
  selectedPath: string | null;
  level: number;
  gitStatus?: Map<string, string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isSelected = selectedPath === node.path;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.kind === "directory") {
      setIsOpen(!isOpen);
    } else {
      onSelect(node.path);
    }
  };

  const status = gitStatus?.get(node.path); // "modified", "untracked", etc.

  const getIcon = () => {
    if (node.kind === "directory") {
      return isOpen ? <FolderOpen className="h-4 w-4 text-blue-400" /> : <Folder className="h-4 w-4 text-blue-400" />;
    }
    // Very basic extension check for icon variety (optional polish)
    if (node.name.endsWith(".tsx") || node.name.endsWith(".ts") || node.name.endsWith(".js")) {
        return <FileCode className="h-4 w-4 text-yellow-500" />;
    }
    return <File className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = () => {
      switch (status) {
          case 'modified': return 'text-yellow-500';
          case 'untracked': return 'text-green-500';
          case 'added': return 'text-green-500';
          case 'deleted': return 'text-red-500 line-through';
          default: return '';
      }
  };

  return (
    <div>
      <div 
        className={cn(
          "flex items-center py-1 px-2 hover:bg-accent/50 cursor-pointer transition-colors",
          isSelected && "bg-accent text-accent-foreground font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
        onClick={handleClick}
      >
        <span className="mr-1 opacity-70 w-4 flex justify-center">
            {node.kind === "directory" && (
                isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
            )}
        </span>
        <span className="mr-2">{getIcon()}</span>
        <span className={cn("truncate", getStatusColor())}>
            {node.name}
            {status && <span className="ml-2 text-xs opacity-50 uppercase">[{status[0]}]</span>}
        </span>
      </div>
      
      {node.kind === "directory" && isOpen && node.children && (
        <FileTree 
          nodes={node.children} 
          onSelect={onSelect} 
          selectedPath={selectedPath} 
          level={level + 1} 
          gitStatus={gitStatus}
        />
      )}
    </div>
  );
}
