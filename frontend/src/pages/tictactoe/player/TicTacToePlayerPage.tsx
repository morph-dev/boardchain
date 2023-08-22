import { Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

export default function TicTacToePlayerPage() {
  const { playerAddress } = useParams();
  return (
    <>
      <Text>{playerAddress}</Text>
    </>
  );
}
