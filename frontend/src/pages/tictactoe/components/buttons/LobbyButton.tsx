import { Button } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';

const PATH = '/tictactoe/lobby';

export default function LobbyButton() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Button isDisabled={location.pathname === PATH} onClick={() => navigate(PATH)}>
      Lobby
    </Button>
  );
}
