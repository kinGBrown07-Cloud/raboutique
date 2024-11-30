import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Alert, Snackbar, Button } from '@mui/material';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationAction {
  label: string;
  onClick: () => void;
}

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  persistent?: boolean;
  actions?: NotificationAction[];
}

interface NotificationContextType {
  notify: (message: string, type: NotificationType, options?: {
    persistent?: boolean;
    actions?: NotificationAction[];
  }) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationIdCounter = useRef(0);

  const notify = useCallback((message: string, type: NotificationType, options?: {
    persistent?: boolean;
    actions?: NotificationAction[];
  }) => {
    const id = `notification-${notificationIdCounter.current++}`;
    setNotifications(prev => [...prev, {
      id,
      message,
      type,
      persistent: options?.persistent,
      actions: options?.actions,
    }]);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const handleClose = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, clearAll }}>
      {children}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.persistent ? null : 6000}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            sx={{ width: '100%' }}
            action={
              notification.actions && (
                <>
                  {notification.actions.map((action, index) => (
                    <Button
                      key={index}
                      color="inherit"
                      size="small"
                      onClick={() => {
                        action.onClick();
                        if (!notification.persistent) {
                          handleClose(notification.id);
                        }
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </>
              )
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};
