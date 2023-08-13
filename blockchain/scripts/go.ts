import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { EventLog } from 'ethers';
import { ethers } from 'hardhat';
import { GoGame } from '../typechain-types';
import { boardToString, scoringBoardToString } from './utils';

export async function deployGo(): Promise<GoGame> {
  const goFactory = await ethers.getContractFactory('GoGame');
  const go = await goFactory.deploy().then((gg) => gg.waitForDeployment());
  console.log('GoGame deployed to:', await go.getAddress());
  return go;
}

async function printGame(go: GoGame, gameId: bigint) {
  const { phase, result, board, playingState, scoringState } = await go.getGameState(gameId);
  console.log('GameId:', gameId.toString(16));
  console.log('Phase:', phase);
  console.log('Prisoners:', Array.from(playingState.prisoners));
  if (phase == 1n) {
    console.log('Last move:', Array.from(playingState.lastMove));
    console.log(boardToString(board));
  }
  if (phase == 2n) {
    console.log('ScoringState:');
    console.log('  accepted:', Array.from(scoringState.accepted));
    console.log('  boardPrisoners:', Array.from(scoringState.boardPrisoners));
    console.log('  territory:', Array.from(scoringState.territory));
    console.log(scoringBoardToString(board, scoringState.board));
  }
  if (phase == 3n) {
    console.log('Result', Array.from(result));
    console.log(scoringBoardToString(board, scoringState.board));
  }
}

async function startGame(
  go: GoGame,
  blackPlayer: SignerWithAddress,
  whitePlayer: SignerWithAddress,
  boardSize = 9,
  komi = 6,
  handicap = 0
): Promise<bigint> {
  const tx = await go.startGame(
    blackPlayer.address,
    whitePlayer.address,
    boardSize,
    komi,
    handicap
  );
  const txReceipt = await tx.wait();

  const gameId = txReceipt?.logs
    .find((event): event is EventLog => 'eventName' in event && event.eventName === 'GameStarted')
    ?.args.getValue('gameId');

  printGame(go, gameId);

  return gameId;
}

function playStone(go: GoGame, gameId: bigint, player: SignerWithAddress, x: number, y: number) {
  return go
    .connect(player)
    .playStone(gameId, x, y)
    .then((tx) => tx.wait())
    .then(() => printGame(go, gameId));
}

function pass(go: GoGame, gameId: bigint, player: SignerWithAddress) {
  return go
    .connect(player)
    .pass(gameId)
    .then((tx) => tx.wait())
    .then(() => printGame(go, gameId));
}

function markGroup(
  go: GoGame,
  gameId: bigint,
  player: SignerWithAddress,
  x: number,
  y: number,
  dead: boolean
) {
  return go
    .connect(player)
    .markGroup(gameId, x, y, dead)
    .then((tx) => tx.wait())
    .then(() => printGame(go, gameId));
}

function acceptScoring(go: GoGame, gameId: bigint, player: SignerWithAddress) {
  return go
    .connect(player)
    .acceptScoring(gameId)
    .then((tx) => tx.wait())
    .then(() => printGame(go, gameId));
}

async function main() {
  const game =
    'B[pd];W[dp];B[pq];W[dd];B[qk];W[pp];B[qp];W[oq];B[op];W[po];B[nq];W[or];B[qq];W[np];B[oo];W[mq];B[no];W[nr];B[pn];W[mo];B[cc];W[cd];B[dc];W[ed];B[ec];W[fc];B[fb];W[qc];B[qd];W[pc];B[od];W[oc];B[nc];W[nb];B[mn];W[lo];B[ln];W[kn];B[ko];W[jn];B[cn];W[dn];B[dm];W[en];B[bo];W[cq];B[ck];W[em];B[dl];W[qj];B[pk];W[pj];B[oj];W[rk];B[rl];W[ri];B[sk];W[sj];B[rj];W[nn];B[on];W[rk];B[kp];W[kq];B[rj];W[nm];B[ml];W[rk];B[jq];W[lq];B[rj];W[mm];B[pi];W[lm];B[hn];W[hm];B[gm];W[gn];B[im];W[hl];B[go];W[fn];B[in];W[il];B[ip];W[hq];B[gq];W[gr];B[fq];W[hp];B[ho];W[ir];B[jr];W[fr];B[er];W[eq];B[dr];W[cr];B[gc];W[fd];B[gd];W[bc];B[bb];W[gb];B[eb];W[ge];B[hb];W[he];B[mc];W[mb];B[lc];W[ci];B[di];W[dh];B[ei];W[cj];B[dj];W[cg];B[eh];W[ek];B[el];W[bk];B[fk];W[bl];B[cl];W[bm];B[cm];W[gl];B[hj];W[eg];B[fg];W[mi];B[kl];W[jl];B[lj];W[rk];B[qi];W[sl];B[rm];W[ff];B[kg];W[ii];B[ji];W[ij];B[jh];W[gh];B[gi];W[fl];B[fh];W[gg];B[fj];W[rd];B[re];W[rc];B[qf];W[ke];B[le];W[kf];B[lf];W[mk];B[nl];W[lk];B[ll];W[kk];B[mj];W[nk];B[ol];W[nj];B[ni];W[ki];B[jj];W[jk];B[kj];W[om];B[pm];W[hc];B[bd];W[be];B[ac];W[ga];B[df];W[dg];B[ic];W[id];B[kd];W[jc];B[je];W[lb];B[kc];W[kb];B[jd];W[ib];B[ae];W[bf];B[ar];W[bp];B[ap];W[co];B[bn];W[aq];B[bq];W[br];B[cp];W[ok];B[do];W[oi];B[ep];W[fp];B[dq];W[ph];B[og];W[nh];B[mg];W[ng];B[nf];W[qr];B[pr];W[ps];B[rr];W[qs];B[os];W[ns];B[rs];W[os];B[lp];W[mp];B[kr];W[jo];B[io];W[jp];B[iq];W[pl];B[ql];W[km];B[pl];W[rn];B[sm];W[qo];B[ro];W[pg];B[pf];W[fo];B[gp];W[if];B[jf];W[rg];B[sk];W[qn];B[rj];W[rp];B[rq];W[rk];B[bj];W[bi];B[rj];W[qh];B[si];W[so];B[sn];W[sh];B[sj];W[sf];B[am];W[ig];B[li];W[mh];B[lh];W[ih];B[hk];W[gk];B[se];W[hi];B[gj];W[rf];B[al];W[aj];B[sd];W[sc];B[qe];W[ak];B[an];W[af];B[fa];W[ha];B[ad];W[lr];B[ls];W[ms];B[ks];W[oh];B[of];W[];B[]';
  const go = await deployGo();

  const [blackPlayer, whitePlayer] = await ethers.getSigners();
  const gameId = await startGame(go, blackPlayer, whitePlayer, 19, 6, 0);

  const moves = game.split(';');
  for (const move of moves) {
    const player = move[0] == 'B' ? blackPlayer : whitePlayer;
    if (move.length == 3) {
      await pass(go, gameId, player);
    } else {
      const x = move.charCodeAt(3) - 97;
      const y = move.charCodeAt(2) - 97;
      await playStone(go, gameId, player, x, y);
    }
  }

  await markGroup(go, gameId, blackPlayer, 15, 15, true);
  await markGroup(go, gameId, blackPlayer, 15, 17, true);
  await markGroup(go, gameId, blackPlayer, 14, 18, true);

  await markGroup(go, gameId, blackPlayer, 17, 1, true);

  await markGroup(go, gameId, blackPlayer, 17, 6, true);
  await markGroup(go, gameId, blackPlayer, 17, 8, true);
  await markGroup(go, gameId, blackPlayer, 16, 7, true);

  await markGroup(go, gameId, blackPlayer, 12, 6, true);
  await markGroup(go, gameId, blackPlayer, 10, 4, true);
  await markGroup(go, gameId, blackPlayer, 8, 10, true);
  await markGroup(go, gameId, blackPlayer, 5, 3, true);
  await markGroup(go, gameId, blackPlayer, 2, 6, true);

  await acceptScoring(go, gameId, blackPlayer);
  await acceptScoring(go, gameId, whitePlayer);
}

async function main2() {
  const go = await deployGo();

  const [blackPlayer, whitePlayer] = await ethers.getSigners();
  const gameId = await startGame(go, blackPlayer, whitePlayer, 9, 6, 2);
  console.log('GameStarted:', gameId.toString(16));

  await playStone(go, gameId, whitePlayer, 1, 6);
  await playStone(go, gameId, blackPlayer, 0, 4);
  await playStone(go, gameId, whitePlayer, 0, 5);
  await playStone(go, gameId, blackPlayer, 1, 4);
  await playStone(go, gameId, whitePlayer, 1, 5);
  await playStone(go, gameId, blackPlayer, 2, 4);
  await playStone(go, gameId, whitePlayer, 2, 5);
  await playStone(go, gameId, blackPlayer, 3, 5);
  await playStone(go, gameId, whitePlayer, 3, 6);
  await playStone(go, gameId, blackPlayer, 4, 5);
  await playStone(go, gameId, whitePlayer, 4, 6);
  await playStone(go, gameId, blackPlayer, 5, 5);
  await playStone(go, gameId, whitePlayer, 5, 6);
  await playStone(go, gameId, blackPlayer, 6, 5);
  await playStone(go, gameId, whitePlayer, 6, 6);
  await playStone(go, gameId, blackPlayer, 7, 4);
  await playStone(go, gameId, whitePlayer, 7, 5);
  await playStone(go, gameId, blackPlayer, 8, 4);
  await playStone(go, gameId, whitePlayer, 8, 5);

  await playStone(go, gameId, blackPlayer, 7, 6);
  await playStone(go, gameId, whitePlayer, 7, 7);
  await playStone(go, gameId, blackPlayer, 8, 6);
  await playStone(go, gameId, whitePlayer, 8, 8);
  // await playStone(go, gameId, blackPlayer, 2, 6);
  // await playStone(go, gameId, whitePlayer, 1, 6);
  await playStone(go, gameId, blackPlayer, 2, 7);
  await playStone(go, gameId, whitePlayer, 1, 7);

  await playStone(go, gameId, blackPlayer, 0, 6);
  await playStone(go, gameId, whitePlayer, 1, 1);

  await pass(go, gameId, blackPlayer);
  await pass(go, gameId, whitePlayer);
  await markGroup(go, gameId, blackPlayer, 1, 1, true);
  await markGroup(go, gameId, blackPlayer, 2, 6, true);
  await markGroup(go, gameId, whitePlayer, 2, 7, false);
  await markGroup(go, gameId, whitePlayer, 2, 6, true);
  await markGroup(go, gameId, whitePlayer, 0, 6, true);

  await acceptScoring(go, gameId, whitePlayer);
  await acceptScoring(go, gameId, blackPlayer);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
