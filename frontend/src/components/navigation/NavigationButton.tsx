import { Button, ButtonProps } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';

const ACTIVE_PROPS: ButtonProps = {
  variant: 'outline',
};
const INACTIVE_PROPS: ButtonProps = {
  variant: 'ghost',
  borderWidth: 1,
  borderColor: 'transparent',
};

export type ItemProps = {
  to: string;
};

export default function NavigationButton({ to, children }: PropsWithChildren<ItemProps>) {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <Button as="div" colorScheme="blue" {...(isActive ? ACTIVE_PROPS : INACTIVE_PROPS)}>
          {children}
        </Button>
      )}
    </NavLink>
  );
}
