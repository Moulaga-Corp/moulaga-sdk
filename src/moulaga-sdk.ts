import Crypto from "crypto";
import { cipher, decryptWithPrivateKey, encryptWithPublicKey } from "eth-crypto";
import { Contract, providers, Wallet } from "ethers";
import MOULAGA_CONSTANTS from "./constants";
import moulagaProtocolAbi from "./contracts/moulaga-protocol.abi";
import moulagaSbtAbi from "./contracts/moulaga-sbt.abi";
import { decryptSymmetricKeyAndIv, decryptWithAes, encryptSymmetricKeyAndIv, encryptWithAes } from "./utils/encryption";

interface MoulagaSdk {
  onboardFeeder: (feederAddress: string, feederPublicKey: string) => Promise<void>;
  prepareDataForStorage: (jsonData: string, feederAddress: string) => Promise<string>;
  isAuthorized: (feeder: string, consumer: string, scheme: string) => Promise<boolean>;
  prepareDataForConsumer: (feederAddress: string, encrypedData: string, consumerPublicKey: string) => Promise<{keyData: string; data: string;}>;
  decryptData: (keyDataCipher: string, encrypedData: string) => Promise<string>;
}

function withWallet(_wallet: Wallet): MoulagaSdk {
  const protocolContract = new Contract(MOULAGA_CONSTANTS.PROTOCOL_ADDRESS, moulagaProtocolAbi, _wallet);
  const sbtContract = new Contract(MOULAGA_CONSTANTS.SBT_ADDRESS, moulagaSbtAbi, _wallet);


  async function onboardFeeder(feederAddress: string, feederPublicKey: string): Promise<void> {
    const key = Crypto.randomBytes(32);
    const iv = Crypto.randomBytes(16);

    const [keyForFeeder, keyForHolder] = await Promise.all(
      [feederPublicKey, _wallet.publicKey]
        .map(pub => encryptSymmetricKeyAndIv(key, iv, pub))
    );
    // call to contract to onboard
    await protocolContract.onboardFeeder(feederAddress, keyForFeeder, keyForHolder);
  }

  /**
   * @notice this method should be called before writing new or updated data to the storage service
   * @param jsonData the JSON string to be stored
   * @param feederAddress the address of the wallet related to said data
   * @returns encrypted data as string
   */
  async function prepareDataForStorage(jsonData: string, feederAddress: string): Promise<string> {
    const [key] = await protocolContract.functions.getHolderKeyForFeeder(feederAddress);
    const [symmetricKey, iv] = await decryptSymmetricKeyAndIv(key, _wallet.privateKey);
    return encryptWithAes(jsonData, symmetricKey, iv);
  }

  /**
   * 
   * @param feeder address of the feeder
   * @param consumer address of the consumer
   * @param scheme name of the scheme corresponding to the data requested
   * @returns a Promised boolean
   */
  async function isAuthorized(feeder: string, consumer: string, scheme: string): Promise<boolean> {
    return await sbtContract.functions.isAuthorized(feeder, consumer, scheme).then(res => res[0]);
  }

  /**
   * @notice you should call "isAuthorized" to check a consumer's credentials before fetching / transferring the data !
   * -> this method only prepares the data and the key, no credentials check is performed
   * @param feederAddress public address of the feeder whose data will be encrypted
   * @param encryptedData the data to share
   * @param consumerPublicKey public key of the consumer, will be used to safely share the symmetric key
   * @returns an object containing 
   *  - keyData the new key cipher, only readable by the consumer
   *  - data the data to be shared with the consumer
   */
  async function prepareDataForConsumer(feederAddress: string, encryptedData: string, consumerPublicKey: string) {
    const [keyDataCipher] = await protocolContract.functions.getHolderKeyForFeeder(feederAddress);
    
    const validPublicKey = consumerPublicKey.startsWith("0x") ? consumerPublicKey.slice(2) : consumerPublicKey;
    const [keyCipher, iv] = keyDataCipher.split(" ");
    const _cipher = cipher.parse(keyCipher);
    const consumerCipher = await decryptWithPrivateKey(_wallet.privateKey, _cipher)
      .then(symmetricKey => encryptWithPublicKey(validPublicKey, symmetricKey))
      .then(c => `${cipher.stringify(c)} ${iv}`);

    return {keyData: consumerCipher, data: encryptedData} as const;
  }

  async function decryptData(keyData: string, encrypedData: string): Promise<string> {
    const [keyCipher, iv] = keyData.split(" ");
    const _cipher = cipher.parse(keyCipher);
    return decryptWithPrivateKey(_wallet.privateKey, _cipher)
      .then(symmetricKey => decryptWithAes(
        encrypedData, 
        Buffer.from(symmetricKey, "hex"), 
        Buffer.from(iv, "hex")
    ));
  }

  return { onboardFeeder, prepareDataForStorage, isAuthorized, prepareDataForConsumer, decryptData } as const;
} 

function fromPrivateKey(privateKey: string): MoulagaSdk {
  return withWallet(new Wallet(
    privateKey, 
    new providers.JsonRpcProvider(
      MOULAGA_CONSTANTS.RPC_ENDPOINT, 
      MOULAGA_CONSTANTS.CHAIN_ID
    )
  ));
}

export {withWallet, fromPrivateKey};