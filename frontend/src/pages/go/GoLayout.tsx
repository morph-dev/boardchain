import { Button, HStack } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import NavigationButton from '../../components/navigation/NavigationButton';
import { useAppContext } from '../../providers/AppContext';
import { useToasts } from '../../hooks/useToasts';
import { useCallback } from 'react';

function MyGames() {
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

export default function GoLayout() {
  return (
    <>
      <HStack w="full">
        <NavigationButton to="lobby">Lobby</NavigationButton>
        <NavigationButton to="games">Games</NavigationButton>
        <MyGames />
      </HStack>
      <Outlet />
    </>
  );
}
