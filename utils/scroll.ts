export function scrollToTop(element?: HTMLElement | null) {
  element?.scroll({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
}
