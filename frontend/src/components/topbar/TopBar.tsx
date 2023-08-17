import { Flex, FlexProps, Spacer } from '@chakra-ui/react';
import Account from './Account';
import Navigation from './Navigation';

export default function TopBar(props: FlexProps) {
  return (
    <Flex {...props}>
      <Navigation />
      <Spacer />
      <Account />
    </Flex>
  );
}
