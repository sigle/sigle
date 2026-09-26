import { Effect } from "effect";
import { Database } from "@/db";
import { user } from "@/db/schema";

export const createTestUser = (
  overrides: Partial<typeof user.$inferInsert> = {},
) =>
  Effect.gen(function* () {
    const db = yield* Database;
    const id = crypto.randomUUID();

    const [created] = yield* db
      .insert(user)
      .values({
        id,
        name: "Test User",
        email: `${id}@test.sigle.io`,
        ...overrides,
      })
      .returning();

    return created;
  });
