import { Box, ChakraProvider } from '@chakra-ui/react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import WagmiProvider from './providers/WagmiProvider';

const router = createBrowserRouter(
  createRoutesFromElements(<Route path="/" element={<Layout />}></Route>)
);

function Layout() {
  return (
    <Box h="100vh">
      {/* <TopBar /> */}
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
