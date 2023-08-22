import { Address } from 'viem';
import { Text } from '@chakra-ui/react';
import CopyButton, { CopyButtonProps } from './buttons/CopyButton';
import { elliptAddress } from '../utils/textUtils';

export interface AddressWithCopyProps {
  address: Address;
  copyIconSize?: CopyButtonProps['size'];
}

export default function AddressWithCopy({ address, copyIconSize }: AddressWithCopyProps) {
  return (
    <>
      <Text fontFamily="mono">{elliptAddress(address)}</Text>
      <CopyButton text={address} size={copyIconSize} />
    </>
  );
}
