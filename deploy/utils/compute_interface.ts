import { Interface } from '@ethersproject/abi'

const { makeInterfaceId } = require('@openzeppelin/test-helpers')

export function computeInterfaceId(iface: Interface) {
  return makeInterfaceId.ERC165(
    Object.values(iface.functions).map((frag) => frag.format('sighash')),
  )
}
