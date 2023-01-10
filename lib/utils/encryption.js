"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptSymmetricKeyAndIv = exports.encryptSymmetricKeyAndIv = exports.decryptWithAes = exports.encryptWithAes = void 0;
const crypto_1 = __importDefault(require("crypto"));
const eth_crypto_1 = require("eth-crypto");
const SYMMETRIC_ALG = "aes-256-cbc";
function encryptWithAes(data, symmetricKey, iv) {
    return __awaiter(this, void 0, void 0, function* () {
        const _cipher = crypto_1.default.createCipheriv(SYMMETRIC_ALG, symmetricKey, iv);
        const encrypted = Buffer.concat([
            _cipher.update(Buffer.from(data, "utf8")),
            _cipher.final()
        ]);
        return encrypted.toString("base64");
    });
}
exports.encryptWithAes = encryptWithAes;
function decryptWithAes(encrypedData, symmetricKey, iv) {
    return __awaiter(this, void 0, void 0, function* () {
        const _decipher = crypto_1.default.createDecipheriv(SYMMETRIC_ALG, symmetricKey, iv);
        const decrypted = Buffer.concat([
            _decipher.update(Buffer.from(encrypedData, "base64")),
            _decipher.final()
        ]);
        return decrypted.toString("utf8");
    });
}
exports.decryptWithAes = decryptWithAes;
/**
 *
 * @param symmetricKey the key used to encrypt / decrypt data
 * @param iv the initial vector
 * @param publicKey the public key used to generate the cipehr of the sym key, must be that of the recipient
 * @returns keydata: a string containing the following separated by a space:
 * - the stringified cipher of the actual symmetric key
 * - the hex string representation of the initial vector (iv) used to encrypt data
 */
function encryptSymmetricKeyAndIv(symmetricKey, iv, publicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const validPublicKey = publicKey.startsWith("0x") ? publicKey.slice(2) : publicKey;
        return (0, eth_crypto_1.encryptWithPublicKey)(validPublicKey, symmetricKey.toString("hex"))
            .then(c => `${eth_crypto_1.cipher.stringify(c)} ${iv.toString("hex")}`);
    });
}
exports.encryptSymmetricKeyAndIv = encryptSymmetricKeyAndIv;
/**
 *
 * @param keyData a string containing the following separated by a space:
 * - the stringified cipher of the actual symmetric key
 * - the hex string representation of the initial vector (iv) used to encrypt data
 * @returns a pair of Buffers containing the symmetric key and the iv
 */
function decryptSymmetricKeyAndIv(keyData, privateKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const [keyCipher, iv] = keyData.split(" ");
        if (iv === undefined) {
            throw new Error("Invalid key data.");
        }
        return (0, eth_crypto_1.decryptWithPrivateKey)(privateKey, eth_crypto_1.cipher.parse(keyCipher))
            .then(symmetricKey => ([
            Buffer.from(symmetricKey, "hex"),
            Buffer.from(iv, "hex")
        ]));
    });
}
exports.decryptSymmetricKeyAndIv = decryptSymmetricKeyAndIv;
