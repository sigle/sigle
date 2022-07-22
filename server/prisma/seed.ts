/**
 * This file is used to seed the database in a dev environment.
 */
import { PrismaClient } from '@prisma/client';

const main = async () => {
  const prisma = new PrismaClient();

  const userResult = await prisma.user.createMany({
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
      {
        stacksAddress: 'SP779SC9CDWQVMTRXT0HZCEHSDBXCHNGG7BC1H9B',
      },
      {
        stacksAddress: 'SP1VCG4HXMG02BMJCSAZDBS1WR4N2YG3RPHMNP9WR',
      },
      {
        stacksAddress: 'SP19N6NE3EYCM96N0Y173Z2B61MCPNDT8PQEQY166',
      },
      {
        stacksAddress: 'SP13QC2G49PXXA84H083Y1PMFS2PGXM583HQ8TQ9F',
      },
    ],
  });

  console.log(`------ SEED DATABASE ------`);
  console.log(`Created ${userResult.count} users`);
};

main();
