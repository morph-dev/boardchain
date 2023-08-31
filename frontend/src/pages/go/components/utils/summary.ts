import { Address } from 'viem';
import {
  ChallengeGameType,
  GameFullStateType,
  GamePhase,
  GameSummaryType,
  Player,
  Result,
  ResultReason,
} from '../../types';

export function getGameIdAsString(
  game: ChallengeGameType | GameSummaryType | GameFullStateType
): string {
  if ('gameId' in game) {
    return game.gameId.toString();
  }
  return game.info.gameId.toString();
}

export function getGameStatus(game: GameSummaryType | GameFullStateType, short: boolean): string {
  switch (game.phase) {
    case GamePhase.Playing: {
      const currentPlayerIsBlack =
        ('currentPlayer' in game ? game.currentPlayer : game.playingState.currentPlayer) ===
        Player.Black;

      let status = `${currentPlayerIsBlack ? 'Black' : 'White'} to play`;
      if (!short && 'playingState' in game && game.playingState.lastMove.isPass) {
        status += ` - ${currentPlayerIsBlack ? 'White' : 'Black'} passed`;
      }
      return status;
    }
    case GamePhase.Scoring:
      return 'Scoring';
    case GamePhase.Finished: {
      let player = '';
      switch (game.result.result) {
        case Result.BlackWin:
          player += short ? 'B' : 'Black';
          break;
        case Result.WhiteWin:
          player += short ? 'W' : 'White';
          break;
        case Result.Jigo:
          return 'Jigo';
        case Result.NoResult:
          return 'No Result';
        default:
          return 'Unknown';
      }
      switch (game.result.reason) {
        case ResultReason.Points:
          return short
            ? `${player}+${game.result.pointsDifference}.5`
            : `${player} wins by ${game.result.pointsDifference}.5 points`;
        case ResultReason.Resignation:
          return short ? `${player}+R` : `${player} wins by Resignation`;
        default:
          return 'Unknown';
      }
    }
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
