import { VStack } from '@chakra-ui/react';
import { StartGameButton } from '../StartGameButton';

export default function GoLobbyPage() {
  return (
    <VStack>
      <VStack align="stretch">
        <StartGameButton />
      </VStack>
    </VStack>
  );
}
