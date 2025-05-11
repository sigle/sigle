;; title: sigle-post-trait-v1
;; version: 1
;; website: https://sigle.io

(define-trait sigle-post-trait
  (
    (mint (principal) (response uint uint))
    (burn (uint) (response bool uint))

    (set-mint-enabled (bool) (response bool uint))
    (reduce-supply (uint) (response bool uint))
    (get-minter () (response principal uint))
    (get-version () (response uint uint))

    (get-contract-owner () (response principal uint))
    (transfer-ownership ((optional principal)) (response bool uint))
    (accept-ownership () (response bool uint))
  )
)
