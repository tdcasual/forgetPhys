# ComfyUI FaceID stub

## Purpose

Lock `assets/chars/{id}/_canon/face.png` as the sole identity reference using IP-Adapter FaceID (optional InstantID). All later poses must re-point at this canon face — never pose→pose chaining.

## Required custom nodes

- ComfyUI_IPAdapter_plus — https://github.com/cubiq/ComfyUI_IPAdapter_plus
- InstantID (optional) — https://github.com/cubiq/ComfyUI_InstantID

## Artist export layout

```
assets/chars/{id}/
  _canon/
    face.png          # locked identity (this workflow)
    identity.txt      # verbatim identity block
    checklist.md
  outfits/{era}/
    stand__idle.png   # etc — always conditioned on _canon/face.png
```

## Forbidden

- **pose → pose chaining**: do not feed pose A as the face/IP reference for pose B.
- Mixing eras or age looks without a new canon lock + gate PASS.

## Stub files

- `faceid-bust-api.json` — minimal API-format graph; load/adapt in ComfyUI.
- `workflow.meta.json` — version + pointer to CHAR_CONSISTENCY style block.
