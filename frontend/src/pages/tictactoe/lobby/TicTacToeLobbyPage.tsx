import { VStack } from '@chakra-ui/react';
import DirectChallengesCard from '../components/challenges/DirectChallengesCard';
import OpenChallengesCard from '../components/challenges/OpenChallengesCrd';

export default function TicTacToeLobbyPage() {
  return (
    <VStack>
      <OpenChallengesCard />
      <DirectChallengesCard />
    </VStack>
  );
}
