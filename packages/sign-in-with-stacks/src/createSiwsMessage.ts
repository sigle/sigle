import {
  SiwsInvalidMessageFieldError,
  type SiwsInvalidMessageFieldErrorType,
} from './errors/siws.js';
import type { SiwsMessage } from './types.js';
import { getAddress, isUri } from './utils.js';
import type { InvalidAddressErrorType } from './errors/address.js';

export type CreateSiwsMessageParameters = SiwsMessage;

export type CreateSiwsMessageReturnType = string;

export type CreateSiwsMessageErrorType =
  | InvalidAddressErrorType
  | SiwsInvalidMessageFieldErrorType;

/**
 * @description Creates SIP-X formatted message.
 *
 * @example
 * const message = createMessage({
 *   address: 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173',
 *   chainId: 1,
 *   domain: 'example.com',
 *   nonce: 'foobarbaz',
 *   uri: 'https://example.com/path',
 *   version: '1',
 * })
 *
 * @see https://github.com/stacksgov/sips/pull/70
 */
export function createSiwsMessage(
  parameters: CreateSiwsMessageParameters,
): CreateSiwsMessageReturnType {
  const {
    chainId,
    domain,
    expirationTime,
    issuedAt = new Date(),
    nonce,
    notBefore,
    requestId,
    resources,
    scheme,
    uri,
    version,
  } = parameters;

  // Validate fields
  {
    // Required fields
    if (chainId !== Math.floor(chainId))
      throw new SiwsInvalidMessageFieldError({
        field: 'chainId',
        metaMessages: [
          '- Chain ID must be a SIP-005 chain ID.',
          '- See https://github.com/stacksgov/sips/blob/main/sips/sip-005/sip-005-blocks-and-transactions.md',
          '',
          `Provided value: ${chainId}`,
        ],
      });
    if (
      !(
        domainRegex.test(domain) ||
        ipRegex.test(domain) ||
        localhostRegex.test(domain)
      )
    )
      throw new SiwsInvalidMessageFieldError({
        field: 'domain',
        metaMessages: [
          '- Domain must be an RFC 3986 authority.',
          '- See https://www.rfc-editor.org/rfc/rfc3986',
          '',
          `Provided value: ${domain}`,
        ],
      });
    if (!nonceRegex.test(nonce))
      throw new SiwsInvalidMessageFieldError({
        field: 'nonce',
        metaMessages: [
          '- Nonce must be at least 8 characters.',
          '- Nonce must be alphanumeric.',
          '',
          `Provided value: ${nonce}`,
        ],
      });
    if (!isUri(uri))
      throw new SiwsInvalidMessageFieldError({
        field: 'uri',
        metaMessages: [
          '- URI must be a RFC 3986 URI referring to the resource that is the subject of the signing.',
          '- See https://www.rfc-editor.org/rfc/rfc3986',
          '',
          `Provided value: ${uri}`,
        ],
      });
    if (version !== '1')
      throw new SiwsInvalidMessageFieldError({
        field: 'version',
        metaMessages: [
          "- Version must be '1'.",
          '',
          `Provided value: ${version}`,
        ],
      });

    // Optional fields
    if (scheme && !schemeRegex.test(scheme))
      throw new SiwsInvalidMessageFieldError({
        field: 'scheme',
        metaMessages: [
          '- Scheme must be an RFC 3986 URI scheme.',
          '- See https://www.rfc-editor.org/rfc/rfc3986#section-3.1',
          '',
          `Provided value: ${scheme}`,
        ],
      });
    const statement = parameters.statement;
    if (statement?.includes('\n'))
      throw new SiwsInvalidMessageFieldError({
        field: 'statement',
        metaMessages: [
          "- Statement must not include '\\n'.",
          '',
          `Provided value: ${statement}`,
        ],
      });
  }

  // Construct message
  const address = getAddress(parameters.address);
  const origin = (() => {
    if (scheme) return `${scheme}://${domain}`;
    return domain;
  })();
  const statement = (() => {
    if (!parameters.statement) return '';
    return `${parameters.statement}\n`;
  })();
  const prefix = `${origin} wants you to sign in with your Stacks account:\n${address}\n\n${statement}`;

  let suffix = `URI: ${uri}\nVersion: ${version}\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${issuedAt.toISOString()}`;

  if (expirationTime)
    suffix += `\nExpiration Time: ${expirationTime.toISOString()}`;
  if (notBefore) suffix += `\nNot Before: ${notBefore.toISOString()}`;
  if (requestId) suffix += `\nRequest ID: ${requestId}`;
  if (resources) {
    let content = '\nResources:';
    for (const resource of resources) {
      if (!isUri(resource))
        throw new SiwsInvalidMessageFieldError({
          field: 'resources',
          metaMessages: [
            '- Every resource must be a RFC 3986 URI.',
            '- See https://www.rfc-editor.org/rfc/rfc3986',
            '',
            `Provided value: ${resource}`,
          ],
        });
      content += `\n- ${resource}`;
    }
    suffix += content;
  }

  return `${prefix}\n${suffix}`;
}

const domainRegex =
  /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:[0-9]{1,5})?$/;
const ipRegex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(:[0-9]{1,5})?$/;
const localhostRegex = /^localhost(:[0-9]{1,5})?$/;
const nonceRegex = /^[a-zA-Z0-9]{8,}$/;
const schemeRegex = /^([a-zA-Z][a-zA-Z0-9+-.]*)$/;
