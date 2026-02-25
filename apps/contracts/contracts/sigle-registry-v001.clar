(define-public (publish-post (url (string-ascii 210)))
  (print {
    a: "publish-post",
    author: tx-sender,
    url: url,
    timestamp: block-height
  })
  (ok true))
