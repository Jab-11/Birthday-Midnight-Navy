import { createFileRoute, useHydrated } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { ExperienceProvider } from "@/experience/ExperienceContext";
import { Shell } from "@/experience/Shell";
import { getExperienceMode } from "@/lib/gate.functions";

// Raw strings: correction of bad chapter values happens in the app, never by rewriting the URL (D-31).
const searchSchema = z.object({
  experience: fallback(z.string(), "").optional(),
  // The router parses `chapter=3` as a number; keep both forms raw.
  chapter: fallback(z.union([z.number(), z.string()]), "").optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ experience: search.experience ?? "" }),
  loader: ({ deps }) => getExperienceMode({ data: { experience: deps.experience } }),
  staleTime: Infinity,
  // Generic title, no description (D-29).
  head: () => ({ meta: [{ title: "Aloo's Birthday" }] }),
  component: Index,
});

function Index() {
  const { mode } = Route.useLoaderData();
  const { experience, chapter } = Route.useSearch();
  const hydrated = useHydrated();

  if (!mode) return <div data-blank="" />;
  // Browser storage decides the unlocked chapter, so the experience renders after hydration.
  if (!hydrated) return <div style={{ minHeight: "100dvh", background: "var(--navy)" }} />;

  return (
    <ExperienceProvider
      mode={mode}
      experience={experience ?? ""}
      rawChapter={chapter === undefined ? undefined : String(chapter)}
    >
      <Shell />
    </ExperienceProvider>
  );
}
