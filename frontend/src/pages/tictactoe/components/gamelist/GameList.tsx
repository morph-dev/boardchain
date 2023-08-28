import { Spinner, Table, TableContainer, Tbody, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { Address } from 'wagmi';
import { useTicTacToeAllPlayerGames } from '../../../../generated/blockchain';
import { useAppContext } from '../../../../providers/AppContext';
import GameRow from './GameRow';

export type GameListProps = {
  address: Address;
};

export default function GameList({ address }: GameListProps) {
  const { chainId } = useAppContext();

  const { data: games, status } = useTicTacToeAllPlayerGames({ chainId: chainId, args: [address] });

  if (status === 'loading') {
    return <Spinner />;
  }

  if (status === 'error' || !games) {
    return <Text fontSize="lg">Error loading games</Text>;
  }

  if (games.length === 0) {
    return <Text fontSize="lg">No games</Text>;
  }

  return (
    <TableContainer boxSize="container.sm">
      <Table>
        <Thead>
          <Tr>
            <Th textAlign="center">id</Th>
            <Th textAlign="center">plays as</Th>
            <Th textAlign="center">opponent</Th>
            <Th textAlign="center">status</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {games.map((game) => (
            <GameRow key={game.gameId.toString()} game={game} player={address} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
