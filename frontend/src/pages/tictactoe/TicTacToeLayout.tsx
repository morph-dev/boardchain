import { HStack } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import MyGames from './components/buttons/MyGames';
import NavigationButton from '../../components/navigation/NavigationButton';

export default function TicTacToeLayout() {
  return (
    <>
      <HStack w="full">
        <NavigationButton to="lobby">Lobby</NavigationButton>
        <MyGames />
      </HStack>
      <Outlet />
    </>
  );
}
