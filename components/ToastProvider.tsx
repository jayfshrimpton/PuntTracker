'use client';

import { useState, useEffect } from 'react';
import { ToastContainer } from './Toast';
import { subscribeToToasts, removeToast, getToasts, type Toast } from '@/lib/toast';

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setToasts(getToasts());
    const unsubscribe = subscribeToToasts((newToasts) => {
      setToasts(newToasts);
    });

    return unsubscribe;
  }, []);

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}
