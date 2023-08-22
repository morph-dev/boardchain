import { Spinner, Text, VStack } from '@chakra-ui/react';
import SimpleCard, { SimpleCardProps } from '../../../../components/cards/SimpleCard';
import {
  useTicTacToeLobbyAllOpenChallenges,
  useTicTacToeLobbyChallengeAcceptedEvent,
  useTicTacToeLobbyChallengeCanceledEvent,
  useTicTacToeLobbyChallengeCreatedEvent,
} from '../../../../generated/blockchain';
import { useAppContext } from '../../../../providers/AppContext';
import ChallengesTable from './ChallengesTable';

export default function OpenChallengesCard(props: Omit<SimpleCardProps, 'title'>) {
  return (
    <SimpleCard title="Open challenges" minW="container.sm" {...props}>
      <Content />
    </SimpleCard>
  );
}

function Content() {
  const { chainId } = useAppContext();
  const {
    data: games,
    status,
    refetch,
  } = useTicTacToeLobbyAllOpenChallenges({
    chainId: chainId,
  });

  const listenerConfig = {
    chainId: chainId,
    listener: () => refetch(),
  };

  useTicTacToeLobbyChallengeCreatedEvent(listenerConfig);
  useTicTacToeLobbyChallengeAcceptedEvent(listenerConfig);
  useTicTacToeLobbyChallengeCanceledEvent(listenerConfig);

  if (status === 'loading') {
    return (
      <VStack>
        <Spinner />
      </VStack>
    );
  }

  if (!games) {
    return (
      <Text textAlign="center" fontSize="lg">
        Something went wrong!
      </Text>
    );
  }

  if (games.length == 0) {
    return (
      <Text textAlign="center" fontSize="lg">
        No challenges
      </Text>
    );
  }

  return (
    <VStack>
      <ChallengesTable challenges={games} showTaker={false} />
    </VStack>
  );
}
