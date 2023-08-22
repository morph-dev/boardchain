import { Spinner, Text, VStack } from '@chakra-ui/react';
import { zeroAddress } from 'viem';
import SimpleCard, { SimpleCardProps } from '../../../../components/cards/SimpleCard';
import {
  useTicTacToeLobbyAllDirectChallenges,
  useTicTacToeLobbyChallengeAcceptedEvent,
  useTicTacToeLobbyChallengeCanceledEvent,
  useTicTacToeLobbyChallengeCreatedEvent,
} from '../../../../generated/blockchain';
import { useAppContext } from '../../../../providers/AppContext';
import ChallengesTable from './ChallengesTable';

const CARD_TITLE = 'Direct challenges';

export default function DirectChallengesCard(props: Omit<SimpleCardProps, 'title'>) {
  return (
    <SimpleCard title={CARD_TITLE} minW="container.sm" {...props}>
      <Content />
    </SimpleCard>
  );
}

function Content() {
  const { chainId, userAddress } = useAppContext();
  const {
    data: games,
    status,
    refetch,
  } = useTicTacToeLobbyAllDirectChallenges({
    chainId: chainId,
    args: [userAddress ?? zeroAddress],
  });

  const listenerConfig = {
    chainId: chainId,
    listener: () => refetch(),
  };

  useTicTacToeLobbyChallengeCreatedEvent(listenerConfig);
  useTicTacToeLobbyChallengeAcceptedEvent(listenerConfig);
  useTicTacToeLobbyChallengeCanceledEvent(listenerConfig);

  if (userAddress == null) {
    return (
      <Text textAlign="center" fontSize="lg">
        You need to login first
      </Text>
    );
  }

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
    <VStack gap={8}>
      <ChallengesTable
        challenges={games.filter((game) => game.maker !== userAddress)}
        title="Me being challenged"
        showTaker={false}
      />
      <ChallengesTable
        challenges={games.filter((game) => game.maker === userAddress)}
        title="Created by me"
        showMaker={false}
      />
    </VStack>
  );
}
