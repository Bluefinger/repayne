declare module "*.css" {
  export const css: string;
  export default css;
}

declare module "*.scss" {
  export const css: string;
  export default css;
}

declare module "web-worker:*" {
  const WorkerFactory: new (options?: any) => Worker;
  export default WorkerFactory;
}

declare module "omt:*" {
  const url: string;
  export default url;
}
