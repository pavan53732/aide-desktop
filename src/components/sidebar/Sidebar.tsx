import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FileSystemItem[];
  path?: string;
}

const mockFileSystem: FileSystemItem[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        children: [
          { id: '3', name: 'ui', type: 'folder' },
          { id: '4', name: 'layout', type: 'folder' },
          { id: '5', name: 'App.tsx', type: 'file', path: '/src/App.tsx' },
        ],
      },
      {
        id: '6',
        name: 'lib',
        type: 'folder',
        children: [
          { id: '7', name: 'utils.ts', type: 'file', path: '/src/lib/utils.ts' },
        ],
      },
      { id: '8', name: 'main.tsx', type: 'file', path: '/src/main.tsx' },
    ],
  },
  {
    id: '9',
    name: 'public',
    type: 'folder',
    children: [
      { id: '10', name: 'index.html', type: 'file', path: '/public/index.html' },
    ],
  },
  { id: '11', name: 'package.json', type: 'file', path: '/package.json' },
];

const FileTreeItem = ({ item, level = 0 }: { item: FileSystemItem; level?: number }) => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1 px-2 hover:bg-accent rounded cursor-pointer ${level > 0 ? 'ml-' + (level * 4) : ''}`}
        onClick={() => item.type === 'folder' && setExpanded(!expanded)}
      >
        {item.type === 'folder' ? (
          <>
            {expanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
            <Folder className="h-4 w-4 mr-2" />
          </>
        ) : (
          <File className="h-4 w-4 mr-2 ml-5" />
        )}
        <span className="text-sm">{item.name}</span>
      </div>
      
      {item.type === 'folder' && expanded && item.children && (
        <div>
          {item.children.map(child => (
            <FileTreeItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  if (!isOpen) {
    return (
      <button 
        className="absolute left-0 top-1/2 transform -translate-y-1/2 p-1 bg-border rounded-r-md"
        onClick={() => setIsOpen(true)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    );
  }
  
  return (
    <div className="w-64 border-r flex flex-col">
      <div className="p-3 border-b flex justify-between items-center">
        <h2 className="font-semibold text-sm">EXPLORER</h2>
        <button 
          className="p-1 hover:bg-accent rounded"
          onClick={() => setIsOpen(false)}
        >
          <ChevronDown className="h-4 w-4 rotate-90" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {mockFileSystem.map(item => (
          <FileTreeItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};