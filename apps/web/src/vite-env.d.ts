/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LABEMBED_ORIGINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
