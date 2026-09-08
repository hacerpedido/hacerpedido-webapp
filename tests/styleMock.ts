// CSS Modules are mocked so class lookups return the class name itself.
const cssModuleProxy = new Proxy<Record<string, string>>(
  {},
  {
    get: (_target, property) => property as string,
  },
);

export default cssModuleProxy;
