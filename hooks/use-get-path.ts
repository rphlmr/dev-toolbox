import { useLocation } from "@remix-run/react";

import { isEmpty } from "~/utils/is-empty";

export function useGetRootPath() {
  const location = useLocation();
  const rootPath =
    location.pathname.split("/").filter((path) => !isEmpty(path))[0] || "";

  return `/${rootPath}`;
}

export function useGetParentPath(offset = -1) {
  const location = useLocation();
  return location.pathname.split("/").slice(0, offset).join("/") || "/";
}
