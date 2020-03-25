import 'egg';
import 'reflect-metadata';
import { Middleware } from 'koa';
import './typings';

declare module 'egg' {
  type HTTP_METHOD = 'GET' | 'POST' | 'HEAD' | 'OPTIONS' | 'PUT' | 'PATCH' | 'DELITE' | 'DEL' | 'ALL' | 'RESOURCES';
  // class 的路由数据
  interface IClassPathData {
    path: string;
    middleware: Middleware[];
  }

  // 单条路由数据
  interface IRoute {
    method: HTTP_METHOD;
    middleware: Middleware[];
    handlerName: string;
    constructorFunction: any;
    className: string;
  }
}