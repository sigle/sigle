import * as z from "zod";

/**
 * The type of a metadata attribute.
 */
export enum MetadataAttributeType {
  BOOLEAN = "Boolean",
  DATE = "Date",
  NUMBER = "Number",
  STRING = "String",
  JSON = "JSON",
}

export interface BooleanAttribute {
  /**
   * A JS boolean value serialized as string. It's consumer responsibility to parse it.
   */
  value: "true" | "false";
  /**
   * Union discriminant.
   */
  type: MetadataAttributeType.BOOLEAN;
  /**
   * The attribute's unique identifier.
   */
  key: string;
}

export const BooleanAttributeSchema = z.object({
  type: z.literal(MetadataAttributeType.BOOLEAN),
  key: z.string().meta({ description: "The attribute's unique identifier." }),
  value: z.enum(["true", "false"]).meta({
    description:
      "A JS boolean value serialized as string. It's consumer responsibility to parse it.",
  }),
});

export interface DateAttribute {
  /**
   * A valid ISO 8601 date string.  It's consumer responsibility to parse it.
   */
  value: string;
  /**
   * Union discriminant.
   */
  type: MetadataAttributeType.DATE;
  /**
   * The attribute's unique identifier.
   */
  key: string;
}

export const DateAttributeSchema = z.object({
  type: z.literal(MetadataAttributeType.DATE),
  key: z.string().meta({ description: "The attribute's unique identifier." }),
  value: z.iso.datetime().meta({
    description:
      "A valid ISO 8601 date string.  It's consumer responsibility to parse it.",
  }),
});

export interface NumberAttribute {
  /**
   * A valid JS number serialized as string. It's consumer responsibility to parse it.
   *
   * @example
   * ```ts
   * '42'
   *
   * '42n'
   *
   * '42.42'
   * ```
   */
  value: string;
  /**
   * Union discriminant.
   */
  type: MetadataAttributeType.NUMBER;
  /**
   * The attribute's unique identifier.
   */
  key: string;
}

export const NumberAttributeSchema = z.object({
  type: z.literal(MetadataAttributeType.NUMBER),
  key: z.string().meta({ description: "The attribute's unique identifier." }),
  value: z.string().meta({
    description:
      "A valid JS number serialized as string. It's consumer responsibility to parse it.",
  }),
});

export interface StringAttribute {
  /**
   * Any string value.
   */
  value: string;
  /**
   * Union discriminant.
   */
  type: MetadataAttributeType.STRING;
  /**
   * The attribute's unique identifier.
   */
  key: string;
}

export const StringAttributeSchema = z.object({
  type: z.literal(MetadataAttributeType.STRING),
  key: z.string().meta({ description: "The attribute's unique identifier." }),
  value: z.string().meta({
    description: "Any string value.",
  }),
});

export interface JSONAttribute {
  /**
   * A JSON string. It's consumer responsibility to validate and parse it.
   */
  value: string;
  /**
   * Union discriminant.
   */
  type: MetadataAttributeType.JSON;
  /**
   * Union discriminant.
   */
  /**
   * The attribute's unique identifier.
   */
  key: string;
}

export const JSONAttributeSchema = z.object({
  type: z.literal(MetadataAttributeType.JSON),
  key: z.string().meta({ description: "The attribute's unique identifier." }),
  value: z.string().meta({
    description:
      "A JSON string. It's consumer responsibility to validate and parse it.",
  }),
});

export type MetadataAttribute =
  | BooleanAttribute
  | DateAttribute
  | NumberAttribute
  | StringAttribute
  | JSONAttribute;

export const MetadataAttributeSchema = z.discriminatedUnion("type", [
  BooleanAttributeSchema,
  DateAttributeSchema,
  NumberAttributeSchema,
  StringAttributeSchema,
  JSONAttributeSchema,
]);
