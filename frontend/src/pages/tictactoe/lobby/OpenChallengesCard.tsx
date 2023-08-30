import { Spinner, Text, VStack } from '@chakra-ui/react';
import SimpleCard, { SimpleCardProps } from '../../../components/cards/SimpleCard';
import {
  useTicTacToeLobbyAllOpenChallenges,
  useTicTacToeLobbyChallengeAcceptedEvent,
  useTicTacToeLobbyChallengeCanceledEvent,
  useTicTacToeLobbyChallengeCreatedEvent,
} from '../../../generated/blockchain';
import { useAppContext } from '../../../providers/AppContext';
import TicTacToeChallengesTable from './TicTacToeChallengesTable';

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
    data: challenges,
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

  if (!challenges) {
    return (
      <Text textAlign="center" fontSize="lg">
        Something went wrong!
      </Text>
    );
  }

  if (challenges.length == 0) {
    return (
      <Text textAlign="center" fontSize="lg">
        No challenges
      </Text>
    );
  }

  return <TicTacToeChallengesTable challenges={challenges} showMaker />;
}
