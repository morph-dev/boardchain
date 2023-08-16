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
