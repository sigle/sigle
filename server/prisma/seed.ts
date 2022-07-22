/**
 * This file is used to seed the database in a dev environment.
 */
import { PrismaClient } from '@prisma/client';

const main = async () => {
  const prisma = new PrismaClient();

  await prisma.user.createMany({
    data: [
      {
        stacksAddress: 'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q',
      },
      {
        stacksAddress: 'SP24GYRG3M7T0S6FZE9RVVP9PNNZQJQ614650G590',
      },
      {
        stacksAddress: 'SP1Y6ZAD2ZZFKNWN58V8EA42R3VRWFJSGWFAD9C36',
      },
      {
        stacksAddress: 'SP21CYC2GKWTVK3FHFF4VVJNKVNQDMRY5GQS27XQB',
      },
      {
        stacksAddress: 'SPQE3J7XMMK0DN0BWJZHGE6B05VDYQRXRMDV734D',
      },
    ],
  });
};

main();
