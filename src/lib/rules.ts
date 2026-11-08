/**
 * Pure rules shared by the page and the wish route.
 * Source of truth: PRD.md, FEATURE_BREAKDOWN.md (F-06, F-11, F-17), REQUIREMENTS_ANALYSIS.md §19.
 */

export type ChapterNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const CHAPTER_COUNT = 8;

/** 14 November 2026, 00:00:00 Asia/Kolkata (UTC+05:30) = 13 November 2026, 18:30:00 UTC. */
export const BIRTHDAY_TARGET_MS = Date.UTC(2026, 10, 13, 18, 30, 0);
// export const BIRTHDAY_TARGET_MS = Date.now() + 20 * 1000;

export type Countdown =
  | { revealed: true }
  | { revealed: false; days: number; hours: number; minutes: number; seconds: number };

/** Recalculated from the device clock every call; never a hand-incremented counter. */
export function getCountdown(nowMs: number, targetMs: number = BIRTHDAY_TARGET_MS): Countdown {
  const remaining = targetMs - nowMs;
  if (remaining <= 0) return { revealed: true };
  const totalSeconds = Math.ceil(remaining / 1000);
  return {
    revealed: false,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** JavaScript string length, per D-26. */
export const WISH_MAX_LENGTH = 5000;

export type WishValidation =
  { ok: true; wish: string } | { ok: false; reason: "empty" | "too_long" | "not_text" };

/** One shared validation function used by the page and the route (STACK.md). */
export function validateWish(value: unknown): WishValidation {
  if (typeof value !== "string") return { ok: false, reason: "not_text" };
  if (value.trim().length === 0) return { ok: false, reason: "empty" };
  if (value.length > WISH_MAX_LENGTH) return { ok: false, reason: "too_long" };
  return { ok: true, wish: value };
}

/**
 * Resolve the `chapter` query value to the chapter shown (D-16, D-25, D-31).
 * - Missing → Chapter 1.
 * - Non-number, outside 1–8, or (on her query) beyond the furthest opened → furthest opened.
 * - Dev mode may open any chapter 1–8.
 * The URL itself is never rewritten by this correction.
 */
export function resolveChapter(
  raw: string | undefined | null,
  furthestOpened: number,
  isDev: boolean,
): ChapterNumber {
  const furthest = clampChapter(furthestOpened);
  if (raw === undefined || raw === null) return 1;
  if (!/^[1-8]$/.test(raw.trim())) return furthest;
  const n = Number(raw.trim()) as ChapterNumber;
  if (isDev) return n;
  return n <= furthest ? n : furthest;
}

function clampChapter(n: number): ChapterNumber {
  if (!Number.isFinite(n)) return 1;
  return Math.min(CHAPTER_COUNT, Math.max(1, Math.floor(n))) as ChapterNumber;
}
