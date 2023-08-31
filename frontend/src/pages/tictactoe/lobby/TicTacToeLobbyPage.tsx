import { VStack } from '@chakra-ui/react';
import DirectChallengesCard from './DirectChallengesCard';
import OpenChallengesCard from './OpenChallengesCard';
import CreateGame from '../components/buttons/CreateGame';

export default function TicTacToeLobbyPage() {
  return (
    <VStack>
      <CreateGame />
      <OpenChallengesCard />
      <DirectChallengesCard />
    </VStack>
  );
}
