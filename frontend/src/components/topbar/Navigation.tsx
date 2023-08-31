import { HStack } from '@chakra-ui/react';
import NavigationButton from '../navigation/NavigationButton';

export default function Navigation() {
  return (
    <HStack>
      <NavigationButton to="/go">Go</NavigationButton>
      <NavigationButton to="/tictactoe">Tic-Tac-Toe</NavigationButton>
    </HStack>
  );
}
