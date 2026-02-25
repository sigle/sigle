(define-public (publish-post (url (string-ascii 210)))
  (print {
    a: "publish-post",
    author: tx-sender,
    url: url,
  })
  (ok true))

  ;; TODO add a function so that admin can disable the registry
