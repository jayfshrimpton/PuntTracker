import { Toast } from '@/components/Toast';
export type { Toast } from '@/components/Toast';

let toastIdCounter = 0;
let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

export function subscribeToToasts(callback: (toasts: Toast[]) => void) {
  toastListeners.push(callback);
  return () => {
    toastListeners = toastListeners.filter((listener) => listener !== callback);
  };
}

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = `toast-${++toastIdCounter}`;
  const newToast: Toast = { id, message, type };
  toasts.push(newToast);
  notifyListeners();

  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeToast(id);
  }, 5000);
}

export function removeToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
  notifyListeners();
}

export function getToasts(): Toast[] {
  return [...toasts];
}
