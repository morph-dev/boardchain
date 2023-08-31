import { BoundedGoban, GhostStone, Map, Marker, Vertex } from '@sabaki/shudan';
import {
  BoardState,
  Coordinates,
  GameFullStateType,
  GamePhase,
  ScoringBoardState,
} from '../../types';
import {
  SabakiSign,
  coordinatesToVertex,
  scoringStateToGhost,
  stateToSign,
  vertexToCoordinates,
} from './utils';

export type GoBoardProps = {
  gameState: GameFullStateType;
  dim?: Coordinates & {
    state: BoardState;
  };
  toogleDeadAlive?: Coordinates;
  onClick?: (c: Coordinates) => void;
  onMouseMove?: (c: Coordinates) => void;
  onMouseLeave?: () => void;
};

export default function GoBoard({
  gameState,
  dim,
  toogleDeadAlive,
  onClick,
  onMouseMove,
  onMouseLeave,
}: GoBoardProps) {
  const board = gameState.board;

  // Stones on the board and 'dim'
  const signs: Map<SabakiSign> = board.map((row) => row.map(stateToSign));
  // Last move and dead stones
  const markers: Map<Marker | null> = board.map((row) => row.map(() => null));
  // Dead stones and 'dim'
  const dimmedVertices: Vertex[] = [];
  // Territory
  const ghostStones: Map<GhostStone | null> | undefined =
    gameState.phase === GamePhase.Scoring || gameState.phase === GamePhase.Finished
      ? gameState.scoringState.board.map((row) => row.map(scoringStateToGhost))
      : undefined;

  // Mark dim place
  if (dim && board[dim.x][dim.y] === BoardState.Empty) {
    signs[dim.x][dim.y] = stateToSign(dim.state);
    dimmedVertices.push(coordinatesToVertex(dim));
  }

  // Mark last move
  if (gameState.playingState.numberOfMoves > 0 && !gameState.playingState.lastMove.isPass) {
    markers[gameState.playingState.lastMove.x][gameState.playingState.lastMove.y] = {
      type: 'circle',
    };
  }

  // Mark dead stones
  if (gameState.phase === GamePhase.Scoring || gameState.phase === GamePhase.Finished) {
    for (let x = 0; x < board.length; x++) {
      for (let y = 0; y < board[x].length; y++) {
        if (board[x][y] === BoardState.Empty) {
          continue;
        }
        let dead = gameState.scoringState.board[x][y] === ScoringBoardState.Dead;
        if (toogleDeadAlive && toogleDeadAlive.x == x && toogleDeadAlive.y == y) {
          dead = !dead;
        }
        if (dead) {
          markers[x][y] = { type: 'point' };
          dimmedVertices.push([y, x]);
        }
      }
    }
  }

  return (
    <>
      {/* @ts-expect-error: Some issue with preact */}
      <BoundedGoban
        maxWidth={800}
        maxHeight={800}
        signMap={signs}
        markerMap={markers}
        ghostStoneMap={ghostStones}
        dimmedVertices={dimmedVertices}
        onVertexClick={(_, v) => onClick && onClick(vertexToCoordinates(v))}
        onVertexPointerMove={(_, v) => onMouseMove && onMouseMove(vertexToCoordinates(v))}
        onVertexPointerLeave={() => onMouseLeave && onMouseLeave()}
      />
    </>
  );
}
