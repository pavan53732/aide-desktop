import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path"; 

// Since we are in the browser, using @tauri-apps/api/path might be async. 
// However, simple string concatenation is often enough if we know the separator.
// But workspacePath might be "C:\Projects\Foo" and git path "src/main.rs".
// "C:\Projects\Foo/src/main.rs" usually works in JS/Browser context for display, 
// but for strict string matching with FileNode paths (which might use backslashes), we need to be careful.
// Let's assume FileNodes have whatever the OS gave us. 
// We will normalize git paths to match the OS style if possible, or try both.

export interface GitStatus {
  [path: string]: string; // "modified" | "untracked" | "added" | "deleted" | "ignored"
}

// Helper to normalize paths for matching
// We will return a Map<AbsolutePath, Status>
async function parseGitStatus(statusMap: Record<string, string>, workspacePath: string): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    // Detect OS separator from workspacePath 
    const isWin = workspacePath.includes("\\");
    const sep = isWin ? "\\" : "/";

    for (const [relPath, code] of Object.entries(statusMap)) {
        // Git usually returns forward slashes. 
        // We replace / with sep
        const normalizedRel = isWin ? relPath.replace(/\//g, "\\") : relPath;
        
        // Construct absolute path
        // Removing trailing slash from workspace if present to avoid double slash
        const cleanWorkspace = workspacePath.endsWith(sep) ? workspacePath.slice(0, -1) : workspacePath;
        const absPath = `${cleanWorkspace}${sep}${normalizedRel}`;

        let status = "ignored";
        const c = code.trim(); // "??", "M", "A", etc.
        
        if (c === "??" || c === "?") status = "untracked";
        else if (c.includes("M")) status = "modified";
        else if (c.includes("A")) status = "added";
        else if (c.includes("D")) status = "deleted";

        map.set(absPath, status);
    }
    return map;
}

export function useGitStatus(workspacePath: string | null) {
  return useQuery({
    queryKey: ["gitStatus", workspacePath],
    queryFn: async () => {
      if (!workspacePath) return new Map<string, string>();
      try {
        const raw = await invoke<Record<string, string>>("git_status", { workspacePath });
        return parseGitStatus(raw, workspacePath);
      } catch (e) {
        console.warn("Git status failed:", e);
        return new Map<string, string>();
      }
    },
    enabled: !!workspacePath,
    refetchInterval: 5000, // Poll every 5s
  });
}
