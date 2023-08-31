import { HStack, Text, VStack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { isAddress } from 'viem';
import AddressWithCopy from '../../../components/AddressWithCopy';
import GameList from '../components/gamelist/GameList';

export default function TicTacToePlayerPage() {
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
      <HStack fontSize="xl">
        <Text>Player:</Text>
        <AddressWithCopy address={playerAddress} copyIconProps={{ size: 'md' }} showMe />
      </HStack>
      <GameList address={playerAddress} />
    </VStack>
  );
}
