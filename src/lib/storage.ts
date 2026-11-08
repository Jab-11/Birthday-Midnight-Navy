/**
 * Browser-only persistence (STACK.md "State"). Call only from effects or handlers.
 * Her query and dev mode use separate keys; dev never writes her unlock record (F-02).
 */
export type StorageMode = "her" | "dev";

type Key = "furthest" | "wish" | "draft" | "muted" | "musicStarted" | "chapter4Seen";

function k(mode: StorageMode, key: Key) {
  return `storybook.${mode}.${key}`;
}

export function read(mode: StorageMode, key: Key): string | null {
  try {
    return window.localStorage.getItem(k(mode, key));
  } catch {
    return null;
  }
}

export function write(mode: StorageMode, key: Key, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(k(mode, key));
    else window.localStorage.setItem(k(mode, key), value);
  } catch {
    /* storage unavailable: behaviour unspecified; experience keeps working */
  }
}
