/**
 * Generate a URL-safe slug from a dropzone name.
 * "Skydive City (ZHills)" → "skydive-city-zhills"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
