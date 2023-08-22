import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

export function useErrorHandler(): (
  title: string,
  description?: string | ((error: Error) => string)
) => (error: Error) => void {
  const toast = useToast();
  return useCallback(
    (title: string, description?: string | ((error: Error) => string)) => {
      return (error: Error) =>
        toast({
          title: title,
          status: 'error',
          description: typeof description === 'function' ? description(error) : description,
          isClosable: true,
        });
    },
    [toast]
  );
}
