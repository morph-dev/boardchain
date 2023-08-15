import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { isAddress } from 'viem';
import { useAccount, useChainId } from 'wagmi';
import { goGameConfig } from '../../generated/blockchain';
import { prepareWriteContract, writeContract } from 'wagmi/actions';

export function StartGameButton() {
  const toast = useToast({ status: 'error', isClosable: true });

  const chainId = useChainId();
  const { address: walletAddress, isConnected } = useAccount();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [opponent, setOpponent] = useState('');
  const [isBlack, setIsBlack] = useState(true);
  const [boardSize, setBoardSize] = useState(9);
  const [handicap, setHandicap] = useState(0);

  const maybeOpen = useCallback(() => {
    if (!isConnected) {
      toast({
        title: 'Please authenticate first!',
        description: 'You need to connect wallet before starting the game.',
      });
      return;
    }
    onOpen();
  }, [isConnected, toast, onOpen]);

  const onStartClick = useCallback(() => {
    if (!walletAddress || !isAddress(walletAddress)) {
      toast({
        title: 'Please authenticate!',
      });
      return;
    }

    if (!isAddress(opponent)) {
      toast({
        title: 'You need to enter valid address for your opponent',
      });
      return;
    }

    const goGameAddress =
      chainId in goGameConfig.address
        ? goGameConfig.address[chainId as keyof typeof goGameConfig.address]
        : '';
    if (!isAddress(goGameAddress)) {
      toast({
        title: 'Unknown contract address!',
        description: 'You are maybe on the wrong chain.',
      });
      return;
    }

    const config = prepareWriteContract({
      address: goGameAddress,
      abi: goGameConfig.abi,
      functionName: 'startGame',
      args: [
        /*black=*/ isBlack ? walletAddress : opponent,
        /*white=*/ isBlack ? opponent : walletAddress,
        /*boardSize=*/ boardSize,
        /*komi*/ handicap == 0 ? 6 : 0,
        /*handicap=*/ handicap == 1 ? 0 : handicap,
      ],
    });

    toast.promise(config.then(writeContract), {
      success: { title: 'Game started!' },
      error: { title: 'Error starting game!' },
      loading: { title: 'Starting game' },
    });
  }, [toast, chainId, walletAddress, opponent, isBlack, boardSize, handicap]);

  if (boardSize < 10 && handicap > 5) {
    setHandicap(0);
  }
  const handicapOptions = [...Array(boardSize < 10 ? 6 : 10).keys()];

  return (
    <>
      <Button onClick={maybeOpen}>Start Game</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new token</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer>
              <Table>
                <Tbody>
                  <Tr>
                    <Td>Opponent</Td>
                    <Td>
                      <Input value={opponent} onChange={(ev) => setOpponent(ev.target.value)} />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Your Color</Td>
                    <Td>
                      <Select
                        value={isBlack ? 'Black' : 'White'}
                        onChange={(ev) => setIsBlack(ev.target.value == 'Black')}
                      >
                        <option value="Black">Black</option>
                        <option value="White">White</option>
                      </Select>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Board Size</Td>
                    <Td>
                      <Select
                        value={boardSize}
                        onChange={(ev) => setBoardSize(Number.parseInt(ev.target.value))}
                      >
                        <option value="9">9x9</option>
                        <option value="13">13x13</option>
                        <option value="19">19x19</option>
                      </Select>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Handicap</Td>
                    <Td>
                      <Select
                        value={handicap}
                        onChange={(ev) => setHandicap(Number.parseInt(ev.target.value))}
                      >
                        {handicapOptions.map((h) => (
                          <option key={h} value={h}>
                            {h > 0 ? h : 'None'}
                          </option>
                        ))}
                      </Select>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onStartClick}>Start</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
