import { utils } from "ethers";

interface AuthSigType {
  sig: string;
  derivedVia: string;
  signedMessage: string;
  address: string;
}

function authSigFactory(message: string, signedMessage: string): AuthSigType {
  const callerWallet = utils.verifyMessage(message, signedMessage);
  return {
    sig: signedMessage,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: message,
    address: callerWallet
  } as const;
}

export default authSigFactory;
export { AuthSigType };