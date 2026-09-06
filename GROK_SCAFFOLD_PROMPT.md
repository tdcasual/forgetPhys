Scaffold physics-chronicle monorepo in /workspace/physics-chronicle. Keep docs/ and assets/ symlink.

Goal: pnpm workspaces; Vite+React+TS+R3F app; packages/lab-core pure TS mc-scattering; packages/content zod+Manchester JSON; packages/ui dialogue with interpretation badge.

Layout: apps/web/src/{app,modes/atlas,modes/venue,camera,dialogue,characters}; packages/{lab-core,content,ui}; pnpm-workspace.yaml; README.

LabPlugin: setup/step/measure/conclude/dispose. mc-scattering steps particles and returns crude histogram; no three/rapier in lab-core.

ClaimMeta source_tier: textbook|primary|secondary|interpretation. CameraDirector same R3F canvas; mask hard-cut 200-400ms ortho atlas <-> perspective venue.

Manchester Coupland Street content. Do NOT claim Rutherford 1911 used the word nucleus. UI shows interpretation badge.

MVP: click atlas node -> venue -> particle viz -> short dialogue. No Rapier/VRM/multi-city.

Done when pnpm install and pnpm dev work. Commit locally.
