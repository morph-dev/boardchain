import { UseToastOptions, useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

export function useToasts() {
  const toast = useToast();

  const pleaseAuthenticateToast = useCallback(
    (config?: UseToastOptions) => toast({ title: 'Please Authenticate', ...config }),
    [toast]
  );

  return {
    toast,
    pleaseAuthenticateToast,
  };
}
