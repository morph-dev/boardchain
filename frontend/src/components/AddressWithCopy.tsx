import { HStack, Text } from '@chakra-ui/react';
import { Address, isAddressEqual } from 'viem';
import { useAccount } from 'wagmi';
import { elliptAddress, elliptText } from '../utils/textUtils';
import CopyButton, { CopyButtonProps } from './buttons/CopyButton';

export interface AddressWithCopyProps {
  address: Address;
  copyIconSize?: CopyButtonProps['size'];
  showMe?: boolean;
}

export default function AddressWithCopy({ address, copyIconSize, showMe }: AddressWithCopyProps) {
  const { address: userAddress, isConnected } = useAccount();

  const isUser = isConnected && userAddress && isAddressEqual(userAddress, address);
  const userProps = isUser
    ? {
        color: 'user',
        fontWeight: 'bold',
      }
    : undefined;

  if (isUser && showMe) {
    return (
      <HStack gap={0}>
        <Text fontFamily="mono" {...userProps}>
          (me) {elliptText(address, 2, 3)}
        </Text>
        <CopyButton text={address} size={copyIconSize} />
      </HStack>
    );
  }

  return (
    <HStack gap={0}>
      <Text fontFamily="mono" {...userProps}>
        {isUser && showMe ? `(me) ${elliptText(address, 2, 3)}` : elliptAddress(address)}
      </Text>
      <CopyButton text={address} size={copyIconSize} />
    </HStack>
  );
}
