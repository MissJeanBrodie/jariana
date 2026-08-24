import { Link } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
  return (
    <main className="landing">
      <header className="landing__head">
        <p className="landing__kicker">The Unnamed Art Project</p>
        <h1 className="landing__title">
          Unnamed Art Project<span className="landing__dot">.</span>
        </h1>
        <p className="landing__sub">
          A private Skibidi museum. The walls currently hold placeholder imagery —
          promotional stills from <em>Malcolm in the Middle</em> (2000–2006) — standing in
          until the real collection is hung. Two galleries to wander.
        </p>
      </header>

      <nav className="landing__doors">
        <Link to="/cards" className="door door--01">
          <span className="door__num">01</span>
          <span className="door__name">The Card Gallery</span>
          <span className="door__desc">An editorial wall. Two featured plates, then a quiet masonry of stills.</span>
          <span className="door__enter">Enter the gallery →</span>
        </Link>

        <Link to="/museum" className="door door--02">
          <span className="door__num">02</span>
          <span className="door__name">The Infinite Museum</span>
          <span className="door__desc">A boundless hall. Drag to roam, scroll to zoom into any frame.</span>
          <span className="door__enter">Enter the gallery →</span>
        </Link>
      </nav>

      <footer className="landing__foot">
        <span>Unnamed Art Project · two minimalist galleries</span>
        <span>Placeholder imagery © respective rights holders, shown in prototype</span>
      </footer>
    </main>
  )
}
