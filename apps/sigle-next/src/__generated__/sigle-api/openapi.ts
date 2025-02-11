/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/chainhook/webhook": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/internal/login-user-sync": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/posts/{postId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description Get post. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          postId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Post entry. */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
              title: string;
              content?: string;
              metaTitle?: string;
              metaDescription?: string;
              coverImage?: {
                id: string;
                width?: number;
                height?: number;
                blurhash?: string;
              };
              excerpt?: string;
              address: string;
              txId: string;
              maxSupply: number;
              collected: number;
              openEdition: boolean;
              price: string;
              metadataUri: string;
              createdAt: string;
              updatedAt: string;
              user: {
                id: string;
                createdAt: string;
                updatedAt: string;
                profile?: {
                  id: string;
                  displayName?: string;
                  description?: string;
                  website?: string;
                  twitter?: string;
                  pictureUri?: {
                    id: string;
                    width?: number;
                    height?: number;
                    blurhash?: string;
                  };
                  coverPictureUri?: {
                    id: string;
                    width?: number;
                    height?: number;
                    blurhash?: string;
                  };
                };
              };
            };
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/posts/list": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description Get posts list. */
    get: {
      parameters: {
        query?: {
          /** @description Limit the number of posts returned. */
          limit?: number;
          /** @description The address of the user to get posts for. */
          username?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Posts list. */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
              address: string;
              title: string;
              content?: string;
              metaTitle?: string;
              metaDescription?: string;
              excerpt?: string;
              coverImage?: {
                id: string;
                width?: number;
                height?: number;
                blurhash?: string;
              };
              maxSupply: number;
              collected: number;
              openEdition: boolean;
              price: string;
              metadataUri: string;
              createdAt: string;
              updatedAt: string;
              user: {
                id: string;
                createdAt: string;
                updatedAt: string;
                profile?: {
                  id: string;
                  displayName?: string;
                  description?: string;
                  website?: string;
                  twitter?: string;
                  pictureUri?: {
                    id: string;
                    width?: number;
                    height?: number;
                    blurhash?: string;
                  };
                  coverPictureUri?: {
                    id: string;
                    width?: number;
                    height?: number;
                    blurhash?: string;
                  };
                };
              };
            }[];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/protected/drafts/{draftId}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description Get draft for the current profile. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          draftId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Draft entry. */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
              title: string;
              content?: string;
              metaTitle?: string;
              metaDescription?: string;
              coverImage?: string;
              /** @enum {string} */
              collectPriceType?: "free" | "paid";
              collectPrice?: string;
              /** @enum {string} */
              collectLimitType?: "open" | "fixed";
              collectLimit?: number;
              txId?: string;
              txStatus?: string;
              createdAt: string;
              updatedAt: string;
            };
          };
        };
        /** @description Draft not found. */
        404: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              /** @example Draft not found. */
              message?: string;
              /** @example 404 */
              statusCode?: number;
            };
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/protected/drafts/{draftId}/delete": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Delete the draft for the current profile. */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          draftId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/protected/drafts/{draftId}/set-tx-id": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Update the draft for the current profile. */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          draftId: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            txId: string;
          };
        };
      };
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/protected/drafts/{draftId}/update": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Update the draft for the current profile. */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          draftId: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            title: string;
            content: string;
            metaTitle?: string;
            metaDescription?: string;
            coverImage?: string;
            collect?: {
              collectPrice: {
                /** @enum {string} */
                type: "free" | "paid";
                price: number;
              };
              collectLimit: {
                /** @enum {string} */
                type: "open" | "fixed";
                limit: number;
              };
            };
          };
        };
      };
      responses: {
        /** @description Draft updated. */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
            };
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/protected/drafts/{draftId}/upload-media": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Upload draft media. */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          draftId: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "multipart/form-data": {
            /**
             * Format: binary
             * @description Profile media
             */
            file: string;
          };
        };
      };
      responses: {
        /** @description Media uploaded */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              cid: string;
              url: string;
              gatewayUrl: string;
            };
          };
        };
        /** @description Bad request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              message: string;
            };
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/protected/drafts/{draftId}/upload-metadata": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Upload draft metadata to Arweave. */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          draftId: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            metadata: Record<string, never>;
          };
        };
      };
      responses: {
        /** @description Metadata uploaded. */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              /** @description Arweave ID. */
              id: string;
            };
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/protected/drafts/create": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Create a new draft for the current profile. */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Draft created. */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
            };
          };
        };
        /** @description Bad request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              message: string;
            };
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/protected/drafts/list": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description Get drafts for the current profile. */
    get: {
      parameters: {
        query?: {
          /** @description Limit the number of drafts returned. */
          limit?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Drafts list. */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
              title: string;
              content?: string;
              metaTitle?: string;
              metaDescription?: string;
              coverImage?: string;
              txId?: string;
              txStatus?: string;
              createdAt: string;
              updatedAt: string;
            }[];
          };
        };
        /** @description Bad request */
        400: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              message: string;
            };
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/protected/user/profile/upload-avatar": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Upload avatar for a profile. */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "multipart/form-data": {
            /**
             * Format: binary
             * @description Profile media
             */
            file: string;
          };
        };
      };
      responses: {
        /** @description Avatar uploaded */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              cid: string;
              url: string;
              gatewayUrl: string;
            };
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/protected/user/profile/upload-cover": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Upload cover picture for a profile. */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "multipart/form-data": {
            /**
             * Format: binary
             * @description Profile media
             */
            file: string;
          };
        };
      };
      responses: {
        /** @description Cover uploaded */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              cid: string;
              url: string;
              gatewayUrl: string;
            };
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/protected/user/profile/upload-metadata": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Upload profile metadata to Arweave. */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          "application/json": {
            /** @description Profile metadata */
            metadata?: Record<string, never>;
          };
        };
      };
      responses: {
        /** @description Metadata uploaded. */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              /** @description Arweave ID. */
              id: string;
            };
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/users/{username}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description Get user profile. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          username: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description User profile. */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
              createdAt: string;
              updatedAt: string;
              profile?: {
                id: string;
                displayName?: string;
                description?: string;
                website?: string;
                twitter?: string;
                pictureUri?: {
                  id: string;
                  width?: number;
                  height?: number;
                  blurhash?: string;
                };
                coverPictureUri?: {
                  id: string;
                  width?: number;
                  height?: number;
                  blurhash?: string;
                };
              };
            };
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/api/users/trending": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** @description Get trending profiles. */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description User profiles. */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            "application/json": {
              id: string;
              createdAt: string;
              updatedAt: string;
              postsCount?: number;
              profile?: {
                id: string;
                displayName?: string;
                description?: string;
                website?: string;
                twitter?: string;
                pictureUri?: {
                  id: string;
                  width?: number;
                  height?: number;
                  blurhash?: string;
                };
                coverPictureUri?: {
                  id: string;
                  width?: number;
                  height?: number;
                  blurhash?: string;
                };
              };
            }[];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/health": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/_openapi.json": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/_scalar": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/_swagger": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description OK */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: never;
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
