import type { H3Event, MultiPartData } from "h3";
import type { z } from "zod";
import { fromError } from "zod-validation-error";

export const getValidatedQueryZod = async <T, Event extends H3Event = H3Event>(
  event: Event,
  schema: z.ZodType<T>,
) => {
  const query = getQuery(event);
  const response = schema.safeParse(query);

  if (!response.success) {
    throw createError({
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
  const body = await readBody(event, { strict: true });
  const response = schema.safeParse(body);

  if (!response.success) {
    throw createError({
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
  setResponseHeader(event, "max-content-length", maxSizeValue.toString());

  if (Number(getRequestHeader(event, "content-length")) > maxSizeValue) {
    throw createError({
      status: 413,
      message: `File too large. Maximum size is ${maxSize}.`,
    });
  }

  return readMultipartFormData(event);
};
