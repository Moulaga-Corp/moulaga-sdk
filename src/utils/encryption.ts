import Crypto from "crypto";
import { cipher, decryptWithPrivateKey, encryptWithPublicKey } from "eth-crypto";

const SYMMETRIC_ALG = "aes-256-cbc";

async function encryptWithAes(data: string, symmetricKey: Buffer, iv: Buffer): Promise<string> {
  const _cipher = Crypto.createCipheriv(SYMMETRIC_ALG, symmetricKey, iv);
  const encrypted = Buffer.concat([
    _cipher.update(Buffer.from(data, "utf8")), 
    _cipher.final()
  ]);

  return encrypted.toString("base64");
}

async function decryptWithAes(encrypedData: string, symmetricKey: Buffer, iv: Buffer): Promise<string> {
  const _decipher = Crypto.createDecipheriv(SYMMETRIC_ALG, symmetricKey, iv);
  const decrypted = Buffer.concat([
    _decipher.update(Buffer.from(encrypedData, "base64")), 
    _decipher.final()
  ]);

  return decrypted.toString("utf8");
}

/**
 * 
 * @param symmetricKey the key used to encrypt / decrypt data
 * @param iv the initial vector
 * @param publicKey the public key used to generate the cipehr of the sym key, must be that of the recipient
 * @returns keydata: a string containing the following separated by a space:
 * - the stringified cipher of the actual symmetric key 
 * - the hex string representation of the initial vector (iv) used to encrypt data
 */
async function encryptSymmetricKeyAndIv(symmetricKey: Buffer, iv: Buffer, publicKey: string): Promise<string> {
  const validPublicKey = publicKey.startsWith("0x") ? publicKey.slice(2) : publicKey;

  return encryptWithPublicKey(validPublicKey, symmetricKey.toString("hex"))
    .then(c => `${cipher.stringify(c)} ${iv.toString("hex")}`);
}

/**
 * 
 * @param keyData a string containing the following separated by a space:
 * - the stringified cipher of the actual symmetric key 
 * - the hex string representation of the initial vector (iv) used to encrypt data
 * @returns a pair of Buffers containing the symmetric key and the iv
 */
async function decryptSymmetricKeyAndIv(keyData: string, privateKey: string): Promise<[Buffer, Buffer]> {
  const [keyCipher, iv] = keyData.split(" ");
  if (iv === undefined) {
    throw new Error("Invalid key data.");
  }

  return decryptWithPrivateKey(privateKey, cipher.parse(keyCipher))
    .then(symmetricKey => ([
      Buffer.from(symmetricKey, "hex"), 
      Buffer.from(iv, "hex")
  ]));
}

export { encryptWithAes, decryptWithAes, encryptSymmetricKeyAndIv, decryptSymmetricKeyAndIv };