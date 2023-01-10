"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moulagaProtocolAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "feeder_",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "keyForFeeder_",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "keyForHolder_",
                "type": "string"
            }
        ],
        "name": "onboardFeeder",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_feeder",
                "type": "address"
            }
        ],
        "name": "getHolderKeyForFeeder",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
exports.default = moulagaProtocolAbi;
