import { HStack } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import CreateGame from './components/buttons/CreateGame';
import LobbyButton from './components/buttons/LobbyButton';
import MyGames from './components/buttons/MyGames';

export default function TicTacToeLayout() {
  return (
    <>
      <HStack>
        <CreateGame />
        <LobbyButton />
        <MyGames />
      </HStack>
      <Outlet />
    </>
  );
}
