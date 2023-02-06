export function pluralize(count: number, word: string, pluralWord?: string) {
  return count > 1 ? pluralWord || word + "s" : word;
}
