import { Interface } from '@ethersproject/abi'
import { ethers } from 'hardhat'

const { makeInterfaceId } = require('@openzeppelin/test-helpers')

export const labelHash = (label: string) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label))

export function computeInterfaceId(iface: Interface) {
  return makeInterfaceId.ERC165(
    Object.values(iface.functions).map((frag) => frag.format('sighash')),
  )
}
