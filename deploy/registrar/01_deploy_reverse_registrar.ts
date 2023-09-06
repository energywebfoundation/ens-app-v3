import { namehash } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { ZERO_HASH } from '../constants'
import { labelHash } from '../utils'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  const registry = await ethers.getContract('ENSRegistry')

  const deployArgs = {
    from: deployer,
    args: [registry.address],
    log: true,
  }
  const reverseRegistrar = await deploy('ReverseRegistrar', deployArgs)
  if (!reverseRegistrar.newlyDeployed) return

  if (owner !== deployer) {
    const r = await ethers.getContract('ReverseRegistrar', deployer)
    const tx = await r.transferOwnership(owner)
    console.log(`Owner of ReverseRegistrar set to owner (tx: ${tx.hash})...`)
    await tx.wait()
  }

  // Only attempt to make controller etc changes directly on testnets
  if (network.name === 'mainnet') return

  if (network.tags.use_root) {
    const root = await ethers.getContract('Root')

    const tx1 = await root
      .connect(await ethers.getSigner(owner))
      .setSubnodeOwner(labelHash('reverse'), owner)
    await tx1.wait()
  } else {
    const tx1 = await registry
      .connect(await ethers.getSigner(owner))
      .setSubnodeOwner(ZERO_HASH, labelHash('reverse'), owner)
    await tx1.wait()
  }
  console.log(`Owner of .reverse set to owner`)

  const tx2 = await registry
    .connect(await ethers.getSigner(owner))
    .setSubnodeOwner(namehash('reverse'), labelHash('addr'), reverseRegistrar.address)
  await tx2.wait()
  console.log(`Owner of .addr.reverse set to ReverseRegistrar (tx: ${tx2.hash})...`)
}

func.id = 'reverse-registrar'
func.tags = ['ReverseRegistrar']
func.dependencies = ['root', 'ENSRegistry']

export default func
