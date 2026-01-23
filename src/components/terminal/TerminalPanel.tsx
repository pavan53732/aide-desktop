import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { X } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

interface TerminalPanelProps {
  onClose?: () => void;
  className?: string;
}

export function TerminalPanel({ onClose, className }: TerminalPanelProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const ptyIdRef = useRef<string>(`pty-${Date.now()}`);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Init Terminal
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: '#09090b', // zinc-950
        foreground: '#e4e4e7', // zinc-200
        cursor: '#fff',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(terminalRef.current);
    
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Backend Init
    const initPty = async () => {
      try {
        await invoke('spawn_pty', {
          id: ptyIdRef.current,
          rows: term.rows,
          cols: term.cols,
        });

        // Listen for incoming data
        const unlisten = await listen(`pty-data-${ptyIdRef.current}`, (event: any) => {
          term.write(event.payload);
        });

        // Handle user input
        term.onData((data) => {
          invoke('write_pty', { id: ptyIdRef.current, data });
        });

        // Handle resize
        const handleResize = () => {
          fitAddon.fit();
          invoke('resize_pty', {
            id: ptyIdRef.current,
            rows: term.rows,
            cols: term.cols,
          });
        };
        
        window.addEventListener('resize', handleResize);
        
        // Initial welcome message
        term.write('\x1b[32mWelcome to AIDE Terminal\x1b[0m\r\n');

        return () => {
            unlisten();
            window.removeEventListener('resize', handleResize);
            term.dispose();
            // TODO: Kill PTY on backend
        };
      } catch (err) {
        term.write(`\r\n\x1b[31mFailed to spawn terminal: ${JSON.stringify(err)}\x1b[0m\r\n`);
        console.error('PTY Spawn Error:', err);
      }
    };

    const cleanupPromise = initPty();

    return () => {
        cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, []);

  return (
    <div className={`h-full flex flex-col bg-zinc-950 ${className}`}>
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <span className="text-xs font-semibold text-zinc-400">TERMINAL</span>
            {onClose && (
                <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded">
                    <X size={14} className="text-zinc-400" />
                </button>
            )}
        </div>
      <div 
        ref={terminalRef} 
        className="flex-1 w-full overflow-hidden p-2"
        style={{ minHeight: 0 }}
      />
    </div>
  );
}
