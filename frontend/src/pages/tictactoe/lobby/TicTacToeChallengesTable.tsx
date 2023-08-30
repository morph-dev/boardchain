import { useMemo } from 'react';
import DynamicTable from '../../../components/table/DynamicTable';
import { DynamicTableColumn } from '../../../components/table/DynamicTableColumn';
import { ChallengeGame } from '../types';

import { ActionsColumn, MakerColumn, TakerColumn } from './Columns';

export interface TicTacToeChallengesTableProps {
  challenges: readonly ChallengeGame[];
  title?: string;
  showMaker?: boolean;
  showTaker?: boolean;
}

export default function TicTacToeChallengesTable({
  challenges,
  title,
  showMaker,
  showTaker,
}: TicTacToeChallengesTableProps) {
  const columns = useMemo<DynamicTableColumn<ChallengeGame>[]>(() => {
    const columns: DynamicTableColumn<ChallengeGame>[] = [];
    if (showMaker) {
      columns.push({
        header: 'challenger',
        headerProps: { minW: 80 },
        Component: MakerColumn,
      });
    }
    if (showTaker) {
      columns.push({
        header: 'opponent',
        headerProps: { minW: 80 },
        Component: TakerColumn,
      });
    }
    columns.push({
      header: 'actions',
      headerProps: { minW: 60 },
      Component: ActionsColumn,
    });
    return columns;
  }, [showMaker, showTaker]);

  if (challenges.length === 0) {
    return null;
  }

  return <DynamicTable items={challenges} itemKey="gameId" title={title} columns={columns} />;
}
