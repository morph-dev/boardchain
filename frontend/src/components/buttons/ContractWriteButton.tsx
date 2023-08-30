import { Button, ButtonProps } from '@chakra-ui/react';
import { useCallback } from 'react';
import { PrepareWriteContractConfig, prepareWriteContract, writeContract } from 'wagmi/actions';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { Abi } from 'viem';

export interface ContractWriteButtonProps extends ButtonProps {
  config: PrepareWriteContractConfig<Abi>;
  onStart?: () => void;
  onEnd?: () => void;
}

export default function ContractWriteButton({
  config,
  onStart,
  onEnd,
  ...props
}: ContractWriteButtonProps) {
  const errorHandler = useErrorHandler();

  const onClick = useCallback(() => {
    onStart && onStart();
    prepareWriteContract(config)
      .then(writeContract)
      .catch(errorHandler('Error accepting the challenge!'))
      .finally(() => onEnd && onEnd());
  }, [config, errorHandler, onEnd, onStart]);

  return <Button onClick={onClick} {...props} />;
}
