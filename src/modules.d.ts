declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*.scss" {
  export const css: string;
  export default css;
}
