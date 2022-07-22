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
      {
        stacksAddress: 'SP34S80102KYXHC0C5VC3GDPDVY3WFG1G5G507Y0K',
      },
      {
        stacksAddress: 'SP7TVCH45CQRVT0VBYTRDKZEAYRSYPM5XQJ3RYT0',
      },
      {
        stacksAddress: 'SP1WBV6EBK8X5EDVADE14NHMM6W8X0BHQ3G2B91JR',
      },
      {
        stacksAddress: 'SP1FD33S5AD9MW9C57BN1R4SWMG72M9667J6BZ2P7',
      },
      {
        stacksAddress: 'SP3D4H6VAD2EQ24WHT3C3YBM463ZMF8RX9ES06F0G',
      },
      {
        stacksAddress: 'SP3RW6BW9F5STYG2K8XS5EP5PM33E0DNQT4XEG864',
      },
      {
        stacksAddress: 'SP275Y1FKWMGMXGZFXA2N3HCNPGBS2ERTEDBVXV4P',
      },
      {
        stacksAddress: 'SPCMGSQF3ME39XN7W6RV4M21HFRHC2BGJH6S07V7',
      },
      {
        stacksAddress: 'SP3BRRCHKMPBR60V8ES9J5YF40VXWMABWXK4SEB9G',
      },
      {
        stacksAddress: 'SP2WCCY98GNV56THV3JMZ8WKA2Q44J3EHPXP1M0QP',
      },
      {
        stacksAddress: 'SP361JJRR1SV6CGTG5ECY6J3719Q5TZ5X7K28RRJW',
      },
      {
        stacksAddress: 'SP1YVF9EWSK6HM0JZR4B3KCM7V3NKVE18VVNFSQV5',
      },
      {
        stacksAddress: 'SP28RZ1QXMXJXVKRRCR3D7GR5D48XY0NNA9MZWHJB',
      },
      {
        stacksAddress: 'SP3GQWCKHYGWK0BW88PX7YDH28DY80DGZ5SKBN8SE',
      },
      {
        stacksAddress: 'SP3Y8N6MFWQ3WQ025AJK28RZZVKWYXK610HD57NH3',
      },
      {
        stacksAddress: 'SP1J004J4QR534VHDJ1M2AY5N0YDXV0CQVK506EZJ',
      },
      {
        stacksAddress: 'SP9MANP57C4QHVMNHR9HEAX6D5BAA4JN9KC8N4J8',
      },
      {
        stacksAddress: 'SP3QK75VP0Y64SAJNKTNH5WBBR798C8XAR8T4PJ6W',
      },
      {
        stacksAddress: 'SP38R1V356BBC5D1631Q9JMQWPCTEEYJZPKPXKH5W',
      },
      {
        stacksAddress: 'SP398XE371G08T84A99TCBD8XKWY3S7VVX6JKJWKY',
      },
    ],
  });

  console.log(`------ SEED DATABASE ------`);
  console.log(`Created ${userResult.count} users`);
};

main();
