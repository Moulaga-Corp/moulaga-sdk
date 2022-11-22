import { LitNodeClient } from "@lit-protocol/sdk-nodejs";
import { Wallet, providers, utils } from "ethers";
import { generateNonce } from "siwe";
import MOULAGA_CONSTANTS from "./constants";

interface MoulagaSdkConfig {
  holderPrivateKey: string;
}

interface AuthSigType {
  sig: string;
  derivedVia: string;
  signedMessage: string;
  address: string;
}

interface ResourceIdType {
  baseUrl: string;
  path: string;
  orgId: string;
  role: string;
  extraData: string;
}

class MoulagaSdk {
  private constructor(
    private readonly _litClient: typeof LitNodeClient,
    private _holderWallet: Wallet
  ) {}

  generatePolicy(feederWallet: string): any {
    // LIT Access Condition
    // must be the feeder or the data holder
    // to pass the check
    return [
      {
        contractAddress: "",
        standardContractType: "",
        chain: MOULAGA_CONSTANTS.CHAIN,
        method: "",
        parameters: [
          ":userAddress",
        ],
        returnValueTest: {
          comparator: "=",
          value: feederWallet
        }
      },
      { operator: "or" },
      {
        contractAddress: "",
        standardContractType: "",
        chain: MOULAGA_CONSTANTS.CHAIN,
        method: "",
        parameters: [
          ":userAddress",
        ],
        returnValueTest: {
          comparator: "=",
          value: this._holderWallet.address
        }
      },
    ]
  }

  generateResourceId(
    baseUrl: string, 
    path: string, 
    orgId: string = "", 
    role: string = MOULAGA_CONSTANTS.CONSUMER_ROLE, 
    extraData: string = ""
  ): ResourceIdType {
    return {baseUrl, path, orgId, role, extraData} as const;
  }

  async savePolicy(policy: any, resourceId: ResourceIdType, permanent: boolean = false): Promise<void> {
    const authSig = await this.generateAuthSigForHolder();
    await this._litClient.saveSigningCondition({
      unifiedAccessControlConditions: policy,
      authSig,
      chain: MOULAGA_CONSTANTS.CHAIN,
      resourceId,
      permanent,
    })
  }

  async grantJWT(message: string, signedMessage: string, policy: any, resourceId: ResourceIdType): Promise<string> {
    const authSig = this.generateAuthSig(message, signedMessage);
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

  private generateAuthSig(message: string, signedMessage: string): AuthSigType {
    const callerWallet = utils.verifyMessage(message, signedMessage);
    return {
      sig: signedMessage,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: message,
      address: callerWallet
    } as const;
  }

  private async generateAuthSigForHolder(): Promise<AuthSigType> {
    const nonce = generateNonce();
    const sig = await this._holderWallet.signMessage(nonce);
    return this.generateAuthSig(nonce, sig);
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

    const sdk =  new MoulagaSdk(litClient, holderWallet);
    await sdk.connect();
    return sdk;
  }
}

export default MoulagaSdk;