import { ChakraProvider, VStack } from '@chakra-ui/react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import WagmiProvider from './providers/WagmiProvider';
import TopBar from './components/topbar/TopBar';
import GoAccountPage from './pages/go/account/GoAccountPage';
import GoGamePage from './pages/go/game/GoGamePage';
import GoLobbyPage from './pages/go/lobby/GoLobbyPage';
import TicTacToeLobbyPage from './pages/tictactoe/lobby/TicTacToeLobbyPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="tictactoe">
        <Route path="lobby" element={<TicTacToeLobbyPage />} />
        <Route index element={<Navigate to="lobby" />} />
      </Route>
      <Route path="go">
        <Route path="game/:gameId" loader={() => null} element={<GoGamePage />} />
        <Route path="account/:address" loader={() => null} element={<GoAccountPage />} />
        <Route path="lobby" element={<GoLobbyPage />} />
        <Route index element={<Navigate to="lobby" />} />
      </Route>
      <Route index element={<Navigate to="/go" />} />
    </Route>
  )
);

function Layout() {
  return (
    <VStack align="stretch" h="100vh" spacing="2" p="2">
      <TopBar />
      <Outlet />
    </VStack>
  );
}

export default function App() {
  return (
    <ChakraProvider>
      <WagmiProvider>
        <RouterProvider router={router} />
      </WagmiProvider>
    </ChakraProvider>
  );
}
