/// <reference types="node" />
declare function encryptWithAes(data: string, symmetricKey: Buffer, iv: Buffer): Promise<string>;
declare function decryptWithAes(encrypedData: string, symmetricKey: Buffer, iv: Buffer): Promise<string>;
/**
 *
 * @param symmetricKey the key used to encrypt / decrypt data
 * @param iv the initial vector
 * @param publicKey the public key used to generate the cipehr of the sym key, must be that of the recipient
 * @returns keydata: a string containing the following separated by a space:
 * - the stringified cipher of the actual symmetric key
 * - the hex string representation of the initial vector (iv) used to encrypt data
 */
declare function encryptSymmetricKeyAndIv(symmetricKey: Buffer, iv: Buffer, publicKey: string): Promise<string>;
/**
 *
 * @param keyData a string containing the following separated by a space:
 * - the stringified cipher of the actual symmetric key
 * - the hex string representation of the initial vector (iv) used to encrypt data
 * @returns a pair of Buffers containing the symmetric key and the iv
 */
declare function decryptSymmetricKeyAndIv(keyData: string, privateKey: string): Promise<[Buffer, Buffer]>;
export { encryptWithAes, decryptWithAes, encryptSymmetricKeyAndIv, decryptSymmetricKeyAndIv };
//# sourceMappingURL=encryption.d.ts.map