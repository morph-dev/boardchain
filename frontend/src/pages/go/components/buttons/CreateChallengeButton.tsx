import {
  HStack,
  Input,
  Radio,
  RadioGroup,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { isAddress, zeroAddress } from 'viem';
import CreateGameButton from '../../../../components/buttons/CreateGameButton';
import {
  useGoLobbyWrite,
  usePrepareGoLobbyCreateChallenge,
} from '../../../../generated/blockchain';
import { useAppContext } from '../../../../providers/AppContext';

export default function CreateChallengeButton() {
  const { chainId } = useAppContext();
  const [opponent, setOpponent] = useState('');
  const [boardSize, setBoardSize] = useState(9);

  const isOpponentValid = !opponent || isAddress(opponent);

  const { config, status: configStatus } = usePrepareGoLobbyCreateChallenge({
    chainId: chainId,
    args: [isAddress(opponent) ? opponent : zeroAddress, boardSize],
  });

  const { writeAsync, status: writeStatus } = useGoLobbyWrite(config);

  const onCreateGame = useCallback((): Promise<unknown> => {
    if (!isOpponentValid || configStatus !== 'success' || !writeAsync) {
      return Promise.reject();
    }
    return writeAsync().then();
  }, [configStatus, isOpponentValid, writeAsync]);

  return (
    <CreateGameButton
      onCreateGame={onCreateGame}
      createButtonProps={{
        isDisabled: !isOpponentValid || configStatus !== 'success',
        isLoading: configStatus === 'loading' || writeStatus === 'loading',
      }}
    >
      <VStack>
        <TableContainer w="full">
          <Table size="sm">
            <Tbody>
              <Tr>
                <Td>Board Size</Td>
                <Td>
                  <RadioGroup
                    value={String(boardSize)}
                    onChange={(value) => setBoardSize(parseInt(value))}
                  >
                    <HStack justify="space-between">
                      <Radio value="9">9x9</Radio>
                      <Radio value="13">13x13</Radio>
                      <Radio value="19">19x19</Radio>
                    </HStack>
                  </RadioGroup>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text color={!isOpponentValid ? 'red.500' : 'current'}>Opponent (optional):</Text>
                </Td>
                <Td>
                  <Input
                    w="full"
                    isInvalid={!isOpponentValid}
                    value={opponent}
                    onChange={(ev) => setOpponent(ev.target.value)}
                  />
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    </CreateGameButton>
  );
}
