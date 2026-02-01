import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { X, Check, AlertTriangle, FileText, ArrowRightLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';

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
        diffLines.push({
          lineNumber: i + 1,
          original: origLine,
          modified: modLine,
          isDifferent: true
        });
      } else if (origLine.trim() !== '') {
        diffLines.push({
          lineNumber: i + 1,
          original: origLine,
          modified: modLine,
          isDifferent: false
        });
      }
    }
    
    return diffLines;
  };

  const diffLines = getDiffLines();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-6xl h-[80vh] flex flex-col shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Confirm Changes</h2>
                  <p className="text-sm text-slate-400">{fileName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRevert}
                  className="text-slate-300 hover:bg-slate-700"
                >
                  Revert
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAcceptChanges}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Accept All
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Original Content Panel */}
              <div className="w-1/2 border-r border-slate-700 flex flex-col">
                <div className="p-2 bg-slate-800/50 border-b border-slate-700">
                  <h3 className="text-sm font-medium text-slate-300">Original</h3>
                </div>
                <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-sm">
                  <pre className="whitespace-pre-wrap break-words text-slate-400">
                    {originalContent}
                  </pre>
                </div>
              </div>

              {/* Modified Content Panel */}
              <div className="w-1/2 flex flex-col">
                <div className="p-2 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-300">Modified</h3>
                  <div className="flex items-center space-x-2">
                    <ArrowRightLeft className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
                <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-sm">
                  <pre className="whitespace-pre-wrap break-words text-slate-300">
                    {modifiedContent}
                  </pre>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{diffLines.length} changes detected</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isConfirming}
                    className={`${
                      isConfirming 
                        ? 'bg-green-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                  >
                    {isConfirming ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Check className="h-4 w-4" />
                      </motion.span>
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    {isConfirming ? 'Saving...' : 'Confirm Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DiffModal;