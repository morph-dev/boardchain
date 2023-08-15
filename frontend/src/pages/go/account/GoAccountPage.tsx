import { HStack, Text, VStack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { getAddress } from 'viem';
import { useGoGameAllPlayerGames } from '../../../generated/blockchain';

export default function GoAccountPage() {
  const { address: walletAddress } = useParams();

  const {
    data: gameIds,
    isLoading,
    isSuccess,
  } = useGoGameAllPlayerGames({ args: [getAddress(walletAddress ?? '')] });

  if (isLoading) {
    return (
      <VStack>
        <VStack align="stretch">
          <h1>Loading</h1>
        </VStack>
      </VStack>
    );
  }

  if (!isSuccess || !gameIds) {
    return (
      <VStack>
        <VStack align="stretch">
          <h1>Error while loading the games!</h1>
        </VStack>
      </VStack>
    );
  }

  return (
    <VStack>
      <VStack align="stretch">
        <HStack>
          <div>
            {gameIds.map((gameId, i) => (
              <Text key={i}>{gameId.toString(16)}</Text>
            ))}
          </div>
        </HStack>
      </VStack>
    </VStack>
  );
}
