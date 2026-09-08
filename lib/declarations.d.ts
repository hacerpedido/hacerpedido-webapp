declare module "validator/lib/isEmpty" {
  interface IsEmptyOptions {
    ignore_whitespace?: boolean;
  }

  function isEmpty(value: string, options?: IsEmptyOptions): boolean;
  export default isEmpty;
}

declare module "*.jpg" {
  const source: string;
  export default source;
}
