/**
 * Removes comments, whitespace, and extraneous characters from a Clarity code string.
 */
export function minifyClarity(code: string): string {
  return code
    .replace(/;;.*$/gm, "") // Remove comments
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s*;\s*/g, ";")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")
    .replace(/^\s+|\s+$/gm, "")
    .replace(/\n+/g, "\n")
    .trim();
}
