# Art provenance log

| id | path | license | source_url | chapter | notes |
|---|---|---|---|---|---|
| venue-lab-modular-shell | `assets/venue/kenney-building-kit/` | CC0 1.0 | https://kenney.nl/assets/building-kit | P0 | 79 GLB modular walls/doors/windows; retexture w/ plaster-brick + old-wood-floor |
| venue-lab-modular-furniture | `assets/venue/kenney-furniture-kit/` | CC0 1.0 | https://kenney.nl/assets/furniture-kit | P0 | GLTF desks/tables/fillers; darken wood |
| venue-lab-desk-school | `assets/venue/school-desk/SchoolDesk_01_1k.gltf` | CC0 | https://polyhaven.com/a/SchoolDesk_01 | P0 | 1k glTF hero workbench |
| venue-lab-table-wood | `assets/venue/wooden-table/WoodenTable_01_1k.gltf` | CC0 | https://polyhaven.com/a/WoodenTable_01 | P0 | 1k glTF apparatus table |
| prop-lead-box-toolchest | `assets/props/metal-tool-chest/metal_tool_chest_1k.gltf` | CC0 | https://polyhaven.com/a/metal_tool_chest | P0 | Reskin w/ metal-plate → lead chamber |
| prop-fluorescent-screen-frame | `assets/props/standing-picture-frame/standing_picture_frame_01_1k.gltf` | CC0 | https://polyhaven.com/a/standing_picture_frame_01 | P0 | Artwork → ZnS emissive |
| prop-gold-foil-stage-handmade | `assets/props/gold-foil-stage/gold_foil_stage.gltf` | original | — | P0 | Box-stub optical rail; see `docs/prop-gold-foil-stage-spec.md` |
| tex-brick-plaster | `assets/textures/plaster-brick/` | CC0 | https://polyhaven.com/a/plaster_brick_01 | P0 | 2k diff/nor/arm |
| tex-wood-floor | `assets/textures/old-wood-floor/` | CC0 | https://polyhaven.com/a/old_wood_floor | P0 | 2k diff/nor/arm |
| tex-aged-metal | `assets/textures/metal-plate/` | CC0 | https://polyhaven.com/a/metal_plate | P0 | Lead reskin (AmbientCG Metal032 blocked) |
| ui-badge-interpretation | `assets/ui/badge-interpretation.svg` | original | — | P0 | 米黄纸+朱红条；第一版 UI 必进 |
| ui-badge-interpretation-corner | `assets/ui/badge-interpretation-corner.svg` | original | — | P0 | 对话角飘带变体 |
| char-lab-assistant-stub | (to commission) | original | — | P0 | Brief: `docs/char-lab-assistant-stub-brief.md` |
| atlas-europe-110m | `assets/atlas/europe-110m.geojson` | CC0 / public domain | https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/ | P0 | Converted+filtered from ne_110m_admin_0_countries via scripts/ne-to-europe-geojson.mjs (CONTINENT==Europe + Maghreb/Turkey/Caucasus/Cyprus fringe; Greenland excluded) |
| atlas-cities-p0 | `assets/atlas/cities-p0.geojson` | original | — | P0 | Manchester unlocked→coupland-lab; Cambridge/Copenhagen locked |
| atlas-europe-hyp-sr-50m | `assets/atlas/europe-hyp-sr-50m.jpg` | public domain | https://www.naturalearthdata.com/downloads/50m-raster-data/50m-cross-blend-hypso/ (HYP_50M_SR) | P0 | Europe crop lon≈[-25,45] lat≈[34,72]; 1320×900; atlas albedo (locked) |
| atlas-europe-sr-50m | `assets/atlas/europe-sr-50m.jpg` | public domain | https://www.naturalearthdata.com/downloads/50m-raster-data/50m-shaded-relief/ (SR_50M) | P0 | Same crop/size; weak vertex displacement + bumpMap |
| atlas-europe-gray-sr-50m | `assets/atlas/europe-gray-sr-50m.jpg` | public domain | Natural Earth GRAY_50M_SR | P0 | Optional grayscale SR; unused in runtime |
| atlas-europe-hyp-sr-w-50m | `assets/atlas/europe-hyp-sr-w-50m.jpg` | public domain | Natural Earth HYP_50M_SR_W | P0 | Civ sandbox albedo (ocean present); further recolored in AtlasScene shader |
| atlas-city-kit-industrial | `assets/atlas/city-clusters/kenney-city-kit-industrial/` | CC0 1.0 | https://kenney.nl/assets/city-kit-industrial | P0 | Manchester chimneys/buildings; hide solar-panel* / shipping-container* / windmill* |
| atlas-city-kit-commercial | `assets/atlas/city-clusters/kenney-city-kit-commercial/` | CC0 1.0 | https://kenney.nl/assets/city-kit-commercial | P0 | Cambridge/Copenhagen street bases; avoid skyscrapers |
| atlas-city-kit-suburban | `assets/atlas/city-clusters/kenney-city-kit-suburban/` | CC0 1.0 | https://kenney.nl/assets/city-kit-suburban | P0 | Low houses for Cambridge/Copenhagen |
| atlas-fantasy-town-kit | `assets/atlas/city-clusters/kenney-fantasy-town-kit/` | CC0 1.0 | https://kenney.nl/assets/fantasy-town-kit | P0 | roof-high-point / roof-point / wall-block for Cambridge spires only; no banners |

## Historical portrait refs (立绘源图)
| file | source | note |
|---|---|---|
| `_historical_refs/rutherford-1908-nobel.jpg` | Wikimedia Commons Ernest Rutherford (Nobel) | ~1908 |
| `_historical_refs/thomson-1896.jpg` | Wikimedia Commons JJ Thomson | ~1896 |
| `_historical_refs/bohr-loc-young.jpg` | Wikimedia Commons / LOC young Bohr | date unverified youth |
| `_historical_refs/geiger-rutherford.jpg` | Wikimedia Commons Geiger-Rutherford group | Geiger likeness from group |

| `_historical_refs/manchester-lab-staff-1910.jpg` | Wikimedia Commons Manchester University Laboratory Staff 1910 | Rutherford+Geiger+Marsden group |
| `_historical_refs/geiger-1928.jpg` | Wikimedia Commons Hans Geiger | 1928 — face only, age backdated |

## char-watson era outfits (2026-09-06)
| id | path | license | notes |
|---|---|---|---|
| watson-victorian-1890s-full4 | `physics-game/assets/chars/char-watson/outfits/victorian-1890s/` | original AI draft | idle/speak/think/surprise + qa-face-row |
| watson-belle-epoque-1913-full4 | `physics-game/assets/chars/char-watson/outfits/belle-epoque-1913/` | original AI draft | idle/speak/think/surprise + qa-face-row |
| watson-era-placeholders | classical-mediterranean / early-modern-eu / interwar / midcentury / contemporary-lab | original AI draft | stand__idle only |
