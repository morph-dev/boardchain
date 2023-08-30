import { HStack } from '@chakra-ui/react';
import NavigationButton from '../navigation/NavigationButton';

export default function Navigation() {
  return (
    <HStack>
      <NavigationButton to="/tictactoe">Tic-Tac-Toe</NavigationButton>
      <NavigationButton to="/go">Go</NavigationButton>
    </HStack>
  );
}
