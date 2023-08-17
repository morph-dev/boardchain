import { Box, Button, HStack, Text, VStack, useToast } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isAddress } from 'viem';
import { useAccount, useChainId } from 'wagmi';
import { prepareWriteContract, writeContract } from 'wagmi/actions';
import {
  goGameConfig,
  useGoGameGetGameState,
  useGoGameMarkedAliveGroupEvent,
  useGoGameMarkedDeadGroupEvent,
  useGoGamePassEvent,
  useGoGameScoringAcceptedEvent,
  useGoGameStonePlayedEvent,
} from '../../../generated/blockchain';
import { BoardState, Coordinates, GamePhase, Player, ScoringBoardState } from '../types';
import GoBoard from './../components/board/GoBoard';

export default function GoGamePage() {
  const { gameId: gameIdString } = useParams();
  const { address } = useAccount();
  const chainId = useChainId();

  const toast = useToast({ status: 'error', isClosable: true });

  const [pendingAction, setPendingAction] = useState(false);
  const [pendingMove, setPendingMove] = useState<Coordinates | null>(null);

  const gameId = BigInt('0x' + gameIdString || 0);

  const {
    data: gameState,
    status: gameStateStatus,
    refetch: refetchGameState,
  } = useGoGameGetGameState({
    args: [gameId],
  });

  const listenerConfig = {
    listener: (logs: { args: { gameId?: bigint } }[]) => {
      if (logs.some((log) => log.args.gameId === gameId)) {
        refetchGameState();
      }
    },
  } as const;

  useGoGameStonePlayedEvent(listenerConfig);
  useGoGamePassEvent(listenerConfig);
  useGoGameMarkedDeadGroupEvent(listenerConfig);
  useGoGameMarkedAliveGroupEvent(listenerConfig);
  useGoGameScoringAcceptedEvent(listenerConfig);

  const goGameAddress = useMemo(
    () =>
      chainId in goGameConfig.address
        ? goGameConfig.address[chainId as keyof typeof goGameConfig.address]
        : '',
    [chainId]
  );

  const canPlay = useMemo(
    () =>
      address &&
      gameState &&
      gameState.phase === GamePhase.Playing &&
      gameState.players[gameState.playingState.currentPlayer] === address,
    [address, gameState]
  );

  const canScore = useMemo(
    () =>
      address &&
      gameState &&
      gameState.phase == GamePhase.Scoring &&
      gameState.players.indexOf(address) >= 0,
    [address, gameState]
  );

  const acceptedScoring = useMemo(
    () =>
      address &&
      gameState &&
      ((gameState.players[Player.Black] === address &&
        gameState.scoringState.accepted[Player.Black]) ||
        (gameState.players[Player.White] === address &&
          gameState.scoringState.accepted[Player.White])),
    [address, gameState]
  );

  const onPlayStone = useCallback(
    (c: Coordinates) => {
      // Exit it is not players turn
      if (!canPlay) {
        return;
      }
      // Exit if action is pending
      if (pendingAction) {
        return;
      }

      // Check that board is empty
      if (!gameState || gameState.board[c.x][c.y] !== BoardState.Empty) {
        return;
      }

      if (!isAddress(goGameAddress)) {
        toast({
          title: 'Unknown contract address!',
          description: 'You are maybe on the wrong chain.',
        });
        return;
      }
      const config = prepareWriteContract({
        address: goGameAddress,
        abi: goGameConfig.abi,
        functionName: 'playStone',
        args: [gameId, c.x, c.y],
      });
      setPendingAction(true);
      setPendingMove(c);
      config
        .then(writeContract)
        .catch(() => toast({ title: 'Error playing move!' }))
        .finally(() => {
          setPendingAction(false);
          setPendingMove(null);
        });
    },
    [canPlay, pendingAction, gameState, goGameAddress, gameId, toast]
  );

  const onMarkStones = useCallback(
    (c: Coordinates) => {
      // Exit it is not players turn
      if (!canScore) {
        return;
      }
      // Exit if action is pending
      if (pendingAction) {
        return;
      }
      // Check that board is empty
      if (!gameState || gameState.board[c.x][c.y] === BoardState.Empty) {
        return;
      }

      if (!isAddress(goGameAddress)) {
        toast({
          title: 'Unknown contract address!',
          description: 'You are maybe on the wrong chain.',
        });
        return;
      }
      const config = prepareWriteContract({
        address: goGameAddress,
        abi: goGameConfig.abi,
        functionName: 'markGroup',
        args: [
          gameId,
          c.x,
          c.y,
          gameState.scoringState.board[c.x][c.y] === ScoringBoardState.Alive,
        ],
      });
      setPendingAction(true);
      config
        .then(writeContract)
        .catch(() => toast({ title: 'Error marking stones!' }))
        .finally(() => {
          setPendingAction(false);
        });
    },
    [canScore, gameId, gameState, goGameAddress, pendingAction, toast]
  );

  const onClick = useCallback(
    (c: Coordinates) => {
      if (!gameState) {
        return;
      }
      if (gameState.phase === GamePhase.Playing) onPlayStone(c);
      if (gameState.phase === GamePhase.Scoring) onMarkStones(c);
    },
    [gameState, onMarkStones, onPlayStone]
  );

  const onPass = useCallback(() => {
    // Exit it is not players turn
    if (!canPlay) {
      return;
    }
    // Exit if action is pending
    if (pendingAction) {
      return;
    }

    if (!isAddress(goGameAddress)) {
      toast({
        title: 'Unknown contract address!',
        description: 'You are maybe on the wrong chain.',
      });
      return;
    }
    const config = prepareWriteContract({
      address: goGameAddress,
      abi: goGameConfig.abi,
      functionName: 'pass',
      args: [gameId],
    });
    setPendingAction(true);
    config
      .then(writeContract)
      .catch(() => toast({ title: 'Error passing!' }))
      .finally(() => setPendingAction(false));
  }, [gameId, goGameAddress, pendingAction, canPlay, toast]);

  const acceptScoring = useCallback(() => {
    // Exit it is not players turn
    if (!canScore && !acceptScoring) {
      return;
    }
    // Exit if action is pending
    if (pendingAction) {
      return;
    }

    if (!isAddress(goGameAddress)) {
      toast({
        title: 'Unknown contract address!',
        description: 'You are maybe on the wrong chain.',
      });
      return;
    }
    const config = prepareWriteContract({
      address: goGameAddress,
      abi: goGameConfig.abi,
      functionName: 'acceptScoring',
      args: [gameId],
    });
    setPendingAction(true);
    config
      .then(writeContract)
      .catch(() => toast({ title: 'Error accepting scorring!' }))
      .finally(() => setPendingAction(false));
  }, [canScore, gameId, goGameAddress, pendingAction, toast]);

  if (
    !gameId ||
    gameStateStatus == 'error' ||
    (gameStateStatus == 'success' && gameState?.info.gameId !== gameId)
  ) {
    return (
      <VStack>
        <VStack align="stretch">
          <h1>Game not found!</h1>
        </VStack>
      </VStack>
    );
  }

  if (gameStateStatus !== 'success') {
    return (
      <VStack>
        <VStack align="stretch">
          <HStack>
            <h1>Loading!</h1>
          </HStack>
        </VStack>
      </VStack>
    );
  }
  if (!gameState) {
    toast({ title: 'Something went wrong!' });
    return;
  }

  console.log(gameState.scoringState.board);

  return (
    <VStack>
      <Box>
        <Text>
          Phase:{' '}
          {gameState.phase === GamePhase.Playing
            ? 'Playing'
            : gameState.phase === GamePhase.Scoring
            ? 'Scoring'
            : 'Finished'}
        </Text>
        {gameState.phase === GamePhase.Finished && (
          <Text fontWeight="bold">{gameState.result.reason}</Text>
        )}
      </Box>
      <Box>
        <Text>Prisoners:</Text>
        <Text>Black: {gameState.playingState.prisoners[Player.Black]}</Text>
        <Text>White: {gameState.playingState.prisoners[Player.White]}</Text>
      </Box>
      <HStack>
        <Button isDisabled={!canPlay || pendingAction} onClick={onPass}>
          Pass
        </Button>
        <Button
          isDisabled={gameState.phase !== GamePhase.Scoring || acceptedScoring || pendingAction}
          onClick={acceptScoring}
        >
          Accept Scoring
        </Button>
      </HStack>
      <GoBoard
        gameState={gameState}
        pendingPass={pendingAction}
        pendingMove={pendingMove}
        onClick={onClick}
      />
    </VStack>
  );
}
