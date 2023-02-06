import { useEffect, useRef, useState } from "react";

import { useSearchParams } from "@remix-run/react";

export function useScrollToAnchor(anchorName: string) {
  const [searchParams] = useSearchParams();
  const anchorParam = searchParams.get(anchorName);
  const [anchor, setAnchor] = useState<string | null>();
  const scrollableRefs = useRef(new Map<string, HTMLDivElement | null>());

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (anchorParam) {
        scrollableRefs.current.get(anchorParam)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setAnchor(anchorParam);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [anchorParam]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (anchor) {
        setAnchor(null);
      }
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [anchor]);

  return { scrollableRefs, anchor };
}

export const highlightTransition = "transition-all duration-[2000ms]";
export const highlightEffect = "rounded ring ring-sky-300 ring-offset-1";
