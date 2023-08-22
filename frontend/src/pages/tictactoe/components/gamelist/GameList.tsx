import { useContractReads } from 'wagmi';
import { ticTacToeABI, ticTacToeAddress } from '../../../../generated/blockchain';
import { useAppContext } from '../../../../providers/AppContext';
import { Text } from '@chakra-ui/react';
import { ReadContractConfig } from 'wagmi/actions';

export type GameListProps = {
  gameIds: bigint[];
};

export default function GameList({ gameIds }: GameListProps) {
  const { chainId } = useAppContext();

  const { data: games, status } = useContractReads({
    contracts: gameIds.map(
      (gameId): ReadContractConfig<typeof ticTacToeABI, 'game'> => ({
        abi: ticTacToeABI,
        address: ticTacToeAddress[chainId],
        chainId: chainId,
        functionName: 'game',
        args: [gameId],
      })
    ),
  });
  console.log(games);

  return (
    <>
      <Text>{status}</Text>
    </>
  );
}
