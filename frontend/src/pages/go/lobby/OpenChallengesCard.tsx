import { Spinner, Text, VStack } from '@chakra-ui/react';
import SimpleCard, { SimpleCardProps } from '../../../components/cards/SimpleCard';
import {
  useGoLobbyAllOpenChallenges,
  useGoLobbyChallengeAcceptedEvent,
  useGoLobbyChallengeCanceledEvent,
  useGoLobbyChallengeCreatedEvent,
} from '../../../generated/blockchain';
import { useAppContext } from '../../../providers/AppContext';
import GoChallengesTable from './GoChallengesTable';
import { useMemo } from 'react';

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
  } = useGoLobbyAllOpenChallenges({
    chainId: chainId,
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

  return <GoChallengesTable challenges={challenges} showMaker />;
}
