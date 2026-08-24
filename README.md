# Jariana Skibidi Museum

A small private museum for **Jackson**,

> **The images are placeholders.** Every picture is a promotional still from *Malcolm in the
> Middle* (2000–2006), pulled live from a free API purely to stand in for layout and mood. They
> are meant to be swapped out for Jackson and Ariana's real photographs / artwork. None of the
> placeholder imagery is owned or licensed here.

Two deliberately distinct minimalist directions:

- **Wireframe 01 — The Card Gallery** (`/cards`): a light, editorial salon hang. Opens with a
  featured **diptych** (the "two card pics"), then a 4-column masonry of stills, each under a
  gallery placard (title · subtitle · date · accession no.). Fraunces display + Archivo body.
- **Wireframe 02 — The Infinite Museum** (`/museum`): a dark, boundless hall of brass-framed
  works at varied sizes. **Drag to roam, scroll to zoom, click a frame to step closer** (the
  viewport animates to fit and a placard slides in). Cormorant Garamond + IBM Plex Mono chrome.

## Stack

- **React + Vite**
- **PixiJS v8 + pixi-viewport v6** for the infinite canvas. This is the right pairing for a
  pan/zoom wall of many images: WebGL renders hundreds of framed sprites with no jank, with
  built-in drag / pinch / wheel / decelerate / clamp + off-screen culling. (Note: pixi-viewport
  5.x targets Pixi v6 and 6.x targets Pixi v8 — there is *no* v7 build, so v8 + viewport-6 is the
  supported combination.)

## Images (placeholders)

Pulled live from the free, no-key **TVmaze API** (show 568, *Malcolm in the Middle*) — ~150
episodes, ~115 with hotlinkable promo stills on `static.tvmaze.com`, each carrying the metadata
used for the placards. A small fallback array in `src/data/useArtworks.js` keeps both wireframes
rendering if the network is unavailable.

**To use real artwork:** replace the TVmaze fetch in `src/data/useArtworks.js` with your own list
of `{ id, title, season, number, airdate, img }` objects (or repoint `img` at local files in
`public/`). Everything downstream — placards, masonry, the infinite wall — reads from that list.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

## Layout

```
src/
  data/useArtworks.js           # image list + formatters; swap this for real artwork
  pages/Landing.jsx             # gallery-entrance switcher into the two wireframes
  wireframes/CardGallery.jsx    # Wireframe 01
  wireframes/InfiniteMuseum.jsx # Wireframe 02 (Pixi v8 + pixi-viewport)
  styles/global.css
```
