import { Text, TextProps } from '@chakra-ui/react';
import { Address } from 'viem';
import { GamePhase, GameResult, GameState } from '../types';
import { OSymbol, XSymbol } from './Symbols';

export interface GameStatusProps extends TextProps {
  game: GameState;
  player?: Address;
}

export default function GameStatus({ game, player, ...props }: GameStatusProps) {
  switch (game.phase) {
    case GamePhase.NotCreated:
      return <Text {...props}>Game not found</Text>;
    case GamePhase.InProgress:
      return (
        <Text {...props}>
          {game.numberOfMoves % 2 == 0 ? <XSymbol inline /> : <OSymbol inline />}
          to play
        </Text>
      );
    case GamePhase.Finished:
      switch (game.result) {
        case GameResult.Unknown:
          throw Error('Impossible state!');
        case GameResult.Xwin:
        case GameResult.Owin: {
          if (!player || (player !== game.playerX && game.playerX !== game.playerO)) {
            return (
              <Text {...props}>
                {game.result === GameResult.Xwin ? <XSymbol inline /> : <OSymbol inline />}
                won
              </Text>
            );
          }
          const win =
            (player === game.playerX && game.result === GameResult.Xwin) ||
            (player === game.playerO && game.result === GameResult.Owin);
          if (win) {
            return (
              <Text color="result.won" {...props}>
                Won
              </Text>
            );
          } else {
            return (
              <Text color="result.lost" {...props}>
                Lost
              </Text>
            );
          }
        }
        case GameResult.Draw:
          return (
            <Text color="result.draw" {...props}>
              Draw
            </Text>
          );
      }
  }
}
