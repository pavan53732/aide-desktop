const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog APIs
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  openFile: (filters) => ipcRenderer.invoke('dialog:openFile', filters),
  
  // File system operations
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  listFiles: (directoryPath) => ipcRenderer.invoke('fs:listFiles', directoryPath),
  
  // AI provider operations
  fetchModels: (providerConfig) => ipcRenderer.invoke('ai:fetchModels', providerConfig),
  testConnection: (providerConfig) => ipcRenderer.invoke('ai:testConnection', providerConfig),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  
  // IPC event listeners
  on: (channel, callback) => {
    const subscription = (_, data) => callback(data);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  }
});