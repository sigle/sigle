import type { Payload } from '@hirosystems/chainhook-client';
import { env } from '~/env';
import { indexerMintJob } from '~/jobs/indexer/mint';
import { indexerMintEnabledJob } from '~/jobs/indexer/mint-enabled';
import { indexerNewPostJob } from '~/jobs/indexer/new-post';
import { indexerReduceSupplyJob } from '~/jobs/indexer/reduce-supply';
import { indexerSetProfileJob } from '~/jobs/indexer/set-profile';
import { consola } from '~/lib/consola';

export default defineEventHandler(async (event) => {
  const chainhook = await readBody<Payload>(event);
  const authorization = event.headers.get('authorization');
  const authorizationToken = authorization?.replace('Bearer ', '');
  if (authorizationToken !== env.CHAINHOOK_API_TOKEN) {
    return createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  if (chainhook.chainhook.predicate.scope === 'contract_deployment') {
    // TODO handle rollback

    for (const block of chainhook.apply) {
      for (const transaction of block.transactions) {
        if (
          'receipt' in transaction.metadata &&
          transaction.metadata.kind.type === 'ContractDeployment'
        ) {
          const logEvents = transaction.metadata.receipt.events
            .filter((event) => event.type === 'SmartContractEvent')
            .sort((a, b) => (a.position.index > b.position.index ? 1 : -1));
          const deployLogEvent = logEvents[0];
          const setMintDetailsLogEvent = logEvents[1];

          // This condition can be removed once we can add predicates for contract_deployment matching a trait implementation
          const isSiglePost =
            deployLogEvent &&
            setMintDetailsLogEvent &&
            deployLogEvent.data.topic === 'print' &&
            (deployLogEvent.data as any).value.a === 'deploy';

          // TODO setup and verify log payload
          // TODO extra security: check that the contract is following the template exported by the SDK (AST?)

          if (isSiglePost) {
            const txId = transaction.transaction_identifier.hash;
            await indexerNewPostJob.emit({
              isStreamingBlocks: chainhook.chainhook.is_streaming_blocks,
              address: transaction.metadata.kind.data.contract_identifier,
              txId,
              blockHeight: block.block_identifier.index,
              version: 1,
              contract: transaction.metadata.kind.data.code,
              price: (setMintDetailsLogEvent.data as any).value.price,
              sender: transaction.metadata.sender,
              createdAt: new Date(block.metadata.block_time * 1000),
            });
          }
        }
      }
    }
  } else if (chainhook.chainhook.predicate.scope === 'print_event') {
    // TODO handle rollback

    const contractAddress = chainhook.chainhook.predicate.contract_identifier;
    for (const block of chainhook.apply) {
      for (const transaction of block.transactions) {
        if ('receipt' in transaction.metadata) {
          const events = transaction.metadata.receipt.events
            // This is separate step to narrow down the type of event for typescript
            .filter((event) => event.type === 'SmartContractEvent')
            // Get all the events that are coming from the contract we watch in this chainhook
            .filter(
              (event) =>
                event.data.contract_identifier === contractAddress &&
                event.data.topic === 'print',
            );
          for (const event of events) {
            const value:
              | { a: 'mint'; contract: string; quantity: number }
              | {
                  a: 'set-mint-details';
                  contract: string;
                  price: number;
                  'start-block': number;
                  'end-block': number;
                }
              | { a: 'mint-enabled'; enabled: boolean }
              | { a: 'reduce-supply'; 'max-supply': number }
              | { a: 'set-profile'; address: string; uri: string } =
              // @ts-expect-error the types are not correct for value here
              event.data.value;
            switch (value.a) {
              case 'mint':
                await indexerMintJob.emit({
                  address: value.contract,
                  quantity: value.quantity,
                  nftMintEvents: transaction.metadata.receipt.events
                    .filter((event) => event.type === 'NFTMintEvent')
                    .map((event) => ({
                      ...event.data,
                      // Type is string, but actual value is a number
                      // We cast it to a string to match the type
                      asset_identifier: String(event.data.asset_identifier),
                    })),
                  sender: transaction.metadata.sender,
                  timestamp: new Date(block.metadata.block_time * 1000),
                });
                break;
              case 'set-mint-details':
                // We ignore this event for now, it's already handled in contract creation
                break;
              case 'mint-enabled':
                await indexerMintEnabledJob.emit({
                  address: contractAddress,
                  enabled: value.enabled,
                });
                break;
              case 'reduce-supply':
                await indexerReduceSupplyJob.emit({
                  address: contractAddress,
                  maxSupply: value['max-supply'],
                });
                break;
              case 'set-profile':
                await indexerSetProfileJob.emit({
                  address: value.address,
                  uri: value.uri,
                });
                break;
              default:
                consola.error('Unknown event', event);
                throw new Error('Unknown event');
            }
          }
        }
      }
    }
  } else {
    throw new Error('Unknown chainhook scope');
  }

  return {
    success: true,
  };
});
