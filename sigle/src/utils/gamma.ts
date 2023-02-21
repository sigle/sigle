export const getNftMetadata = async (
  asset_identifier: string,
  token_id: string
) => {
  const nftMetadata = await fetch('https://gql.stxnft.com/', {
    method: 'POST',
    body: JSON.stringify({
      query:
        '\n    query fetchNftTokens($where: nft_tokens_bool_exp = {}) @cached(ttl: 120) {\n  nft_tokens(where: $where) {\n    asset_id\n    collection_contract_id\n    token_id\n    fully_qualified_token_id\n    token_metadata {\n      image_url\n      image_type\n      image_protocol\n      asset_url\n      asset_type\n      asset_protocol\n      asset_id\n      name\n      contract_id\n    }\n    nft_token_attributes {\n      value\n      trait_type\n    }\n    marketplace_list_events_active {\n      commission_trait\n      burn_block_time_iso\n      block_height\n      price_amount\n      price_currency\n      sender_address\n      tx_id\n      marketplace_contract\n      fees\n    }\n  }\n}\n    ',
      variables: {
        where: {
          token_id: {
            _eq: token_id,
          },
          //   asset_id: {
          //     _eq: 'The-Explorer-Guild',
          //   },
          collection_contract_id: {
            _eq: asset_identifier,
          },
        },
      },
    }),
  });
  const res = nftMetadata.json();
  return res;
};
