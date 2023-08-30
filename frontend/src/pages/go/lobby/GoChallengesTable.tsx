import { HStack } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import DynamicTable from '../../../components/table/DynamicTable';
import {
  DynamicTableColumn,
  DynamicTableColumnProps,
  addressColumn,
  textColumn,
} from '../../../components/table/DynamicTableColumn';
import { ChallengeGame } from '../types';
import { AcceptChallengeButton, CancelChallengeButton } from './Buttons';

export interface GoChallengesTableProps {
  challenges: readonly ChallengeGame[];
  title?: string;
  showMaker?: boolean;
  showTaker?: boolean;
}

export default function GoChallengesTable({
  challenges,
  title,
  showMaker,
  showTaker,
}: GoChallengesTableProps) {
  if (challenges.length === 0) {
    return <></>;
  }

  const columns: DynamicTableColumn<ChallengeGame>[] = [];
  if (showMaker) {
    columns.push(addressColumn('challenger', (challenge) => challenge.maker));
  }
  if (showTaker) {
    columns.push(addressColumn('opponent', (challenge) => challenge.taker));
  }
  columns.push(
    textColumn('Board Size', (challenge) => `${challenge.boardSize}x${challenge.boardSize}`, {
      textAlign: 'center',
    })
  );
  columns.push({
    header: 'actions',
    headerProps: { minW: 60 },
    Component: ActionsColumn,
  });

  return <DynamicTable items={challenges} itemKey="gameId" title={title} columns={columns} />;
}

function ActionsColumn({ item: challenge }: DynamicTableColumnProps<ChallengeGame>) {
  const [pending, setPending] = useState(false);

  const onStart = useCallback(() => setPending(true), [setPending]);
  const onEnd = useCallback(() => setPending(false), [setPending]);

  return (
    <HStack justify="center">
      <AcceptChallengeButton
        isLoading={pending}
        challenge={challenge}
        onStart={onStart}
        onEnd={onEnd}
      />
      <CancelChallengeButton
        isLoading={pending}
        challenge={challenge}
        onStart={onStart}
        onEnd={onEnd}
      />
    </HStack>
  );
}
