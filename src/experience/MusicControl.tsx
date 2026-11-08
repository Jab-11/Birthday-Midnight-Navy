import { useExperience } from "./ExperienceContext";

/** Persistent mute/unmute after music has started, plus manual play when the browser blocks it (F-10). */
export function MusicControl({
  buttonClassName,
  pillClassName,
}: {
  buttonClassName: string;
  pillClassName: string;
}) {
  const { music } = useExperience();
  const { state } = music;
  // Silent chapters (1-2 on a first visit, 3 before the candle) show no music control at all.
  if (state.unavailable || !music.hasTrack) return <span />;

  if (!state.muted && !state.playing) {
    return (
      <button type="button" className={pillClassName} onClick={music.playManually}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M8 5v14l11-7z" fill="currentColor" />
        </svg>
        Play music
      </button>
    );
  }

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={music.toggleMute}
      aria-label={state.muted ? "Unmute music" : "Mute music"}
      aria-pressed={state.muted}
    >
      {state.muted ? (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M4 9h4l5-4v14l-5-4H4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M16.5 9.5l5 5m0-5l-5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M4 9h4l5-4v14l-5-4H4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
