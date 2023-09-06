import '@rainbow-me/rainbowkit/styles.css'
import { DefaultOptions, QueryClient } from '@tanstack/react-query'
import { Address, Chain, configureChains, createClient } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import { makePersistent } from '@app/utils/persist'

import { WC_PROJECT_ID } from './constants'
import { getDefaultWallets } from './getDefaultWallets'

const NEXT_PUBLIC_DEPLOYMENT_ADDRESSES = process.env.NEXT_PUBLIC_DEPLOYMENT_ADDRESSES
if (!NEXT_PUBLIC_DEPLOYMENT_ADDRESSES) {
  throw new Error('Deployment addresses are not set')
}
const ensRegistry = JSON.parse(NEXT_PUBLIC_DEPLOYMENT_ADDRESSES).ENSRegistry as Address
if (!ensRegistry) {
  throw new Error('ENSRegistry is not set')
}
const universalResolver = JSON.parse(NEXT_PUBLIC_DEPLOYMENT_ADDRESSES).UniversalResolver as Address
if (!universalResolver) {
  throw new Error('UniversalResolver is not set')
}
const multicall = JSON.parse(NEXT_PUBLIC_DEPLOYMENT_ADDRESSES).Multicall as Address
if (!multicall) {
  throw new Error('Multicall is not set')
}

const contracts = {
  ensRegistry: {
    address: ensRegistry,
  },
  ensUniversalResolver: {
    address: universalResolver,
  },
  multicall3: {
    address: multicall,
  },
}

export const ewc: Chain = {
  id: 246,
  name: 'Energy Web Chain',
  network: 'ewc',
  nativeCurrency: { name: 'EWT', symbol: 'EWT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.energyweb.org/'],
    },
    public: {
      http: ['https://rpc.energyweb.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Energy Web Chain Explorer',
      url: 'https://explorer.energyweb.org',
    },
  },
  contracts,
}

export const volta: Chain = {
  id: 73799,
  name: 'Volta EnergyWeb Chain',
  network: 'volta',
  nativeCurrency: { name: 'VT', symbol: 'VT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://volta-rpc.energyweb.org/'],
    },
    public: {
      http: ['https://volta-rpc.energyweb.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Volta EnergyWeb Chain Explorer',
      url: 'http://volta-explorer.energyweb.org',
    },
  },
  contracts,
}

export const hardhat: Chain = {
  id: 1337,
  name: 'localhost',
  network: 'localhost',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:8545/'],
    },
    public: {
      http: ['http://localhost:8545/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hardhat',
      url: 'http://explorer.energyweb.org',
    },
  },
  contracts,
}

const jsonProvider = jsonRpcProvider({
  rpc: (chain) => ({
    http: chain.rpcUrls.public.http[0] || chain.rpcUrls.default.http[0],
  }),
})

const { provider, chains } = configureChains([volta, ewc, hardhat], [jsonProvider])

const connectors = getDefaultWallets({
  appName: 'ENS',
  projectId: WC_PROJECT_ID,
  chains,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  },
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  queryClient,
  persister: null,
})

makePersistent(queryClient)

export const refetchOptions: DefaultOptions<unknown> = {
  queries: {
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60,
    staleTime: 1000 * 120,
    meta: {
      isRefetchQuery: true,
    },
    refetchOnMount: 'always',
  },
}

const queryClientWithRefetch = new QueryClient({
  queryCache: queryClient.getQueryCache(),
  defaultOptions: refetchOptions,
  mutationCache: queryClient.getMutationCache(),
})

const wagmiClientWithRefetch = createClient({
  autoConnect: true,
  connectors,
  provider,
  queryClient: queryClientWithRefetch,
  persister: null,
})

export { chains, queryClient, wagmiClient, wagmiClientWithRefetch }
