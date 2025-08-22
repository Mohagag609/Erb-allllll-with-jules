import { useCallback } from 'react';

type Toast = { title?: string; description?: string; variant?: 'default' | 'destructive' };

export function useToast() {
  const toast = useCallback((opts: Toast) => {
    // Placeholder: integrate with a real toast system (shadcn/ui) later
    if (opts.variant === 'destructive') {
      console.error(opts.title ?? 'Error', opts.description);
    } else {
      console.log(opts.title ?? 'Info', opts.description);
    }
  }, []);
  return { toast };
}