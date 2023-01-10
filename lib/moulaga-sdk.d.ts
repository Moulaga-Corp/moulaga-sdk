import { Wallet } from "ethers";
interface MoulagaSdk {
    onboardFeeder: (feederAddress: string, feederPublicKey: string) => Promise<void>;
    prepareDataForStorage: (jsonData: string, feederAddress: string) => Promise<string>;
    isAuthorized: (feeder: string, consumer: string, scheme: string) => Promise<boolean>;
    prepareDataForConsumer: (keyDataCipher: string, encrypedData: string, consumerPublicKey: string) => Promise<{
        keyData: string;
        data: string;
    }>;
    decryptData: (keyDataCipher: string, encrypedData: string) => Promise<string>;
}
declare function withWallet(_wallet: Wallet): MoulagaSdk;
declare function fromPrivateKey(privateKey: string): MoulagaSdk;
export { withWallet, fromPrivateKey };
//# sourceMappingURL=moulaga-sdk.d.ts.map