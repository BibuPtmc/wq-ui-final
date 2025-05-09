import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null); // { message, type }

  const showNotification = useCallback(
    (message, type = "info", duration = 4000) => {
      setNotification({ message, type });
      if (duration > 0) {
        setTimeout(() => setNotification(null), duration);
      }
    },
    []
  );

  const clearNotification = useCallback(() => setNotification(null), []);

  return (
    <NotificationContext.Provider
      value={{ notification, showNotification, clearNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
