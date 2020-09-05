require('babel-register');
require('babel-polyfill');
require('dotenv').config()
const HDWalletProvider = require('truffle-hdwallet-provider')

module.exports = {
  networks: {
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
    }

  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
