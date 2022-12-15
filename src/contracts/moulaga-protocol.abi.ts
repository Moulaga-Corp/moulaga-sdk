const moulagaProtocolAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "feeder",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "holder",
				"type": "address"
			}
		],
		"name": "FeederOnboarded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "feeder",
				"type": "address"
			}
		],
		"name": "NewFeeder",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "holder",
				"type": "address"
			}
		],
		"name": "NewHolder",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "holder",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "NewScheme",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name_",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "signature_",
				"type": "string"
			}
		],
		"name": "addScheme",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "feeder_",
				"type": "address"
			}
		],
		"name": "getHoldersFromFeeder",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "wallet",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					}
				],
				"internalType": "struct MoulagaUtils.Holder[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "holder_",
				"type": "address"
			}
		],
		"name": "getSchemesFromHolder",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "signature",
						"type": "string"
					}
				],
				"internalType": "struct MoulagaUtils.Scheme[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_holder",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_scheme",
				"type": "string"
			}
		],
		"name": "hasScheme",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isFeeder",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isHolder",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
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
		"inputs": [],
		"name": "registerAsFeeder",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name_",
				"type": "string"
			}
		],
		"name": "registerAsHolder",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

export default moulagaProtocolAbi;