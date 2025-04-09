(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)
(impl-trait .sigle-post-trait-v001.sigle-post-trait)

(define-non-fungible-token sigle-post uint)

(define-constant ERR-NOT-AUTHORIZED u403)
(define-constant ERR-NOT-FOUND u1000)
(define-constant ERR-LISTING u1001)
(define-constant ERR-WRONG-COMMISSION u1002)
(define-constant ERR-TREASURY-FEE u1003)
(define-constant ERR-TREASURY-OWNER u1004)
(define-constant ERR-INVALID-PERCENTAGE u1005)
(define-constant ERR-ALL-MINTED u1006)
(define-constant ERR-MINT-PAUSED u1007)
(define-constant ERR-INVALID-LIMIT u1008)
(define-constant ERR-METADATA-FROZEN u1009)

(define-constant contract-version u1)
(define-constant authorized-minter 'ST1JRRZ45G7E528BV1M3PR08093JFZGP1C4EZE4MC.sigle-minter-fixed-price-v001)

;; The post owner address
(define-data-var contract-owner principal tx-sender)
;; The base token uri
(define-data-var base-token-uri (string-ascii 210) "{__BASE_TOKEN_URI__}")
;; The pending owner used for the 2 steps owernership transfer
(define-data-var pending-contract-owner (optional principal) none)
;; The last minted token id
(define-data-var last-token-id uint u0)
;; The maximum number of tokens that can be minted
(define-data-var max-supply uint u0)
;; Define if the mint is enabled
(define-data-var mint-enabled bool true)
;; Define if the metadata is frozen
(define-data-var metadata-frozen bool false)

(begin
  (print { a: "publish-content", version: contract-version, minter: authorized-minter }))
  (unwrap-panic (as-contract (contract-call? .sigle-minter-fixed-price-v001 init-mint-details u0 u0 u1 none)))

;; @desc SIP-009 transfer token to a specified principal
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-sender-owner token-id) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-none (map-get? market token-id)) (err ERR-LISTING))
    (print { a: "transfer", token-id: token-id, sender: sender, recipient: recipient })
    (trnsfr token-id sender recipient)))

;; @desc SIP-009 get the identifier for the last NFT registered using the contract
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

;; @desc SIP-009 get the principal owning the NFT with the given identifier
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? sigle-post token-id)))

;; @desc SIP-009 returns a valid URI which resolves to the NFT's metadata
(define-read-only (get-token-uri (token-id uint))
    (ok (some (var-get base-token-uri))))

;; @desc burn an NFT
;; @param token-id the identifier of the NFT to burn
(define-public (burn (token-id uint))
  (begin
    (asserts! (is-sender-owner token-id) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-none (map-get? market token-id)) (err ERR-LISTING))
    (print { a: "burn", token-id: token-id })
    (nft-burn? sigle-post token-id tx-sender)))

;; @desc set the mint state to paused or unpaused
;; @param paused the new state of the mint
(define-public (set-mint-enabled (enabled bool))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (var-set mint-enabled enabled)
    (print { a: "mint-enabled", enabled: enabled })
    (ok true)))

;; @desc set the mint limit
;; the limit can only be decreased
;; @param new-limit the new limit of the mint
(define-public (reduce-supply (new-max-supply uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (asserts! (<= new-max-supply (var-get max-supply)) (err ERR-INVALID-LIMIT))
    (asserts! (>= new-max-supply (var-get last-token-id)) (err ERR-INVALID-LIMIT))
    (var-set max-supply new-max-supply)
    (print { a: "reduce-supply", max-supply: new-max-supply })
    (ok true)))

;; @desc Set a new base token URI
;; @param new-uri The new base token URI to set
(define-public (set-base-token-uri (new-uri (string-ascii 210)))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (asserts! (not (var-get metadata-frozen)) (err ERR-METADATA-FROZEN))
    (var-set base-token-uri new-uri)
    (print { a: "set-base-token-uri", uri: new-uri })
    (ok true)))

;; @desc Freeze the metadata URI permanently
(define-public (freeze-metadata)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (var-set metadata-frozen true)
    (print { a: "freeze-metadata", frozen: true })
    (ok true)))

;; @desc starts the ownership transfer of the contract to a new account
(define-public (transfer-ownership (new-owner (optional principal)))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (var-set pending-contract-owner new-owner)
    (print { a: "ownership-transfer-started", owner: new-owner })
    (ok true)))

;; @desc The new owner accepts the ownership transfer
(define-public (accept-ownership)
  (begin
    (asserts! (is-eq tx-sender (unwrap! (var-get pending-contract-owner) (err ERR-NOT-AUTHORIZED))) (err ERR-NOT-AUTHORIZED))
    (var-set contract-owner (unwrap! (var-get pending-contract-owner) (err ERR-NOT-AUTHORIZED)))
    (var-set pending-contract-owner none)
    (print { a: "ownership-transferred", owner: (var-get contract-owner) })
    (ok true)))

;; @desc Mint a new NFT to the specified principal
;; can only be called by the minter
(define-public (mint (recipient principal))
  (let ((next-token-id (+ u1 (var-get last-token-id)))
    (current-balance (get-balance recipient)))
  (asserts! (is-authorized-minter) (err ERR-NOT-AUTHORIZED))
  (asserts! (is-eq true (var-get mint-enabled)) (err ERR-MINT-PAUSED))
  (asserts! (<= next-token-id (var-get max-supply)) (err ERR-ALL-MINTED))
  (var-set last-token-id next-token-id)
  (map-set token-count recipient (+ current-balance u1))
  (try! (nft-mint? sigle-post next-token-id recipient))
  (ok next-token-id)))

;; @desc returns the max supply
(define-read-only (get-max-supply)
  (ok (var-get max-supply)))

;; @desc returns the address of the contract owner
(define-read-only (get-contract-owner)
  (ok (var-get contract-owner)))

;; @desc returns the address of the pending owner
(define-read-only (get-pending-owner)
  (ok (var-get pending-contract-owner)))

;; @desc returns the address of the authorized minter
(define-read-only (get-minter)
  (ok authorized-minter))

;; @desc returns the version of the contract
(define-read-only (get-version)
  (ok contract-version))

;; @desc Check if metadata is frozen
(define-read-only (get-metadata-frozen)
  (ok (var-get metadata-frozen)))

;; @desc checks if the sender is the owner of the given token
(define-private (is-sender-owner (id uint))
  (let ((owner (unwrap! (nft-get-owner? sigle-post id) false)))
    (or (is-eq tx-sender owner) (is-eq contract-caller owner))))

;; @desc Check if caller is authorized minter
(define-private (is-authorized-minter)
  (is-eq tx-sender authorized-minter))

;; ---------------------------------------------------------
;; SIP-011 non-custodial Marketplace
;; ---------------------------------------------------------

(use-trait commission-trait 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.commission-trait.commission)

(define-map token-count principal uint)
(define-map market uint {price: uint, commission: principal, royalty: uint})

(define-read-only (get-balance (account principal))
  (default-to u0
    (map-get? token-count account)))

(define-private (trnsfr (id uint) (sender principal) (recipient principal))
  (match (nft-transfer? sigle-post id sender recipient)
    success
      (let
        ((sender-balance (get-balance sender))
         (recipient-balance (get-balance recipient)))
        (map-set token-count
          sender
          (- sender-balance u1))
        (map-set token-count
          recipient
          (+ recipient-balance u1))
        (ok success))
    error (err error)))

(define-read-only (get-listing-in-ustx (id uint))
  (map-get? market id))

(define-public (list-in-ustx (id uint) (price uint) (comm-trait <commission-trait>))
  (let ((listing  {price: price, commission: (contract-of comm-trait), royalty: (var-get royalty-percent)}))
    (asserts! (is-sender-owner id) (err ERR-NOT-AUTHORIZED))
    (map-set market id listing)
    (print (merge listing {a: "list-in-ustx", id: id}))
    (ok true)))

(define-public (unlist-in-ustx (id uint))
  (begin
    (asserts! (is-sender-owner id) (err ERR-NOT-AUTHORIZED))
    (map-delete market id)
    (print {a: "unlist-in-ustx", id: id})
    (ok true)))

(define-public (buy-in-ustx (id uint) (comm-trait <commission-trait>))
  (let ((owner (unwrap! (nft-get-owner? sigle-post id) (err ERR-NOT-FOUND)))
        (listing (unwrap! (map-get? market id) (err ERR-LISTING)))
        (price (get price listing))
        (royalty (get royalty listing)))
    (asserts! (is-eq (contract-of comm-trait) (get commission listing)) (err ERR-WRONG-COMMISSION))
    (try! (stx-transfer? price tx-sender owner))
    (try! (pay-royalty price royalty))
    (try! (contract-call? comm-trait pay id price))
    (try! (trnsfr id owner tx-sender))
    (map-delete market id)
    (print {a: "buy-in-ustx", id: id})
    (ok true)))

(define-data-var royalty-percent uint u1000)

(define-read-only (get-royalty-percent)
  (ok (var-get royalty-percent)))

(define-public (set-royalty-percent (royalty uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err ERR-NOT-AUTHORIZED))
    (asserts! (and (>= royalty u0) (<= royalty u1000)) (err ERR-INVALID-PERCENTAGE))
    (print {a: "set-royalty-percent", royalty: royalty})
    (ok (var-set royalty-percent royalty))))

(define-private (pay-royalty (price uint) (royalty uint))
  (let ((royalty-amount (/ (* price royalty) u10000)))
   (if (and (> royalty-amount u0) (not (is-eq tx-sender (var-get contract-owner))))
     (try! (stx-transfer? royalty-amount tx-sender (var-get contract-owner)))
     (print false))
   (ok true)))
