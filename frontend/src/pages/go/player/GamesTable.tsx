import { Spinner, Text } from '@chakra-ui/react';
import { useCallback, useMemo } from 'react';
import { Address } from 'viem';
import DynamicTable from '../../../components/table/DynamicTable';
import {
  DynamicTableColumn,
  addressColumn,
  textColumn,
} from '../../../components/table/DynamicTableColumn';
import {
  useGoGameAllPlayerGames,
  useGoGameGamePhaseChangedEvent,
  useGoGameGameStartedEvent,
} from '../../../generated/blockchain';
import { useAppContext } from '../../../providers/AppContext';
import {
  actionColumn,
  boardSizeColumn,
  statusColumn,
} from '../components/table/GameSummaryColumns';
import { GameSummaryType, Player } from '../types';
import { getGameIdAsString } from '../components/utils/summary';

export type GamesTableProps = {
  playerAddress: Address;
};

export default function GamesTable({ playerAddress }: GamesTableProps) {
  const { chainId } = useAppContext();

  const {
    data: games,
    status,
    refetch,
  } = useGoGameAllPlayerGames({
    chainId: chainId,
    args: [playerAddress],
  });

  useGoGameGameStartedEvent({
    listener: (events) => {
      if (
        events.some(
          (event) => event.args.black === playerAddress || event.args.white === playerAddress
        )
      ) {
        refetch();
      }
    },
  });
  useGoGameGamePhaseChangedEvent({
    listener: (events) => {
      if (events.some((event) => games?.some((game) => game.info.gameId === event.args.gameId))) {
        refetch();
      }
    },
  });

  const player = useCallback(
    (game: GameSummaryType): Player => {
      if (game.players[0] === playerAddress) return Player.Black;
      if (game.players[1] === playerAddress) return Player.White;
      throw Error('Unknown player');
    },
    [playerAddress]
  );

  const columns = useMemo<DynamicTableColumn<GameSummaryType>[]>(() => {
    return [
      textColumn<GameSummaryType>('', (game) => (player(game) === Player.Black ? '⚫' : '⚪')),
      addressColumn<GameSummaryType>('Opponent', (game) =>
        player(game) === Player.Black ? game.players[1] : game.players[0]
      ),
      boardSizeColumn(),
      statusColumn(),
      actionColumn(),
    ];
  }, [player]);

  if (status === 'loading') {
    return <Spinner />;
  }

  if (!games) {
    return (
      <Text textAlign="center" fontSize="lg">
        Something went wrong!
      </Text>
    );
  }

  if (games.length == 0) {
    return (
      <Text textAlign="center" fontSize="lg">
        No games
      </Text>
    );
  }

  return <DynamicTable items={games} itemFn={getGameIdAsString} columns={columns} />;
}
