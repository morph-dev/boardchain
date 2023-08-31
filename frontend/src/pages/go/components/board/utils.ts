import { GhostStone, Vertex } from '@sabaki/shudan';
import { BoardState, Coordinates, ScoringBoardState } from '../../types';

export enum SabakiSign {
  White = -1,
  Empty = 0,
  Black = 1,
}

export function stateToSign(x: BoardState): SabakiSign {
  if (x === BoardState.Black) {
    return SabakiSign.Black;
  }
  if (x === BoardState.White) {
    return SabakiSign.White;
  }
  return SabakiSign.Empty;
}

export function scoringStateToGhost(x: ScoringBoardState): GhostStone | null {
  if (x === ScoringBoardState.TerritoryBlack) {
    return { sign: SabakiSign.Black };
  }
  if (x === ScoringBoardState.TerritoryWhite) {
    return { sign: SabakiSign.White };
  }
  return null;
}

export function vertexToCoordinates(v: Vertex) {
  return { x: v[1], y: v[0] };
}

export function coordinatesToVertex(c: Coordinates): Vertex {
  return [c.y, c.x];
}
