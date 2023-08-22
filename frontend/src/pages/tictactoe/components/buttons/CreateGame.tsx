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
  usePrepareTicTacToeLobbyCreateChallenge,
  useTicTacToeLobbyWrite,
} from '../../../../generated/blockchain';
import { useAppContext } from '../../../../providers/AppContext';

export default function CreateGame() {
  const { chainId } = useAppContext();
  const [opponent, setOpponent] = useState('');
  const [isX, setIsX] = useState(true);

  const isOpponentValid = !opponent || isAddress(opponent);

  const { config, status: configStatus } = usePrepareTicTacToeLobbyCreateChallenge({
    chainId: chainId,
    args: [isX, isAddress(opponent) ? opponent : zeroAddress],
  });

  const { writeAsync, status: writeStatus } = useTicTacToeLobbyWrite(config);

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
                <Td>Play as</Td>
                <Td>
                  <RadioGroup value={isX ? 'x' : 'o'} onChange={(value) => setIsX(value === 'x')}>
                    <HStack spacing="8">
                      <Radio value="x">X</Radio>
                      <Radio value="o">O</Radio>
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
