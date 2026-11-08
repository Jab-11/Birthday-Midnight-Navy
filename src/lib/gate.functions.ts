import { createServerFn } from "@tanstack/react-start";

export type Mode = "her" | "dev" | null;

/** Returns only the mode, never the valid values themselves. */
export const getExperienceMode = createServerFn({ method: "GET" })
  .validator((input: unknown) => ({
    experience:
      typeof (input as { experience?: unknown })?.experience === "string"
        ? (input as { experience: string }).experience.slice(0, 200)
        : "",
  }))
  .handler(async ({ data }): Promise<{ mode: Mode }> => {
    const { resolveExperience } = await import("@/server/experience");
    return { mode: resolveExperience(data.experience) };
  });
