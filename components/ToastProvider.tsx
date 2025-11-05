'use client';

import { useState, useEffect } from 'react';
import { ToastContainer, type Toast } from './Toast';
import { subscribeToToasts, removeToast, getToasts } from '@/lib/toast';

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
