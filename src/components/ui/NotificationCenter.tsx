import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { X, Bell, Check, AlertCircle, Info } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification, markAsRead, clearAllNotifications } = useAppStore();
  const [isVisible, setIsVisible] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      default:
        return 'border-blue-500/30 bg-blue-500/5';
    }
  };

  // Auto-hide notification center when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isVisible && !target.closest('.notification-center') && !target.closest('.notification-trigger')) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  // Mark all notifications as read when opening the center
  const handleOpenCenter = () => {
    setIsVisible(true);
    notifications.forEach(notification => {
      if (!notification.read) {
        markAsRead(notification.id);
      }
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpenCenter}
        className="relative notification-trigger text-slate-400 hover:text-white hover:bg-slate-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-xs rounded-full flex items-center justify-center text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed right-4 top-16 w-80 max-h-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 notification-center overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-slate-400" />
                <h3 className="font-medium text-slate-200">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="text-xs text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  Clear All
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVisible(false)}
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  No notifications
                </div>
              ) : (
                <ul>
                  <AnimatePresence>
                    {notifications.map((notification) => (
                      <motion.li
                        key={notification.id}
                        className={`p-3 border-b border-slate-700 last:border-b-0 ${getTypeColor(notification.type)} ${
                          !notification.read ? 'bg-slate-700/30' : ''
                        }`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex justify-between">
                          <div className="flex items-start space-x-2">
                            {getTypeIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-200 text-sm truncate">
                                {notification.title}
                              </h4>
                              <p className="text-slate-400 text-xs mt-1">
                                {notification.message}
                              </p>
                              <p className="text-slate-500 text-xs mt-1">
                                {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeNotification(notification.id)}
                            className="text-slate-500 hover:text-slate-300 hover:bg-slate-600/50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;