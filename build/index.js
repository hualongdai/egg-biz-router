Object.defineProperty(exports, '__esModule', { value: true });
require('reflect-metadata');
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
exports.HTTP_METHOD = {
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
  /**
   * 路由映射 - 简化 router和Controller 代码
   * @param path 路径
   * @param method 请求方法 支持RESTFUL API
   * @param middleware 路由中间件
   */
  RouteMapping(path = '', method = 'GET', ...middleware) {
    // 判断是class 的装饰器工厂还是 method 的装饰器工厂
    return function(target, propName, descriptor) {
      if (
        typeof target === 'function' &&
        propName === undefined &&
        descriptor === undefined
      ) {
        RouteEnhancer.handleClassDecorator(target, path, middleware);
        return;
      } else if (
        typeof propName === 'string' &&
        typeof descriptor === 'object'
      ) {
        RouteEnhancer.handleMethodDecorator(
          target,
          path,
          method,
          propName,
          middleware,
        );
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
  static handleClassDecorator(target, path, middleware) {
    if (!path) {
      throw new Error('path must be non-empty string');
    }
    if (isEmptyObject(RouteEnhancer.__prototype)) {
      RouteEnhancer.__prototype = target.prototype;
    }
    const allClassRouteData =
      Reflect.getMetadata('CLASS_ROUTE_PATH', target.prototype) || {};
    if (allClassRouteData[target.name]) {
      throw new Error(
        `you have defined a same path[${path}] by class decorator`,
      );
    }
    const classRouteData = { path, middleware };
    allClassRouteData[target.name] = classRouteData;
    Reflect.defineMetadata(
      'CLASS_ROUTE_PATH',
      allClassRouteData,
      target.prototype,
    );
  }
  /**
   * 处理 Method 上的路由的装饰器
   * @param target 方法装饰器所在类的原型 或者 类的构造函数
   * @param path 路由路径
   * @param method 路由方法
   * @param propName 方法名
   * @param middleware 方法的descriptor
   */
  static handleMethodDecorator(target, path, method, propName, middleware) {
    const proto = typeof target === 'function' ? target.prototype : target;
    if (isEmptyObject(RouteEnhancer.__prototype)) {
      RouteEnhancer.__prototype = proto;
    }
    const methodRouteData =
      Reflect.getMetadata('METHOD_ROUTE_PATH', proto) || {};
    methodRouteData[path] = methodRouteData[path] || [];
    methodRouteData[path].push({
      method,
      middleware,
      handlerName: propName,
      constructorFunction: proto.constructor,
      className: proto.constructor.name,
    });
    Reflect.defineMetadata('METHOD_ROUTE_PATH', methodRouteData, proto);
  }
  /**
   * 初始化路由
   * @param app Application 实例
   * @param options 所有路由的统一前缀
   */
  initRouter(app, options = { prefix: '' }) {
    const { router } = app;
    // 所有 method 装饰器，存在 Controller 原型上的数据
    const allMethodRouteData = Reflect.getMetadata(
      'METHOD_ROUTE_PATH',
      RouteEnhancer.__prototype,
    );
    // 所有class 装饰器，存在 Controller 原型上的数据
    const allClassRouteData = Reflect.getMetadata(
      'CLASS_ROUTE_PATH',
      RouteEnhancer.__prototype,
    );
    Object.keys(allMethodRouteData).forEach(methodPath => {
      allMethodRouteData[methodPath].forEach(routeData => {
        const classRouteData = allClassRouteData[routeData.className];
        const fullPath = `${options.prefix}${classRouteData.path}${methodPath}`;
        const methodLowerCase = routeData.method.toLowerCase();
        console.log(
          `register URL * ${routeData.method} ${fullPath} * ${routeData.className}.${routeData.handlerName}`,
        );
        router[methodLowerCase](
          fullPath,
          ...classRouteData.middleware,
          ...routeData.middleware,
          async ctx => {
            const controllerIns = new routeData.constructorFunction(ctx);
            await controllerIns[routeData.handlerName](ctx);
          },
        );
      });
    });
  }
}
// 缓存 Controller 原型
RouteEnhancer.__prototype = {};
const routerEnhancer = new RouteEnhancer();
exports.initRouter = routerEnhancer.initRouter;
exports.RouteMapping = routerEnhancer.RouteMapping;
// # sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDRCQUEwQjtBQW1CMUIsU0FBUyxhQUFhLENBQUMsR0FBVztJQUNoQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRVksUUFBQSxXQUFXLEdBQUc7SUFDekIsR0FBRyxFQUFFLEtBQUs7SUFDVixJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUksRUFBRSxNQUFNO0lBQ1osT0FBTyxFQUFFLFNBQVM7SUFDbEIsR0FBRyxFQUFFLEtBQUs7SUFDVixLQUFLLEVBQUUsT0FBTztJQUNkLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLEdBQUcsRUFBRSxLQUFLO0lBQ1YsR0FBRyxFQUFFLEtBQUs7SUFDVixTQUFTLEVBQUUsV0FBVztDQUN2QixDQUFDO0FBRUYsTUFBTSxhQUFhO0lBSWpCOzs7OztPQUtHO0lBQ0ksWUFBWSxDQUNqQixJQUFJLEdBQUcsRUFBRSxFQUNULFNBQXNCLEtBQUssRUFDM0IsR0FBRyxVQUF3QjtRQUUzQixrQ0FBa0M7UUFDbEMsT0FBTyxVQUFTLE1BQVcsRUFBRSxRQUEwQixFQUFFLFVBQStCO1lBQ3RGLElBQUksT0FBTyxNQUFNLEtBQUssVUFBVSxJQUFJLFFBQVEsS0FBSyxTQUFTLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtnQkFDdEYsYUFBYSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQzdELE9BQU87YUFDUjtpQkFBTSxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsSUFBSSxPQUFPLFVBQVUsS0FBSyxRQUFRLEVBQUU7Z0JBQ3pFLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JB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
