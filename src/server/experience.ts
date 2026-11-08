/**
 * Server-only experience check (D-12, D-17, D-18).
 * Import this module only from inside server handlers (dynamic import), so the
 * valid values never reach the browser bundle.
 */
export type ExperienceMode = "her" | "dev";

const EXPERIENCES: Record<string, ExperienceMode> = {
  "aloo-1411": "her",
  "jb-11-jelly": "dev",
};

export function resolveExperience(value: unknown): ExperienceMode | null {
  if (typeof value !== "string") return null;
  const key = value.toLowerCase();
  return Object.prototype.hasOwnProperty.call(EXPERIENCES, key) ? (EXPERIENCES[key] ?? null) : null;
}
