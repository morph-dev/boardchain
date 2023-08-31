import { ReadContractReturnType } from 'viem';
import { goGameABI, goLobbyABI } from '../../generated/blockchain';

export enum Player {
  Black,
  White,
}

export enum Result {
  Unknown,
  BlackWin,
  WhiteWin,
  NoResult,
  Jigo,
}

export enum BoardState {
  Empty,
  Black,
  White,
}

export enum GamePhase {
  NotCreated,
  Playing,
  Scoring,
  Finished,
}

export enum ScoringBoardState {
  Unknown,
  Neutral,
  TerritoryBlack,
  TerritoryWhite,
  Dead,
  Alive,
}

export type Coordinates = {
  x: number;
  y: number;
};

export type GameResultType = {
  result: Result;
  reason: string;
};

export type MoveType = {
  x: number;
  y: number;
  isPass: boolean;
};

export type GameInfoType = {
  gameId: bigint;
  boardSize: number;
  komi: number;
  handicap: number;
};

export type PlayingStateType = {
  numberOfMoves: bigint;
  lastMove: MoveType;
  currentPlayer: Player;
  isKoPossible: boolean;
  prisoners: readonly [number, number];
};

export type ScoringStateType = {
  accepted: readonly [boolean, boolean];
  boardPrisoners: readonly [number, number];
  territory: readonly [number, number];
  board: readonly (readonly ScoringBoardState[])[];
};

export type GameFullStateType = ReadContractReturnType<typeof goGameABI, 'getGameState'>;

export type GameSummaryType = ReadContractReturnType<typeof goGameABI, 'allGames'>[number];

export type ChallengeGameType = ReadContractReturnType<
  typeof goLobbyABI,
  'allOpenChallenges'
>[number];
