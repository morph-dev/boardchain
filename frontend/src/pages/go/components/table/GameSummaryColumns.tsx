import { Button, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Address } from 'viem';
import {
  DynamicTableColumn,
  DynamicTableColumnProps,
  textColumn,
} from '../../../../components/table/DynamicTableColumn';
import { bigintToString } from '../../../../utils/textUtils';
import { GameSummaryType } from '../../types';
import { getGameStatus, getLoser, getWinner } from '../utils/summary';

export function boardSizeColumn(): DynamicTableColumn<GameSummaryType> {
  return textColumn('Size', (item) => `${item.info.boardSize}x${item.info.boardSize}`);
}

export function statusColumn(player?: Address): DynamicTableColumn<GameSummaryType> {
  return {
    header: 'Status',
    Component: ({ item: game }: DynamicTableColumnProps<GameSummaryType>) => (
      <Text
        textAlign="center"
        {...(player && player == getWinner(game) && { textColor: 'result.won' })}
        {...(player && player == getLoser(game) && { textColor: 'result.lost' })}
      >
        {getGameStatus(game, true /* =short */)}
      </Text>
    ),
  };
}

export function actionColumn(): DynamicTableColumn<GameSummaryType> {
  return {
    header: 'Actions',
    Component: ({ item: game }: DynamicTableColumnProps<GameSummaryType>) => (
      <Link to={`/go/game/${bigintToString(game.info.gameId, false)}`}>
        <Button as="div">Open</Button>
      </Link>
    ),
  };
}
