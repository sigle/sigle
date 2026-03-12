import type { z } from "zod";
import { HTTPError, getQuery, type H3Event } from "nitro/h3";
import { fromError } from "zod-validation-error";

export const getValidatedQueryZod = async <T, Event extends H3Event = H3Event>(
  event: Event,
  schema: z.ZodType<T>,
) => {
  const query = getQuery(event);
  const response = schema.safeParse(query);

  if (!response.success) {
    throw new HTTPError({
      status: 400,
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
  const body = await event.req.json();
  const response = schema.safeParse(body);

  if (!response.success) {
    throw new HTTPError({
      status: 400,
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

export const readFormData = async (
  event: H3Event,
  maxSize: keyof typeof possibleMaxSizes,
): Promise<FormData> => {
  const maxSizeValue = possibleMaxSizes[maxSize];
  if (!maxSizeValue) {
    throw new Error(`Invalid maxSize: ${maxSize}`);
  }

  const contentLength = event.req.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxSizeValue) {
    throw new HTTPError({
      status: 413,
      message: `File too large. Maximum size is ${maxSize}.`,
    });
  }

  return await event.req.formData();
};
