import React, { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { FileTreeSkeleton } from '../skeletons/FileTreeSkeleton';

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
  const itemId = `file-tree-item-${item.id}`;
  
  return (
    <div className="select-none" role="treeitem" aria-expanded={item.type === 'folder' ? expanded : undefined}>
      <div
        id={itemId}
        className={`flex items-center py-1 px-2 hover:bg-accent rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${level > 0 ? 'ml-' + (level * 4) : ''}`}
        onClick={() => item.type === 'folder' && setExpanded(!expanded)}
        role={item.type === 'folder' ? 'button' : undefined}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (item.type === 'folder') {
              setExpanded(!expanded);
            }
          }
        }}
        aria-label={item.type === 'folder' ? `${expanded ? 'Collapse' : 'Expand'} folder ${item.name}` : `File ${item.name}`}
      >
        {item.type === 'folder' ? (
          <>
            {expanded ? <ChevronDown className="h-4 w-4 mr-1" aria-hidden="true" /> : <ChevronRight className="h-4 w-4 mr-1" aria-hidden="true" />}
            <Folder className="h-4 w-4 mr-2" aria-hidden="true" />
          </>
        ) : (
          <File className="h-4 w-4 mr-2 ml-5" aria-hidden="true" />
        )}
        <span className="text-sm">{item.name}</span>
      </div>
      
      {item.type === 'folder' && expanded && item.children && (
        <div role="group" aria-label={`${item.name} contents`}>
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading state for file tree
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  if (!isOpen) {
    return (
      <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 p-1 bg-border rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
        type="button"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }
  
  return (
    <aside className="w-64 border-r flex flex-col" role="complementary" aria-label="File explorer">
      <div className="p-3 border-b flex justify-between items-center">
        <h2 className="font-semibold text-sm">EXPLORER</h2>
        <button
          className="p-1 hover:bg-accent rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
          type="button"
        >
          <ChevronDown className="h-4 w-4 rotate-90" aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2" role="tree" aria-label="File tree">
        {isLoading ? (
          <FileTreeSkeleton />
        ) : (
          mockFileSystem.map(item => (
            <FileTreeItem key={item.id} item={item} />
          ))
        )}
      </div>
    </aside>
  );
};