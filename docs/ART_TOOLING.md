产品名：**ForgetPhys**（仓库建议 `forgetphys`）。

# Art tooling

Umbrella for LFS, CI validate, Projects board, and Comfy FaceID stubs.

## Git LFS

- `.gitattributes` tracks png/jpg/jpeg/gif/webp/psd/mp4/gltf/bin via LFS.
- Local: install git-lfs, then in repo root: git lfs install.
- CI checkout should enable LFS (see .github/workflows/validate-art.yml).
- Strict validate needs a full LFS pull so binaries exist (not pointer stubs).
- assets/ may be a symlink to physics-game/assets — fine locally; CI may lack that tree.

### Migration note

If large PNGs were already committed as normal Git blobs, convert with LFS migrate only after documenting the cutover. Do not rewrite shared main history without team agreement; prefer a dedicated branch.

## Validate script and Actions

- Root package script validate:art invokes the mjs under scripts/
- CI workflow validate-art on push or PR to main or master
- Node 20 plus package manager; allow-missing env skips empty asset trees

## Projects board

- See GITHUB_ART_BOARD.md for board columns and seed issues
- Structured issues via art-asset issue template
- PR template reminds QA shots, checklist, green validate

## ComfyUI FaceID

- tools/comfy/ has README and faceid-bust-api.json stub
- Purpose: lock canon face via IP-Adapter FaceID (optional InstantID)
- Identity rules: CHAR_CONSISTENCY_CONSTRAINTS.md

## Gates index

- ART_GATES_INDEX.md links here


## 远程仓（当前阻塞）

本机 `gh` 账号 **tdcasual** 的 PAT **无 `createRepository` 权限**（2026-09-06 实测 GraphQL 拒建仓）。

你需要任选其一：
1. 在 GitHub → Settings → Developer settings → PAT 打开 **`repo`** 全套（含创建），然后告诉我再跑 `gh repo create`
2. 或你在网页新建空仓 `tdcasual/forgetphys`，把 URL 给我，我只加 `git remote` + 推送（LFS 需先 commit 工具文件）

看板：仓建好后按 `GITHUB_ART_BOARD.md` 建 Project「美术进度」。
