import { useMatches } from "@remix-run/react";

export type Handle<T extends string> = {
  key: T;
};

export function useOutletHandle<T extends Handle<string>>(key: T["key"]) {
  const handles = useMatches()
    .filter((match) => match.handle && match.handle.key === key)
    .map((match) => ({ ...(match.handle as T), pathname: match.pathname }));

  return handles;
}
