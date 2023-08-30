import { HStack } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';
import DynamicTable from '../../../components/table/DynamicTable';
import {
  DynamicTableColumn,
  DynamicTableColumnProps,
  addressColumn,
  textColumn,
} from '../../../components/table/DynamicTableColumn';
import { ChallengeGameType } from '../types';
import { AcceptChallengeButton, CancelChallengeButton } from './Buttons';
import { getGameIdAsString } from '../components/utils/summary';

export interface GoChallengesTableProps {
  challenges: readonly ChallengeGameType[];
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
  const columns = useMemo(() => {
    const columns: DynamicTableColumn<ChallengeGameType>[] = [];
    if (showMaker) {
      columns.push(addressColumn('challenger', (challenge) => challenge.maker));
    }
    if (showTaker) {
      columns.push(addressColumn('opponent', (challenge) => challenge.taker));
    }
    columns.push(
      textColumn('Size', (challenge) => `${challenge.boardSize}x${challenge.boardSize}`)
    );
    columns.push({
      header: 'Actions',
      headerProps: { minW: 60 },
      Component: ActionsColumn,
    });
    return columns;
  }, [showMaker, showTaker]);

  if (challenges.length === 0) {
    return <></>;
  }

  return (
    <DynamicTable items={challenges} itemFn={getGameIdAsString} title={title} columns={columns} />
  );
}

function ActionsColumn({ item: challenge }: DynamicTableColumnProps<ChallengeGameType>) {
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
