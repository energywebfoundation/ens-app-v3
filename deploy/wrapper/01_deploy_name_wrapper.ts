import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  const registry = await ethers.getContract('ENSRegistry', owner)
  const registrar = await ethers.getContract('BaseRegistrarImplementation', owner)
  const metadata = await ethers.getContract('StaticMetadataService', owner)

  const deployArgs = {
    from: deployer,
    args: [registry.address, registrar.address, metadata.address],
    log: true,
  }

  const nameWrapper = await deploy('NameWrapper', deployArgs)

  if (owner !== deployer) {
    const wrapper = await ethers.getContract('NameWrapper', deployer)
    const tx = await wrapper.transferOwnership(owner)
    console.log(`Owner of NameWrapper set to ${owner} (tx: ${tx.hash})...`)
    await tx.wait()
  }

  // Only attempt to make controller etc changes directly on testnets
  if (network.name === 'mainnet') return

  if (network.tags.use_wrap_names) {
    const tx2 = await registrar.addController(nameWrapper.address)
    await tx2.wait()
    console.log(`NameWrapper added to controllers of registrar (tx: ${tx2.hash})...`)
  }
}

func.id = 'name-wrapper'
func.tags = ['wrapper', 'NameWrapper']
func.dependencies = [
  'ENSRegistry',
  'BaseRegistrarImplementation',
  'StaticMetadataService',
  'ReverseRegistrar', // NameWrapper extends ReverseClaimer, which depends on ReverseRegistrar
]

export default func
