require('babel-register');
require('babel-polyfill');
require('dotenv').config()
const HDWalletProvider = require('truffle-hdwallet-provider')

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        process.env.ROPSTEN_URL),
      network_id: 3
    },
    goerli: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        process.env.GOERLI_URL),
      network_id: "*"
    },
    matic: {
      provider: () => new HDWalletProvider(mnemonic, `https://rpc-mainnet.matic.network`),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    xdai: {
          provider: function() {
                return new HDWalletProvider(
               process.env.MNEMONIC,
               "https://api.anyblock.tools/ethereum/poa/xdai/rpc/c6f80ef3-bc49-49f1-9961-82c2644bde63")
          },
	  confirmations: 2,
	  skipDryRun: true,
          network_id: 100,
          gas: 12500000,
          gasPrice: 1000000000
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.6.0",
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
