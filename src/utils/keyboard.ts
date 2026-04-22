export function isHotkeyPressed(e: KeyboardEvent, hotkey: string): boolean {
  const parts = hotkey.toLowerCase().split("+");
  const key = parts[parts.length - 1];
  const ctrl = parts.includes("ctrl");
  const shift = parts.includes("shift");
  const alt = parts.includes("alt");
  const meta = parts.includes("meta");

  return (
    e.key.toLowerCase() === key &&
    e.ctrlKey === ctrl &&
    e.shiftKey === shift &&
    e.altKey === alt &&
    e.metaKey === meta
  );
}
