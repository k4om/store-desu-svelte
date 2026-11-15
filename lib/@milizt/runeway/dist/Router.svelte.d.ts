import type { Action } from "svelte/action";
export interface ParsedLocation {
    path: string;
    qs: string;
}
declare enum PathType {
    WILDCARD = 0,
    PARAM = 1,
    STATIC = 2,
    END = 3
}
type PathStaticSegment = {
    type: PathType.STATIC;
    value: string;
};
type PathParamSegment = {
    type: PathType.PARAM;
    name: string;
};
type PathWildcardSegment = {
    type: PathType.WILDCARD;
};
type PathSegment = PathStaticSegment | PathParamSegment | PathWildcardSegment;
export type RouteParsed = {
    pattern: string;
    segments: PathSegment[];
    hasWildcard: boolean;
};
export type Params = Record<string, string>;
export interface RouteMatch {
    pattern: string;
    path: string;
    params: Params;
}
export type RouterMatch = Omit<RouteMatch, "path">;
export declare const router: {
    init(): void;
    stop(): void;
    readonly location: string;
    readonly path: string;
    readonly qs: string;
};
export declare function matchRoute(routes: RouteParsed[], path: string): RouteMatch | null;
export declare class RoutingTable {
    #private;
    readonly routes: RouteParsed[];
    constructor(routes: string[]);
    get match(): RouterMatch | null;
}
export interface LinkActionOpts {
    disabled?: boolean;
}
export declare const link: Action<HTMLAnchorElement, LinkActionOpts | undefined>;
export {};
