const Context = artifacts.require('../Context')
const ERC20 = artifacts.require('../ERC20')
const IERC20 = artifacts.require('../IERC20')
const Migrations = artifacts.require('../Migrations')
const SafeMath = artifacts.require('../SafeMath')
const Permissions = artifacts.require('../Permissions')
const xUPC = artifacts.require('../xUPC')
const UPCNFT = artifacts.require('../UPCNFT')

module.exports = async function(deployer, network, accounts) {
  // Deploy Dapp Token
  //await deployer.deploy(Permissions)
  //await deployer.deploy(Context)
  //await deployer.deploy(ERC20)
  await deployer.deploy(xUPC)
  await deployer.deploy(UPCNFT)
  //await deployer.deploy(IERC20)
  //await deployer.deploy(Migrations)
  //await deployer.deploy(RewardGranter)
  //await deployer.deploy(SafeMath)
//  const UPCGoldBank= await UPCGoldBank.deployed()
}
