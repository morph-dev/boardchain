import { Address } from 'viem';

export enum BoardState {
  Empty,
  X,
  O,
}

export enum GamePhase {
  NotCreated,
  InProgress,
  Finished,
}

export enum GameResult {
  Unknown,
  Xwin,
  Owin,
  Draw,
}

export type ChallengeGame = {
  gameId: bigint;
  maker: Address;
  taker: Address;
  makerIsX: boolean;
};

export type BoardRow = [BoardState, BoardState, BoardState];
export type Board = [Readonly<BoardRow>, Readonly<BoardRow>, Readonly<BoardRow>];

export type GameState = {
  gameId: bigint;
  playerX: Address;
  playerO: Address;
  phase: GamePhase;
  result: GameResult;
  numberOfMoves: number;
  board: Readonly<Board>;
};
