import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

export default function NotificationBar() {
  const { notification, clearNotification } = useNotification();

  if (!notification) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      minWidth: 250,
      background: notification.type === 'error' ? '#f44336' : notification.type === 'success' ? '#4caf50' : '#2196f3',
      color: 'white',
      padding: '16px 24px',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      fontSize: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: 'pointer',
    }} onClick={clearNotification}>
      <span>{notification.message}</span>
      <span style={{marginLeft: 'auto', fontWeight: 'bold'}}>×</span>
    </div>
  );
}
