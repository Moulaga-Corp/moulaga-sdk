import Crypto from "crypto";
import { cipher, decryptWithPrivateKey, encryptWithPublicKey } from "eth-crypto";
import { Wallet, providers } from "ethers";
import MOULAGA_CONSTANTS from "./constants";
import { decryptWithAes, encryptSymmetricKeyAndIv } from "./utils/encryption";

interface MoulagaSdk {
  onboardFeeder: (feederAddress: string, feederPublicKey: string) => Promise<void>;
  prepareDataForConsumer: (keyDataCipher: string, encrypedData: string, consumerPublicKey: string) => Promise<{keyData: string; data: string;}>;
  decryptData: (keyDataCipher: string, encrypedData: string) => Promise<string>;
}

function withWallet(_wallet: Wallet): MoulagaSdk {
  async function onboardFeeder(feederAddress: string, feederPublicKey: string): Promise<void> {
    const key = Crypto.randomBytes(32);
    const iv = Crypto.randomBytes(16);

    const keyDataCiphers = await Promise.all(
      [feederPublicKey, _wallet.publicKey]
        .map(pub => encryptSymmetricKeyAndIv(key, iv, pub))
    );
    // call to contract to onboard
  }

  async function prepareDataForConsumer(keyDataCipher: string, encrypedData: string, consumerPublicKey: string) {
    const validPublicKey = consumerPublicKey.startsWith("0x") ? consumerPublicKey.slice(2) : consumerPublicKey;
    const [keyCipher, iv] = keyDataCipher.split(" ");
    const _cipher = cipher.parse(keyCipher);
    const consumerCipher = await decryptWithPrivateKey(_wallet.privateKey, _cipher)
      .then(symmetricKey => encryptWithPublicKey(validPublicKey, symmetricKey))
      .then(c => `${cipher.stringify(c)} ${iv}`);

    return {keyData: consumerCipher, data: encrypedData} as const;
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

  return { onboardFeeder, prepareDataForConsumer, decryptData } as const;
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