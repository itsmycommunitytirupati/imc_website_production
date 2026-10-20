/// <reference types="vite/client" />

// The previous site imports a few upper-case .PNG files.
declare module "*.PNG" {
  const src: string;
  export default src;
}
