import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { AlertCircle, X } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  errorDetails?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  errorDetails
}) => {
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
            className="bg-slate-900 border border-red-500/30 rounded-xl w-full max-w-md flex flex-col shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Error</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1">
              <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
              <p className="text-slate-300 mb-4">{message}</p>
              
              {errorDetails && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Details:</h4>
                  <pre className="text-xs text-slate-400 whitespace-pre-wrap break-words font-mono">
                    {errorDetails}
                  </pre>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/30">
              <div className="flex justify-end">
                <Button
                  onClick={onClose}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorModal;