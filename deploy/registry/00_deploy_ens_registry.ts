import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy } = deployments
  const { deployer, owner } = await getNamedAccounts()

  await deploy('ENSRegistry', {
    from: deployer,
    args: [],
    log: true,
  })

  const registry = await ethers.getContract('ENSRegistry')
  if (deployer !== owner) {
    const tx = await registry.setOwner(ZERO_HASH, owner, { from: deployer })
    console.log(`root trasferred to owner (tx:${tx.hash})...`)
    await tx.wait()
  }

  return true
}

func.id = 'ens'
func.tags = ['ENSRegistry']

export default func
