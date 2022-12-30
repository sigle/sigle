// Production list
export const allowedNewsletterUsers = [
  // sigle.btc
  'SP2EVYKET55QH40RAZE5PVZ363QX0X6BSRP4C7H0W',
];
if (process.env.NODE_ENV === 'development') {
  // leopradel.btc
  allowedNewsletterUsers.push('SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q');
  // gregogun.btc
  allowedNewsletterUsers.push('SP1F48HCD4SP4HT8BHQPXZ35615764KC80ACNMBDZ');
}
