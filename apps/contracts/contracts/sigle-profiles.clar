(define-constant ERR-NOT-AUTHORIZED u403)
(define-constant ERR-INVALID-URI u1000)

(define-map profiles principal (string-ascii 210))

;; @desc Read profile URI for a given address
(define-read-only (get-profile (address principal))
  (ok (map-get? profiles address))
)

;; @desc Set or update profile URI
;; @param uri - URI of the profile
(define-public (set-profile (uri (string-ascii 256)))
  (begin
    (print { a: "set-profile", address: tx-sender, uri: uri })
    (ok (map-set profiles tx-sender uri))
  )
)
