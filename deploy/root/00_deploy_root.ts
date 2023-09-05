import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre
  const { deploy } = deployments
  const { owner, deployer } = await getNamedAccounts()
  console.log(`owner ${owner}, deployer ${deployer}`)

  // if (!network.tags.use_root) {
  //   return true
  // }

  const registry = await ethers.getContract('ENSRegistry', await ethers.getSigner(owner))

  await deploy('Root', {
    from: deployer,
    args: [registry.address],
    log: true,
  })

  const root = await ethers.getContract('Root')

  const tx1 = await registry.setOwner(ZERO_HASH, root.address)
  await tx1.wait()
  console.log(`Owner of root node set to Root (tx: ${tx1.hash})...`)

  if (owner !== deployer) {
    const tx = await root.connect(await ethers.getSigner(deployer)).transferOwnership(owner)
    await tx.wait()
    console.log(`Owner of Root set to owner (tx: ${tx.hash})...`)
  }

  if (!(await root.controllers(owner))) {
    const tx = await root.connect(await ethers.getSigner(owner)).setController(owner, true)
    await tx.wait()
    console.log(`Owner added to controllers of Root (tx: ${tx.hash})...`)
  }

  return true
}

func.id = 'root'
func.tags = ['Root']
func.dependencies = ['ENSRegistry']

export default func
