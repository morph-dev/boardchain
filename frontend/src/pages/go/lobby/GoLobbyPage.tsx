import { VStack } from '@chakra-ui/react';
import CreateChallengeButton from '../components/buttons/CreateChallengeButton';
import OpenChallengesCard from './OpenChallengesCard';
import DirectChallengesCard from './DirectChallengesCard';

export default function GoLobbyPage() {
  return (
    <VStack>
      <VStack>
        <CreateChallengeButton />
        <OpenChallengesCard />
        <DirectChallengesCard />
      </VStack>
    </VStack>
  );
}
