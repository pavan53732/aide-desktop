import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import {
    MessageReader,
    MessageWriter,
    Disposable,
    Message,
    Emitter,
    AbstractMessageReader,
    AbstractMessageWriter,
    DataCallback
} from 'vscode-jsonrpc';

export class TauriMessageWriter extends AbstractMessageWriter {
    constructor(private lspId: number) {
        super();
    }

    async write(msg: Message): Promise<void> {
        const content = JSON.stringify(msg);
        const length = new TextEncoder().encode(content).byteLength;
        const packet = `Content-Length: ${length}\r\n\r\n${content}`;
        try {
            await invoke('write_lsp', { id: this.lspId, data: packet });
        } catch (e) {
            // @ts-ignore
            this.fireError(e);
        }
    }

    end(): void {}
}

export class TauriMessageReader extends AbstractMessageReader {
    // Basic state machine for Content-Length framing
    private buffer: Uint8Array = new Uint8Array(0);
    private contentLength: number = -1;
    private state: 'HEADER' | 'CONTENT' = 'HEADER';
    private unlisten: (() => void) | undefined;
    private callback: DataCallback | undefined;

    constructor(private lspId: number) {
        super();
    }

    listen(callback: DataCallback): Disposable {
        this.callback = callback;
        listen<number[]>(`lsp-stdout-${this.lspId}`, (event) => {
            if (!this.callback) return;
            const newData = new Uint8Array(event.payload);
            this.appendBuffer(newData);
            this.processBuffer();
        }).then(unlisten => {
            this.unlisten = unlisten;
        });

        // Also listen for stderr/exit?
        return {
            dispose: () => {
                this.unlisten?.();
                this.callback = undefined;
            }
        };
    }

    private appendBuffer(data: Uint8Array) {
        const newBuffer = new Uint8Array(this.buffer.length + data.length);
        newBuffer.set(this.buffer);
        newBuffer.set(data, this.buffer.length);
        this.buffer = newBuffer;
    }

    private processBuffer() {
        while (true) {
            if (this.state === 'HEADER') {
                // Look for \r\n\r\n
                const str = new TextDecoder().decode(this.buffer);
                const headerEnd = str.indexOf('\r\n\r\n');
                
                if (headerEnd !== -1) {
                    const headerPart = str.substring(0, headerEnd);
                    // Parse Content-Length
                    const match = headerPart.match(/Content-Length: (\d+)/i);
                    if (match) {
                        this.contentLength = parseInt(match[1]);
                        // Move buffer past header
                        // Note: TextDecoder handles utf8 but headers are ascii using byte index might be safer?
                        // \r\n\r\n is 4 bytes.
                        // We need exact byte index of the sequence 13,10,13,10
                        
                        // Let's do byte search for safety against multi-byte confusion (though headers are ascii)
                        const splitIndex = this.findSequence(this.buffer, [13, 10, 13, 10]);
                        if (splitIndex !== -1) {
                            this.buffer = this.buffer.slice(splitIndex + 4);
                            this.state = 'CONTENT';
                        } else {
                            // Should theoretically find it if string find worked, but safeguard
                            break;
                        }
                    } else {
                        // Invalid header or other headers? discard?
                        // For now assume standard LSP
                         console.error("Invalid LSP Header", headerPart);
                         this.buffer = this.buffer.slice(headerEnd + 4); // Skip
                    }
                } else {
                    break; // Need more data
                }
            }

            if (this.state === 'CONTENT') {
                if (this.buffer.length >= this.contentLength) {
                    const messageBytes = this.buffer.slice(0, this.contentLength);
                    this.buffer = this.buffer.slice(this.contentLength);
                    this.contentLength = -1;
                    this.state = 'HEADER';
                    
                    try {
                        const jsonStr = new TextDecoder().decode(messageBytes);
                        const message = JSON.parse(jsonStr);
                        if (this.callback) this.callback(message);
                    } catch (e) {
                         // @ts-ignore
                         this.fireError(e);
                    }
                } else {
                    break; // Need more data
                }
            }
        }
    }

    private findSequence(data: Uint8Array, seq: number[]): number {
        for (let i = 0; i <= data.length - seq.length; i++) {
            let match = true;
            for (let j = 0; j < seq.length; j++) {
                if (data[i + j] !== seq[j]) {
                    match = false;
                    break;
                }
            }
            if (match) return i;
        }
        return -1;
    }
}
