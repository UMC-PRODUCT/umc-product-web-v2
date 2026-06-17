/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module "*&format=webp" {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string
  readonly VITE_GA_API_SAMPLE_RATE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
