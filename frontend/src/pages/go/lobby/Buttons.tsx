import { ButtonProps } from '@chakra-ui/react';
import { useMemo } from 'react';
import { zeroAddress } from 'viem';
import { PrepareWriteContractConfig } from 'wagmi/actions';
import ContractWriteButton from '../../../components/buttons/ContractWriteButton';
import { goLobbyABI, goLobbyAddress } from '../../../generated/blockchain';
import { useAppContext } from '../../../providers/AppContext';
import { ChallengeGameType } from '../types';

export interface ChallengeButtonProps extends ButtonProps {
  challenge: ChallengeGameType;
  onStart: () => void;
  onEnd: () => void;
}

export function AcceptChallengeButton({ challenge, ...props }: ChallengeButtonProps) {
  const { chainId, userAddress } = useAppContext();

  const config = useMemo<PrepareWriteContractConfig<typeof goLobbyABI>>(
    () => ({
      abi: goLobbyABI,
      address: goLobbyAddress[chainId],
      chainId: chainId,
      functionName:
        challenge.taker === zeroAddress ? 'acceptOpenChallenge' : 'acceptDirectChallenge',
      args: [challenge.gameId],
    }),
    [chainId, challenge.gameId, challenge.taker]
  );

  if (
    challenge.maker === userAddress ||
    (challenge.taker !== zeroAddress && challenge.taker !== userAddress)
  ) {
    // User can't accept the challenge (either user is maker or user is not taker)
    return null;
  }

  return (
    <ContractWriteButton config={config} colorScheme="green" {...props}>
      Accept
    </ContractWriteButton>
  );
}

export function CancelChallengeButton({ challenge, ...props }: ChallengeButtonProps) {
  const { chainId, userAddress } = useAppContext();

  const config = useMemo<PrepareWriteContractConfig<typeof goLobbyABI>>(
    () => ({
      abi: goLobbyABI,
      address: goLobbyAddress[chainId],
      chainId: chainId,
      functionName:
        challenge.taker === zeroAddress ? 'cancelOpenChallenge' : 'cancelDirectChallenge',
      args: [challenge.gameId],
    }),
    [chainId, challenge.gameId, challenge.taker]
  );

  if (challenge.maker !== userAddress && challenge.taker !== userAddress) {
    // User can't cancel the challenge (user is neither maker nor taker)
    return null;
  }

  return (
    <ContractWriteButton config={config} colorScheme="red" {...props}>
      Cancel
    </ContractWriteButton>
  );
}
