const Context = artifacts.require('../Context')
const ERC20 = artifacts.require('../ERC20')
const IERC20 = artifacts.require('../IERC20')
const Migrations = artifacts.require('../Migrations')
const RewardGranter = artifacts.require('../RewardGranter')
const SafeMath = artifacts.require('../SafeMath')
const UPCGoldBank = artifacts.require('../UPCGoldBank')

module.exports = async function(deployer, network, accounts) {
  // Deploy Dapp Token
  await deployer.deploy(UPCGoldBank)
  //await deployer.deploy(Context)
  //await deployer.deploy(ERC20)
  //await deployer.deploy(IERC20)
  await deployer.deploy(Migrations)
  await deployer.deploy(RewardGranter)
  //await deployer.deploy(SafeMath)
//  const UPCGoldBank= await UPCGoldBank.deployed()
}
