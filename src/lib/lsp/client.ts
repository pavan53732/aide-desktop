import { MonacoLanguageClient } from 'monaco-languageclient';
import { createMessageConnection, CloseAction, ErrorAction } from 'vscode-languageclient';
import { TauriMessageReader, TauriMessageWriter } from './transport';
import { invoke } from '@tauri-apps/api/core';

export async function createLSPClient(language: string, workspacePath: string) {
    try {
        console.log(`Starting LSP for ${language} in ${workspacePath}`);
        const lspId = await invoke<number>('start_lsp', { language, workspacePath });
        console.log(`LSP Started with ID: ${lspId}`);
        
        const reader = new TauriMessageReader(lspId);
        const writer = new TauriMessageWriter(lspId);
        
        const connection = createMessageConnection(reader as any, writer as any);
        
        const client = new MonacoLanguageClient({
            name: `${language} Client`,
            clientOptions: {
                // Use a Language Client / Server pattern
                documentSelector: [{ language }],
                errorHandler: {
                    error: () => ({ action: ErrorAction.Continue }),
                    closed: () => ({ action: CloseAction.DoNotRestart }),
                },
            },
            connectionProvider: {
                get: async () => {
                    return connection;
                }
            }
        } as any);

        return { client, lspId, connection };
    } catch (e) {
        console.error("Failed to create LSP client", e);
        throw e;
    }
}
