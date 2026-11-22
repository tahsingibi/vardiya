/** Preserve records already saved on the same origin before the rename. */
export function migrateLegacyStorage(storage: Storage): void {
  const legacyPrefix = "kurye35";
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key?.startsWith(legacyPrefix)) continue;
    const target = "vardiya" + key.slice(legacyPrefix.length);
    if (storage.getItem(target) === null) {
      const value = storage.getItem(key);
      if (value !== null) storage.setItem(target, value);
    }
  }
}
