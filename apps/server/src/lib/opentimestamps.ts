import { OpenTimestampsClient } from "@otskit/client";
import { consola } from "@/lib/consola";

export const openTimestampsClient = new OpenTimestampsClient({
  logger: consola,
});
