import { VStack } from '@chakra-ui/react';
import DirectChallengesCard from './DirectChallengesCard';
import OpenChallengesCard from './OpenChallengesCard';

export default function TicTacToeLobbyPage() {
  return (
    <VStack>
      <OpenChallengesCard />
      <DirectChallengesCard />
    </VStack>
  );
}
