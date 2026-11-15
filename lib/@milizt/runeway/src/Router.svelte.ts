import type { Action } from "svelte/action";

export interface ParsedLocation {
  path: string;
  qs: string;
}

enum PathType {
  WILDCARD,
  PARAM,
  STATIC,
  END,
}

type PathStaticSegment = { type: PathType.STATIC; value: string };
type PathParamSegment = { type: PathType.PARAM; name: string };
type PathWildcardSegment = { type: PathType.WILDCARD };
type PathSegment = PathStaticSegment | PathParamSegment | PathWildcardSegment;

export type RouteParsed = {
  pattern: string;
  segments: PathSegment[];
  hasWildcard: boolean;
};

export type Params = Record<string, string>;

export interface RouteMatch {
  pattern: string; // the pattern that matched, e.g. "/users/:id"
  path: string; // the actual path that was matched
  params: Params;
}

export type RouterMatch = Omit<RouteMatch, "path">;

/* -------------------------------------------------------------------------- */
/* URL state                                                                  */
/* -------------------------------------------------------------------------- */

const FALLBACK: ParsedLocation = { path: "/", qs: "" };

function readHash(): string {
  return typeof window === "undefined" ? "" : window.location.hash;
}

/** Parses a hash such as "#/users/42?tab=1". Never throws, never returns null. */
function parseHash(hash: string): ParsedLocation | null {
  if (hash === "" || hash === "#") return FALLBACK;
  if (!hash.startsWith("#/")) return null;

  try {
    // A second "#" ("#/page#section") lands in url.hash, which is ignored here.
    const url = new URL(`http://router.local${hash.slice(1)}`);
    return { path: url.pathname, qs: url.search.slice(1) };
  } catch {
    return FALLBACK;
  }
}

let _initialized = false;
let _parsed: ParsedLocation = $state.raw(parseHash(readHash()) ?? FALLBACK);

const _location = $derived(_parsed.path + (_parsed.qs ? `?${_parsed.qs}` : ""));
const _path = $derived(_parsed.path);
const _qs = $derived(_parsed.qs);

function updateLocation(): void {
  const next = parseHash(readHash());
  if (next === null) return
  if (next.path === _parsed.path && next.qs === _parsed.qs) return;
  _parsed = next;
}

export const router = {
  init() {
    if (_initialized || typeof window === "undefined") return;
    _initialized = true;

    updateLocation(); // sync in case the hash changed before init
    window.addEventListener("hashchange", updateLocation);
  },

  stop() {
    if (!_initialized) return;
    _initialized = false;

    window.removeEventListener("hashchange", updateLocation);
  },

  get location() {
    return _location;
  },

  get path() {
    return _path;
  },

  get qs() {
    return _qs;
  },
};

/* -------------------------------------------------------------------------- */
/* Route matching                                                             */
/* -------------------------------------------------------------------------- */

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value; // malformed % sequence: keep raw
  }
}

function parseRoute(route: string): RouteParsed {
  const segments = route
    .split("/")
    .filter(Boolean)
    .map((seg): PathSegment => {
      if (seg === "*" || seg === "...") return { type: PathType.WILDCARD };
      if (seg[0] === ":") return { type: PathType.PARAM, name: seg.slice(1) };
      return { type: PathType.STATIC, value: seg };
    });

  return {
    pattern: route,
    segments,
    hasWildcard: segments.some((s) => s.type === PathType.WILDCARD),
  };
}

/** Most specific first: static > param > wildcard, shorter before longer. */
function sortedRoutes(routes: string[]): RouteParsed[] {
  return routes.map(parseRoute).sort((a, b) => {
    const len = Math.max(a.segments.length, b.segments.length);
    for (let i = 0; i < len; i++) {
      const scoreA = a.segments[i]?.type ?? PathType.END;
      const scoreB = b.segments[i]?.type ?? PathType.END;
      if (scoreA !== scoreB) return scoreB - scoreA;
    }
    return 0; // Array.prototype.sort is stable, so ties keep the original order
  });
}

function matchSegments(route: RouteParsed, actual: string[]): Params | null {
  const { segments, hasWildcard } = route;

  // Without a wildcard, the segment counts must be equal.
  if (!hasWildcard && segments.length !== actual.length) return null;

  const params: Params = {};

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    if (seg.type === PathType.WILDCARD) break; // swallows the rest

    const value = actual[i];
    if (value === undefined) return null;

    if (seg.type === PathType.PARAM) {
      params[seg.name] = safeDecode(value);
    } else if (seg.value !== safeDecode(value)) {
      return null;
    }
  }

  return params;
}

export function matchRoute(routes: RouteParsed[], path: string): RouteMatch | null {
  const actual = path.split("/").filter(Boolean);

  for (const route of routes) {
    const params = matchSegments(route, actual);
    if (params !== null) return { pattern: route.pattern, path, params };
  }

  return null;
}

export class RoutingTable {
  readonly routes: RouteParsed[];

  // Lazy and cached: it only re-runs when `_path` changes, and it returns the
  // same object until then, so consumers don't re-render needlessly.
  #match = $derived.by((): RouterMatch | null => {
    const m = matchRoute(this.routes, _path);
    return m && { pattern: m.pattern, params: m.params };
  });

  constructor(routes: string[]) {
    this.routes = sortedRoutes(routes);
  }

  get match(): RouterMatch | null {
    return this.#match;
  }
}

/* -------------------------------------------------------------------------- */
/* use:link                                                                   */
/* -------------------------------------------------------------------------- */

export interface LinkActionOpts {
  disabled?: boolean;
}

export const link: Action<HTMLAnchorElement, LinkActionOpts | undefined> = (node, opts) => {
  if (node.tagName.toLowerCase() !== "a") {
    throw Error('Action "link" can only be used with <a> tags');
  }

  let disabled = !!opts?.disabled;

  // "/users/1" -> "#/users/1". Anything else (e.g. already "#/...") is left alone.
  // The corrected value no longer starts with "/", so this can't loop.
  const syncHref = () => {
    const href = node.getAttribute("href");
    if (href === "/") node.setAttribute("href", "/#/")
    else if (href?.startsWith("/")) node.setAttribute("href", `#${href}`);
  };

  const syncDisabled = () => {
    if (disabled) node.setAttribute("aria-disabled", "true");
    else node.removeAttribute("aria-disabled");
  };

  // The real href does the navigation (and fires `hashchange`), so ctrl/middle
  // click and "open in new tab" keep working. We only block it when disabled.
  const onClick = (event: MouseEvent) => {
    if (disabled) event.preventDefault();
  };

  syncHref();
  syncDisabled();
  node.addEventListener("click", onClick);

  // Svelte resets `href` itself when a dynamic href={...} changes, which would
  // drop the "#". Re-apply it whenever that happens.
  const observer = new MutationObserver(syncHref);
  observer.observe(node, { attributes: true, attributeFilter: ["href"] });

  return {
    update(next) {
      disabled = !!next?.disabled;
      syncDisabled();
    },
    destroy() {
      observer.disconnect();
      node.removeEventListener("click", onClick);
    },
  };
};