import { Address } from 'viem';
import {
  ChallengeGameType,
  GameFullStateType,
  GamePhase,
  GameSummaryType,
  Result,
} from '../../types';

export function getGameIdAsString(
  game: ChallengeGameType | GameSummaryType | GameFullStateType
): string {
  if ('gameId' in game) {
    return game.gameId.toString();
  }
  return game.info.gameId.toString();
}

export function getGameStatus(game: GameSummaryType | GameFullStateType): string {
  switch (game.phase) {
    case GamePhase.Playing:
      return 'In progress';
    case GamePhase.Scoring:
      return 'Scoring';
    case GamePhase.Finished:
      return game.result.reason;
    default:
      return 'Unknown';
  }
}

export function getWinner(game: GameSummaryType | GameFullStateType): Address | null {
  if (game.result.result === Result.BlackWin) {
    return game.players[0];
  }
  if (game.result.result === Result.WhiteWin) {
    return game.players[1];
  }
  return null;
}

export function getLoser(game: GameSummaryType | GameFullStateType): Address | null {
  if (game.result.result === Result.BlackWin) {
    return game.players[1];
  }
  if (game.result.result === Result.WhiteWin) {
    return game.players[0];
  }
  return null;
}
