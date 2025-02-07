import { writeFileSync } from 'node:fs';
import { sigleClient } from './lib/sigle.js';

const main = async () => {
  const { contract } = sigleClient.generatePostContract({
    collectInfo: {
      amount: 0,
      maxSupply: 100,
    },
    metadata: 'TODO',
  });

  writeFileSync(
    './src/__generated__/contract-free-limited.clar',
    contract,
    'utf8',
  );
};

main();
