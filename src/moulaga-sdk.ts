import Crypto from "crypto";
import { cipher, decryptWithPrivateKey, encryptWithPublicKey } from "eth-crypto";
import { Wallet, providers } from "ethers";
import MOULAGA_CONSTANTS from "./constants";
import { decryptWithAes, encryptSymmetricKeyAndIv } from "./utils";


class MoulagaSdk {
  constructor(private readonly _wallet: Wallet) {}

  async onboardFeeder(feederAddress: string, feederPublicKey: string): Promise<void> {
    const key = Crypto.randomBytes(32);
    const iv = Crypto.randomBytes(16);

    const keyDataCiphers = await Promise.all(
      [feederPublicKey, this._wallet.publicKey]
        .map(pub => encryptSymmetricKeyAndIv(key, iv, pub))
    );
    // call to contract to onboard
  }

  async prepareDataForConsumer(keyDataCipher: string, encrypedData: string, consumerPublicKey: string) {
    const validPublicKey = consumerPublicKey.startsWith("0x") ? consumerPublicKey.slice(2) : consumerPublicKey;
    const [keyCipher, iv] = keyDataCipher.split(" ");
    const _cipher = cipher.parse(keyCipher);
    const consumerCipher = await decryptWithPrivateKey(this._wallet.privateKey, _cipher)
      .then(symmetricKey => encryptWithPublicKey(validPublicKey, symmetricKey))
      .then(c => `${cipher.stringify(c)} ${iv}`);

    return {key: consumerCipher, data: encrypedData} as const;
  }

  // key data must be a string containing the following separated by a space:
  // - the hex cipher for the symmetric key
  // - the hex initial vector (iv) used to encrypt the data
  async decryptData(keyDataCipher: string, encrypedData: string): Promise<string> {
    const [keyCipher, iv] = keyDataCipher.split(" ");
    const _cipher = cipher.parse(keyCipher);
    return decryptWithPrivateKey(this._wallet.privateKey, _cipher)
      .then(symmetricKey => decryptWithAes(
        encrypedData, 
        Buffer.from(symmetricKey, "hex"), 
        Buffer.from(iv, "hex")
    ));
  }

  static from(privateKey: string): MoulagaSdk {
    return new MoulagaSdk(new Wallet(
      privateKey, 
      new providers.JsonRpcProvider(
        MOULAGA_CONSTANTS.RPC_ENDPOINT, 
        MOULAGA_CONSTANTS.CHAIN_ID
      )
    ));
  }
}

export default MoulagaSdk;