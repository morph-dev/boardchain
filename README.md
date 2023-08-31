# BoardChain

The project for playing turn based games on the blockchain and the associated frontend.

The main game is Go, but other games might be added as well (Tic-Tac-Toe, etc.)

## Developer details

Some overview:

- Yarn is used as a package manager

- Code is divided into 2 workspaces

  - blockchain - Smart contracts and simple console testing

  - frontend - Vite+React app

- TypeScript and Solidity as main languages

## Local development

1. Make sure to install packages

   ```console
   yarn install
   ```
  
2. Run blockchain locally

   ```console
   yarn hh node
   ```

3. Deploy contracts:

   ```console
   yarn hh run scripts/setupLocal.ts
   ```

4. Start local frontend:

   ```console
   yarn fe dev
   ```

    You can press 'o' in this terminal and it will open page in the browser




