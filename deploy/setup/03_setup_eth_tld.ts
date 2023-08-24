// import namehash from 'eth-ens-namehash'
import { Interface } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { computeInterfaceId, labelHash } from '../utils'

const { utils } = ethers
const { namehash } = utils

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre
  const { owner } = await getNamedAccounts()

  const root = await ethers.getContract('Root')
  const resolver = await ethers.getContract('PublicResolver', await ethers.getSigner(owner))
  const registry = await ethers.getContract('ENSRegistry', await ethers.getSigner(owner))
  const controller = await ethers.getContract('ETHRegistrarController')
  const wrapper = await ethers.getContract('NameWrapper')
  const registrar = await ethers.getContract('BaseRegistrarImplementation')

  // const tx = await root
  //   .connect(await ethers.getSigner(owner))
  //   .setSubnodeOwner(labelhash('eth'), registrar.address)
  // await tx.wait()
  // console.log(`.eth node created, owner is registrar (tx: ${tx2.hash})...`)

  const tx = await root.setSubnodeOwner(labelHash('eth'), owner)
  await tx.wait()
  console.log(`eth node created, owner temporarily set to owner (tx: ${tx.hash})...`)

  const tx2 = await registry.setResolver(namehash('eth'), resolver.address)
  await tx2.wait()
  console.log('Resolver of eth tld set to PublicResolver')

  const controllerArtifact = await deployments.getArtifact('IETHRegistrarController')
  // const interfaceId = computeInterfaceId(new Interface(artifact.abi))
  const tx3 = await resolver.setInterface(
    ethers.utils.namehash('eth'),
    computeInterfaceId(new Interface(controllerArtifact.abi)),
    controller.address,
  )
  await tx3.wait()
  console.log('eth tld implements ETHRegistrarController')

  const tx4 = await resolver.setInterface(
    ethers.utils.namehash('eth'),
    computeInterfaceId(wrapper.interface),
    wrapper.address,
  )
  await tx4.wait()
  console.log('eth tld implements NameWrapper')

  const tx6 = await root.setSubnodeOwner(labelHash('eth'), registrar.address)
  await tx6.wait()
  console.log('Owner of eth tld set to registrar')

  if ((await registry.owner(ethers.utils.namehash('resolver.eth'))) === owner) {
    const pr = (await ethers.getContract('PublicResolver')).connect(await ethers.getSigner(owner))
    const resolverHash = ethers.utils.namehash('resolver.eth')
    const tx = await registry.setResolver(resolverHash, pr.address)
    console.log(`Setting resolver for resolver.eth to PublicResolver (tx: ${tx.hash})...`)
    await tx.wait()

    const tx3 = await pr['setAddr(bytes32,address)'](resolverHash, pr.address)
    console.log(`Setting address for resolver.eth to PublicResolver (tx: ${tx3.hash})...`)
    await tx3.wait()
  } else {
    console.log('Skip setting resolver for resolver.eth: it is not owned by the owner')
  }

  return true
}

func.id = 'setup_base_eth_tld'
func.tags = ['setupEthTld']
func.dependencies = [
  // 'setupRoot',
  // 'setupBaseRegistrar',
  'Root',
  'PublicResolver',
  'ENSRegistry',
  'ETHRegistrarController',
  'NameWrapper',
  'BaseRegistrarImplementation',
]

export default func
