import { GhostStone, Goban, Map, Marker, Vertex } from '@sabaki/shudan';
import { useState } from 'react';
import { ReadContractReturnType } from 'viem';
import { goGameABI } from '../../../../generated/blockchain';
import { BoardState, Coordinates, GamePhase, Player, ScoringBoardState } from '../../types';
import { useAccount } from 'wagmi';

enum SabakiSign {
  White = -1,
  Empty = 0,
  Black = 1,
}

function boardToSign(x: BoardState): SabakiSign {
  if (x === BoardState.Black) {
    return SabakiSign.Black;
  }
  if (x === BoardState.White) {
    return SabakiSign.White;
  }
  return SabakiSign.Empty;
}

function scoringStateToGhost(x: ScoringBoardState): GhostStone | null {
  if (x === ScoringBoardState.TerritoryBlack) {
    return { sign: SabakiSign.Black };
  }
  if (x === ScoringBoardState.TerritoryWhite) {
    return { sign: SabakiSign.White };
  }
  return null;
}

function vertexToCoordinates(v: Vertex) {
  return { x: v[1], y: v[0] };
}

type GoGamePageProps = {
  gameState: ReadContractReturnType<typeof goGameABI, 'getGameState'>;
  pendingPass: boolean;
  pendingMove: Coordinates | null;
  onClick?: (c: Coordinates) => void;
};

export default function GoGamePage({
  gameState,
  pendingPass,
  pendingMove,
  onClick,
}: GoGamePageProps) {
  const { address } = useAccount();

  const [hover, setHover] = useState<Coordinates | null>(null);

  const board = gameState.board;

  // Stones on the board (including dimmed one for next move)
  const signs: Map<SabakiSign> = board.map((row) => row.map(boardToSign));
  // Last move and captured stones
  const markers: Map<Marker | null> = board.map((row) => row.map(() => null));
  // Territory
  const ghostStones: Map<GhostStone | null> | undefined =
    gameState.phase === GamePhase.Scoring || gameState.phase === GamePhase.Finished
      ? gameState.scoringState.board.map((row) => row.map(scoringStateToGhost))
      : undefined;
  // Next move and captured stones
  const dimmedVertices: Vertex[] = [];

  // Mark last move
  if (gameState.playingState.numberOfMoves > 0 && !gameState.playingState.lastMove.isPass) {
    markers[gameState.playingState.lastMove.x][gameState.playingState.lastMove.y] = {
      type: 'circle',
    };
  }

  // Show captured stones
  if (gameState.phase === GamePhase.Scoring || gameState.phase === GamePhase.Finished) {
    for (let x = 0; x < board.length; x++) {
      for (let y = 0; y < board[x].length; y++) {
        if (board[x][y] === BoardState.Empty) {
          continue;
        }
        let dead = gameState.scoringState.board[x][y] === ScoringBoardState.Dead;
        if (hover && gameState.phase === GamePhase.Scoring && hover.x == x && hover.y == y) {
          dead = !dead;
        }
        if (dead) {
          markers[x][y] = { type: 'point' };
          dimmedVertices.push([y, x]);
        }
      }
    }
  }

  // Show pending or next (hover) move
  if (
    address &&
    gameState.players[gameState.playingState.currentPlayer] === address &&
    !pendingPass
  ) {
    const sign =
      gameState.playingState.currentPlayer === Player.Black ? SabakiSign.Black : SabakiSign.White;
    if (pendingMove && board[pendingMove.x][pendingMove.y] == SabakiSign.Empty) {
      // Show pending move
      signs[pendingMove.x][pendingMove.y] = sign;
      dimmedVertices.push([pendingMove.y, pendingMove.x]);
    } else if (hover) {
      if (gameState.phase === GamePhase.Playing && board[hover.x][hover.y] === SabakiSign.Empty) {
        // Show next move
        signs[hover.x][hover.y] = sign;
        dimmedVertices.push([hover.y, hover.x]);
      }
    }
  }

  return (
    <>
      {/* @ts-expect-error: Some issue with preact */}
      <Goban
        vertexSize={48}
        signMap={signs}
        markerMap={markers}
        ghostStoneMap={ghostStones}
        dimmedVertices={dimmedVertices}
        onVertexClick={(_, v) => onClick && onClick(vertexToCoordinates(v))}
        onVertexPointerMove={(_, v) => setHover(vertexToCoordinates(v))}
        onVertexPointerLeave={() => setHover(null)}
      />
    </>
  );
}
