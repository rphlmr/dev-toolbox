import { isBrowser } from "./is-browser";

export function convertToRem(px: number | string) {
  let value = 0;

  if (typeof px === "string") {
    value = parseFloat(px.replace("px", ""));
  }

  if (typeof px === "number") {
    value = px;
  }

  if (value === 0) return 0;

  return value / 16;
}

export function getElementRemSize(element: HTMLElement) {
  if (!isBrowser) throw new Error("getElementSize can only be used in browser");

  if (!element) throw new Error("getElementSize: 'element' is undefined");

  const lineHeight = convertToRem(window.getComputedStyle(element).lineHeight);
  const height = convertToRem(window.getComputedStyle(element).height);
  const width = convertToRem(window.getComputedStyle(element).width);
  const paddingTop = convertToRem(window.getComputedStyle(element).paddingTop);
  const paddingBottom = convertToRem(
    window.getComputedStyle(element).paddingTop
  );
  const paddingRight = convertToRem(
    window.getComputedStyle(element).paddingRight
  );
  const paddingLeft = convertToRem(
    window.getComputedStyle(element).paddingLeft
  );

  return {
    lineHeight,
    height,
    width,
    paddingTop,
    paddingBottom,
    paddingY: paddingTop + paddingBottom,
    paddingLeft,
    paddingRight,
    paddingX: paddingLeft + paddingRight,
  };
}
