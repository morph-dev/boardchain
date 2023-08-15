import { Box, ChakraProvider } from '@chakra-ui/react';
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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="go">
        <Route path="game/:gameId" loader={() => null} element={<GoGamePage />} />
        <Route path="account/:address" loader={() => null} element={<GoAccountPage />} />
        <Route index path="lobby" element={<GoLobbyPage />} />
      </Route>
      <Route index element={<Navigate to="/go/games" />} />
    </Route>
  )
);

function Layout() {
  return (
    <Box h="100vh">
      <TopBar />
      <Box h="full">
        <Outlet />
      </Box>
    </Box>
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
