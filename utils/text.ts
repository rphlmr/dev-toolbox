export function take(nbOfChar: number, str: string) {
  return str.length > nbOfChar ? `${str.slice(0, nbOfChar)}...` : str;
}
