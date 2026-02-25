(define-public (publish-post (url (string-ascii 210)))
  (begin
    (print {
      a: "publish-post",
      author: tx-sender,
      url: url,
    })
    (ok true)
  )
)
