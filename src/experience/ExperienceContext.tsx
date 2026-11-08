import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { resolveChapter, type ChapterNumber } from "@/lib/rules";
import { read, write } from "@/lib/storage";
import { useMusic } from "./useMusic";
import { useReducedMotion } from "./useReducedMotion";

type Ctx = {
  mode: "her" | "dev";
  experience: string;
  chapter: ChapterNumber;
  reducedMotion: boolean;
  /** Next: opens the following chapter and records it as opened. */
  goNext: () => void;
  goBack: () => void;
  restart: () => void;
  /** A chapter can take over the Back control (Chapter 6 constellation → wish form). */
  setBackOverride: (fn: (() => void) | null) => void;
  /** Bumps on Restart so chapters remount fresh. */
  runId: number;
  music: ReturnType<typeof useMusic>;
};

const ExperienceCtx = createContext<Ctx | null>(null);

export function useExperience() {
  const ctx = useContext(ExperienceCtx);
  if (!ctx) throw new Error("useExperience outside provider");
  return ctx;
}

export function ExperienceProvider({
  mode,
  experience,
  rawChapter,
  children,
}: {
  mode: "her" | "dev";
  experience: string;
  rawChapter: string | undefined;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const isDev = mode === "dev";
  const reducedMotion = useReducedMotion();

  // Furthest opened chapter. Her query persists it; dev keeps it in memory only.
  const [furthest, setFurthest] = useState<number>(() => {
    if (isDev) return 1;
    const stored = Number(read("her", "furthest"));
    return Number.isFinite(stored) && stored >= 1 ? Math.min(8, Math.floor(stored)) : 1;
  });

  const chapter = resolveChapter(rawChapter, furthest, isDev);

  // Opening a chapter unlocks it, even before its main action is done (D-25).
  useEffect(() => {
    if (chapter > furthest) setFurthest(chapter);
  }, [chapter, furthest]);
  useEffect(() => {
    if (!isDev) write("her", "furthest", String(furthest));
  }, [furthest, isDev]);

  // Once Chapter 8 has been opened, every chapter is unlocked: a revisit gets background music in 1-2.
  const allUnlocked = furthest >= 8;

  const music = useMusic(mode, {
    reducedMotion,
    letterScene: chapter === 7,
    chapter,
    allUnlocked,
  });

  const backOverride = useRef<(() => void) | null>(null);
  const setBackOverride = useCallback((fn: (() => void) | null) => {
    backOverride.current = fn;
  }, []);

  const [runId, setRunId] = useState(0);

  const open = useCallback(
    (n: number) => {
      backOverride.current = null;
      setFurthest((f) => Math.max(f, n));
      void navigate({ to: "/", search: { experience, chapter: n } });
    },
    [experience, navigate],
  );

  const goNext = useCallback(() => {
    if (chapter < 8) open(chapter + 1);
  }, [chapter, open]);

  const goBack = useCallback(() => {
    if (backOverride.current) return backOverride.current();
    if (chapter > 1) open(chapter - 1);
  }, [chapter, open]);

  const restart = useCallback(() => {
    music.reset();
    backOverride.current = null;
    setRunId((r) => r + 1);
    void navigate({ to: "/", search: { experience, chapter: 1 } });
  }, [experience, music, navigate]);

  // Each chapter starts at the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [chapter, runId]);

  const value = useMemo<Ctx>(
    () => ({
      mode,
      experience,
      chapter,
      reducedMotion,
      goNext,
      goBack,
      restart,
      setBackOverride,
      runId,
      music,
    }),
    [
      mode,
      experience,
      chapter,
      reducedMotion,
      goNext,
      goBack,
      restart,
      setBackOverride,
      runId,
      music,
    ],
  );

  return <ExperienceCtx.Provider value={value}>{children}</ExperienceCtx.Provider>;
}
