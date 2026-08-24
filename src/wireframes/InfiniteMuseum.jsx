import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Application, Container, Sprite, Graphics, Text, TextStyle, Assets } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { useArtworks, seasonLabel, longDate } from '../data/useArtworks.js'
import './InfiniteMuseum.css'

// ---- layout constants for the salon wall ----
const COL_W = 360
const GAP_X = 90
const GAP_Y = 90
const MARGIN = 700
const FRAME = 16
// portrait / landscape / square aspect ratios → "different size framed artwork"
const ASPECTS = [1.34, 0.72, 1.0, 1.5, 0.82, 1.18]

// tiny deterministic PRNG so the hang is stable across reloads
function rng(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

// Pixi v8 Graphics: build the brass frame + mat reveal for a w×h opening.
function drawFrame(w, h) {
  const g = new Graphics()
  g.roundRect(-FRAME + 6, -FRAME + 12, w + FRAME * 2, h + FRAME * 2, 4).fill({ color: 0x05040a, alpha: 0.55 }) // cast shadow
  g.rect(-FRAME, -FRAME, w + FRAME * 2, h + FRAME * 2).fill(0x0a0805) // outer lip
  g.rect(-FRAME + 3, -FRAME + 3, w + (FRAME - 3) * 2, h + (FRAME - 3) * 2).fill(0xb89154) // brass
  g.rect(-6, -6, w + 12, h + 12).fill(0x8a6b38) // inner bevel
  g.rect(-2, -2, w + 4, h + 4).fill(0x07060c) // mat reveal behind image
  return g
}

function drawPlacard(w, h, art, style) {
  const c = new Container()
  const plateW = Math.min(w, 230)
  const plate = new Graphics()
  plate.rect((w - plateW) / 2, h + 22, plateW, 30).fill(0x161009)
  plate.rect((w - plateW) / 2, h + 22, plateW, 2).fill(0xc9a86a)
  c.addChild(plate)
  const label = new Text({ text: art.title.toUpperCase(), style })
  label.anchor.set(0.5, 0)
  label.position.set(w / 2, h + 30)
  c.addChild(label)
  return c
}

export default function InfiniteMuseum() {
  const hostRef = useRef(null)
  const apiRef = useRef(null)
  const { artworks, loading } = useArtworks()

  const [zoom, setZoom] = useState(100)
  const [focused, setFocused] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!artworks.length || !hostRef.current) return
    let disposed = false
    let app = null

    ;(async () => {
      // wait for web fonts so canvas placards render in IBM Plex Mono
      if (document.fonts?.ready) await document.fonts.ready.catch(() => {})

      const host = hostRef.current
      const a = new Application()
      await a.init({
        resizeTo: host,
        background: 0x0b0a0f,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        preference: 'webgl',
      })
      if (disposed) {
        a.destroy(true, { children: true })
        return
      }
      app = a
      host.appendChild(app.canvas)

      // ----- shortest-column masonry across a large world -----
      const rand = rng(99)
      const cols = Math.max(6, Math.round(Math.sqrt(artworks.length) * 1.6))
      const colBottoms = new Array(cols).fill(MARGIN)
      const placardStyle = new TextStyle({
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 11,
        letterSpacing: 1.5,
        fill: 0xd9c9a3,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 210,
      })

      const worldWGuess = MARGIN * 2 + cols * (COL_W + GAP_X)
      const viewport = new Viewport({
        screenWidth: host.clientWidth,
        screenHeight: host.clientHeight,
        worldWidth: worldWGuess,
        worldHeight: worldWGuess,
        events: app.renderer.events,
      })
      app.stage.addChild(viewport)

      const wash = new Graphics().rect(0, 0, worldWGuess * 2, worldWGuess * 2).fill(0x14121b)
      viewport.addChild(wash)

      const pieces = []
      artworks.forEach((art) => {
        let col = 0
        for (let i = 1; i < cols; i++) if (colBottoms[i] < colBottoms[col]) col = i
        const aspect = ASPECTS[Math.floor(rand() * ASPECTS.length)]
        const scale = 0.82 + rand() * 0.7
        const w = COL_W * scale
        const h = w * aspect
        const jitterX = (rand() - 0.5) * 60
        const x = MARGIN + col * (COL_W + GAP_X) + (COL_W - w) / 2 + jitterX
        const y = colBottoms[col]

        const piece = new Container()
        piece.position.set(x, y)
        piece.addChild(drawFrame(w, h))
        piece.addChild(drawPlacard(w, h, art, placardStyle))
        piece.eventMode = 'static'
        piece.cursor = 'pointer'
        piece.__meta = { art, cx: x + w / 2, cy: y + h / 2, w, h }
        piece.on('pointertap', () => focusPiece(piece))
        viewport.addChild(piece)
        pieces.push(piece)

        // lazy-load the still, then cover-fit it into the opening
        Assets.load(art.img)
          .then((tex) => {
            if (disposed || piece.destroyed) return
            const sprite = new Sprite(tex)
            const s = Math.max(w / tex.width, h / tex.height)
            sprite.scale.set(s)
            sprite.x = (w - tex.width * s) / 2
            sprite.y = (h - tex.height * s) / 2
            const mask = new Graphics().rect(0, 0, w, h).fill(0xffffff)
            sprite.mask = mask
            piece.addChildAt(mask, 1)
            piece.addChildAt(sprite, 1)
          })
          .catch(() => {})

        colBottoms[col] = y + h + FRAME * 2 + 60 + GAP_Y
      })

      const worldW = MARGIN * 2 + cols * (COL_W + GAP_X)
      const worldH = Math.max(...colBottoms) + MARGIN
      viewport.worldWidth = worldW
      viewport.worldHeight = worldH

      // responsive "fitted" zoom: bigger frames on phones, the dense wall on desktop
      const computeHome = () => {
        const w = host.clientWidth
        if (w < 480) return 0.62
        if (w < 768) return 0.54
        if (w < 1100) return 0.46
        return 0.42
      }
      let home = computeHome()
      const centerY = () => MARGIN + host.clientHeight * 0.6

      viewport
        .drag()
        .pinch()
        .wheel({ smooth: 3 })
        .decelerate({ friction: 0.93 })
        .clampZoom({ minScale: 0.16, maxScale: 3 })
        .clamp({ direction: 'all', underflow: 'center' })

      viewport.setZoom(home, true)
      viewport.moveCenter(worldW / 2, centerY())

      let raf = false
      const updateChrome = () => {
        raf = false
        setZoom(Math.round((viewport.scale.x / home) * 100))
      }
      const onMove = () => {
        const b = viewport.getVisibleBounds()
        for (const p of pieces) {
          const m = p.__meta
          p.visible =
            m.cx + m.w > b.x - 200 &&
            m.cx - m.w < b.x + b.width + 200 &&
            m.cy + m.h > b.y - 200 &&
            m.cy - m.h < b.y + b.height + 200
        }
        if (!raf) {
          raf = true
          requestAnimationFrame(updateChrome)
        }
      }
      viewport.on('moved', onMove)
      viewport.on('zoomed', onMove)
      onMove()

      function focusPiece(p) {
        const m = p.__meta
        const targetW = (m.w + FRAME * 2) * 2.4
        viewport.snap(m.cx, m.cy, { time: 850, ease: 'easeInOutSine', removeOnComplete: true, removeOnInterrupt: true })
        viewport.snapZoom({ width: targetW, time: 850, ease: 'easeInOutSine', removeOnComplete: true, removeOnInterrupt: true })
        setFocused(m.art)
        setTimeout(onMove, 900)
      }

      const onResize = () => {
        viewport.resize(host.clientWidth, host.clientHeight, worldW, worldH)
        // re-fit on orientation change so frames stay a usable size
        home = computeHome()
        viewport.setZoom(home, true)
        viewport.moveCenter(worldW / 2, centerY())
        onMove()
      }
      window.addEventListener('resize', onResize)
      window.addEventListener('orientationchange', onResize)

      apiRef.current = {
        cleanupResize: () => {
          window.removeEventListener('resize', onResize)
          window.removeEventListener('orientationchange', onResize)
        },
        goHome: () => {
          viewport.animate({
            time: 900,
            position: { x: worldW / 2, y: centerY() },
            scale: home,
            ease: 'easeInOutSine',
          })
          setFocused(null)
          setTimeout(onMove, 950)
        },
        zoomBy: (pct) => {
          viewport.zoomPercent(pct, true)
          onMove()
        },
      }
      setReady(true)
    })()

    return () => {
      disposed = true
      apiRef.current?.cleanupResize?.()
      apiRef.current = null
      if (app) {
        try {
          app.destroy(true, { children: true })
        } catch (e) {
          /* noop */
        }
      }
    }
  }, [artworks])

  return (
    <main className="museum">
      <div ref={hostRef} className="museum__stage" />
      <div className="museum__vignette" aria-hidden />

      <header className="museum__top">
        <Link to="/" className="museum__back">← Lobby</Link>
        <div className="museum__id">
          <span className="museum__id-num">Unnamed Art Project · Gallery II</span>
          <span className="museum__id-name">The Infinite Museum</span>
        </div>
        <div className="museum__count">
          {loading ? 'unrolling the canvas…' : `${artworks.length} works hung`}
        </div>
      </header>

      <div className="museum__hint" data-ready={ready}>
        drag to roam · scroll to zoom · click a frame to step closer
      </div>

      <div className="museum__controls">
        <button onClick={() => apiRef.current?.zoomBy(0.35)} aria-label="Zoom in">+</button>
        <span className="museum__zoom">{zoom}%</span>
        <button onClick={() => apiRef.current?.zoomBy(-0.35)} aria-label="Zoom out">−</button>
        <button className="museum__home" onClick={() => apiRef.current?.goHome()}>Reset view</button>
      </div>

      <aside className={`museum__placard ${focused ? 'is-open' : ''}`} aria-hidden={!focused}>
        {focused && (
          <>
            <p className="museum__placard-eyebrow">Unnamed Art Project · Placeholder Collection</p>
            <h2 className="museum__placard-title">{focused.title}</h2>
            <p className="museum__placard-meta">{seasonLabel(focused)}</p>
            <p className="museum__placard-line">Promotional still on broadcast emulsion</p>
            <p className="museum__placard-line">{longDate(focused)}</p>
            <button className="museum__placard-close" onClick={() => setFocused(null)}>
              Step back ×
            </button>
          </>
        )}
      </aside>
    </main>
  )
}
