/** Renders owner copy; bracketed values like [LETTER_TEXT] show as visible placeholders (F-09). */
export function isPlaceholder(value: string | null | undefined) {
  return typeof value === "string" && /^\[[A-Z0-9_ ]+\]$/.test(value.trim());
}

export function Copy({ value }: { value: string }) {
  if (isPlaceholder(value)) return <span className="placeholder">{value}</span>;
  return <>{value}</>;
}
