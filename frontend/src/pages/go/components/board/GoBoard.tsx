import { GhostStone, Goban, Map, Marker, Vertex } from '@sabaki/shudan';
import { useState } from 'react';
import { ReadContractReturnType } from 'viem';
import { goGameABI } from '../../../../generated/blockchain';
import { BoardState, Player } from '../../types';
import { useAccount } from 'wagmi';

enum SabakiSign {
  White = -1,
  Empty = 0,
  Black = 1,
}

function boardToSign(x: number): SabakiSign {
  if (x === BoardState.Black) {
    return SabakiSign.Black;
  }
  if (x === BoardState.White) {
    return SabakiSign.White;
  }
  return SabakiSign.Empty;
}

type GoGamePageProps = {
  gameState: ReadContractReturnType<typeof goGameABI, 'getGameState'>;
  onClick?: (x: number, y: number) => null;
};

export default function GoGamePage({ gameState, onClick }: GoGamePageProps) {
  const { address } = useAccount();

  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  const board = gameState.board;

  // TODO add info while in Scoring or finished state

  // Stones on the board (including dimmed one for next move)
  const signs: Map<SabakiSign> = board.map((row) => row.map(boardToSign));
  // Last move
  const markers: Map<Marker | null> = board.map((row) => row.map(() => null));
  // Territory
  const ghostStones: Map<GhostStone | null> = board.map((row) => row.map(() => null));
  // Next move and captured stones
  const dimmedVertices: Vertex[] = [];

  // Mark last move
  if (gameState.playingState.numberOfMoves > 0 && !gameState.playingState.lastMove.isPass) {
    markers[gameState.playingState.lastMove.x][gameState.playingState.lastMove.y] = {
      type: 'circle',
    };
  }

  // Show next move
  if (address && gameState.players[gameState.playingState.currentPlayer] === address) {
    if (hover && signs[hover.x][hover.y] == SabakiSign.Empty) {
      signs[hover.x][hover.y] =
        gameState.playingState.currentPlayer === Player.Black ? SabakiSign.Black : SabakiSign.White;
      dimmedVertices.push([hover.y, hover.x]);
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
        onVertexClick={(_, v) => onClick && onClick(v[1], v[0])}
        onVertexPointerMove={(_, v) => setHover({ x: v[1], y: v[0] })}
        onVertexPointerLeave={() => setHover(null)}
      />
    </>
  );
}
