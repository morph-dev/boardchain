import { ChakraProps, HStack, Text } from '@chakra-ui/react';
import { Address, isAddressEqual } from 'viem';
import { useAccount } from 'wagmi';
import { elliptAddress, elliptText } from '../utils/textUtils';
import CopyButton, { CopyButtonProps } from './buttons/CopyButton';

export interface AddressWithCopyProps extends ChakraProps {
  address: Address;
  copyIconProps?: Omit<CopyButtonProps, 'text'>;
  showMe?: boolean;
}

export default function AddressWithCopy({
  address,
  copyIconProps,
  showMe,
  ...props
}: AddressWithCopyProps) {
  const { address: userAddress, isConnected } = useAccount();

  const isUser = isConnected && userAddress && isAddressEqual(userAddress, address);
  const userProps: ChakraProps = isUser
    ? {
        textColor: 'user',
        fontWeight: 'bold',
      }
    : {};

  const text = isUser && showMe ? `(me) ${elliptText(address, 2, 3)}` : elliptAddress(address);

  return (
    <HStack gap={0} {...userProps} {...props}>
      <Text fontFamily="mono">{text}</Text>
      <CopyButton text={address} size="sm" {...copyIconProps} />
    </HStack>
  );
}
