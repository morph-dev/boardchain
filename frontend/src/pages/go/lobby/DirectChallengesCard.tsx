import { Spinner, Text, VStack } from '@chakra-ui/react';
import { zeroAddress } from 'viem';
import SimpleCard, { SimpleCardProps } from '../../../components/cards/SimpleCard';
import { useAppContext } from '../../../providers/AppContext';
import GoChallengesTable from './GoChallengesTable';
import {
  useGoLobbyAllDirectChallenges,
  useGoLobbyChallengeAcceptedEvent,
  useGoLobbyChallengeCanceledEvent,
  useGoLobbyChallengeCreatedEvent,
} from '../../../generated/blockchain';
import { useMemo } from 'react';

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
    data: challenges,
    status,
    refetch,
  } = useGoLobbyAllDirectChallenges({
    chainId: chainId,
    args: [userAddress ?? zeroAddress],
  });

  const listenerConfig = useMemo(
    () => ({
      chainId: chainId,
      listener: () => refetch(),
    }),
    [chainId, refetch]
  );

  useGoLobbyChallengeCreatedEvent(listenerConfig);
  useGoLobbyChallengeAcceptedEvent(listenerConfig);
  useGoLobbyChallengeCanceledEvent(listenerConfig);

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

  return (
    <VStack gap={8}>
      <GoChallengesTable
        challenges={challenges.filter((challenge) => challenge.maker !== userAddress)}
        title="Me being challenged"
        showMaker
      />
      <GoChallengesTable
        challenges={challenges.filter((challenge) => challenge.maker === userAddress)}
        title="Created by me"
        showTaker
      />
    </VStack>
  );
}
