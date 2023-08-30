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

export type ChallengeGame = {
  gameId: bigint;
  maker: Address;
  taker: Address;
  boardSize: number;
};
