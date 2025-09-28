interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  readonly VITE_API_URL?: string
  // add more custom variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}