/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly REACT_APP_GATEWAY_BASE?: string
  // Add other REACT_APP_* environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

