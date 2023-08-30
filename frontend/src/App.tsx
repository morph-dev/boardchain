import { ChakraProvider, VStack } from '@chakra-ui/react';
import {
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import TopBar from './components/topbar/TopBar';
import GoLayout from './pages/go/GoLayout';
import GoPlayerPage from './pages/go/player/GoPlayerPage';
import GoGamesPage from './pages/go/games/GoGamesPage';
import GoGamePage from './pages/go/game/GoGamePage';
import GoLobbyPage from './pages/go/lobby/GoLobbyPage';
import TicTacToeLayout from './pages/tictactoe/TicTacToeLayout';
import TicTacToeGamePage from './pages/tictactoe/game/TicTacToeGamePage';
import TicTacToeLobbyPage from './pages/tictactoe/lobby/TicTacToeLobbyPage';
import TicTacToePlayerPage from './pages/tictactoe/player/TicTacToePlayerPage';
import AppContextProvider from './providers/AppContextProvider';
import WagmiProvider from './providers/WagmiProvider';
import { theme } from './theme';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppLayout />}>
      <Route path="tictactoe" element={<TicTacToeLayout />}>
        <Route path="lobby" element={<TicTacToeLobbyPage />} />
        <Route path="game/:gameId" element={<TicTacToeGamePage />} />
        <Route path="player/:playerAddress" element={<TicTacToePlayerPage />} />
        <Route index element={<Navigate to="lobby" />} />
      </Route>
      <Route path="go" element={<GoLayout />}>
        <Route path="lobby" element={<GoLobbyPage />} />
        <Route path="games" element={<GoGamesPage />} />
        <Route path="game/:gameId" loader={() => null} element={<GoGamePage />} />
        <Route path="player/:playerAddress" element={<GoPlayerPage />} />
        <Route index element={<Navigate to="lobby" />} />
      </Route>
      <Route index element={<Navigate to="/go" />} />
    </Route>
  )
);

function AppLayout() {
  return (
    <VStack align="stretch" h="100vh" spacing="2" p="2">
      <TopBar />
      <VStack h="full">
        <AppContextProvider>
          <Outlet />
        </AppContextProvider>
      </VStack>
    </VStack>
  );
}

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <WagmiProvider>
        <RouterProvider router={router} />
      </WagmiProvider>
    </ChakraProvider>
  );
}
