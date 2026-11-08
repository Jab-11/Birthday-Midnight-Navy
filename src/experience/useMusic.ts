import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  BIRTHDAY_MUSIC_SRC,
  MUSIC_BASE_VOLUME,
  MUSIC_DUCK_FACTOR,
  MUSIC_FADE_SECONDS,
  MUSIC_LETTER_FACTOR,
  MUSIC_SRC,
} from "@/content/media";
import { read, write, type StorageMode } from "@/lib/storage";

export type MusicState = {
  started: boolean;
  playing: boolean;
  muted: boolean;
  unavailable: boolean;
};

type MusicOptions = {
  reducedMotion: boolean;
  letterScene: boolean;
  chapter: number;
  /** Every chapter (through 8) is unlocked: Chapters 1 and 2 then get the background track. */
  allUnlocked: boolean;
};

/**
 * Which track belongs to a chapter.
 *  - 1-2: silent on a first visit; bgm once everything is unlocked (revisit).
 *  - 3: silent until the candle is blown, then the birthday song.
 *  - 4: keeps the birthday song going (also after a refresh, when the candle was blown before).
 *  - 5+: bgm.
 */
function pickTrack(
  chapter: number,
  birthdayRequested: boolean,
  started: boolean,
  allUnlocked: boolean,
): string | null {
  if (chapter <= 2) return allUnlocked ? MUSIC_SRC : null;
  if (chapter === 3) return birthdayRequested ? BIRTHDAY_MUSIC_SRC : null;
  if (chapter === 4) return birthdayRequested || started ? BIRTHDAY_MUSIC_SRC : null;
  return MUSIC_SRC;
}

export function useMusic(mode: StorageMode, opts: MusicOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeTrackRef = useRef<string | null>(null);

  const [birthdayRequested, setBirthdayRequested] = useState(false);
  // Bumped by reset() so the track effect re-applies even when the track string is unchanged.
  const [resetCount, setResetCount] = useState(0);

  const [state, setState] = useState<MusicState>({
    started: false,
    playing: false,
    muted: false,
    unavailable: !MUSIC_SRC || !BIRTHDAY_MUSIC_SRC,
  });

  const levelRef = useRef(MUSIC_BASE_VOLUME);
  const duckedRef = useRef(false);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !activeTrackRef.current) return;
    // Already playing: never nudge it (keeps the song seamless across chapters).
    if (!audio.paused) return;

    try {
      await audio.play();
      setState((s) => ({ ...s, playing: true }));
    } catch {
      setState((s) => ({ ...s, playing: false }));
    }
  }, []);

  const changeTrack = useCallback(
    (src: string | null, shouldPlay: boolean) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (!src) {
        if (activeTrackRef.current === null) return;
        activeTrackRef.current = null;
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        return;
      }

      if (activeTrackRef.current !== src) {
        activeTrackRef.current = src;
        audio.pause();
        audio.src = src;
        audio.load();
      }

      if (shouldPlay && !audio.muted) {
        void tryPlay();
      }
    },
    [tryPlay],
  );

  // Create one shared audio element.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onError = () => setState((s) => ({ ...s, unavailable: true, playing: false }));

    const onPause = () => setState((s) => ({ ...s, playing: false }));

    const onPlay = () => setState((s) => ({ ...s, playing: true, unavailable: false }));

    const onEnded = () => {
      audio.currentTime = 0;
      void audio.play().catch(() => undefined);
    };

    audio.addEventListener("error", onError);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("ended", onEnded);

    const started = read(mode, "musicStarted") === "1";
    const muted = read(mode, "muted") === "1";

    audio.muted = muted;
    setState((s) => ({ ...s, started, muted }));

    return () => {
      audio.pause();
      audio.removeEventListener("error", onError);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.src = "";
      audioRef.current = null;
      activeTrackRef.current = null;
    };
  }, [mode]);

  // The chapter decides the track. Derived, so re-renders never reset it.
  const track = pickTrack(opts.chapter, birthdayRequested, state.started, opts.allUnlocked);

  useEffect(() => {
    changeTrack(track, !state.muted);
  }, [track, state.muted, resetCount, changeTrack]);

  // If the browser blocked autoplay (e.g. a revisit's background track), the first tap retries.
  useEffect(() => {
    if (!track || state.muted || state.playing) return;
    const retry = () => {
      if (!audioRef.current?.muted) void tryPlay();
    };
    window.addEventListener("pointerdown", retry, { once: true });
    window.addEventListener("keydown", retry, { once: true });
    return () => {
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
    };
  }, [track, state.muted, state.playing, tryPlay]);

  // Volume, video ducking, letter-scene softening and end fade.
  useEffect(() => {
    const id = window.setInterval(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const { reducedMotion, letterScene } = optsRef.current;
      audio.loop = reducedMotion;

      let target = MUSIC_BASE_VOLUME;
      if (duckedRef.current) target *= MUSIC_DUCK_FACTOR;

      if (reducedMotion) {
        levelRef.current = target;
        audio.volume = target;
        return;
      }

      if (letterScene) target *= MUSIC_LETTER_FACTOR;

      levelRef.current += (target - levelRef.current) * 0.06;

      let edge = 1;
      if (Number.isFinite(audio.duration) && audio.duration > MUSIC_FADE_SECONDS * 3) {
        const fromStart = audio.currentTime / MUSIC_FADE_SECONDS;
        const toEnd = (audio.duration - audio.currentTime) / MUSIC_FADE_SECONDS;
        edge = Math.max(0, Math.min(1, fromStart, toEnd));
      }

      audio.volume = Math.max(0, Math.min(1, levelRef.current * edge));
    }, 50);

    return () => window.clearInterval(id);
  }, []);

  // Start is still the intentional music permission action.
  const start = useCallback(() => {
    write(mode, "musicStarted", "1");
    write(mode, "muted", null);

    const audio = audioRef.current;
    if (audio) audio.muted = false;

    setState((s) => ({ ...s, started: true, muted: false }));
    void tryPlay();
  }, [mode, tryPlay]);

  // Called when the Chapter 3 candle is blown.
  const playBirthday = useCallback(() => {
    write(mode, "musicStarted", "1");

    setBirthdayRequested(true);
    setState((s) => ({ ...s, started: true }));

    // Start inside the tap so the browser allows it. Same track already playing stays untouched.
    changeTrack(BIRTHDAY_MUSIC_SRC, true);
  }, [mode, changeTrack]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const muted = !audio.muted;
    audio.muted = muted;

    write(mode, "muted", muted ? "1" : null);
    setState((s) => ({ ...s, muted }));

    if (!muted) void tryPlay();
  }, [mode, tryPlay]);

  const playManually = useCallback(() => {
    write(mode, "musicStarted", "1");
    setState((s) => ({ ...s, started: true }));
    void tryPlay();
  }, [mode, tryPlay]);

  const setDucked = useCallback((ducked: boolean) => {
    duckedRef.current = ducked;
  }, []);

  const reset = useCallback(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      audio.removeAttribute("src");
      audio.load();
    }

    activeTrackRef.current = null;
    setBirthdayRequested(false);
    setResetCount((n) => n + 1);

    write(mode, "musicStarted", null);
    write(mode, "muted", null);

    setState({
      started: false,
      playing: false,
      muted: false,
      unavailable: !MUSIC_SRC || !BIRTHDAY_MUSIC_SRC,
    });
  }, [mode]);

  return useMemo(
    () => ({
      state,
      /** A track belongs to this chapter right now (false = the chapter is meant to be silent). */
      hasTrack: track !== null,
      start,
      playBirthday,
      toggleMute,
      playManually,
      setDucked,
      reset,
    }),
    [state, track, start, playBirthday, toggleMute, playManually, setDucked, reset],
  );
}
