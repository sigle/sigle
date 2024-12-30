(use-trait sigle-publication-trait .sigle-publication-trait-v001.sigle-publication-trait)

(define-constant ERR-NOT-AUTHORIZED u403)
(define-constant ERR-INVALID-MINT-DATA u1000)
(define-constant ERR-INVALID-QUANTITY u1001)
(define-constant ERR-SALE-NOT-STARTED u1002)
(define-constant ERR-SALE-ENDED u1003)

;; Separate fee structures for free and paid mints
(define-data-var paid-fee-structure {
    protocol: uint,
    creator: uint,
    mintReferrer: uint
} {
    protocol: u550000,
    creator: u300000,
    mintReferrer: u150000
})

(define-data-var free-fee-structure {
    protocol: uint,
    creator: uint,
    mintReferrer: uint
} {
    protocol: u350000,
    creator: u500000,
    mintReferrer: u150000
})

(define-map contract-mint-config principal {
    ;; Price in uSTX
    price: uint,
    ;; Block height at which the sale starts
    start-block: uint,
    ;; Block height at which the sale ends
    end-block: uint,
})

;; Initialize contract mint configuration
(define-public (set-mint-details (price uint) (start-block uint) (end-block uint))
  (begin
    ;; TODO only allow to set once?
    (print { a: "set-mint-details", contract: tx-sender, price: price, start-block: start-block, end-block: end-block })
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

(define-public (mint (token-contract <sigle-publication-trait>) (quantity uint) (mintReferrer (optional principal)) (recipient (optional principal)))
  (let (
    (protocol-address (contract-call? .sigle-protocol get-payout-address))
    (mint-config (unwrap! (map-get? contract-mint-config (contract-of token-contract)) (err ERR-INVALID-MINT-DATA)))
    (mint-recipient (default-to tx-sender recipient))
    ;; Choose fee structure based on whether it's a paid mint
    (fees (if (> (get price mint-config) u0)
            (var-get paid-fee-structure)
            (var-get free-fee-structure)))
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

    (try! (stx-transfer? protocol-fee tx-sender protocol-address))
    (try! (stx-transfer? (+ creator-fee price-amount) tx-sender creator-address))
    (try! (stx-transfer? referrer-fee tx-sender referrer-address))

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

(define-public (update-paid-fees (protocol uint) (creator uint) (mintReferrer uint))
    (let (
        (protocol-owner (contract-call? .sigle-protocol get-contract-owner))
    )
        (asserts! (is-eq tx-sender protocol-owner) (err ERR-NOT-AUTHORIZED))
        (var-set paid-fee-structure {
            protocol: protocol,
            creator: creator,
            mintReferrer: mintReferrer
        })
        (print { a: "update-paid-fees", protocol: protocol, creator: creator, mintReferrer: mintReferrer })
        (ok true)
    )
)

(define-public (update-free-fees (protocol uint) (creator uint) (mintReferrer uint))
    (let (
        (protocol-owner (contract-call? .sigle-protocol get-contract-owner))
    )
        (asserts! (is-eq tx-sender protocol-owner) (err ERR-NOT-AUTHORIZED))
        (var-set free-fee-structure {
            protocol: protocol,
            creator: creator,
            mintReferrer: mintReferrer
        })
        (print { a: "update-free-fees", protocol: protocol, creator: creator, mintReferrer: mintReferrer })
        (ok true)
    )
)

(define-read-only (get-contract-config (token-contract principal))
    (map-get? contract-mint-config token-contract)
)
