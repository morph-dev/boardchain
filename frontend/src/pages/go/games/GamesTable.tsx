import { Spinner, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import DynamicTable from '../../../components/table/DynamicTable';
import { DynamicTableColumn, addressColumn } from '../../../components/table/DynamicTableColumn';
import { useGoGameAllGames, useGoGameGamePhaseChangedEvent } from '../../../generated/blockchain';
import { useAppContext } from '../../../providers/AppContext';
import {
  actionColumn,
  boardSizeColumn,
  statusColumn,
} from '../components/table/GameSummaryColumns';
import { GameSummaryType } from '../types';
import { getGameIdAsString } from '../components/utils/summary';

export default function GamesTable() {
  const { chainId } = useAppContext();

  const {
    data: games,
    status,
    refetch,
  } = useGoGameAllGames({
    chainId: chainId,
  });

  useGoGameGamePhaseChangedEvent({
    listener: () => refetch(),
  });

  const columns = useMemo<DynamicTableColumn<GameSummaryType>[]>(() => {
    return [
      addressColumn<GameSummaryType>('Black', (game) => game.players[0]),
      addressColumn<GameSummaryType>('White', (game) => game.players[1]),
      boardSizeColumn(),
      statusColumn(),
      actionColumn(),
    ];
  }, []);

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
