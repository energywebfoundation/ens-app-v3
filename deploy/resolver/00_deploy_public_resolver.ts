import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  const registry = await ethers.getContract('ENSRegistry', owner)
  const nameWrapper = await ethers.getContract('NameWrapper', owner)
  const controller = await ethers.getContract('ETHRegistrarController', owner)
  const reverseRegistrar = await ethers.getContract('ReverseRegistrar', owner)
  // const registrar = await ethers.getContract('BaseRegistrarImplementation', owner)

  const deployArgs = {
    from: deployer,
    args: [registry.address, nameWrapper.address, controller.address, reverseRegistrar.address],
    log: true,
  }
  const publicResolver = await deploy('PublicResolver', deployArgs)
  if (!publicResolver.newlyDeployed) return

  const tx = await reverseRegistrar.setDefaultResolver(publicResolver.address)
  await tx.wait()
  console.log(`Set resolver of ReverseRegistrar to PublicResolver (tx: ${tx.hash})...`)

  // const tx2 = await registrar.setResolver(publicResolver.address)
  // await tx2.wait()
  // console.log(`Set resolver of tld to PublicResolver`)

  // if ((await registry.owner(ethers.utils.namehash('resolver.eth'))) === owner) {
  //   const pr = (await ethers.getContract('PublicResolver')).connect(await ethers.getSigner(owner))
  //   const resolverHash = ethers.utils.namehash('resolver.eth')
  //   const tx2 = await registry.setResolver(resolverHash, pr.address)
  //   console.log(`Setting resolver for resolver.eth to PublicResolver (tx: ${tx2.hash})...`)
  //   await tx2.wait()
  //
  //   const tx3 = await pr['setAddr(bytes32,address)'](resolverHash, pr.address)
  //   console.log(`Setting address for resolver.eth to PublicResolver (tx: ${tx3.hash})...`)
  //   await tx3.wait()
  // } else {
  //   console.log('Skip setting resolver for resolver.eth: it is not owned by the owner')
  // }
}

func.id = 'public_resolver'
func.tags = ['PublicResolver']
func.dependencies = [
  'ENSRegistry',
  'NameWrapper',
  'ETHRegistrarController',
  'ReverseRegistrar',
  // 'BaseRegistrarImplementation',
]

export default func
