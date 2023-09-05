import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { TLD_NODE } from '../constants'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre
  const { deploy } = deployments
  const { owner, deployer } = await getNamedAccounts()

  // if (!network.tags.use_root) {
  //   return true
  // }

  const registry = await ethers.getContract('ENSRegistry')

  const deployArgs = {
    from: deployer,
    args: [registry.address, TLD_NODE],
    log: true,
  }

  const bri = await deploy('BaseRegistrarImplementation', deployArgs)
  if (!bri.newlyDeployed) return

  const registrar = await ethers.getContract('BaseRegistrarImplementation')
  const tx1 = await registrar.transferOwnership(owner, { from: deployer })
  await tx1.wait()
  console.log(`Owner of BaseRegistrarImplementation is set to owner (tx: ${tx1.hash})...`)
}

func.id = 'registrar'
func.tags = ['BaseRegistrarImplementation', 'registrar']
func.dependencies = ['ENSRegistry']

export default func
