import {
  Card,
  CardBody,
  CardHeader,
  ChakraProps,
  Flex,
  HStack,
  Spacer,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import AddressWithCopy from '../../../components/AddressWithCopy';
import { GameFullStateType, GamePhase, Player } from '../types';

export interface GameStatusBoxProps extends ChakraProps {
  gameState: GameFullStateType;
}

export default function GameStatusBox({ gameState, ...props }: GameStatusBoxProps) {
  return (
    <Wrap justify="end" {...props}>
      <WrapItem>
        <PlayerCard gameState={gameState} player={Player.Black} />
      </WrapItem>
      <WrapItem>
        <PlayerCard gameState={gameState} player={Player.White} />
      </WrapItem>
    </Wrap>
  );
}

type PlayerCardProps = {
  gameState: GameFullStateType;
  player: Player;
};

function PlayerCard({ gameState, player }: PlayerCardProps) {
  const playerProps: ChakraProps =
    player === Player.Black
      ? {
          bgGradient: 'linear(to-b, blackAlpha.600, black)',
          textColor: 'gray.100',
        }
      : {
          bgGradient: 'linear(to-b, gray.100, white)',
          textColor: 'gray.800',
        };

  const playerPoints =
    gameState.playingState.prisoners[player] +
    gameState.scoringState.boardPrisoners[player] +
    gameState.scoringState.territory[player] +
    (player === Player.White ? gameState.info.komi + 0.5 : 0);

  return (
    <Card size="sm" {...playerProps}>
      <CardHeader w={48}>
        <HStack justify="end">
          <AddressWithCopy
            address={gameState.players[player]}
            showMe
            textColor={playerProps.textColor}
            fontWeight="normal"
            copyIconProps={{
              color: player === Player.Black ? 'gray.100' : 'gray.800',
              _hover: {
                bg: player === Player.Black ? 'whiteAlpha.300' : 'blackAlpha.300',
              },
              _active: {
                bg: player === Player.Black ? 'whiteAlpha.500' : 'blackAlpha.500',
              },
            }}
          />
        </HStack>
      </CardHeader>
      <CardBody fontSize="sm" fontWeight="bold">
        <Flex>
          {gameState.phase === GamePhase.Playing && (
            <>
              <Text>{gameState.playingState.prisoners[player]} captures</Text>
              <Spacer />
              {player === Player.White && <Text>+{gameState.info.komi}.5</Text>}
            </>
          )}
          {[GamePhase.Scoring, GamePhase.Finished].includes(gameState.phase) && (
            <>
              <Text>{playerPoints} points</Text>
              <Spacer />
              {gameState.phase === GamePhase.Scoring && (
                <Text>{!gameState.scoringState.accepted[player] && 'not '}accepted</Text>
              )}
            </>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
}
