import { Address } from 'viem';

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

export type GameFullStateType = {
  info: GameInfoType;
  players: readonly [Address, Address];
  phase: GamePhase;
  result: GameResultType;
  playingState: PlayingStateType;
  scoringState: ScoringStateType;
  board: readonly (readonly BoardState[])[];
};

export type GameSummaryType = {
  info: GameInfoType;
  players: readonly [Address, Address];
  phase: GamePhase;
  result: GameResultType;
  numberOfMoves: bigint;
  currentPlayer: Player;
  prisoners: readonly [number, number];
};

export type ChallengeGameType = {
  gameId: bigint;
  maker: Address;
  taker: Address;
  boardSize: number;
};
