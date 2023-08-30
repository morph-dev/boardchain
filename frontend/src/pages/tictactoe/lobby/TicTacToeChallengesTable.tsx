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
  if (challenges.length === 0) {
    return <></>;
  }

  const columns: DynamicTableColumn<ChallengeGame>[] = [];
  if (showMaker) {
    columns.push({
      header: 'challenger',
      headerProps: { minW: 80 },
      component: MakerColumn,
    });
  }
  if (showTaker) {
    columns.push({
      header: 'opponent',
      headerProps: { minW: 80 },
      component: TakerColumn,
    });
  }
  columns.push({
    header: 'actions',
    headerProps: { minW: 60 },
    component: ActionsColumn,
  });

  return <DynamicTable items={challenges} itemKey="gameId" title={title} columns={columns} />;
}
