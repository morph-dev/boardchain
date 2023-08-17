import { Button, HStack } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';

type ItemProps = {
  to: string;
};

function Item({ to, children }: PropsWithChildren<ItemProps>) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <Button colorScheme={isActive ? 'blue' : 'gray'} variant="link">
          {children}
        </Button>
      )}
    </NavLink>
  );
}

export default function Navigation() {
  return (
    <HStack>
      <Item to="/tictactoe">Tic-Tac-Toe</Item>
      <Item to="/go">Go</Item>
    </HStack>
  );
}
