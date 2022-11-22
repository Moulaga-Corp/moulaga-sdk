import { LitNodeClient } from "@lit-protocol/sdk-nodejs";
import { Wallet, providers, utils } from "ethers";
import { generateNonce } from "siwe";
import { authSigFactory, AuthSigType } from "./authSig";
import MOULAGA_CONSTANTS from "./constants";
import { ResourceIdType } from "./resourceId";

interface MoulagaSdkConfig {
  holderPrivateKey: string;
}

class MoulagaSdk {
  get holderWalletAddress(): string { return this._holderWallet.address; }

  private constructor(
    private readonly _litClient: typeof LitNodeClient,
    private _holderWallet: Wallet
  ) {}

  async savePolicyForResource(policy: any, resourceId: ResourceIdType, permanent: boolean = false): Promise<void> {
    const authSig = await this.generateAuthSigForHolder();
    await this._litClient.saveSigningCondition({
      unifiedAccessControlConditions: policy,
      authSig,
      chain: MOULAGA_CONSTANTS.CHAIN,
      resourceId,
      permanent,
    })
  }

  async grantJWTForResource(message: string, signedMessage: string, policy: any, resourceId: ResourceIdType): Promise<string> {
    const authSig = authSigFactory(message, signedMessage);
    return this._litClient.getSignedToken({
      unifiedAccessControlConditions: policy,
      chain: MOULAGA_CONSTANTS.CHAIN,
      authSig,
      resourceId,
    });
  }

  async verifyJWT(
    jwt: string, 
    requiredBaseUrl: string, 
    requiredPath: string, 
    requiredOrgId: string = "",
    requiredRole: string = MOULAGA_CONSTANTS.CONSUMER_ROLE,
    requiredExtraData: string = "",
  ): Promise<boolean> {
    const { verified, payload } = await this._litClient.verifyJWT(jwt);
    if (!verified) {
      return false;
    }

    return payload.baseUrl === requiredBaseUrl
      && payload.path === requiredPath
      && payload.orgId === requiredOrgId
      && payload.role === requiredRole
      && payload.extraData === requiredExtraData;
  }

  private async generateAuthSigForHolder(): Promise<AuthSigType> {
    const nonce = generateNonce();
    const sig = await this._holderWallet.signMessage(nonce);
    return authSigFactory(nonce, sig);
  }

  private async connect(): Promise<void> {
    await this._litClient.connect();
  }

  static async init({ holderPrivateKey }: MoulagaSdkConfig): Promise<MoulagaSdk> {
    const holderWallet = new Wallet(
      holderPrivateKey, 
      new providers.JsonRpcProvider(
        MOULAGA_CONSTANTS.RPC_ENDPOINT, 
        MOULAGA_CONSTANTS.CHAIN_ID
      )
    );
    const litClient = LitNodeClient({ 
      alertWhenUnauthorized: false, 
      litNetwork: process.env.NODE_ENV === "production" ? "jalapeno" : "serrano"
    });

    const sdk = new MoulagaSdk(litClient, holderWallet);
    await sdk.connect();
    return sdk;
  }
}

export default MoulagaSdk;