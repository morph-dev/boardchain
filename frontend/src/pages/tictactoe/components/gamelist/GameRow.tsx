import { Button, Center, TableRowProps, Td, Tr } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Address } from 'viem';
import AddressWithCopy from '../../../../components/AddressWithCopy';
import { bigintToString } from '../../../../utils/textUtils';
import { GameState } from '../../types';
import GameResult from '../GameStatus';
import { OSymbol, XSymbol } from '../Symbols';

export interface GameRowProps extends TableRowProps {
  game: GameState;
  player: Address;
}

export default function GameRow({ game, player }: GameRowProps) {
  return (
    <Tr key={game.gameId.toString()}>
      <Td>
        <Link to={`/tictactoe/game/${bigintToString(game.gameId, false)}`}>
          <Button colorScheme="blue" variant="link">
            {bigintToString(game.gameId, false)}
          </Button>
        </Link>
      </Td>
      <Td>
        <Center>{game.playerX === player ? <XSymbol /> : <OSymbol />}</Center>
      </Td>
      <Td>
        <AddressWithCopy
          address={game.playerX === player ? game.playerO : game.playerX}
          copyIconSize="sm"
          showMe
        />
      </Td>
      <Td>
        <GameResult game={game} player={player} />
      </Td>
      <Td>
        <Link to={`/tictactoe/game/${bigintToString(game.gameId, false)}`}>
          <Button>Open</Button>
        </Link>
      </Td>
    </Tr>
  );
}
