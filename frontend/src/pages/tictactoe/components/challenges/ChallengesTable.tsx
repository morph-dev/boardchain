import {
  Table,
  TableCaption,
  TableContainer,
  TableContainerProps,
  Tbody,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { ChallengeGame } from '../../types';
import ChallengeRow from './ChallengeRow';

export interface ChallengesTableProps extends TableContainerProps {
  challenges: readonly ChallengeGame[];
  title?: string;
  showMaker?: boolean;
  showTaker?: boolean;
}

export default function ChallengesTable({
  challenges,
  title,
  showMaker = true,
  showTaker = true,
  ...props
}: ChallengesTableProps) {
  return (
    <TableContainer {...props}>
      <Table>
        {title && (
          <TableCaption placement="top" fontSize="lg" m={0} p={0}>
            {title}
          </TableCaption>
        )}
        <Thead>
          <Tr>
            {showMaker && (
              <Th textAlign="center" minW={80}>
                challenger
              </Th>
            )}
            {showTaker && (
              <Th textAlign="center" minW={80}>
                challenged
              </Th>
            )}
            <Th textAlign="center" minW={60}>
              Available Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {challenges.map((challenge) => (
            <ChallengeRow
              key={challenge.gameId.toString()}
              challenge={challenge}
              showMaker={showMaker}
              showTaker={showTaker}
            />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
