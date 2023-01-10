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
exports.fromPrivateKey = exports.withWallet = void 0;
const crypto_1 = __importDefault(require("crypto"));
const eth_crypto_1 = require("eth-crypto");
const ethers_1 = require("ethers");
const constants_1 = __importDefault(require("./constants"));
const moulaga_protocol_abi_1 = __importDefault(require("./contracts/moulaga-protocol.abi"));
const moulaga_sbt_abi_1 = __importDefault(require("./contracts/moulaga-sbt.abi"));
const encryption_1 = require("./utils/encryption");
function withWallet(_wallet) {
    const protocolContract = new ethers_1.Contract(constants_1.default.PROTOCOL_ADDRESS, moulaga_protocol_abi_1.default, _wallet);
    const sbtContract = new ethers_1.Contract(constants_1.default.SBT_ADDRESS, moulaga_sbt_abi_1.default, _wallet);
    function onboardFeeder(feederAddress, feederPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = crypto_1.default.randomBytes(32);
            const iv = crypto_1.default.randomBytes(16);
            const [keyForFeeder, keyForHolder] = yield Promise.all([feederPublicKey, _wallet.publicKey]
                .map(pub => (0, encryption_1.encryptSymmetricKeyAndIv)(key, iv, pub)));
            // call to contract to onboard
            yield protocolContract.onboardFeeder(feederAddress, keyForFeeder, keyForHolder);
        });
    }
    /**
     * @notice this method should be called before writing new or updated data to the storage service
     * @param jsonData the JSON string to be stored
     * @param feederAddress the address of the wallet related to said data
     * @returns encrypted data as string
     */
    function prepareDataForStorage(jsonData, feederAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const [key] = yield protocolContract.functions.getHolderKeyForFeeder(feederAddress);
            const [symmetricKey, iv] = yield (0, encryption_1.decryptSymmetricKeyAndIv)(key, _wallet.privateKey);
            return (0, encryption_1.encryptWithAes)(jsonData, symmetricKey, iv);
        });
    }
    /**
     *
     * @param feeder address of the feeder
     * @param consumer address of the consumer
     * @param scheme name of the scheme corresponding to the data requested
     * @returns a Promised boolean
     */
    function isAuthorized(feeder, consumer, scheme) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield sbtContract.functions.isAuthorized(feeder, consumer, scheme).then(res => res[0]);
        });
    }
    /**
     * @notice you should call "isAuthorized" to check a consumer's credentials before fetching / transferring the data !
     * -> this method only prepares the data and the key, no credentials check is performed
     * @param keyDataCipher retrieved cipher of the key used to decrypt the data, should be encrpted for the holder at this point
     * @param encryptedData the data to share
     * @param consumerPublicKey public key of the consumer, will be used to safely share the symmetric key
     * @returns an object containing
     *  - keyData the new key cipher, only readable by the consumer
     *  - data the data to be shared with the consumer
     */
    function prepareDataForConsumer(keyDataCipher, encryptedData, consumerPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const validPublicKey = consumerPublicKey.startsWith("0x") ? consumerPublicKey.slice(2) : consumerPublicKey;
            const [keyCipher, iv] = keyDataCipher.split(" ");
            const _cipher = eth_crypto_1.cipher.parse(keyCipher);
            const consumerCipher = yield (0, eth_crypto_1.decryptWithPrivateKey)(_wallet.privateKey, _cipher)
                .then(symmetricKey => (0, eth_crypto_1.encryptWithPublicKey)(validPublicKey, symmetricKey))
                .then(c => `${eth_crypto_1.cipher.stringify(c)} ${iv}`);
            return { keyData: consumerCipher, data: encryptedData };
        });
    }
    function decryptData(keyData, encrypedData) {
        return __awaiter(this, void 0, void 0, function* () {
            const [keyCipher, iv] = keyData.split(" ");
            const _cipher = eth_crypto_1.cipher.parse(keyCipher);
            return (0, eth_crypto_1.decryptWithPrivateKey)(_wallet.privateKey, _cipher)
                .then(symmetricKey => (0, encryption_1.decryptWithAes)(encrypedData, Buffer.from(symmetricKey, "hex"), Buffer.from(iv, "hex")));
        });
    }
    return { onboardFeeder, prepareDataForStorage, isAuthorized, prepareDataForConsumer, decryptData };
}
exports.withWallet = withWallet;
function fromPrivateKey(privateKey) {
    return withWallet(new ethers_1.Wallet(privateKey, new ethers_1.providers.JsonRpcProvider(constants_1.default.RPC_ENDPOINT, constants_1.default.CHAIN_ID)));
}
exports.fromPrivateKey = fromPrivateKey;
