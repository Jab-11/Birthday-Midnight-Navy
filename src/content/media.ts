import memories from "./memories.json";
import musicTrack from "@/assets/audio/bgm.mp3";
import happyBirthdayTrack from "@/assets/audio/happy-birthday.mp3";

/**
 * Media is imported from src/assets by code (STACK.md "Files"). Globs resolve to
 * build-assigned URLs only; files download when a chapter actually renders them.
 */
const photoUrls = import.meta.glob("/src/assets/memories/*", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const videoUrls = import.meta.glob("/src/assets/videos/*", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const finaleUrls = import.meta.glob("/src/assets/finale/*.{mp4,gif,webp,png,jpg,jpeg,avif}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export type Photo = {
  id: string;
  src: string | null;
  alt: string;
  caption: string | null;
  dateLabel: string | null;
  focus: string;
  width: number;
  height: number;
};

export type Video = {
  id: string;
  src: string | null;
  poster: string | null;
  title: string;
  description: string;
};

const resolve = (table: Record<string, string>, dir: string, name: string | null) =>
  name ? (table[`/src/assets/${dir}/${name}`] ?? null) : null;

export const photos: Photo[] = memories.photos.map((p) => ({
  ...p,
  src: resolve(photoUrls, "memories", p.src),
}));

export const videos: Video[] = memories.videos
  .map((v) => ({
    ...v,
    src: resolve(videoUrls, "videos", v.src),
    poster: resolve(videoUrls, "videos", v.poster),
  }))
  .filter((v) => v.src);

/** First owner-supplied finale image in src/assets/finale, or null until one is added. */
export const FINALE_GIF: string | null = Object.values(finaleUrls)[0] ?? null;
export const FINALE_VIDEO: string | null = finaleUrls["/src/assets/finale/final_wish.mp4"] ?? null;

/** Placeholder licence-free track (original, generated for this project). Replace when supplied. */
export const MUSIC_SRC: string | null = musicTrack;
export const BIRTHDAY_MUSIC_SRC: string | null = happyBirthdayTrack;
/** Numeric levels are TBD (PRD §7); these are working values. */
export const MUSIC_BASE_VOLUME = 0.5;
export const MUSIC_LETTER_FACTOR = 0.6;
export const MUSIC_DUCK_FACTOR = 0.15;
export const MUSIC_FADE_SECONDS = 2.5;
