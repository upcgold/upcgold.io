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
      provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://rpc-mainnet.maticvigil.com`),
      network_id: 137,
      confirmations: 2,
      skipDryRun: true,
      timeoutBlocks: 200,
      gas: 12500000,
      gasPrice: 1000000000,
    },
    xdai: {
          provider: function() {
                return new HDWalletProvider(
               process.env.MNEMONIC,
               "https://rpc.xdaichain.com/")
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
      version: "^0.8.0",
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "istanbul"
    }
  }
}
