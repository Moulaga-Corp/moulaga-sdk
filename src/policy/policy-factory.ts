import MOULAGA_CONSTANTS from "../constants";

// factory for genrating the most basic moulaga policy
// i.e access is reserved to:
// - feeder of the data
// - holder of data
// - consumer with granted access by feeder
function policyFactory(feederWallet: string, holderWallet: string): any {
  return [
    {
      contractAddress: "",
      standardContractType: "",
      chain: MOULAGA_CONSTANTS.CHAIN,
      method: "",
      parameters: [
        ":userAddress",
      ],
      returnValueTest: {
        comparator: "=",
        value: feederWallet
      }
    },
    { operator: "or" },
    {
      contractAddress: "",
      standardContractType: "",
      chain: MOULAGA_CONSTANTS.CHAIN,
      method: "",
      parameters: [
        ":userAddress",
      ],
      returnValueTest: {
        comparator: "=",
        value: holderWallet
      }
    },
  ]
}

export default policyFactory;