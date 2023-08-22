import { Button } from '@chakra-ui/react';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToasts } from '../../../../hooks/useToasts';
import { useAppContext } from '../../../../providers/AppContext';

export default function MyGames() {
  const { userAddress } = useAppContext();
  const navigate = useNavigate();
  const { pleaseAuthenticateToast } = useToasts();
  const location = useLocation();

  const path = useMemo(() => `/tictactoe/player/${userAddress}`, [userAddress]);

  const isDisabled = !!userAddress && location.pathname === path;

  const onClick = useCallback(() => {
    if (!userAddress) {
      pleaseAuthenticateToast();
      return;
    }
    navigate(path);
  }, [navigate, path, pleaseAuthenticateToast, userAddress]);

  return (
    <Button isDisabled={isDisabled} onClick={onClick}>
      My games
    </Button>
  );
}
