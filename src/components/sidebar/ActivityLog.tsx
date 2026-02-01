import React, { useState } from 'react';
import { Activity, ChevronRight, ChevronDown, ChevronLeft, FileText, Edit3, Eye } from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: 'file-read' | 'file-edit' | 'file-create' | 'ai-request' | 'ai-response';
  message: string;
  filePath?: string;
}

const mockActivities: ActivityLogEntry[] = [
  { id: '1', timestamp: '10:30 AM', type: 'file-read', message: 'Read file', filePath: '/src/App.tsx' },
  { id: '2', timestamp: '10:32 AM', type: 'ai-request', message: 'User asked for code review' },
  { id: '3', timestamp: '10:35 AM', type: 'ai-response', message: 'AI provided suggestions' },
  { id: '4', timestamp: '10:40 AM', type: 'file-edit', message: 'Proposed changes to', filePath: '/src/lib/utils.ts' },
  { id: '5', timestamp: '10:42 AM', type: 'file-read', message: 'Read file', filePath: '/package.json' },
];

const getIconForType = (type: ActivityLogEntry['type']) => {
  switch (type) {
    case 'file-read': return <Eye className="h-4 w-4 text-blue-500" />;
    case 'file-edit': return <Edit3 className="h-4 w-4 text-yellow-500" />;
    case 'file-create': return <FileText className="h-4 w-4 text-green-500" />;
    case 'ai-request': return <Activity className="h-4 w-4 text-purple-500" />;
    case 'ai-response': return <Activity className="h-4 w-4 text-indigo-500" />;
    default: return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

const getTypeColor = (type: ActivityLogEntry['type']) => {
  switch (type) {
    case 'file-read': return 'text-blue-600';
    case 'file-edit': return 'text-yellow-600';
    case 'file-create': return 'text-green-600';
    case 'ai-request': return 'text-purple-600';
    case 'ai-response': return 'text-indigo-600';
    default: return 'text-gray-600';
  }
};

export const ActivityLog = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  if (!isOpen) {
    return (
      <button 
        className="absolute right-0 top-1/2 transform -translate-y-1/2 p-1 bg-border rounded-l-md"
        onClick={() => setIsOpen(true)}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    );
  }
  
  return (
    <div className="w-64 border-l flex flex-col">
      <div className="p-3 border-b flex justify-between items-center">
        <h2 className="font-semibold text-sm flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          ACTIVITY
        </h2>
        <button 
          className="p-1 hover:bg-accent rounded"
          onClick={() => setIsOpen(false)}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {mockActivities.map(activity => (
            <div key={activity.id} className="p-2 border rounded text-xs">
              <div className="flex items-start space-x-2">
                {getIconForType(activity.type)}
                <div>
                  <div className="font-medium text-muted-foreground">
                    {activity.timestamp}
                  </div>
                  <div className={getTypeColor(activity.type)}>
                    {activity.message} {activity.filePath && (
                      <span className="font-mono text-xs bg-muted px-1 rounded">
                        {activity.filePath}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Note: We need to import ChevronLeft which isn't currently imported
// Adding it to the import statement at the top