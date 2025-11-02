import toast, { ToastOptions } from 'react-hot-toast';

const base: ToastOptions = {
  duration: 3000,
};

export const notify = {
  success(message: string, options?: ToastOptions) {
    return toast.success(message, { ...base, ...options });
  },
  error(message: string, options?: ToastOptions) {
    return toast.error(message, { ...base, ...options });
  },
  info(message: string, options?: ToastOptions) {
    return toast(message, { ...base, ...options });
  },
  loading(message: string, options?: ToastOptions) {
    return toast.loading(message, { ...base, ...options });
  },
  promise<T>(p: Promise<T>, messages: { loading: string; success: string | ((t: T) => string); error: string | ((e: any) => string) }, options?: ToastOptions) {
    return toast.promise(p, {
      loading: messages.loading,
      success: (t) => (typeof messages.success === 'function' ? (messages.success as any)(t) : messages.success),
      error: (e) => (typeof messages.error === 'function' ? (messages.error as any)(e) : messages.error),
    }, { ...base, ...options });
  },
  dismiss(id?: string) {
    toast.dismiss(id);
  }
};

export default notify;
