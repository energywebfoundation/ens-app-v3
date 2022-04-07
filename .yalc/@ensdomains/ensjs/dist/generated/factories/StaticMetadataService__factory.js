/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Contract, utils } from "ethers";
const _abi = [
    {
        type: "constructor",
        payable: false,
        inputs: [
            {
                type: "string",
                name: "_metaDataUri",
            },
        ],
    },
    {
        type: "function",
        name: "uri",
        constant: true,
        stateMutability: "view",
        payable: false,
        inputs: [
            {
                type: "uint256",
            },
        ],
        outputs: [
            {
                type: "string",
            },
        ],
    },
];
export class StaticMetadataService__factory {
    static createInterface() {
        return new utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new Contract(address, _abi, signerOrProvider);
    }
}
StaticMetadataService__factory.abi = _abi;
