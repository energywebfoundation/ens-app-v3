import { ethers } from 'hardhat'

export const labelHash = (label: string) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(label))
