(define-constant ERR-NOT-AUTHORIZED u403)
(define-data-var contract-owner principal)
(define-data-var payout-address principal)
(define-read-only (get-contract-owner)
  (var-get contract-owner)
)

(define-read-only (get-payout-address)
  (var-get payout-address)
)

(define-public (set-contract-owner
    (address principal)
  )
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (print {
      a: "set-contract-owner",
      address: address,
    })
    (ok (var-set contract-owner address))
  )
)

(define-public (set-payout-address
    (address principal)
  )
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (print {
      a: "set-payout-address",
      address: address,
    })
    (ok (var-set payout-address address))
  )
)
