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
