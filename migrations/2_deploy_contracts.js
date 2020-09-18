const UPCGoldBank = artifacts.require('UPCGoldBank')

module.exports = async function(deployer, network, accounts) {
  // Deploy Dapp Token
  await deployer.deploy(UPCGoldBank)
  const UPCGoldBank= await UPCGoldBank.deployed()
}
