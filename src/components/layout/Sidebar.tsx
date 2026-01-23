import { useWorkspaceStore } from "@/stores/workspace-store";
import { useGitStatus } from "@/hooks/use-git";
import { Button } from "@/components/ui/Button";
import { FileTree } from "@/components/files/FileTree";
import { FolderOpen, FilePlus, FolderPlus, Trash2, RefreshCw, TerminalSquare } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { open, ask } from "@tauri-apps/plugin-dialog";
import { readDir } from "@tauri-apps/plugin-fs";
import { useRAGStore } from "@/stores/rag-store";
import { Database } from "lucide-react";

// Helper to recursively build file tree
// Note: In a real app we might want to lazy load, but for Stage 2 we'll try to load depth-first
// or just top-level. Let's start with a recursive loader.
async function buildFileTree(path: string): Promise<any[]> {
    try {
        const entries = await readDir(path);
        const nodes = [];
        for (const entry of entries) {
            const kind = entry.isDirectory ? "directory" : "file";
            const node: any = {
                path: `${path}/${entry.name}`, // Naive path joining, might need normalization on Windows
                name: entry.name,
                kind: kind,
            };
            if (entry.isDirectory) {
               // For performance/simplicity in MVP, maybe don't deep recurse instantly?
               // Let's recurse 1 level or handle 'on expand' in the component. 
               // For this 'Sidebar.tsx' implementation, let's assume valid tree.
               // ACTUALLY: Let's implement lazy loading logic in the component or store later.
               // For now, let's just create the top-level structure.
               node.children = []; 
            }
            nodes.push(node);
        }
        return nodes;
    } catch (e) {
        console.error("Failed to read dir", e);
        return [];
    }
}

// Better approach: The Sidebar handles the "Open Workspace" action, 
// and populates the store. The Store or a hook handles the reading.
// For now, let's put the logic here for simplicity of Stage 2 verification.

export function Sidebar() {
  const { workspacePath, files, setWorkspacePath, setFiles, selectedFile, setSelectedFile, createFile, createFolder, deleteNode, refreshFiles } = useWorkspaceStore();
  const { data: gitStatus } = useGitStatus(workspacePath);

  const handleOpenWorkspace = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Workspace Folder",
      });

      if (selected && typeof selected === "string") {
        setWorkspacePath(selected);
        // Initial load
        const nodes = await buildFileTree(selected); // This is just top-level
        setFiles(nodes);
      }
    } catch (err) {
      console.error("Failed to open workspace:", err);
    }
  };

  const handleCreateFile = async () => {
    const name = prompt("Enter file name:");
    if (!name) return;
    try {
        // Create at root for MVP or relative to selected if we track that context options
        // For now, let's just create at root of workspace
        await createFile(name);
    } catch (e: any) {
        alert("Failed to create file: " + e.message);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name) return;
    try {
        await createFolder(name);
    } catch (e: any) {
        alert("Failed to create folder: " + e.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    const confirmed = await ask(`Are you sure you want to delete ${selectedFile}?`, { title: "Delete", kind: "warning" });
    if (confirmed) {
        // Need relative path or absolute? Backend expects relative to workspace I think?
        // Let's check backend: validate_path joins workspace + path.
        // But the FileNode path from `list_files` might be absolute?
        // Let's check `file_ops.rs` -> it returns `path.to_string_lossy()`.
        // If `readDir` returns absolute paths, we need to handle that.
        // Actually, for `delete_node(path)`, if path is absolute, `join` might behave oddly or we need to strip workspace.
        
        // Let's assume we pass the path from the node.
        // If it's absolute, `workspace.join(absolute)` on Windows might just replace it with absolute?
        // Actually, we should probably verify what `list_files` returns. 
        // It uses `path.to_string_lossy()` on the entry path.
        // `entry.path()` is absolute.
        
        // So we need to relativize it or fix backend to accept absolute if within workspace.
        // The backend `validate_path` logic: `Path::new(&workspace_path).join(path)`.
        // If `path` is absolute `D:\...`, joining it to workspace will likely be `D:\...`.
        // Then `canonicalize` checks `starts_with(workspace)`. 
        // So passing absolute path *might* work if `join` handles it, OR we should pass relative.
        
        // Safer to try passing the relative name? 
        // But complex logic. Let's try passing the stored path.
        // If it fails, we fix it.
        
        // Wait, `selectedFile` holds the path.
        // We probably need to strip the workspace root from it.
        
        // Let's implement a simple strip or backend fix.
        // The backend `validate_path` joins. 
        // If I pass "foo.txt", it joins.
        // If I pass "d:/workspace/foo.txt", `join` on windows:
        // Path::new("d:/workspace").join("d:/workspace/foo.txt") -> "d:/workspace/foo.txt" (if join detects absolute, it replaces).
        // Rust `Path::join` behavior: "If path is absolute, it replaces self."
        // So passing absolute path works!
        
        // However, we must ensure it matches the `starts_with` check.
        // Absolute path canonicalized should start with workspace canonicalized.
        
        try {
            // HACK: for delete, we might need to be careful.
            // Let's convert absolute path to relative if possible, or just pass it as is since backend handles absolute join.
            // But `selectedFile` is from the store.
            
            // To be safe, let's try passing relative to workspace if we can.
            let pathToSend = selectedFile;
            if (workspacePath && selectedFile.startsWith(workspacePath)) {
                pathToSend = selectedFile.slice(workspacePath.length).replace(/^[/\\]/, "");
            }
            
            await deleteNode(pathToSend);
            setSelectedFile(null); // Clear selection
        } catch (e: any) {
            alert("Failed to delete: " + e.message);
        }
    }
  };

  return (
    <aside className="w-64 border-r bg-muted/10 flex flex-col h-full">
      <div className="p-4 border-b h-14 flex items-center justify-between font-medium text-sm">
        <span>FILES</span>
        {workspacePath && (
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCreateFile} title="New File">
                    <FilePlus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCreateFolder} title="New Folder">
                    <FolderPlus className="h-4 w-4" />
                </Button>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={refreshFiles} title="Refresh">
                    <RefreshCw className="h-4 w-4" />
                </Button>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => useUIStore.getState().toggleTerminal()} title="Toggle Terminal">
                    <TerminalSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={handleDelete} title="Delete Selected">
                    <Trash2 className="h-4 w-4" />
                </Button>
                <IndexButton />
            </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-2">
        {!workspacePath ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No workspace open</p>
            <Button onClick={handleOpenWorkspace}>Open Folder</Button>
          </div>
        ) : (
          <FileTree 
            nodes={files} 
            onSelect={setSelectedFile} 
            selectedPath={selectedFile} 
            gitStatus={gitStatus}
          />
        )}
      </div>
    </aside>
  );
}

function IndexButton() {
    const { isIndexing, progress, indexWorkspace } = useRAGStore();
    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={indexWorkspace} 
            disabled={isIndexing}
            title={isIndexing ? `Indexing... ${progress?.current}/${progress?.total}` : "Index Workspace (RAG)"}
        >
            <Database className={`h-4 w-4 ${isIndexing ? "animate-pulse text-blue-400" : ""}`} />
            {isIndexing && <span className="sr-only">Indexing</span>}
        </Button>
    )
}
