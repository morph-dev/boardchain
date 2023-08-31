import { Button } from '@chakra-ui/react';
import { useCallback } from 'react';
import NavigationButton from '../../../../components/navigation/NavigationButton';
import { useToasts } from '../../../../hooks/useToasts';
import { useAppContext } from '../../../../providers/AppContext';

export default function MyGames() {
  const { userAddress } = useAppContext();
  const { pleaseAuthenticateToast } = useToasts();

  const pleaseAuthenticateHandler = useCallback(
    () => pleaseAuthenticateToast(),
    [pleaseAuthenticateToast]
  );

  if (userAddress !== null) {
    return <NavigationButton to={`player/${userAddress}`}>My games</NavigationButton>;
  }

  return (
    <Button
      colorScheme="blue"
      variant="ghost"
      borderWidth={1}
      borderColor="transparent"
      onClick={pleaseAuthenticateHandler}
    >
      My games
    </Button>
  );
}
