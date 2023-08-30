import { Text, VStack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { isAddress } from 'viem';
import AddressWithCopy from '../../../components/AddressWithCopy';
import GamesTable from './GamesTable';

export default function GoPlayerPage() {
  const { playerAddress } = useParams();

  if (!playerAddress || !isAddress(playerAddress)) {
    return (
      <VStack>
        <Text fontSize="lg">Player address not valid</Text>
      </VStack>
    );
  }
  return (
    <VStack>
      <AddressWithCopy address={playerAddress} showMe />
      <GamesTable playerAddress={playerAddress} />
    </VStack>
  );
}
