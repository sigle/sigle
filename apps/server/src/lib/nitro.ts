import type { z } from "zod";
import { HTTPError, getQuery, type H3Event, readBody } from "nitro/h3";
import { fromError } from "zod-validation-error";

interface MultiPartData {
  name: string;
  data: Uint8Array;
  type?: string;
  filename?: string;
}

export const getValidatedQueryZod = async <T, Event extends H3Event = H3Event>(
  event: Event,
  schema: z.ZodType<T>,
) => {
  const query = getQuery(event);
  const response = schema.safeParse(query);

  if (!response.success) {
    throw new HTTPError({
      status: 400,
      statusMessage: "Validation Error",
      message: fromError(response.error).toString(),
      data: response.error,
    });
  }

  return response.data;
};

export const readValidatedBodyZod = async <T, Event extends H3Event = H3Event>(
  event: Event,
  schema: z.ZodType<T>,
) => {
  const body = await readBody(event);
  const response = schema.safeParse(body);

  if (!response.success) {
    throw new HTTPError({
      status: 400,
      statusMessage: "Validation Error",
      message: fromError(response.error).toString(),
      data: response.error,
    });
  }

  return response.data;
};

const possibleMaxSizes = {
  "1mb": 1024 * 1024,
  "5mb": 1024 * 1024 * 5,
};

export const readMultipartFormDataSafe = async (
  event: H3Event,
  maxSize: keyof typeof possibleMaxSizes,
): Promise<MultiPartData[] | undefined> => {
  const maxSizeValue = possibleMaxSizes[maxSize];
  if (!maxSizeValue) {
    throw new Error(`Invalid maxSize: ${maxSize}`);
  }
  event.req.headers.set("max-content-length", maxSizeValue.toString());

  const contentLength = event.req.headers.get("content-length");
  if (Number(contentLength) > maxSizeValue) {
    throw new HTTPError({
      status: 413,
      message: `File too large. Maximum size is ${maxSize}.`,
    });
  }

  const formData = await event.req.formData();
  return formData as unknown as MultiPartData[];
};
