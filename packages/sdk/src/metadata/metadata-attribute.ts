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
/**
 * @internal
 */
export const BooleanAttributeSchema = z.object({
  type: z.literal(MetadataAttributeType.BOOLEAN),
  key: z.string().meta({ description: "The attribute's unique identifier." }),
  value: z.enum(["true", "false"]).meta({
    description:
      "A JS boolean value serialized as string. It's consumer responsibility to parse it.",
  }),
});

export type MetadataAttribute = BooleanAttribute;

export const MetadataAttributeSchema = z.discriminatedUnion("type", [
  BooleanAttributeSchema,
  // DateAttributeSchema,
  // NumberAttributeSchema,
  // StringAttributeSchema,
  // JSONAttributeSchema,
]);
