import React, { useEffect, useState } from 'react';
// Trust Surface: NO framer-motion imports allowed
import { Button } from '@/components/ui/Button';
import { X, Check, AlertTriangle, FileText, ArrowRightLeft } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface DiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalContent: string;
  modifiedContent: string;
  fileName: string;
  onSave: (content: string) => void;
}

const DiffModal: React.FC<DiffModalProps> = ({
  isOpen,
  onClose,
  originalContent,
  modifiedContent,
  fileName,
  onSave
}) => {
  const [currentContent, setCurrentContent] = useState(modifiedContent);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setCurrentContent(modifiedContent);
  }, [modifiedContent]);

  const handleSave = () => {
    setIsConfirming(true);
    // Mimic async save without animation
    setTimeout(() => {
      onSave(currentContent);
      setIsConfirming(false);
      onClose();
    }, 500);
  };

  const handleRevert = () => {
    setCurrentContent(originalContent);
  };

  const handleAcceptChanges = () => {
    setCurrentContent(modifiedContent);
  };

  // Set up keyboard shortcuts for diff modal
  useKeyboardShortcuts({
    isDiffModalOpen: isOpen,
    onAcceptDiff: handleAcceptChanges,
    onRejectDiff: handleRevert,
  });

  // Calculate differences for highlighting
  const getDiffLines = () => {
    const originalLines = originalContent.split('\n');
    const modifiedLines = modifiedContent.split('\n');
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    
    const diffLines = [];
    for (let i = 0; i < maxLines; i++) {
      const origLine = originalLines[i] || '';
      const modLine = modifiedLines[i] || '';
      
      if (origLine !== modLine) {
        // Simple manual diff logic
        diffLines.push({
          lineNumber: i + 1,
          original: origLine,
          modified: modLine,
          isDifferent: true
        });
      }
    }
    
    return diffLines;
  };

  const diffLines = getDiffLines();

  if (!isOpen) return null;

  return (
    // Trust Surface Rule: Solid opaque background, no backdrop-blur
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diff-modal-title"
      aria-describedby="diff-modal-description"
    >
      {/* Trust Surface Rule: No scale/fade animations on entry */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-6xl h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-900/50 rounded-lg" aria-hidden="true">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 id="diff-modal-title" className="text-xl font-semibold text-white">Confirm Changes</h2>
              <p id="diff-modal-description" className="text-sm text-slate-400 font-mono">{fileName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRevert}
              className="text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Revert changes (Ctrl+Shift+R)"
            >
              Revert
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptChanges}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Accept all changes (Ctrl+Shift+A)"
            >
              Accept All
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Content Area - Static Split View */}
        <div className="flex-1 flex overflow-hidden bg-slate-950">
          {/* Original Content Panel */}
          <div className="w-1/2 border-r border-slate-700 flex flex-col">
            <div className="p-2 bg-slate-900 border-b border-slate-700">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-red-400">Original</h3>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap break-words text-slate-500">
                {originalContent}
              </pre>
            </div>
          </div>

          {/* Modified Content Panel */}
          <div className="w-1/2 flex flex-col">
            <div className="p-2 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-green-400">Modified</h3>
              <ArrowRightLeft className="h-3 w-3 text-slate-600" />
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed">
              <pre className="whitespace-pre-wrap break-words text-slate-200">
                {modifiedContent}
              </pre>
            </div>
          </div>
        </div>

        {/* Action Bar - Static */}
        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-slate-400 font-mono">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>{diffLines.length} modifications proposed</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Cancel and close"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isConfirming}
                className={`
                  ${isConfirming ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'}
                  text-white font-medium min-w-[140px]
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                `}
                aria-label="Confirm and save changes"
              >
                <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                {isConfirming ? 'Saving...' : 'Confirm Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffModal;