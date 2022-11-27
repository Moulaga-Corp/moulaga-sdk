import Crypto from "crypto";
import { createIdentity } from "eth-crypto";
import { decryptSymmetricKeyAndIv, decryptWithAes, encryptSymmetricKeyAndIv, encryptWithAes } from "../src/utils/encryption";

describe("utils", () => {
  const wallet = createIdentity();
  const key = Crypto.randomBytes(32);
  const iv = Crypto.randomBytes(16);
  const message = "a test message huhu !";

  describe("AES encryption", () => {
    it("should succeed", async () => {
      const encryptedData = await encryptWithAes(message, key, iv);
      expect(typeof encryptedData).toBe("string");
    });

    it("should be decryptable", async () => {
      const encryptedData = await encryptWithAes(message, key, iv);
      const clearData = await decryptWithAes(encryptedData, key, iv);

      expect(clearData).toBe(message);
    });

    it("should throw when the symmetric key is invalid", async () => {
      const encryptedData = await encryptWithAes(message, key, iv);
      const fakeKey = Buffer.concat([key.subarray(16, 32), key.subarray(0, 16)]);

      await expect(() => decryptWithAes(encryptedData, fakeKey, iv)).rejects.toThrow();
    });

    it("should return an invalid message when the iv is invalid", async () => {
      const encryptedData = await encryptWithAes(message, key, iv);
      const fakeIv = Buffer.concat([iv.subarray(8, 16), key.subarray(0, 8)]);
      const clearMessage = await decryptWithAes(encryptedData, key, fakeIv);

      expect(clearMessage).not.toBe(message);
    });
  });

  describe("symmetric key an iv encryption", () => {
    it("should succeed", async () => {
      const keyData = await encryptSymmetricKeyAndIv(key, iv, wallet.publicKey);

      expect(typeof keyData).toBe("string");
    });

    it("should be decryptable", async () => {
      const keyData = await encryptSymmetricKeyAndIv(key, iv, wallet.publicKey);
      const clearBuffers = await decryptSymmetricKeyAndIv(keyData, wallet.privateKey);

      expect(clearBuffers).toEqual([key, iv]);
    });

    it("should only be decryptable by the recipient", async () => {
      const impostor = createIdentity();
      const keyData = await encryptSymmetricKeyAndIv(key, iv, wallet.publicKey);

      await expect(() => decryptSymmetricKeyAndIv(keyData, impostor.privateKey)).rejects.toThrow();
    });

    it("should throw when the keyData is invalid", async () => {
      const keyData = await encryptSymmetricKeyAndIv(key, iv, wallet.publicKey);

      await expect(() => decryptSymmetricKeyAndIv(keyData.split(" ")[0], wallet.privateKey)).rejects.toThrowError("Invalid key data.");
    });
  });
});