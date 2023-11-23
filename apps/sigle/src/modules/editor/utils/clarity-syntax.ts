import { LanguageFn, Mode } from 'highlight.js';

const MAIN_KEYWORDS = [
  'or',
  'and',
  'xor',
  'not',
  'begin',
  'let',
  'if',
  'ok',
  'err',
  'unwrap!',
  'unwrap-err!',
  'unwrap-panic',
  'unwrap-err-panic',
  'match',
  'try!',
  'asserts!',
  'map-get?',
  'var-get',
  'get',
  'define-public',
  'define-private',
  'define-constant',
  'define-map',
  'define-data-var',
  'define-fungible-token',
  'define-non-fungible-token',
  'define-read-only',
  'is-none',
];

const WRITE_KEYWORDS = [
  'var-set',
  'map-set',
  'map-delete',
  'map-insert',
  'ft-transfer?',
  'nft-transfer?',
  'nft-mint?',
  'ft-mint?',
  'nft-get-owner?',
  'ft-get-balance?',
  'contract-call',
];

const COMP_KEYWORDS = ['is-eq', 'is-some', 'is-none', 'is-ok', 'is-err'];

const TYPES_FUNC_KEYWORDS = [
  'list',
  'map',
  'filter',
  'fold',
  'len',
  'concat',
  'append',
  'as-max-len?',
  'to-int',
  'to-uint',
  'hash160',
  'sha256',
  'sha512',
  'sha512/256',
  'keccak256',
];

const CLARITY_KEYWORDS = [
  'as-contract',
  'contract-caller',
  'tx-sender',
  'block-height',
  'at-block',
  'get-block-info',
];

const TYPES_KEYWORDS = [
  'tuple',
  'list',
  'response',
  'optional',
  'buff',
  'string-ascii',
  'string-utf8',
  'principal',
  'bool',
  'int',
  'uint',
];

export const clarity: LanguageFn = (hljs) => {
  const COMMENT: Mode = hljs.COMMENT(';;', '$', { relevance: 0 });

  const NUMBER: Mode = {
    scope: 'number',
    begin: ' [-]?u?\\d+',
  };

  const BOOLEAN: Mode = {
    scope: 'literal',
    begin: '( |\\()(some|none|true|false)',
  };

  const TYPES: Mode = {
    scope: 'symbol',
    begin: `\\b(${TYPES_KEYWORDS.join('|')})`,
  };

  const STRING: Mode = {
    scope: 'string',
    variants: [
      { begin: /"(?:[^"\\]|\\.)*"/ },
      { begin: /u"(?:[^"\\]|\\.)*"/ },
      { begin: /0x[0-9a-fA-F]*/ },
    ],
  };

  const TUPLE: Mode = {
    className: 'variable',
    begin: '[a-zA-Z0-9_\\-$?!]*:',
  };

  const KEYWORDS = [
    ...MAIN_KEYWORDS,
    ...COMP_KEYWORDS,
    ...WRITE_KEYWORDS,
    ...TYPES_FUNC_KEYWORDS,
    ...CLARITY_KEYWORDS,
  ];

  return {
    name: 'Clarity',
    keywords: {
      $pattern: '[a-zA-Z][a-zA-Z0-9-_$?!]*',
      keyword: KEYWORDS,
    },

    contains: [COMMENT, STRING, NUMBER, BOOLEAN, TYPES, TUPLE],
  };
};
