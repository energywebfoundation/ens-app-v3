/* eslint-disable import/no-extraneous-dependencies */
import '@nomiclabs/hardhat-ethers'
import 'dotenv/config'
import 'hardhat-deploy'
import { HardhatUserConfig } from 'hardhat/config'

const ownerPk = process.env.OWNER_PK
if (!ownerPk) {
  throw new Error('Onwer private key was not set')
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      // for DummyOldResolver contract
      {
        version: '0.4.11',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: 'localhost',
  networks: {
    hardhat: {
      saveDeployments: false,
      chainId: 1337,
      live: false,
    },
    localhost: {
      saveDeployments: false,
      url: 'http://localhost:8545',
      chainId: 1337,
      accounts: {
        mnemonic: process.env.SECRET_WORDS!,
      },
      live: false,
    },
    volta: {
      saveDeployments: true,
      url: 'https://volta-rpc.energyweb.org',
      chainId: 73799,
      accounts: [ownerPk, ownerPk],
      live: false,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    owner: {
      default: 0,
    },
    owner2: {
      default: 2,
    },
  },
}

export default config
