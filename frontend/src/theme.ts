import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors: {
    user: '#805AD5',
    result: {
      won: '#48BB78',
      lost: '#E53E3E',
      draw: '#ED8936',
    },
    tictactoe: {
      x: '#3182CE',
      o: '#E53E3E',
      win: '#4FD1C5',
    },
  },
});
