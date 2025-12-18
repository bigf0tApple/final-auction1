// Ethereum Window Extension Type Definitions
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>
  on: (event: string, handler: (accounts: string[]) => void) => void
  removeListener: (event: string, handler: (accounts: string[]) => void) => void
  isMetaMask?: boolean
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

export {}