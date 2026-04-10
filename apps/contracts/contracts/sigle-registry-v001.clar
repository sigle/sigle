(define-public (publish-post (metatadata-uri (string-ascii 210)))
  (begin
    (print {
      a: "publish-post",
      author: tx-sender,
      uri: metatadata-uri,
    })
    (ok true)
  )
)
