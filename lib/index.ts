import { Application } from 'egg';
import { Middleware } from 'koa';
import 'reflect-metadata';

type HTTP_METHOD = 'GET' | 'POST' | 'HEAD' | 'OPTIONS' | 'PUT' | 'PATCH' | 'DELITE' | 'DEL' | 'ALL' | 'RESOURCES'

// class 的路由数据
type ClassPathData = {
  path: string;
  middleware: Middleware[];
};

// 单条路由数据
type Route = {
  method: HTTP_METHOD;
  middleware: Middleware[];
  handlerName: string;
  constructorFunction: any;
  className: string;
}

function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELITE: 'DELITE',
  DEL: 'DEL',
  ALL: 'ALL',
  RESOURCES: 'RESOURCES',
};

class RouteEnhancer {
  // 缓存 Controller 原型
  private static __prototype = {};

  /**
   * 路由映射 - 简化 router和Controller 代码
   * @param path 路径
   * @param method 请求方法 支持RESTFUL API
   * @param middleware 路由中间件
   */
  public RouteMapping(
    path = '',
    method: HTTP_METHOD = 'GET',
    ...middleware: Middleware[]
  ) {
    // 判断是class 的装饰器工厂还是 method 的装饰器工厂
    return function(target: any, propName?: string | symbol, descriptor?: PropertyDescriptor) {
      if (typeof target === 'function' && propName === undefined && descriptor === undefined) {
        RouteEnhancer.handleClassDecorator(target, path, middleware);
        return;
      } else if (typeof propName === 'string' && typeof descriptor === 'object') {
        RouteEnhancer.handleMethodDecorator(target, path, method, propName, middleware);
        return;
      }
    };
  }

  /**
   * 处理 Class 上路由的装饰器
   * @param target class 构造函数
   * @param path 路由路径
   * @param middleware 路由中间件
   */
  private static handleClassDecorator(
    target: Function,
    path: string,
    middleware: Middleware[],
  ) {
    if (!path) {
      throw new Error('path must be non-empty string');
    }
    if (isEmptyObject(RouteEnhancer.__prototype)) {
      RouteEnhancer.__prototype = target.prototype;
    }
    const allClassRouteData = Reflect.getMetadata('CLASS_ROUTE_PATH', target.prototype) || {};
    if (allClassRouteData[target.name]) {
      throw new Error(`you have defined a same path[${path}] by class decorator`);
    }
    const classRouteData: ClassPathData = { path, middleware };
    allClassRouteData[target.name] = classRouteData;
    Reflect.defineMetadata('CLASS_ROUTE_PATH', allClassRouteData, target.prototype);
  }

  /**
   * 处理 Method 上的路由的装饰器
   * @param target 方法装饰器所在类的原型 或者 类的构造函数
   * @param path 路由路径
   * @param method 路由方法
   * @param propName 方法名
   * @param middleware 方法的descriptor
   */
  private static handleMethodDecorator(
    target: Function | object,
    path: string,
    method: HTTP_METHOD,
    propName: string,
    middleware: Middleware[],
  ) {
    const proto = typeof target === 'function' ? target.prototype : target;
    if (isEmptyObject(RouteEnhancer.__prototype)) {
      RouteEnhancer.__prototype = proto;
    }
    const methodRouteData = Reflect.getMetadata('METHOD_ROUTE_PATH', proto) || {};
    methodRouteData[path] = methodRouteData[path] || [];
    methodRouteData[path].push({
      method,
      middleware,
      handlerName: propName,
      constructorFunction: proto.constructor,
      className: proto.constructor.name,
    } as Route);
    Reflect.defineMetadata('METHOD_ROUTE_PATH', methodRouteData, proto);
  }

  /**
   * 初始化路由
   * @param app Application 实例
   * @param options 所有路由的统一前缀
   */
  initRouter(app: Application, options = { prefix: '' }) {
    const { router } = app;
    // 所有 method 装饰器，存在 Controller 原型上的数据
    const allMethodRouteData = Reflect.getMetadata('METHOD_ROUTE_PATH', RouteEnhancer.__prototype);
    // 所有class 装饰器，存在 Controller 原型上的数据
    const allClassRouteData = Reflect.getMetadata('CLASS_ROUTE_PATH', RouteEnhancer.__prototype);
    Object.keys(allMethodRouteData).forEach((methodPath: string) => {
      allMethodRouteData[methodPath].forEach((routeData: Route) => {
        const classRouteData = allClassRouteData[routeData.className];
        const fullPath = `${options.prefix}${classRouteData.path}${methodPath}`;
        const methodLowerCase = routeData.method.toLowerCase();
        console.log(`register URL * ${routeData.method} ${fullPath} * ${routeData.className}.${routeData.handlerName}`);
        router[methodLowerCase](fullPath, ...classRouteData.middleware, ...routeData.middleware, async ctx => {
          const controllerIns = new routeData.constructorFunction(ctx);
          await controllerIns[routeData.handlerName](ctx);
        });
      });
    });
  }
}

const routerEnhancer = new RouteEnhancer();

export const initRouter = routerEnhancer.initRouter;
export const RouteMapping = routerEnhancer.RouteMapping;
