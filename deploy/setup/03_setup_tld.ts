import { Interface } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { TLD_LABELHASH, TLD_NODE } from '../constants'
import { computeInterfaceId } from '../utils'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log('setting up top level domain')
  const { getNamedAccounts, deployments } = hre
  const { owner } = await getNamedAccounts()

  const root = await ethers.getContract('Root')
  const resolver = await ethers.getContract('PublicResolver', await ethers.getSigner(owner))
  const registry = await ethers.getContract('ENSRegistry', await ethers.getSigner(owner))
  const controller = await ethers.getContract('ETHRegistrarController')
  const wrapper = await ethers.getContract('NameWrapper')
  const registrar = await ethers.getContract('BaseRegistrarImplementation')

  const tx = await root.setSubnodeOwner(TLD_LABELHASH, owner)
  await tx.wait()
  console.log(`tld node created, owner temporarily set to owner (tx: ${tx.hash})...`)

  const tx2 = await registry.setResolver(TLD_NODE, resolver.address)
  await tx2.wait()
  console.log('Resolver of tld set to PublicResolver')

  const controllerArtifact = await deployments.getArtifact('IETHRegistrarController')
  const tx3 = await resolver.setInterface(
    TLD_NODE,
    computeInterfaceId(new Interface(controllerArtifact.abi)),
    controller.address,
  )
  await tx3.wait()
  console.log('tld implements ETHRegistrarController')

  const tx4 = await resolver.setInterface(
    TLD_NODE,
    computeInterfaceId(wrapper.interface),
    wrapper.address,
  )
  await tx4.wait()
  console.log('tld implements NameWrapper')

  const tx6 = await root.setSubnodeOwner(TLD_LABELHASH, registrar.address)
  await tx6.wait()
  console.log('Owner of tld set to registrar')

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
  'Root',
  'PublicResolver',
  'ENSRegistry',
  'ETHRegistrarController',
  'NameWrapper',
  'BaseRegistrarImplementation',
]

export default func
