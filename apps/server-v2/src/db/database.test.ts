import { describe, expect, it } from "@effect/vitest";
import { eq } from "drizzle-orm";
import { Effect, Result } from "effect";
import { Database } from "@/db";
import { account, session, user, verification } from "@/db/schema";
import { createTestUser } from "@/test/helpers";
import { TestDatabaseLayer } from "@/test/layer";

describe("database", () => {
  it.layer(TestDatabaseLayer)((it) => {
    it.effect("user: creates, reads, updates and deletes", () =>
      Effect.gen(function* () {
        const db = yield* Database;

        const created = yield* createTestUser({ name: "Ada" });

        const [found] = yield* db
          .select()
          .from(user)
          .where(eq(user.id, created.id));

        expect({
          id: found.id,
          name: found.name,
          flag: found.flag,
          emailVerified: found.emailVerified,
        }).toStrictEqual({
          id: created.id,
          name: "Ada",
          flag: "NONE",
          emailVerified: false,
        });

        const [updated] = yield* db
          .update(user)
          .set({
            flag: "VERIFIED",
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(user.id, created.id))
          .returning();

        expect({
          flag: updated.flag,
          hasLastLoginAt: updated.lastLoginAt instanceof Date,
        }).toStrictEqual({
          flag: "VERIFIED",
          hasLastLoginAt: true,
        });

        yield* db.delete(user).where(eq(user.id, created.id));
        const remaining = yield* db
          .select()
          .from(user)
          .where(eq(user.id, created.id));

        expect(remaining).toStrictEqual([]);
      }),
    );

    it.effect("auth: sessions, accounts and verifications", () =>
      Effect.gen(function* () {
        const db = yield* Database;

        const created = yield* createTestUser();
        const sessionId = crypto.randomUUID();
        const accountId = crypto.randomUUID();
        const verificationId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 60_000);

        yield* db.insert(session).values({
          id: sessionId,
          userId: created.id,
          token: crypto.randomUUID(),
          expiresAt,
        });
        yield* db.insert(account).values({
          id: accountId,
          userId: created.id,
          accountId: "SP123",
          providerId: "stacks",
        });
        yield* db.insert(verification).values({
          id: verificationId,
          identifier: `email:${created.id}`,
          value: "code",
          expiresAt,
        });

        const [foundSession] = yield* db
          .select()
          .from(session)
          .where(eq(session.id, sessionId));
        const [foundVerification] = yield* db
          .select()
          .from(verification)
          .where(eq(verification.id, verificationId));

        expect({
          sessionUserId: foundSession.userId,
          verificationIdentifier: foundVerification.identifier,
        }).toStrictEqual({
          sessionUserId: created.id,
          verificationIdentifier: `email:${created.id}`,
        });

        const userWithAuth = yield* db.query.user.findFirst({
          where: { id: created.id },
          with: { sessions: true, accounts: true },
        });

        expect({
          sessions: userWithAuth?.sessions.map((row) => row.id),
          accounts: userWithAuth?.accounts.map((row) => row.id),
        }).toStrictEqual({
          sessions: [sessionId],
          accounts: [accountId],
        });

        yield* db.delete(user).where(eq(user.id, created.id));

        const remainingSessions = yield* db
          .select()
          .from(session)
          .where(eq(session.userId, created.id));
        const remainingAccounts = yield* db
          .select()
          .from(account)
          .where(eq(account.userId, created.id));

        expect({
          sessions: remainingSessions,
          accounts: remainingAccounts,
        }).toStrictEqual({ sessions: [], accounts: [] });
      }),
    );

    it.effect("transactions: commits and rolls back", () =>
      Effect.gen(function* () {
        const db = yield* Database;
        const rollbackId = crypto.randomUUID();

        const committed = yield* db.transaction((tx) =>
          tx
            .insert(user)
            .values({
              id: crypto.randomUUID(),
              email: `${crypto.randomUUID()}@test.sigle.io`,
            })
            .returning(),
        );

        const rolledBack = yield* db
          .transaction((tx) =>
            Effect.gen(function* () {
              yield* tx.insert(user).values({
                id: rollbackId,
                email: `${rollbackId}@test.sigle.io`,
              });

              return yield* Effect.fail(new Error("force rollback"));
            }),
          )
          .pipe(Effect.result);

        expect(Result.isFailure(rolledBack)).toBe(true);

        const rolledBackUsers = yield* db
          .select()
          .from(user)
          .where(eq(user.id, rollbackId));

        expect({
          committedId: committed[0].id,
          rolledBackUsers,
        }).toStrictEqual({
          committedId: committed[0].id,
          rolledBackUsers: [],
        });
      }),
    );
  });
});
