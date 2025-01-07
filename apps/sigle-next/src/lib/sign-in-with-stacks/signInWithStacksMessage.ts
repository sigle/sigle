// siwe port of https://github.com/spruceid/siwe/blob/main/packages/siwe/lib/client.ts

import * as uri from 'valid-url';
import {
  createMessageSignature,
  publicKeyFromSignatureRsv,
  validateStacksAddress,
} from '@stacks/transactions';
import { hashMessage, verifyMessageSignatureRsv } from '@stacks/encryption';
import { ParsedMessage } from './parser';
import {
  SiweError,
  SiweErrorType,
  type SiweResponse,
  type VerifyParams,
  VerifyParamsKeys,
} from './types';

// https://github.com/stacksgov/sips/blob/22f964ca9beddf9fd750d466b4a20568435f3911/sips/sip-x%20sign-in-with-stacks/sip-x-sign-in-with-stacks.md

type StacksMessageParams = Pick<
  SignInWithStacksMessage,
  | 'domain'
  | 'address'
  | 'statement'
  | 'uri'
  | 'version'
  | 'chainId'
  | 'nonce'
  | 'issuedAt'
  | 'expirationTime'
  | 'notBefore'
  | 'requestId'
  | 'resources'
>;

export class SignInWithStacksMessage {
  /**
   * Application's domain name.
   * Max 80 chars.
   */
  domain: string;
  /**
   * The address of the signer.
   */
  address: string;
  /**
   * Describes the terms and conditions the user agrees to by using the application.
   * Max 80 chars.
   */
  statement?: string;
  /**
   * An RFC 3986 URI referring to the resource that is the subject of the signing (as in the subject of a claim).
   */
  uri: string;
  /**
   * Is the current version of the message, which MUST be X for this specification.
   */
  version: string;
  /**
   * The chain ID to which the session is bound. This must correspond to the version of the address.
   */
  chainId?: number;
  /**
   * Randomized token used to prevent replay attacks, at least 8 alphanumeric characters.
   */
  nonce: string;
  /**
   * The ISO 8601 datetime string of the current time.
   */
  issuedAt?: string;
  /**
   * The ISO 8601 datetime string that, if present, indicates when the signed authentication message is no longer valid.
   */
  expirationTime?: string;
  /**
   * The ISO 8601 datetime string that, if present, indicates when the signed authentication message will become valid.
   */
  notBefore?: string;
  /**
   * A system-specific identifier that may be used to uniquely refer to the sign-in request.
   */
  requestId?: string;
  /**
   * A list of information or references to information the user wishes to have resolved as part of authentication by the relying party.
   * They are expressed as RFC 3986 URIs.
   */
  resources?: string[];

  /**
   * Creates a parsed Sign-In with Stacks Message (SIP-XXX) object from a
   * string or an object. If a string is used an ABNF parser is called to
   * validate the parameter, otherwise the fields are attributed.
   * @param param {string | SignInWithStacksMessage} Sign message as a string or an object.
   */
  constructor(param: string | StacksMessageParams) {
    if (typeof param === 'string') {
      param = new ParsedMessage(param);
    }
    this.domain = param.domain;
    this.address = param.address;
    this.statement = param.statement;
    this.uri = param.uri;
    this.version = param.version;
    this.nonce = param.nonce;
    this.issuedAt = param.issuedAt;
    this.expirationTime = param.expirationTime;
    this.notBefore = param.notBefore;
    this.requestId = param.requestId;
    this.chainId = param.chainId;
    this.resources = param.resources;
    if (typeof this.chainId === 'string') {
      this.chainId = Number.parseInt(this.chainId);
    }
    this.validateMessage();
  }

  /**
   * This function can be used to retrieve an EIP-4361 formated message for
   * signature, although you can call it directly it's advised to use
   * [prepareMessage()] instead which will resolve to the correct method based
   * on the [type] attribute of this object, in case of other formats being
   * implemented.
   * @returns {string} EIP-4361 formated message, ready for EIP-191 signing.
   */
  toMessage(): string {
    /** Validates all fields of the object */
    this.validateMessage();

    const header = `${this.domain} wants you to sign in with your Stacks account:`;
    const uriField = `URI: ${this.uri}`;
    let prefix = [header, this.address].join('\n');
    const versionField = `Version: ${this.version}`;

    const chainField = `Chain ID: ` + this.chainId || '1';

    const nonceField = `Nonce: ${this.nonce}`;

    const suffixArray = [uriField, versionField, chainField, nonceField];

    if (this.issuedAt) {
      Date.parse(this.issuedAt);
    }
    this.issuedAt = this.issuedAt ? this.issuedAt : new Date().toISOString();
    suffixArray.push(`Issued At: ${this.issuedAt}`);

    if (this.expirationTime) {
      const expiryField = `Expiration Time: ${this.expirationTime}`;

      suffixArray.push(expiryField);
    }

    if (this.notBefore) {
      suffixArray.push(`Not Before: ${this.notBefore}`);
    }

    if (this.requestId) {
      suffixArray.push(`Request ID: ${this.requestId}`);
    }

    if (this.resources) {
      suffixArray.push(
        [`Resources:`, ...this.resources.map((x) => `- ${x}`)].join('\n'),
      );
    }

    const suffix = suffixArray.join('\n');
    prefix = [prefix, this.statement].join('\n\n');
    if (this.statement) {
      prefix += '\n';
    }
    return [prefix, suffix].join('\n');
  }

  /**
   * This method parses all the fields in the object and creates a messaging for signing
   * message according with the type defined.
   * @returns {string} Returns a message ready to be signed according with the
   * type defined in the object.
   */
  prepareMessage(): string {
    let message: string;
    switch (this.version) {
      case '1': {
        message = this.toMessage();
        break;
      }

      default: {
        message = this.toMessage();
        break;
      }
    }
    return message;
  }

  /**
   * Verifies the integrity of the object by matching its signature.
   * @param params Parameters to verify the integrity of the message, signature is required.
   * @returns {Promise<SiweMessage>} This object if valid.
   */
  async verify(params: VerifyParams): Promise<SiweResponse> {
    return new Promise<SiweResponse>((resolve, reject) => {
      Object.keys(params).forEach((key: any) => {
        if (!VerifyParamsKeys.includes(key)) {
          reject({
            success: false,
            data: this,
            error: new Error(`${key} is not a valid key for VerifyParams.`),
          });
        }
      });

      const assert = (result: any) => {
        reject(result);
      };

      const { signature, domain, nonce, time } = params;

      /** Domain binding */
      if (domain && domain !== this.domain) {
        assert({
          success: false,
          data: this,
          error: new SiweError(
            SiweErrorType.DOMAIN_MISMATCH,
            domain,
            this.domain,
          ),
        });
      }

      /** Nonce binding */
      if (nonce && nonce !== this.nonce) {
        assert({
          success: false,
          data: this,
          error: new SiweError(SiweErrorType.NONCE_MISMATCH, nonce, this.nonce),
        });
      }

      /** Check time or now */
      const checkTime = new Date(time || new Date());

      /** Message not expired */
      if (this.expirationTime) {
        const expirationDate = new Date(this.expirationTime);
        if (checkTime.getTime() >= expirationDate.getTime()) {
          assert({
            success: false,
            data: this,
            error: new SiweError(
              SiweErrorType.EXPIRED_MESSAGE,
              `${checkTime.toISOString()} < ${expirationDate.toISOString()}`,
              `${checkTime.toISOString()} >= ${expirationDate.toISOString()}`,
            ),
          });
        }
      }

      /** Message is valid already */
      if (this.notBefore) {
        const notBefore = new Date(this.notBefore);
        if (checkTime.getTime() < notBefore.getTime()) {
          assert({
            success: false,
            data: this,
            error: new SiweError(
              SiweErrorType.NOT_YET_VALID_MESSAGE,
              `${checkTime.toISOString()} >= ${notBefore.toISOString()}`,
              `${checkTime.toISOString()} < ${notBefore.toISOString()}`,
            ),
          });
        }
      }
      let EIP4361Message: string;
      try {
        EIP4361Message = this.prepareMessage();
      } catch (e) {
        assert({
          success: false,
          data: this,
          error: e,
        });
        return;
      }

      const stacksSignature = createMessageSignature(signature);

      const hashedMessage = Buffer.from(hashMessage(EIP4361Message)).toString(
        'hex',
      );

      const publicKey = publicKeyFromSignatureRsv(
        hashedMessage,
        stacksSignature.data,
      );

      const isValid = verifyMessageSignatureRsv({
        signature,
        message: EIP4361Message,
        publicKey,
      });
      if (isValid) {
        resolve({
          success: true,
          data: this,
        });
        return;
      }

      /** Signature is not valid */
      assert({
        success: false,
        data: this,
        error: new SiweError(SiweErrorType.INVALID_SIGNATURE),
      });
    });
  }

  /**
   * Validates the values of this object fields.
   * @throws Throws an {ErrorType} if a field is invalid.
   */
  private validateMessage(...args: any) {
    /** Checks if the user might be using the function to verify instead of validate. */
    if (args.length > 0) {
      throw new SiweError(
        SiweErrorType.UNABLE_TO_PARSE,
        `Unexpected argument in the validateMessage function.`,
      );
    }

    /** `domain` check. */
    if (
      !this.domain ||
      this.domain.length === 0 ||
      !/[^#?]*/.test(this.domain)
    ) {
      throw new SiweError(
        SiweErrorType.INVALID_DOMAIN,
        `${this.domain} to be a valid domain.`,
      );
    }

    /** `address` check. */
    if (!validateStacksAddress(this.address)) {
      throw new SiweError(
        SiweErrorType.INVALID_ADDRESS,
        `${this.address} to be a valid address.`,
      );
    }

    /** Check if the URI is valid. */
    if (!uri.isUri(this.uri)) {
      throw new SiweError(
        SiweErrorType.INVALID_URI,
        `${this.uri} to be a valid uri.`,
      );
    }

    /** Check if the version is 1. */
    if (this.version !== '1') {
      throw new SiweError(
        SiweErrorType.INVALID_MESSAGE_VERSION,
        '1',
        this.version,
      );
    }

    /** Check if the nonce is alphanumeric and bigger then 8 characters */
    const nonce = this?.nonce?.match(/[a-zA-Z0-9]{8,}/);
    if (!nonce || this.nonce.length < 8 || nonce[0] !== this.nonce) {
      throw new SiweError(
        SiweErrorType.INVALID_NONCE,
        `Length > 8 (${nonce?.length}). Alphanumeric.`,
        this.nonce,
      );
    }

    const ISO8601 =
      /([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(([Zz])|([+|\-]([01][0-9]|2[0-3]):[0-5][0-9]))/;
    /** `issuedAt` conforms to ISO-8601 */
    if (this.issuedAt) {
      if (!ISO8601.test(this.issuedAt)) {
        throw new Error(SiweErrorType.INVALID_TIME_FORMAT);
      }
    }

    /** `expirationTime` conforms to ISO-8601 */
    if (this.expirationTime) {
      if (!ISO8601.test(this.expirationTime)) {
        throw new Error(SiweErrorType.INVALID_TIME_FORMAT);
      }
    }

    /** `notBefore` conforms to ISO-8601 */
    if (this.notBefore) {
      if (!ISO8601.test(this.notBefore)) {
        throw new Error(SiweErrorType.INVALID_TIME_FORMAT);
      }
    }
  }
}
