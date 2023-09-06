/* eslint-disable import/no-extraneous-dependencies */
import { writeFile } from 'fs/promises'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { resolve } from 'path'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const allDeployments = await hre.deployments.all()
  const deploymentAddressMap = Object.fromEntries(
    Object.keys(allDeployments).map((dkey) => [dkey, allDeployments[dkey].address]),
  )

  await writeFile(
    resolve(__dirname, '../.env.local'),
    `NEXT_PUBLIC_DEPLOYMENT_ADDRESSES='${JSON.stringify(
      deploymentAddressMap,
    )}'\nNEXT_PUBLIC_PROVIDER=http://localhost:8545`,
  )
  console.log('Wrote contract addresses and provider to .env.local')
}

func.runAtTheEnd = true
func.tags = ['getContractAddresses']

export default func
