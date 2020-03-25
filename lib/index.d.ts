/// <reference types="koa" />
/// <reference types="koa-compose" />
import { Application } from 'egg';
import 'reflect-metadata';
export declare const HTTP_METHOD: {
    GET: string;
    POST: string;
    HEAD: string;
    OPTIONS: string;
    PUT: string;
    PATCH: string;
    DELITE: string;
    DEL: string;
    ALL: string;
    RESOURCES: string;
};
export declare const initRouter: (app: Application, options?: {
    prefix: string;
}) => void;
export declare const RouteMapping: (path?: string, method?: import("egg").HTTP_METHOD, ...middleware: import("koa-compose").Middleware<import("koa").ParameterizedContext<import("koa").DefaultState, import("koa").DefaultContext>>[]) => (target: any, propName?: string | symbol | undefined, descriptor?: PropertyDescriptor | undefined) => void;
