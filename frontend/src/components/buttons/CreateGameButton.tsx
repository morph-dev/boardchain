import {
  Button,
  ButtonProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { PropsWithChildren, useCallback } from 'react';
import { Address } from 'viem';
import { useToasts } from '../../hooks/useToasts';
import { useAppContext } from '../../providers/AppContext';

export type CreateGameProps = {
  onCreateGame: (userAddress: Address) => Promise<unknown>;
  openButtonProps?: Omit<ButtonProps, 'onClick'>;
  createButtonProps?: Omit<ButtonProps, 'onClick'>;
};

export default function CreateGameButton({
  onCreateGame,
  openButtonProps,
  createButtonProps,
  children,
}: PropsWithChildren<CreateGameProps>) {
  const { userAddress } = useAppContext();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { toast, pleaseAuthenticateToast } = useToasts();

  const maybeOpen = useCallback(() => {
    if (!userAddress) {
      pleaseAuthenticateToast({
        description: 'You need to connect wallet before starting the game.',
      });
      return;
    }
    onOpen();
  }, [userAddress, onOpen, pleaseAuthenticateToast]);

  const onStartClick = useCallback(() => {
    if (!userAddress) {
      pleaseAuthenticateToast();
      return;
    }

    toast.promise(
      onCreateGame(userAddress).then(() => onClose()),
      {
        success: { title: 'Game created!' },
        error: { title: 'Error creating game!' },
        loading: { title: 'Creating game' },
      }
    );
  }, [userAddress, toast, onCreateGame, pleaseAuthenticateToast, onClose]);

  return (
    <>
      <Button onClick={maybeOpen} {...openButtonProps}>
        Create Game
      </Button>

      <Modal size="xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new game</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{children}</ModalBody>
          <ModalFooter>
            <Button onClick={onStartClick} {...createButtonProps}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
