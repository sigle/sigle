(use-trait sigle-post-trait .sigle-post-trait-v001.sigle-post-trait)

(define-constant ERR-NOT-AUTHORIZED u403)
(define-constant ERR-INVALID-MINT-DATA u1000)
(define-constant ERR-INVALID-QUANTITY u1001)
(define-constant ERR-INVALID-END-BLOCK u1002)
(define-constant ERR-SALE-NOT-STARTED u1003)
(define-constant ERR-SALE-ENDED u1004)

;; Single fee structure for all mints
(define-data-var fixed-fee-structure {
    protocol: uint,
    creator: uint,
    mintReferrer: uint
} {
    protocol: u1050,
    creator: u1500,
    mintReferrer: u450
})

(define-map contract-mint-config principal {
    ;; Price in satoshis
    price: uint,
    ;; Block height at which the sale starts
    start-block: uint,
    ;; Block height at which the sale ends
    end-block: uint,
})

;; @desc Initialize contract mint configuration when a new post is created
(define-public (init-mint-details (price uint) (start-block uint) (end-block uint))
  (begin
    (asserts! (is-none (map-get? contract-mint-config tx-sender)) (err ERR-NOT-AUTHORIZED))
    (asserts! (> end-block start-block) (err ERR-INVALID-END-BLOCK))

    (print { a: "init-mint-details", contract: tx-sender, price: price, start-block: start-block, end-block: end-block })
    (ok (map-set contract-mint-config
      tx-sender
      {
        price: price,
        start-block: start-block,
        end-block: end-block,
      })
    )
  )
)

;; @desc Update mint details for a post
(define-public (set-mint-details (token-contract <sigle-post-trait>) (price uint) (start-block uint) (end-block uint))
  (let (
    (mint-config (unwrap! (map-get? contract-mint-config (contract-of token-contract)) (err ERR-INVALID-MINT-DATA)))
    (contract-owner (try! (contract-call? token-contract get-contract-owner)))
  )
    (asserts! (is-eq tx-sender contract-owner) (err ERR-NOT-AUTHORIZED))
    (asserts! (> end-block start-block) (err ERR-INVALID-END-BLOCK))
    (asserts! (<= burn-block-height (get end-block mint-config)) (err ERR-SALE-ENDED))

    (print { a: "set-mint-details", contract: (contract-of token-contract), price: price, start-block: start-block, end-block: end-block })
    (ok (map-set contract-mint-config
      (contract-of token-contract)
      {
        price: price,
        start-block: start-block,
        end-block: end-block,
      }
    ))
  )
)

(define-public (mint (token-contract <sigle-post-trait>) (quantity uint) (mintReferrer (optional principal)) (recipient (optional principal)))
  (let (
    (protocol-address (contract-call? .sigle-protocol get-payout-address))
    (mint-config (unwrap! (map-get? contract-mint-config (contract-of token-contract)) (err ERR-INVALID-MINT-DATA)))
    (mint-recipient (default-to tx-sender recipient))
    (fees (var-get fixed-fee-structure))
    (protocol-fee (* (get protocol fees) quantity))
    (creator-fee (* (get creator fees) quantity))
    (referrer-fee (* (get mintReferrer fees) quantity))
    (price-amount (* (get price mint-config) quantity))
    (creator-address (try! (contract-call? token-contract get-contract-owner)))
    (referrer-address (default-to protocol-address mintReferrer))
  )
    (asserts! (>= burn-block-height (get start-block mint-config)) (err ERR-SALE-NOT-STARTED))
    (asserts! (<= burn-block-height (get end-block mint-config)) (err ERR-SALE-ENDED))
    (asserts! (<= quantity u10) (err ERR-INVALID-QUANTITY))

    (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer protocol-fee tx-sender protocol-address none))
    (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer (+ creator-fee price-amount) tx-sender creator-address none))
    (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token transfer referrer-fee tx-sender referrer-address none))

    (try! (if (<= u1 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u2 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u3 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u4 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u5 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u6 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u7 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u8 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u9 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u10 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))

    (print { a: "mint", contract: token-contract, quantity: quantity, mintReferrer: mintReferrer, recipient: mint-recipient })
    (ok true)
  )
)

;; @desc Allows the contract owner to mint for free
(define-public (owner-mint (token-contract <sigle-post-trait>) (quantity uint) (recipient (optional principal)))
  (let (
    (mint-config (unwrap! (map-get? contract-mint-config (contract-of token-contract)) (err ERR-INVALID-MINT-DATA)))
    (mint-recipient (default-to tx-sender recipient))
    (contract-owner (try! (contract-call? token-contract get-contract-owner)))
  )
    (asserts! (is-eq tx-sender contract-owner) (err ERR-NOT-AUTHORIZED))
    (asserts! (<= quantity u10) (err ERR-INVALID-QUANTITY))

    (try! (if (<= u1 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u2 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u3 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u4 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u5 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u6 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u7 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u8 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u9 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))
    (try! (if (<= u10 quantity) (as-contract (contract-call? token-contract mint mint-recipient)) (ok u0)))

    (print { a: "owner-mint", contract: token-contract, quantity: quantity, recipient: mint-recipient })
    (ok true)
  )
)

(define-public (update-fees (protocol uint) (creator uint) (mintReferrer uint))
    (let (
        (protocol-owner (contract-call? .sigle-protocol get-contract-owner))
    )
        (asserts! (is-eq tx-sender protocol-owner) (err ERR-NOT-AUTHORIZED))
        (var-set fixed-fee-structure {
            protocol: protocol,
            creator: creator,
            mintReferrer: mintReferrer
        })
        (print { a: "update-fees", protocol: protocol, creator: creator, mintReferrer: mintReferrer })
        (ok true)
    )
)

(define-read-only (get-contract-config (token-contract principal))
    (map-get? contract-mint-config token-contract)
)
